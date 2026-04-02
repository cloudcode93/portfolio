const supabase = require('../utils/supabase');
const { authenticate } = require('../utils/auth');
const crypto = require('crypto');

async function routes(fastify) {
  // Track Page View (Public)
  fastify.post('/track', async (request, reply) => {
    try {
      const { path } = request.body || {};
      if (!path) return { ok: false };
      
      const ip = request.ip || request.headers['x-forwarded-for'] || 'unknown';
      const ip_hash = crypto.createHash('sha256').update(ip).digest('hex');
      const user_agent = request.headers['user-agent'] || 'unknown';
      const device_type = user_agent.includes('Mobile') ? 'mobile' : 'desktop';

      const { error } = await supabase.from('analytics').insert({
        path,
        user_agent,
        device_type,
        ip_hash
      });
      
      if (error) fastify.log.error('Analytics Insert Error: ' + error.message);
      return { ok: !error };
    } catch (err) {
      fastify.log.error('Analytics Error: ' + err.message);
      return { ok: false };
    }
  });

  // Get Analytics Stats (Protected Admin Endpoint)
  fastify.get('/stats', { preHandler: authenticate }, async () => {
    // 1. Total Views
    const { count: totalViews } = await supabase.from('analytics').select('*', { count: 'exact', head: true });
    
    // 2. Today Views
    const startOfDay = new Date();
    startOfDay.setHours(0,0,0,0);
    const { count: todayViews } = await supabase.from('analytics')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfDay.toISOString());
      
    // 3. Fetch paths, IPs, devices to calculate memory aggregates
    const { data } = await supabase.from('analytics').select('ip_hash, path, device_type');
    
    const pathCounts = {};
    const uniqueIps = new Set();
    let mobileCount = 0;
    
    (data || []).forEach(row => {
      pathCounts[row.path] = (pathCounts[row.path] || 0) + 1;
      if (row.ip_hash) uniqueIps.add(row.ip_hash);
      if (row.device_type === 'mobile') mobileCount++;
    });
    
    // Sort and take top 5 paths
    const topPages = Object.keys(pathCounts)
      .map(k => ({ path: k, views: pathCounts[k] }))
      .sort((a,b) => b.views - a.views)
      .slice(0, 5);
      
    return {
      totalViews: totalViews || 0,
      todayViews: todayViews || 0,
      uniqueUsers: uniqueIps.size,
      mobilePercentage: data && data.length > 0 ? Math.round((mobileCount / data.length) * 100) : 0,
      topPages
    };
  });
}

module.exports = routes;
