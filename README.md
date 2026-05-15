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

The Docker Scout scan revealed no critical (C) vulnerabilities. See the full report in [scout-report.txt](doc/scout-report.txt).

### Setup

Copy `.env.example` to `.env`:

```
cp .env.example .env
```

The default values work out of the box. `DATABASE_URL` uses `db` hostname for the app container; `DATABASE_URL_LOCAL` uses `localhost` for running Prisma CLI within tests from the host machine.

### Running with Docker Compose

Start all services (app + PostgreSQL + Qdrant vector DB):

```
docker compose up --build
```

Use debug profile to start Adminer database management tool at http://localhost:8080:

```
docker compose --profile debug up --build
```

### Vector Database (Qdrant)

The RAG layer stores article embeddings in [Qdrant](https://qdrant.tech/) `v1.17.1`, started as the `vectordb` service in `docker-compose.yml` on port `6333`. The `app` service waits for `vectordb` to become healthy before starting (TCP healthcheck on `6333`).

| Variable | Default | Description |
|---|---|---|
| `RAG_VECTOR_DB_URL` | `http://vectordb:6333` | Qdrant URL (use `http://localhost:6333` from the host) |
| `RAG_VECTOR_COLLECTION` | `knowledge_hub_articles` | Qdrant collection name |

The collection is created automatically on app startup with named dense (768-dim, cosine) and sparse (TF + server-side IDF) vectors. To inspect the collection visually, open the Qdrant dashboard at http://localhost:6333/dashboard.

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

Reset database (drops all data, re-applies migrations):

```
npx prisma migrate reset
```

## AI Integration (Gemini API)

The app integrates with Google Gemini API to provide AI-powered article analysis, summarization, and translation.

### Obtaining a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Select or create a Google Cloud project
5. Copy the generated API key

### Models

| Purpose | Model (default) | Env variable |
|---|---|---|
| Text generation (summarization, translation, RAG answers) | `gemini-3-flash-preview` | `GEMINI_MODEL` |
| Embeddings (RAG indexing & retrieval) | `gemini-embedding-2` (768-dim) | `GEMINI_EMBEDDING_MODEL` |

Both models use the same `GEMINI_API_KEY`. Embedding output dimensionality is configurable via `EMBEDDING_DIMENSION` (default 768).

### Setup

1. Copy `.env.example` to `.env` (if not done already):
   ```
   cp .env.example .env
   ```

2. Set your Gemini API key in `.env`:
   ```
   GEMINI_API_KEY=your-gemini-api-key
   ```

3. (Optional) Adjust AI-specific variables in `.env`:

   | Variable | Default | Description |
   |---|---|---|
   | `GEMINI_API_KEY` | — | **Required.** Your Gemini API key |
   | `GEMINI_API_BASE_URL` | `https://generativelanguage.googleapis.com` | Gemini API base URL |
   | `GEMINI_MODEL` | `gemini-3-flash-preview` | Model to use |
   | `AI_RATE_LIMIT_RPM` | `20` | Max AI requests per minute per client |
   | `AI_CACHE_TTL_SEC` | `300` | Cache TTL for AI responses in seconds |

4. Start the app:
   ```
   docker compose up --build
   ```

### AI & RAG Endpoints

All endpoints require authentication (Bearer token). See OpenAPI docs at http://localhost:4000/doc/ for full details.

**Before using RAG endpoints** (`/ai/rag/search`, `/ai/rag/hybrid-search`, `/ai/rag/chat`), build the vector index by calling `POST /ai/rag/index`. Indexing is incremental — re-running it only re-embeds articles whose content has changed. Pass `{ "force": true }` to re-embed everything.

### Known Limitations

- **Free-tier quotas**: Google AI Studio free tier has rate and token limits that vary per model (e.g. 5 RPM, 250K TPM, 20 RPD for some models). If you exceed these limits, requests will return 503 after retries. You can switch to a different model via the `GEMINI_MODEL` environment variable to get a fresh set of quotas or higher limits.
- **Latency**: Gemini API responses typically take 1-5 seconds depending on content length and model load.
- **Regional availability**: Gemini API may not be available in all regions. Check [Google AI availability](https://ai.google.dev/available_regions) for details.
- **In-memory state**: Cache, chat sessions, and usage stats are stored in memory and reset on app restart.
- **Chat sessions**: Each authenticated user has one chat session for the `/ai/generate` endpoint. Sessions are not persisted.

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
