import { FastifyReply, FastifyRequest } from "fastify";
import * as service from './users.service';
import { CreateUserBodySchema } from './users.schemas';
import { ZodError } from 'zod';

export async function getUsers(req: FastifyRequest, reply: FastifyReply) {
  try {
    const users = await service.getAllUsers();
    return reply.send(users);
  } catch (err: any) {
    // Known error: DB not configured -> service unavailable
    if (err?.message === 'Database not configured') {
      return reply.status(503).send({ status: 'error', error: 'database not configured' });
    }

    // Generic server error
    req.log?.error(err);
    return reply.status(500).send({ status: 'error', error: 'internal_server_error' });
  }
}

export async function createUser(req: FastifyRequest, reply: FastifyReply) {
  try {
    // Validate request body (Zod) and create the resource
    const parsed = CreateUserBodySchema.parse(req.body);
    const user = await service.createUser(parsed);
    return reply.status(201).send(user);
  } catch (err: any) {
    // Known error: DB not configured -> service unavailable
    if (err?.message === 'Database not configured') {
      return reply.status(503).send({ status: 'error', error: 'database not configured' });
    }

    // Zod validation error
    if (err instanceof ZodError) {
      return reply.status(400).send({ status: 'error', error: 'invalid_request', details: err.issues });
    }

    // Generic server error
    req.log?.error(err);
    return reply.status(500).send({ status: 'error', error: 'internal_server_error' });
  }
}