import { FastifyPluginAsync } from "fastify";
import * as controller from "./users.controller";

// Routes for the users module. Schemas are JSON Schema used by Fastify
// for request validation and to generate OpenAPI docs.

const getUsersSchema = {
  response: { 200: { /* ... */ } }
} as const;

const getUserByIdSchema = {
  params: {
    type: "object",
    properties: {
      id: { type: "string", pattern: "^[0-9]+$" } // route param is string
    },
    required: ["id"]
  },
  response: {
    200: {
      type: "object",
      properties: {
        id: { type: "number" },
        id_document: { type: "string" },
        username: { type: "string" },
        email: { type: "string" }
      }
    }
  }
} as const;

// DELETE /:id -> delete user by id
const deleteUserSchema = {
  params: {
    type: "object",
    properties: {
      id: { type: "string", pattern: "^[0-9]+$" }
    },
    required: ["id"]
  }
} as const;

const routes: FastifyPluginAsync = async function (app, opts) {
  app.get("/", { schema: getUsersSchema }, controller.getUsers);
  app.post("/", controller.createUser);

  // route that accepts /api/users/:id  (and with ignoreTrailingSlash true also /api/users/:id/)
  app.get("/:id/", { schema: getUserByIdSchema }, controller.getUserById);
  app.delete("/:id/", { schema: deleteUserSchema }, controller.deleteUser);
};

export default routes;