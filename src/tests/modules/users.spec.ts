import { beforeAll, afterAll, describe, expect, it } from 'vitest';
import { FastifyInstance } from 'fastify';
import { buildApp } from '../../app';


process.env.NODE_ENV = 'test';

describe('Users CRUD Endpoints', () => {
    let app: FastifyInstance;
    let createdUserId: number | 0 = 0;

    // Example user payload for creation
    const userPayload = {
        id_document: '123456789',
        username: 'John Test',
        email: `john.test.${Date.now()}@example.com`, // Use a unique email
        password: 'A-Strong-P4sswOrd',
    };

    // Initial Setup
    beforeAll(async () => {
        app = await buildApp();
    });

    // Final Cleanup
    afterAll(async () => {
        // Optional: Remove the created user to ensure environment cleanup
        if (createdUserId) {
            await app.inject({
                method: 'DELETE',
                url: `/api/users/${createdUserId}/`,
            });
        }
        await app.close();
    });

    // ------------------------------------
    // TEST: POST /users (Crear Usuario)
    // ------------------------------------
    it('POST /users should return 201 and create a new user', async () => {
        // Simulate the creation request
        const res = await app.inject({
            method: 'POST',
            url: '/api/users/',
            payload: userPayload,
        });

        // Assertions
        expect(res.statusCode).toBe(201); // 201 Created
        const payload = JSON.parse(res.payload);

        // El cuerpo debe contener el ID generado por la DB y los datos sin el password
        expect(payload).toHaveProperty('id');
        expect(typeof payload.id).toBe('number');
        expect(payload.id_document).toBe(userPayload.id_document);
        expect(payload.username).toBe(userPayload.username);
        expect(payload.email).toBe(userPayload.email);
        expect(payload).not.toHaveProperty('password');
        expect(payload.id).toBeGreaterThan(0);

        // Guardar el ID para las siguientes pruebas y la limpieza
        createdUserId = payload.id;
    });

    // ------------------------------------
    // TEST: GET /users/:id (Leer Usuario)
    // ------------------------------------
    it('GET /users/:id should return 200 and the user data', async () => {
        // Se asume que el usuario fue creado en el test anterior (createdUserId está disponible)
        if (!createdUserId) throw new Error('User ID not set for retrieval test.');

        // 1. Simular la petición de lectura
        const res = await app.inject({
            method: 'GET',
            url: `/api/users/${createdUserId}/`,
        });

        // 2. Afirmaciones
        expect(res.statusCode).toBe(200);
        const payload = JSON.parse(res.payload);

        // Verificar que los datos son correctos
        expect(payload.id).toBe(createdUserId);
        expect(payload.id_document).toBe(userPayload.id_document);
        expect(payload.username).toBe(userPayload.username);
        expect(payload.email).toBe(userPayload.email);
        expect(payload).not.toHaveProperty('password');
    });

    // ------------------------------------
    // TEST: GET /users (Listar Usuarios)
    // ------------------------------------
    it('GET /users should return 200 and a list containing the created user', async () => {
        const res = await app.inject({
            method: 'GET',
            url: '/api/users/',
        });

        expect(res.statusCode).toBe(200);
        const payload = JSON.parse(res.payload);

        // Debe retornar un arreglo y al menos un elemento
        expect(Array.isArray(payload)).toBe(true);
        expect(payload.length).toBeGreaterThanOrEqual(1);

        // Verificar que el usuario creado está en la lista
        const foundUser = payload.find((user: any) => user.id === createdUserId);
        expect(foundUser).toBeDefined();
        expect(foundUser.email).toBe(userPayload.email);
    });

    // ----------------------------------------------------
    // TEST: GET /users/:id (Usuario No Encontrado - 404)
    // ----------------------------------------------------
    it('GET /users/:id should return 404 for a non-existent user', async () => {
        const nonExistentId = Math.floor(Math.random() * 1_000_000_000) + 1; // Asumiendo formato UUID/similar

        const res = await app.inject({
            method: 'GET',
            url: `/api/users/${nonExistentId}/`,
        });

        expect(res.statusCode).toBe(404);
    });

    // ------------------------------------
    // TEST: DELETE /users/:id (Eliminar)
    // ------------------------------------
    it('DELETE /users/:id should return 204 and remove the user', async () => {
        // Se asume que el usuario existe
        if (!createdUserId) throw new Error('User ID not set for deletion test.');

        // 1. Simular la petición de eliminación
        const deleteRes = await app.inject({
            method: 'DELETE',
            url: `/api/users/${createdUserId}/`,
        });


        // 2. Afirmación de éxito (No Content)
        expect(deleteRes.statusCode).toBe(204);

        // 3. Verificación: Intentar leer el usuario eliminado
        const verifyRes = await app.inject({
            method: 'GET',
            url: `/api/users/${createdUserId}/`,
        });

        // Debe fallar con 404
        expect(verifyRes.statusCode).toBe(404);
        createdUserId = 0; // Limpiar la referencia
    });

    it('POST /users should return 400 when input data fails Zod validation', async () => {
        // Escenario 1: Email inválido
        const invalidEmailPayload = {
            ...userPayload,
            email: 'not-an-email', // Rompe la validación .email()
            password: 'A-Strong-P4sswOrd',
        };

        let res = await app.inject({
            method: 'POST',
            url: '/api/users/',
            payload: invalidEmailPayload,
        });


        expect(res.statusCode).toBe(400);
        const payload = JSON.parse(res.payload);
        // Verificar el formato de error de Fastify/Zod
        expect(res).toHaveProperty('statusCode', 400);
        expect(res).toHaveProperty('statusMessage', 'Bad Request');
        expect(payload.details[0].message).toContain('email');

        // Escenario 2: Password demasiado corto (si tu Schema lo define)
        const shortPasswordPayload = {
            ...userPayload,
            password: 'short', // Rompe la validación .min(8)
        };

        res = await app.inject({
            method: 'POST',
            url: '/api/users/',
            payload: shortPasswordPayload,
        });

        expect(res.statusCode).toBe(400);
    });

    it('POST /users should return 400/500 if a NOT NULL column is missing (e.g., id_document)', async () => {
    const missingIdPayload = {
        email: `missing.${Date.now()}@test.com`,
        password: 'A-Strong-P4sswOrd',
        name: 'Missing ID',
        // id_document está omitido
    };

    const res = await app.inject({
        method: 'POST',
        url: '/api/users/',
        payload: missingIdPayload,
    });

    // Si Zod tiene el campo como .string().min(1), devuelve 400.
    // Si Zod lo permite, la DB falla con 500 (violación NOT NULL).
    // El resultado más limpio es 400 gracias a la validación Zod.
    expect(res.statusCode).toBe(400);
});
});