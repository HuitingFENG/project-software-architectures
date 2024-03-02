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
  
    fastify.put('/sessions/:id', async (request, reply) => {
      try {
        const session = await Session.findByIdAndUpdate(request.params.id, request.body, { new: true });
        if (!session) {
          return reply.code(404).send({ message: 'session not found' });
        }
        reply.send({ session, message: 'session updated successfully' });
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