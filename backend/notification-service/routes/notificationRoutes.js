// notification-service/routes/notificationRoutes.js
// const express = require('express');
// const router = express.Router();
const Notification = require('../models/notification');

async function notificationRoutes(fastify, options) {
    fastify.post('/add', async (request, reply) => {
      try {
        const newNotification = new Notification(request.body);
        await newNotification.save();
        reply.code(201).send({ notification: newNotification, message: 'Notification registered successfully' });
      } catch (error) {
        reply.code(400).send(error);
      }
    });
  
    fastify.get('/', async (request, reply) => {
      try {
        const notifications = await Notification.find({});
        reply.send(notifications);
      } catch (error) {
        reply.code(500).send(error);
      }
    });
  
    fastify.get('/:id', async (request, reply) => {
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
  
    fastify.get('/email/:userEmail', async (request, reply) => {
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
  
    fastify.put('/:id', async (request, reply) => {
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
  
    fastify.delete('/:id', async (request, reply) => {
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




// // Endpoint to add a new notification
// router.post('/add', async (req, res) => {
//   try {
//     const newNotification = new Notification(req.body);
//     await newNotification.save();
//     res.status(201).send({ notification: newNotification, message: 'notification registered successfully' });
//   } catch (error) {
//     res.status(400).send(error);
//   }
// });

// // Endpoint to retrieve all notifications
// router.get('/', async (req, res) => {
//   try {
//     const notifications = await Notification.find({});
//     res.send(notifications);
//   } catch (error) {
//     res.status(500).send(error);
//   }
// });

// // GET /notifications/:id to retrieve a notification by their ID
// router.get('/:id', async (req, res) => {
//     try {
//         const notification = await Notification.findById(req.params.id);
//         if (!notification) {
//             return res.status(404).send({ message: 'notification not found' });
//         }
//         res.send(notification);
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// });

// // GET /notifications/:id to retrieve a notification by userEmail
// router.get('/email/:userEmail', async (req, res) => {
//     try {
//         const notification = await Notification.findAll(req.params.userEmail);
//         if (!notification) {
//             return res.status(404).send({ message: 'notification not found' });
//         }
//         res.send(notification);
//     } catch (error) {
//         res.status(500).send({ error: error.message });
//     }
// });

// // PUT /notifications/:id to update a notification by id
// router.put('/:id', async (req, res) => {
//     try {
//       const notification = await Notification.findByIdAndUpdate(req.params.id, req.body, { new: true });
//       if (!notification) {
//         return res.status(404).send({ message: 'notification not found' });
//       }
//       res.send({ notification, message: 'notification updated successfully' });
//     } catch (error) {
//       res.status(400).send({ error: error.message });
//     }
// });
  
// // DELETE /notifications/:id to delete a notification by id
// router.delete('/:id', async (req, res) => {
//     try {
//       const notification = await Notification.findByIdAndDelete(req.params.id);
//       if (!notification) {
//         return res.status(404).send({ message: 'notification not found' });
//       }
//       res.send({ message: 'notification deleted successfully' });
//     } catch (error) {
//       res.status(500).send({ error: error.message });
//     }
// });


// module.exports = router;
