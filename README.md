# Knowledge Hub

## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.

## Downloading

```
git clone {repository URL}
```

## Installing NPM modules

```
npm install
```

## Running application

```
npm start
```

After starting the app on port (4000 as default) you can open
in your browser OpenAPI documentation by typing http://localhost:4000/doc/.
For more information about OpenAPI/Swagger please visit https://swagger.io/.

## Testing

After application running open new terminal and enter:

To run all tests without authorization

```
npm run test
```

To run only one of all test suites

```
npm run test -- <path to suite>
```

To run all unit tests

```
npm run test:unit
```

To run only specific unit test suite

```
npm run test:unit -- <path to suite>
```

To run all test with authorization

```
npm run test:auth
```

To run only specific test suite with authorization

```
npm run test:auth -- <path to suite>
```

To run refresh token tests

```
npm run test:refresh
```

To run RBAC (role-based access control) tests

```
npm run test:rbac
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

### Debugging in VSCode

Press <kbd>F5</kbd> to debug.

For more information, visit: https://code.visualstudio.com/docs/editor/debugging

## Docker & Database

Application image size: 65.8 MB (compressed) -
[Docker Hub Repository](https://hub.docker.com/repository/docker/245091236523498/knowledge-hub-app/general)

The Docker Scout scan revealed no critical (C) vulnerabilities. See the full report in [scout-report.txt](scout-report.txt).

### Setup

1. Copy `.env.example` to `.env` and fill in the values:

```
cp .env.example .env
```

2. Configure `DATABASE_URL` in `.env` depending on how you run the app:

| Scenario | `POSTGRES_HOST` | `DATABASE_URL` example |
|---|---|---|
| **Docker Compose** (app + db in containers) | `db` (docker service name) | `postgresql://postgres:postgres@db:5432/knowledge_hub` |
| **Local dev** (app on host, db in container or local) | `localhost` | `postgresql://postgres:postgres@localhost:5432/knowledge_hub` |

> Inside Docker network containers communicate by service name (`db`).
> From the host machine, use `localhost` since the port is forwarded via `ports` in docker-compose.

### Running with Docker Compose

Start all services (app + PostgreSQL). Migrations are applied automatically on startup.

```
docker compose up --build
```

Use debug profile to start Adminer database management tool at http://localhost:8080:

```
docker compose --profile debug up --build
```

### Database commands

Run seed (populate database with initial data) — execute from the host machine with `localhost` in `DATABASE_URL`:

```
npx prisma db seed
```

Create a new migration after schema changes:

```
npx prisma migrate dev --name <migration_name>
```

Apply pending migrations (runs automatically in Docker on startup):

```
npx prisma migrate deploy
```

Open Prisma Studio (visual database browser):

```
npx prisma studio
```
