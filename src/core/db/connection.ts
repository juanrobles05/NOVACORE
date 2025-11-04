import { config } from '../config/env';
import pg from 'pg';

let pool: pg.Pool | null = null;

// Initialize the connection pool if DATABASE_URL is configured.
// We avoid forcing a test query here; connectivity is surfaced by the /health endpoint or callers.
export async function initDb(): Promise<void> {
  if (!config.databaseUrl) {
    pool = null;
    return;
  }

  pool = new pg.Pool({ connectionString: config.databaseUrl });
}

// Return the current pool (or null when DB is not configured)
export function getDb(): pg.Pool | null {
  return pool;
}

// Close the pool gracefully and clear the reference.
export async function closeDb(): Promise<void> {
  if (!pool) return;
  try {
    await pool.end();
    pool = null;
  } catch (err) {
    // Let callers handle logging of unexpected close errors.
    throw err;
  }
}