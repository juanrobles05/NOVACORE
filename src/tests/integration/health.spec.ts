import { beforeAll, afterAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../app';
import { closeDb, getDb } from '../../core/db/connection';

describe('GET /health', () => {
  // App instance
  let app: Awaited<ReturnType<typeof buildApp>>;
  let dbIsConfigured = false;

  // Setup and teardown
  beforeAll(async () => {
    app = await buildApp();
    // Mock db.query to avoid real DB dependency
    dbIsConfigured = !!getDb();
    // Opcional: Si necesitas asegurar que la tabla users existe antes de los tests
    if (dbIsConfigured) {
        await getDb()?.query('SELECT 1');
    }
  });

  afterAll(async () => {
    if (app) await app.close(), closeDb();
  });

  it('returns 200 and ok status when service is running', async () => {
    const res = await app.inject({ method: 'GET', url: '/' });
    expect(res.statusCode).toBe(200);
  });

  it('returns 200 and checks DB status via real query', async () => {
    if (!dbIsConfigured) {
      console.warn('Skipping /health DB check: DATABASE_URL not set for test env.');
      return;
    }

    const res = await app.inject({ method: 'GET', url: '/health' });

    expect(res.statusCode).toBe(200);
    const payload = JSON.parse(res.payload);

    expect(payload).toHaveProperty('status', 'ok');
    expect(payload).not.toHaveProperty('db, skipped');
  });
});