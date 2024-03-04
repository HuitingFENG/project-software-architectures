// session-management-service/routes/sessionRoutes.js
const Session = require('../models/session');

async function sessionRoutes(fastify, options) {
    fastify.post('/sessions/add', async (request, reply) => {
      try {
        const newSession = new Session(request.body);
        await newSession.save();
        reply.code(201).send({ session: newSession, message: 'session added successfully' });
      } catch (error) {
        reply.code(400).send(error);
      }
    });

    fastify.get('/sessions/getCatalogForQRCode', async (request, reply) => {
        try {
          const { qrCode } = request.query; // GET /sessions/getCatalogForQRCode?qrCode=yourQRCodeHere
          const existingSession = await Session.findOne({ qrCode, status: 'active' });
          const isValid = !existingSession;  // If there's no active session, the QR code is valid for use
          reply.send({ isValid });
        } catch (error) {
          reply.code(500).send({ error: error.message });
        }
    });
  
    fastify.get('/sessions', async (request, reply) => {
      try {
        const sessions = await Session.find({});
        reply.send(sessions);
      } catch (error) {
        reply.code(500).send(error);
      }
    });
  
    fastify.get('/sessions/:id', async (request, reply) => {
      try {
        const session = await Session.findById(request.params.id);
        if (!session) {
          return reply.code(404).send({ message: 'session not found' });
        }
        reply.send(session);
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    });
  
    // fastify.put('/sessions/:id', async (request, reply) => {
    //   try {
    //     const session = await Session.findByIdAndUpdate(request.params.id, request.body, { new: true });
    //     if (!session) {
    //       return reply.code(404).send({ message: 'session not found' });
    //     }
    //     reply.send({ session, message: 'session updated successfully' });
    //   } catch (error) {
    //     reply.code(400).send({ error: error.message });
    //   }
    // });

    fastify.put('/sessions/:id', async (request, reply) => {
      try {
        const { id } = request.params;
        const updateData = request.body;


        if (updateData.customers) {
            const session = await Session.findById(id);
            if (!session) {
                return reply.code(404).send({ message: 'Session not found' });
            }
            const updatedCustomers = Array.from(new Set([...session.customers, ...updateData.customers]));
            updateData.customers = updatedCustomers;
        }

        const updatedSession = await Session.findByIdAndUpdate(id, updateData, { new: true });
        if (!updatedSession) {
            return reply.code(404).send({ message: 'Session not found' });
        }
        reply.send({ session: updatedSession, message: 'Session updated successfully' });
      } catch (error) {
          reply.code(400).send({ error: error.message });
      }
  });


    fastify.put('/sessions/:id/add-order', async (request, reply) => {
      try {
        const { id } = request.params;
        const updateData = request.body;
        const session = await Session.findById(id);

        if (!session) {
          return reply.code(404).send({ message: 'Session not found' });
        }

        session.needToPay += updateData.orderDetails.totalPrice;
        session.restToPay += updateData.orderDetails.totalPrice;


        // Update customers array
        if (updateData.customers) {
          session.customers = [...new Set([...session.customers, ...updateData.customers])];
        }

        // Update orders array
        if (updateData.orders) {
          session.orders = [...new Set([...session.orders, ...updateData.orders])];
        }

        await session.save();
        reply.send({ session, message: 'Session updated successfully' });
      } catch (error) {
        reply.code(400).send({ error: error.message });
      }
    });



  
    fastify.delete('/sessions/:id', async (request, reply) => {
      try {
        const session = await Session.findByIdAndDelete(request.params.id);
        if (!session) {
          return reply.code(404).send({ message: 'session not found' });
        }
        reply.send({ message: 'session deleted successfully' });
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    });
}

module.exports = sessionRoutes;