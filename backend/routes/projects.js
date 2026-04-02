const supabase = require('../utils/supabase');
const { authenticate } = require('../utils/auth');

async function routes(fastify) {
  // List all projects (public)
  fastify.get('/', async () => {
    const { data, error } = await supabase
      .from('projects').select('*').order('sort_order', { ascending: true });
    if (error) throw error;
    return data;
  });

  // Get single project (public)
  fastify.get('/:id', async (request) => {
    const { data, error } = await supabase
      .from('projects').select('*').eq('id', request.params.id).single();
    if (error) throw error;
    return data;
  });

  // Create project (protected)
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const { title, description, tech_stack, image_url, live_link, github_link, category, featured, sort_order } = request.body;
    if (!title) return reply.status(400).send({ error: 'Title is required' });

    const { data, error } = await supabase
      .from('projects').insert({ title, description, tech_stack, image_url, live_link, github_link, category, featured, sort_order }).select().single();
    if (error) throw error;
    return data;
  });

  // Update project (protected)
  fastify.put('/:id', { preHandler: [authenticate] }, async (request) => {
    const { data, error } = await supabase
      .from('projects').update(request.body).eq('id', request.params.id).select().single();
    if (error) throw error;
    return data;
  });

  // Delete project (protected)
  fastify.delete('/:id', { preHandler: [authenticate] }, async (request) => {
    const { error } = await supabase
      .from('projects').delete().eq('id', request.params.id);
    if (error) throw error;
    return { success: true };
  });
}

module.exports = routes;
