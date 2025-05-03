/**
 * Authentication routes for AuthMini.
 * @module routes/auth
 */
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import {
  registerUser,
  loginUser,
  updateUserProfile,
  updateUserSettings,
  changeUserPassword,
} from '../services/userService.mjs';
import { logActivity } from '../services/activityService.mjs';

// Load environment variables
config();

/**
 * Registers auth routes.
 * @param {FastifyInstance} fastify - Fastify instance.
 * @param {Object} options - Route options.
 * @async
 */
export async function registerRoutes(fastify) {
  // Handle user registration
  fastify.post('/register', async (request, reply) => {
    const { email, password } = request.body;
    try {
      // Delegate registration to service layer
      await registerUser(email, password);
      // Send success response
      reply.code(201).send({ message: 'User registered' });
    } catch (err) {
      // Handle errors (e.g., duplicate email)
      reply.code(400).send({ error: `Registration failed: ${err.message}` });
    }
  });

  // Handle user login
  fastify.post('/login', async (request, reply) => {
    const { email, password } = request.body;
    try {
      // Delegate login to service layer
      const { token, user } = await loginUser(email, password);
      // Send token and user data
      reply.send({ token, user });
    } catch (err) {
      // Handle invalid credentials
      reply.code(401).send({ error: err.message });
    }
  });

  // Handle logout (client-side token removal)
  fastify.post('/logout', async (request, reply) => {
    reply.send({ message: 'Logged out' });
  });

  // Handle profile updates
  fastify.post('/profile', async (request, reply) => {
    // Extract token from Authorization header
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return reply.code(401).send({ error: 'No token provided' });
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Get profile data from request
      const profileData = request.body;
      // Update profile via service layer
      updateUserProfile(decoded.id, profileData);
      // Log profile update
      logActivity(decoded.id, 'Profile updated');
      reply.send({ message: 'Profile updated' });
    } catch (err) {
      // Handle invalid token
      reply.code(401).send({ error: 'Invalid token' });
    }
  });

  // Handle password changes
  fastify.post('/password', async (request, reply) => {
    // Extract token from Authorization header
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return reply.code(401).send({ error: 'No token provided' });
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Get new password from request
      const { newPassword } = request.body;
      // Update password via service layer
      await changeUserPassword(decoded.id, newPassword);
      // Log password change
      logActivity(decoded.id, 'Password changed');
      reply.send({ message: 'Password updated' });
    } catch (err) {
      // Handle invalid token
      reply.code(401).send({ error: 'Invalid token' });
    }
  });

  // Handle settings updates
  fastify.post('/settings', async (request, reply) => {
    // Extract token from Authorization header
    const token = request.headers.authorization?.replace('Bearer ', '');
    if (!token) return reply.code(401).send({ error: 'No token provided' });
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      // Get settings data from request
      const settingsData = request.body;
      // Update settings via service layer
      updateUserSettings(decoded.id, settingsData);
      // Log settings update
      logActivity(decoded.id, 'Settings updated');
      reply.send({ message: 'Settings updated' });
    } catch (err) {
      // Handle invalid token
      reply.code(401).send({ error: 'Invalid token' });
    }
  });
}
