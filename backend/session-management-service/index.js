const fastify = require('fastify')({ logger: true });

// fastify.post('/send-notification', async (request, reply) => {
//   return { success: true, message: 'Notification sent successfully!' };
// });

fastify.get('/test', async (request, reply) => {
    return { success: true, message: 'Test route is working correctly!' };
});

// Run the server!
const start = async () => {
  try {
    await fastify.listen({ port: 3005 });
    fastify.log.info(`Server listening at http://127.0.0.1:${fastify.server.address().port}`);
    fastify.log.info(`Session Management Service listening on ${fastify.server.address().port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();