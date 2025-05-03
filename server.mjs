/**
 * Entry point for AuthMini server.
 * @module server
 */
import Fastify from 'fastify';
import fastifyStatic from '@fastify/static';
import { config } from 'dotenv';
import { registerRoutes } from './backend/routes/auth.mjs';
import { registerUserRoutes } from './backend/routes/users.mjs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
config();
// Initialize Fastify with logging
const fastify = Fastify({
  logger: { level: process.env.LOG_LEVEL || 'info' },
});
// Get directory name for static file serving
const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Starts the Fastify server.
 * @async
 */
async function startServer() {
  // Register static file serving for frontend
  await fastify.register(fastifyStatic, {
    root: join(__dirname, 'frontend'),
    prefix: '/',
    setHeaders: (res) => {
      // Set cache control for static files
      res.setHeader('Cache-Control', 'public, max-age=3600');
    },
  });

  // Register authentication routes
  await fastify.register(registerRoutes, { prefix: '/api' });
  // Register admin user routes
  await fastify.register(registerUserRoutes, { prefix: '/api' });

  try {
    // Start server on specified port for render use 10000
    const port = process.env.PORT || 3000;
    // Bind to 0.0.0.0 in production (Render), otherwise use default (localhost)
    const host =
      process.env.NODE_ENV === 'production' ? '0.0.0.0' : '127.0.0.1';
    await fastify.listen({ port, host });
    fastify.log.info(`Server running on port ${process.env.PORT}`);
  } catch (err) {
    // Log and exit on server failure
    fastify.log.error(err);
    process.exit(1);
  }
}

// Start the server
startServer();
