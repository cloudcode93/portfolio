const supabase = require('../utils/supabase');
const { authenticate } = require('../utils/auth');

async function routes(fastify) {
  // List all tools (public)
  fastify.get('/', async () => {
    const { data, error } = await supabase
      .from('tools').select('*').order('category', { ascending: true });
    if (error) throw error;
    return data;
  });

  // Create tool (protected)
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const { name, description, icon_url, link, category } = request.body;
    if (!name) return reply.status(400).send({ error: 'Name is required' });

    const { data, error } = await supabase
      .from('tools').insert({ name, description, icon_url, link, category }).select().single();
    if (error) throw error;
    return data;
  });

  // Update tool (protected)
  fastify.put('/:id', { preHandler: [authenticate] }, async (request) => {
    const { data, error } = await supabase
      .from('tools').update(request.body).eq('id', request.params.id).select().single();
    if (error) throw error;
    return data;
  });

  // Delete tool (protected)
  fastify.delete('/:id', { preHandler: [authenticate] }, async (request) => {
    const { error } = await supabase
      .from('tools').delete().eq('id', request.params.id);
    if (error) throw error;
    return { success: true };
  });
}

module.exports = routes;
