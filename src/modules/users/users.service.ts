import { getDb } from '../../core/db/connection';
import { User } from './users.model';
import { config } from '../../core/config/env';

export async function getAllUsers(): Promise<User[]> {
    const db = getDb();

    if (!db) {
        if (config.nodeEnv !== 'production') return [{ id: 1, id_document: '123456789', username: 'testuser', email: 'testuser@example.com' }];
        throw new Error('Database not configured');
    }

    const result = await db.query('SELECT id, id_document, username, email FROM users');
    return result.rows;
}


export async function getUserById(id: number): Promise<User | null> {
  const db = getDb();
  if (!db) {
    if (config.nodeEnv !== 'production') {
      return { id: 1, id_document: '123456789', username: 'testuser', email: 'testuser@example.com' };
    }
    throw new Error('Database not configured');
  }
  const result = await db.query('SELECT id, id_document, username, email FROM users WHERE id = $1', [id]);
  return result.rows[0] ?? null;
}


export async function createUser(payload: Pick<User, 'id_document' | 'username' | 'email' | 'password'>): Promise<User> {
    const db = getDb();

    if (!db) {
        if (config.nodeEnv !== 'production') return { id: 1, id_document: '123456789', username: 'testuser', email: 'testuser@example.com', password: 'testpassword' };
        throw new Error('Database not configured');
    }

    const result = await db.query('INSERT INTO users (id_document, username, email, password) VALUES ($1, $2, $3, $4) RETURNING id, id_document, username, email', [payload.id_document, payload.username, payload.email, payload.password]);
    return result.rows[0];
}


export async function deleteUserById(id: number): Promise<User | null> {
  const db = getDb();
  if (!db) {
    if (config.nodeEnv !== 'production') {
      // In dev mode return a fake deleted user for testing
      return { id: 1, id_document: '123456789', username: 'testuser', email: 'testuser@example.com' } as unknown as User;
    }
    throw new Error('Database not configured');
  }

  const result = await db.query('DELETE FROM users WHERE id = $1 RETURNING id, id_document, username, email', [id]);
  return result.rows[0] ?? null;
}