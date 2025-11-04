import { FastifyPluginAsync } from "fastify";
import * as controller from "./users.controller";

// Routes for the users module. Schemas are JSON Schema used by Fastify
// for request validation and to generate OpenAPI docs.
const getUsersSchema = {
    response: {
        200: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    id: { type: "number" },
                    id_document: { type: "string" },
                    username: { type: "string" },
                    email: { type: "string" }
                },
                required: ["id", "id_document", "username", "email"]
            }
        }
    }
} as const;

const routes: FastifyPluginAsync = async function (app, opts) {
    // GET / -> list users
    app.get("/", { schema: getUsersSchema }, controller.getUsers);

    // POST / -> create user (body validated by schema)
    const createUserSchema = {
        body: {
            type: "object",
            properties: {
                id_document: { type: "string", minLength: 5 },
                username: { type: "string", minLength: 3 },
                email: { type: "string", format: "email" },
                password: { type: "string", minLength: 6 }
            },
            required: ["id_document", "username", "email", "password"]
        }
    } as const;

    app.post("/", { schema: createUserSchema }, controller.createUser);
};

export default routes;