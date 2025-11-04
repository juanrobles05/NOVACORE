import dotenv from 'dotenv';
import { envSchema } from './schema';
import { z } from 'zod';

dotenv.config();

// Validate environment variables at startup and fail fast if invalid.
const parsed = envSchema.safeParse(process.env);
if (!parsed.success) {
  // Use console because the logger may not be initialized yet.
  // eslint-disable-next-line no-console
  console.error('Environment validation error:', z.treeifyError(parsed.error));
  throw new Error('Invalid environment variables');
}

const env = parsed.data;

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  authEnabled: env.AUTH_ENABLED,
  nodeEnv: env.NODE_ENV,
};