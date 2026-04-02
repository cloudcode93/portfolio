const supabase = require('../utils/supabase');
const { authenticate } = require('../utils/auth');

async function routes(fastify) {
  // List messages (protected)
  fastify.get('/', { preHandler: [authenticate] }, async () => {
    const { data, error } = await supabase
      .from('messages').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  });

  // Submit contact form (public)
  fastify.post('/', async (request, reply) => {
    const { name, email, subject, message } = request.body || {};
    if (!name || !email || !message) return reply.status(400).send({ error: 'Name, email, and message are required' });

    const { data, error } = await supabase
      .from('messages').insert({ name, email, subject, message }).select().single();
    if (error) throw error;
    return { success: true, message: 'Message sent successfully' };
  });

  // Mark as read (protected)
  fastify.put('/:id', { preHandler: [authenticate] }, async (request) => {
    const { data, error } = await supabase
      .from('messages').update({ status: 'read' }).eq('id', request.params.id).select().single();
    if (error) throw error;
    return data;
  });

  // Delete message (protected)
  fastify.delete('/:id', { preHandler: [authenticate] }, async (request) => {
    const { error } = await supabase
      .from('messages').delete().eq('id', request.params.id);
    if (error) throw error;
    return { success: true };
  });
}

module.exports = routes;
