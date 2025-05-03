/**
 * Admin user management routes.
 * @module routes/users
 */
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import { getDb } from '../data/db.mjs';
import { toggleUserActive } from '../services/userService.mjs';
import { logActivity } from '../services/activityService.mjs';

// Load environment variables
config();

/**
 * Registers user routes.
 * @param {FastifyInstance} fastify - Fastify instance.
 * @param {Object} options - Route options.
 * @async
 */
export async function registerUserRoutes(fastify) {
  // Handle user list retrieval
  fastify.get('/users', async (request, reply) => {
    // Extract token from Authorization header
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return reply.code(401).send({ error: 'No token provided' });
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Restrict to admin users
      if (decoded.role !== 'admin')
        return reply.code(403).send({ error: 'Admin access required' });
      // Get database instance
      const db = getDb();
      // Get search and active filters from query
      const { search, active } = request.query;
      // Build dynamic query for users
      let query = 'SELECT id, email, role, created_at, is_active FROM users';
      const params = [];
      if (search) {
        query += ' WHERE email LIKE ?';
        params.push(`%${search}%`);
      }
      if (active !== undefined) {
        query += params.length ? ' AND' : ' WHERE';
        query += ' is_active = ?';
        params.push(active === 'true' ? 1 : 0);
      }
      // Execute query to fetch users
      const users = db.prepare(query).all(...params);
      // Send user list
      reply.send({ users });
    } catch (err) {
      // Handle invalid token
      reply.code(401).send({ error: 'Invalid token' });
    }
  });

  // Handle user active status toggle
  fastify.post('/users/:id/toggle', async (request, reply) => {
    // Extract token from Authorization header
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return reply.code(401).send({ error: 'No token provided' });
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Restrict to admin users
      if (decoded.role !== 'admin')
        return reply.code(403).send({ error: 'Admin access required' });
      // Get user ID from route parameter
      const userId = parseInt(request.params.id, 10);
      // Get active status from request
      const { isActive } = request.body;
      // Toggle user active status via service layer
      toggleUserActive(userId, isActive);
      // Log toggle action
      logActivity(userId, `User ${isActive ? 'enabled' : 'disabled'} by admin`);
      // Send success response
      reply.send({ message: `User ${isActive ? 'enabled' : 'disabled'}` });
    } catch (err) {
      // Handle invalid token
      reply.code(401).send({ error: 'Invalid token' });
    }
  });
}
