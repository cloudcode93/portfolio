require('dotenv').config();
const path = require('path');
const fastify = require('fastify')({ logger: true });

// --- Plugins ---
fastify.register(require('@fastify/cors'), { origin: true });
fastify.register(require('@fastify/rate-limit'), { max: 100, timeWindow: '1 minute' });
fastify.register(require('@fastify/multipart'), { limits: { fileSize: 10 * 1024 * 1024 } });
fastify.register(require('@fastify/static'), {
  root: path.join(__dirname, 'public'),
  prefix: '/'
});

// Fallback to explicitly serve index.html for root path, needed by some cloud providers
fastify.get('/', async (request, reply) => {
  return reply.sendFile('index.html');
});

// --- API Routes ---
// Health Check Endpoint
fastify.get('/api/health', async (request, reply) => {
  try {
    const supabase = require('./backend/utils/supabase');
    // Ping DB
    const { error } = await supabase.from('settings').select('id').limit(1);
    if (error) throw error;
    return { status: 'healthy', database: 'connected', timestamp: new Date().toISOString() };
  } catch(err) {
    return reply.code(500).send({ status: 'unhealthy', database: 'disconnected', error: err.message });
  }
});

fastify.register(require('./backend/routes/auth'), { prefix: '/api/auth' });
fastify.register(require('./backend/routes/projects'), { prefix: '/api/projects' });
fastify.register(require('./backend/routes/blogs'), { prefix: '/api/blogs' });
fastify.register(require('./backend/routes/tools'), { prefix: '/api/tools' });
fastify.register(require('./backend/routes/messages'), { prefix: '/api/messages' });
fastify.register(require('./backend/routes/settings'), { prefix: '/api/settings' });
fastify.register(require('./backend/routes/about'), { prefix: '/api/about' });
fastify.register(require('./backend/routes/upload'), { prefix: '/api/upload' });
fastify.register(require('./backend/routes/analytics'), { prefix: '/api/analytics' });

// --- Start ---
const start = async () => {
  try {
    await fastify.listen({ port: process.env.PORT || 3000, host: '0.0.0.0' });
    console.log(`🚀 Server running on http://localhost:${process.env.PORT || 3000}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};
start();
