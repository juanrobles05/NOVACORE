import { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifySwagger from '@fastify/swagger';
import fastifySwaggerUi from '@fastify/swagger-ui';

// Register application-wide Fastify plugins.
// Keep comments minimal: behavior is obvious from the registration below.
export default async function registerPlugins(app: FastifyInstance) {
  // Enable CORS with default settings (customize per env if needed)
  await app.register(fastifyCors);

  // Register OpenAPI generator. This is useful in development and staging.
  // Consider disabling or restricting this in production when exposing internal APIs.
  await app.register(fastifySwagger, {
    openapi: {
      info: { title: 'NOVACORE API', version: '1.0.0' }
    }
  });

  // Serve Swagger UI at /docs
  await app.register(fastifySwaggerUi, { routePrefix: '/docs' });
}