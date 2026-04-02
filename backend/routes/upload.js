const supabase = require('../utils/supabase');
const { authenticate } = require('../utils/auth');

async function routes(fastify) {
  // Upload file to Supabase Storage (protected)
  fastify.post('/', { preHandler: [authenticate] }, async (request, reply) => {
    const data = await request.file();
    if (!data) return reply.status(400).send({ error: 'No file uploaded' });

    const bucket = data.fields.bucket?.value || 'projects-images';
    const buffer = await data.toBuffer();
    const fileName = `${Date.now()}-${data.filename}`;

    const { data: uploadData, error } = await supabase.storage
      .from(bucket)
      .upload(fileName, buffer, { contentType: data.mimetype, upsert: false });

    if (error) throw error;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return { url: urlData.publicUrl, path: uploadData.path };
  });
}

module.exports = routes;
