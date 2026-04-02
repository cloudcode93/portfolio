const supabase = require('../utils/supabase');
const { authenticate } = require('../utils/auth');

async function routes(fastify) {
  // Get settings (public)
  fastify.get('/', async () => {
    const { data, error } = await supabase.from('settings').select('*').single();
    if (error) throw error;
    return data;
  });

  // Update settings (protected)
  fastify.put('/', { preHandler: [authenticate] }, async (request) => {
    // Get the single settings row
    const { data: existing } = await supabase.from('settings').select('id').single();
    if (!existing) throw new Error('Settings not found');

    const { data, error } = await supabase
      .from('settings').update(request.body).eq('id', existing.id).select().single();
    if (error) throw error;
    return data;
  });
}

module.exports = routes;
