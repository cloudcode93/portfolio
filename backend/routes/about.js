const supabase = require('../utils/supabase');
const { authenticate } = require('../utils/auth');

async function routes(fastify) {
  // Get about content (public)
  fastify.get('/', async () => {
    const { data, error } = await supabase.from('about').select('*').single();
    if (error) throw error;
    return data;
  });

  // Update about content (protected)
  fastify.put('/', { preHandler: [authenticate] }, async (request) => {
    const { data: existing } = await supabase.from('about').select('id').single();
    if (!existing) throw new Error('About not found');

    const { data, error } = await supabase
      .from('about').update(request.body).eq('id', existing.id).select().single();
    if (error) throw error;
    return data;
  });
}

module.exports = routes;
