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

Application image size: 101.18 MB (Compressed) and 492.98 MB (Plain)-
[Docker Hub Repository](https://hub.docker.com/repository/docker/245091236523498/knowledge-hub-app/general)

The Docker Scout scan revealed no critical (C) vulnerabilities. See the full report in [scout-report.txt](scout-report.txt).

### Setup

1. Copy `.env.example` to `.env` and fill in the values:

```
cp .env.example .env
```

2. `DATABASE_URL` in `.env` should use `localhost` — this is used both for local development and for running Prisma CLI commands from the host machine:

```
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/knowledge_hub
```

> The app container in Docker Compose overrides `DATABASE_URL` via `docker-compose.yml` environment to use the `db` service name for internal Docker network communication.
> From the host machine, `localhost` works because the database port is forwarded via `ports` in docker-compose.

### Running with Docker Compose

Start all services (app + PostgreSQL):

```
docker compose up --build
```

Use debug profile to start Adminer database management tool at http://localhost:8080:

```
docker compose --profile debug up --build
```

### Database commands

All Prisma CLI commands run from the host machine using `localhost` in `DATABASE_URL`.

Apply pending migrations (run before first start or after schema changes):

```
npx prisma migrate deploy
```

Run seed (populate database with initial data):

```
npx prisma db seed
```

Create a new migration after schema changes:

```
npx prisma migrate dev --name <migration_name>
```

Open Prisma Studio (visual database browser):

```
npx prisma studio
```
