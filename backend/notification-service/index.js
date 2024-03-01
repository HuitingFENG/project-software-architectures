require('dotenv').config();
const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const notificationRoutes = require('./routes/notificationRoutes');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

// Declare a route for sending notifications
fastify.post('/send-notification', async (request, reply) => {
  // Example: Send a notification here
  return { success: true, message: 'Notification sent successfully!' };
});

// Register the routes plugin
fastify.register(notificationRoutes);

fastify.get('/test', async (request, reply) => {
    // This route will respond with a success message when visited
    return { success: true, message: 'Test route is working correctly!' };
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3004 });
    fastify.log.info(`Server listening at http://127.0.0.1:${fastify.server.address().port}`);
    fastify.log.info(`Notification Service listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
