const bcrypt = require('bcryptjs');
const supabase = require('../utils/supabase');
const { signToken, authenticate } = require('../utils/auth');

async function routes(fastify) {
  // Login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body || {};
    if (!email || !password) return reply.status(400).send({ error: 'Email and password required' });

    const { data: user, error } = await supabase
      .from('users').select('*').eq('email', email).single();

    if (error || !user) return reply.status(401).send({ error: 'Invalid credentials' });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return reply.status(401).send({ error: 'Invalid credentials' });

    const token = signToken({ id: user.id, email: user.email });
    return { token, user: { id: user.id, email: user.email } };
  });

  // Get current user
  fastify.get('/me', { preHandler: [authenticate] }, async (request) => {
    return { user: request.user };
  });
}

module.exports = routes;
