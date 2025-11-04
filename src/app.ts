import Fastify, { FastifyInstance } from 'fastify';
import registerPlugins from './core/plugins/index';
import usersModule from './modules/users/index';
import { initDb, getDb, closeDb } from './core/db/connection';
import { config } from './core/config/env';

export async function buildApp(): Promise<FastifyInstance> {

  const isDevelopment = config.nodeEnv !== 'production';

  const loggerOptions = {
    level: isDevelopment ? 'debug' : 'info',

    transport: isDevelopment ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:HH:MM:ss Z',
        ignore: 'pid,hostname',
      }
    } : undefined,
  };

  const app = Fastify({ logger: loggerOptions });

  // Registrar plugins globales (CORS, Swagger, etc.)
  await registerPlugins(app);

  // Registrar módulo de usuarios con prefijo
  await app.register(usersModule, { prefix: '/api/users' });

  // Ruta raíz
  app.get('/', async () => ({ message: 'NOVACORE API V1 ONLINE' }));

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