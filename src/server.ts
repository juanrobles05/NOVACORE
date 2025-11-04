import { buildApp } from './app';

const start = async () => {
  const app = await buildApp();

  // Graceful shutdown helper
  const shutdown = async (signal: string) => {
    try {
      app.log.info({ signal }, 'Received signal, closing server...');
      await app.close();
      app.log.info('Fastify instance closed, exiting process');
      process.exit(0);
    } catch (err) {
      app.log.error(err, 'Error during shutdown');
      process.exit(1);
    }
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));

  try {
    await app.listen({ port: Number(process.env.PORT) || 3000, host: '0.0.0.0' });
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start();