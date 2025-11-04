import { getDb } from '../../core/db/connection';
import { User } from './users.model';
import { config } from '../../core/config/env';

export async function getAllUsers(): Promise<User[]> {
    const db = getDb();

    if (!db) {
        if (config.nodeEnv !== 'production') return [{ id: 1, id_document: '123456789', username: 'testuser', email: 'testuser@example.com' }];
        throw new Error('Database not configured');
    }

    const result = await db.query('SELECT * FROM users');
    return result.rows;
}

export async function createUser(payload: Pick<User, 'id_document' | 'username' | 'email' | 'password'>): Promise<User> {
    const db = getDb();

    if (!db) {
        if (config.nodeEnv !== 'production') return { id: 1, id_document: '123456789', username: 'testuser', email: 'testuser@example.com', password: 'testpassword' };
        throw new Error('Database not configured');
    }

    const result = await db.query('INSERT INTO users (id_document, username, email, password) VALUES ($1, $2, $3, $4) RETURNING *', [payload.id_document, payload.username, payload.email, payload.password]);
    return result.rows[0];
}