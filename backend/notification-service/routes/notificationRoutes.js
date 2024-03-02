// notification-service/routes/notificationRoutes.js
const Notification = require('../models/notification');

async function notificationRoutes(fastify, options) {
    fastify.post('/notifications/add', async (request, reply) => {
      try {
        const newNotification = new Notification(request.body);
        await newNotification.save();
        reply.code(201).send({ notification: newNotification, message: 'Notification added successfully' });
      } catch (error) {
        reply.code(400).send(error);
      }
    });
  
    fastify.get('/notifications', async (request, reply) => {
      try {
        const notifications = await Notification.find({});
        reply.send(notifications);
      } catch (error) {
        reply.code(500).send(error);
      }
    });
  
    fastify.get('/notifications/:id', async (request, reply) => {
      try {
        const notification = await Notification.findById(request.params.id);
        if (!notification) {
          return reply.code(404).send({ message: 'Notification not found' });
        }
        reply.send(notification);
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    });
  
    fastify.get('/notifications/email/:userEmail', async (request, reply) => {
      try {
        const notification = await Notification.find({ userEmail: request.params.userEmail });
        if (notification.length === 0) {
          return reply.code(404).send({ message: 'No notifications found for this email' });
        }
        reply.send(notification);
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    });
  
    fastify.put('/notifications/:id', async (request, reply) => {
      try {
        const notification = await Notification.findByIdAndUpdate(request.params.id, request.body, { new: true });
        if (!notification) {
          return reply.code(404).send({ message: 'Notification not found' });
        }
        reply.send({ notification, message: 'Notification updated successfully' });
      } catch (error) {
        reply.code(400).send({ error: error.message });
      }
    });
  
    fastify.delete('/notifications/:id', async (request, reply) => {
      try {
        const notification = await Notification.findByIdAndDelete(request.params.id);
        if (!notification) {
          return reply.code(404).send({ message: 'Notification not found' });
        }
        reply.send({ message: 'Notification deleted successfully' });
      } catch (error) {
        reply.code(500).send({ error: error.message });
      }
    });
}

module.exports = notificationRoutes;
