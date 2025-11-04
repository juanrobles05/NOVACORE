# NOVACORE

Boilerplate for Fastify + TypeScript projects following a modular, domain-driven pattern.

This repository is a starting template (a.k.a. NovaFast Pattern) that provides a clear folder layout, config helpers, DB connection wiring and an example `users` module so you can quickly spin up a new API.

## Main features
- Modular structure by domain (each module contains routes, controller, service, model)
- Fastify app wiring and plugin registration
- Simple PostgreSQL connection helper (core/db)
- Example `users` module with request validation using Zod
- Tests scaffolded with Vitest

## Quick start

1. Install dependencies

```pwsh
npm install
```

2. Create your environment file from the example and edit values

```pwsh
cp .env.example .env
# Edit .env and set DATABASE_URL and other variables
```

3. Run in development (hot-reload)

```pwsh
npm run dev
```

4. Run tests

```pwsh
npm test
```

## Project layout

Top-level layout (important files/folders):

```
src/
 ├── core/         → config, DB connection, common plugins
 ├── modules/      → domain modules (eg. users)
 │   └── users/    → controller, service, model, routes, schemas
 ├── shared/       → shared utils and types (logger, common types)
 ├── app.ts        → Fastify instance and plugin/module registration
 └── server.ts     → server entrypoint (runs the app)
```

Key scripts (see `package.json`):

- `npm run dev` — development server (ts-node-dev)
- `npm run build` — compile TypeScript
- `npm test` — run tests with Vitest
- `npm run check-types` — run TypeScript type check

## How modules are organized

Each module (under `src/modules`) should include:

- `<name>.routes.ts` — Fastify routes and JSON schemas
- `<name>.controller.ts` — thin HTTP layer, input validation, error mapping
- `<name>.service.ts` — business logic and DB orchestration
- `<name>.model.ts` — TypeScript types or DB mappings
- `index.ts` — module registration helper

This separation keeps controllers small, services testable and DB access isolated.

## Security note — do not return sensitive fields

When returning rows from the database avoid using `RETURNING *` on user creation or updates; explicitly return only public fields (eg. `RETURNING id, id_document, username, email`). Controllers and services in this template already follow that guideline in most places, but double-check any new SQL queries to avoid leaking `password` or other secrets.

## Tests

Vitest is configured as the test runner. Tests are located in `src/tests` and `tests/`.

Run all tests:

```pwsh
npm test
```

## Contributing

If you use this template as a repo starter, follow these recommendations:

- Keep commits small and focused (docs, feature, tests, ci)
- Use Conventional Commits for consistent history
- Add a unit test when adding business logic
- Protect `main` with branch protection and CI

## License

MIT — see `LICENSE`

---

If you'd like, I can also:
- add badges (build/test/coverage) to the top of this README,
- generate a `CONTRIBUTING.md`, or
- create a GitHub Actions workflow that runs the tests on push/PR.
