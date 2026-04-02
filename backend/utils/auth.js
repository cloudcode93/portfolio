const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'fallback_secret';

/** Sign a JWT token */
function signToken(payload) {
  return jwt.sign(payload, SECRET, { expiresIn: '7d' });
}

/** Verify a JWT token */
function verifyToken(token) {
  return jwt.verify(token, SECRET);
}

/** Fastify preHandler hook — protects admin routes */
async function authenticate(request, reply) {
  try {
    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return reply.status(401).send({ error: 'Unauthorized' });
    }
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid or expired token' });
  }
}

module.exports = { signToken, verifyToken, authenticate };
