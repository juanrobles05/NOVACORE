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


export async function getUserById(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const idStr = req.params.id;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id) || id <= 0) {
      return reply.status(400).send({ status: 'error', error: 'invalid_id' });
    }

    const user = await service.getUserById(id);
    if (!user) return reply.status(404).send({ status: 'error', error: 'not_found' });

    return reply.send(user);
  } catch (err) {
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

    if (err instanceof SyntaxError) {
      return reply.status(400).send({ status: 'error', error: 'invalid_request', details: [{ message: 'Invalid format', field: 'body' }] });
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


export async function deleteUser(req: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply) {
  try {
    const idStr = req.params.id;
    const id = parseInt(idStr, 10);
    if (Number.isNaN(id) || id <= 0) {
      return reply.status(400).send({ status: 'error', error: 'invalid_id' });
    }

    const deleted = await service.deleteUserById(id);
    if (!deleted) return reply.status(404).send({ status: 'error', error: 'not_found' });

    // return the deleted resource for reference
    return reply.status(204).send();
  } catch (err: any) {
    if (err?.message === 'Database not configured') {
      return reply.status(503).send({ status: 'error', error: 'database not configured' });
    }

    req.log?.error(err);
    return reply.status(500).send({ status: 'error', error: 'internal_server_error' });
  }
}