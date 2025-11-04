import Fastify, { FastifyInstance } from 'fastify';
import registerPlugins from './core/plugins/index';
import usersModule from './modules/users/index';
import { initDb, getDb, closeDb } from './core/db/connection';
import { loggerOpts, logger } from './shared/utils/logger';
import { config } from './core/config/env';

// Function to build and configure the Fastify app
export async function buildApp(): Promise<FastifyInstance> {

  // Create Fastify instance with logger
  const app = Fastify({ logger: loggerOpts });

  // Register plugins
  await registerPlugins(app);

  // Register users module with prefix
  await app.register(usersModule, { prefix: '/api/users' });

  // Root route
  app.get('/', async (request, reply) => {
  const payload = {
    message: 'NOVACORE API v1 is up and running!',
    docs: '/docs',
    healthCheck: '/health',
    environment: config.nodeEnv
  };

  reply
    .code(200)
    .type('application/json')
    .send(JSON.stringify(payload, null, 2)); // null, 2 -> 2 spaces indentation
});

  // Initialize DB if configured
  await initDb();

  // Health check endpoint: checks DB connectivity (skips DB in non-production when not configured)
  app.get('/health', async (request, reply) => {
    const db = getDb();
    if (!db) {
      if (config.nodeEnv !== 'production') return reply.status(200).send({ status: 'ok', db: 'skipped' });
      return reply.status(503).send({ status: 'error', detail: 'database not configured' });
    }

    try {
      await db.query('SELECT 1');
      return reply.status(200).send({ status: 'ok' });
    } catch (err) {
      app.log.error({ err }, 'Health check failed');
      return reply.status(503).send({ status: 'error', detail: 'database unavailable' });
    }
  });

  // Hook para cerrar recursos al cerrar la instancia de Fastify
  app.addHook('onClose', async (instance) => {
    try {
      await closeDb();
      instance.log.info('Database pool closed');
    } catch (err) {
      instance.log.error({ err }, 'Error closing database pool');
    }
  });

  return app;
}