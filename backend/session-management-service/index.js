require('dotenv').config();
const mongoose = require('mongoose');
const fastify = require('fastify')({ logger: true });
const sessionRoutes = require('./routes/sessionRoutes');

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, { 
    useNewUrlParser: true, 
    useUnifiedTopology: true 
})
.then(() => console.log('MongoDB connected...'))
.catch(err => console.log(err));

// Register the routes plugin
fastify.register(sessionRoutes);

fastify.get('/test', async (request, reply) => {
    return { success: true, message: 'Test route is working correctly!' };
});

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