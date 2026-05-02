# Knowledge Hub

## Quick Start

```bash
cp .env.example .env
docker compose up --build
```

OpenAPI documentation will be available at http://localhost:4000/doc/

## Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js - [Download & Install Node.js](https://nodejs.org/en/download/) and the npm package manager.
- Docker


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

Unit tests run without a server. Integration tests require the app running via Docker Compose.

Run all tests (unit and integration):

```
npm run test
```

Unit tests only (no server needed):

```
npm run test:unit
```

Unit tests with coverage:

```
npm run test:coverage
```

E2E tests by category (server must be running):

```
npm run test:auth
npm run test:refresh
npm run test:rbac
```

### Auto-fix and format

```
npm run lint
```

```
npm run format
```

## Docker & Database

Application image size: 101.18 MB (Compressed) and 492.98 MB (Plain)-
[Docker Hub Repository](https://hub.docker.com/repository/docker/245091236523498/knowledge-hub-app/general)

The Docker Scout scan revealed no critical (C) vulnerabilities. See the full report in [scout-report.txt](scout-report.txt).

### Setup

Copy `.env.example` to `.env`:

```
cp .env.example .env
```

The default values work out of the box. `DATABASE_URL` uses `db` hostname for the app container; `DATABASE_URL_LOCAL` uses `localhost` for running Prisma CLI within tests from the host machine.

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

Apply pending migrations:

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

Reset database (drops all data, re-applies migrations and seed):

```
npx prisma migrate reset
```

## Logging

The app logs to both console and file (`logs/app.log`). Log files rotate automatically when exceeding `LOG_MAX_FILE_SIZE` (default 1024 KB). Rotated files are named `app-{timestamp}.log`.

Configure via `.env`:

| Variable | Default | Description |
|---|---|---|
| `LOG_LEVEL` | `log` | Min level: `fatal`, `error`, `warn`, `log`, `debug`, `verbose` |
| `LOG_MAX_FILE_SIZE` | `1024` | Max log file size in KB before rotation |

In production (`NODE_ENV=production`) logs are JSON-formatted. In development — human-readable.

### Log file locations

| Scenario | Path |
|---|---|
| Local (`npm start`) | `./logs/app.log` |
| Docker Compose | `/usr/src/app/logs/app.log` inside the container |

To view logs from Docker container:

```
docker compose exec app cat logs/app.log
```

To stream logs in real time:

```
docker compose logs -f app
```
