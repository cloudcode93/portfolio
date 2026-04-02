const supabase = require('../utils/supabase');
const { authenticate } = require('../utils/auth');

async function routes(fastify) {
  // List published blogs (public)
  fastify.get('/', async (request) => {
    const showAll = request.query.all === 'true';
    let query = supabase.from('blogs').select('*').order('created_at', { ascending: false });
    if (!showAll) query = query.eq('published', true);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  });

  // Get blog by slug (public)
  fastify.get('/:slug', async (request) => {
    const { data, error } = await supabase
      .from('blogs').select('*').eq('slug', request.params.slug).single();
    if (error) throw error;
    return data;
  });

  // Create blog (protected)
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const { title, slug, content, excerpt, image_url, published } = request.body;
    if (!title || !slug || !content) return reply.status(400).send({ error: 'Title, slug, and content are required' });

    const { data, error } = await supabase
      .from('blogs').insert({ title, slug, content, excerpt, image_url, published }).select().single();
    if (error) throw error;
    return data;
  });

  // Update blog (protected)
  fastify.put('/:id', { preHandler: [authenticate] }, async (request) => {
    const { data, error } = await supabase
      .from('blogs').update(request.body).eq('id', request.params.id).select().single();
    if (error) throw error;
    return data;
  });

  // Delete blog (protected)
  fastify.delete('/:id', { preHandler: [authenticate] }, async (request) => {
    const { error } = await supabase
      .from('blogs').delete().eq('id', request.params.id);
    if (error) throw error;
    return { success: true };
  });
}

module.exports = routes;
