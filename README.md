# Knowledge Hub

## Table of Contents

- [Overview](#overview)
- [Quick Start](#quick-start)
- [Project Setup](#project-setup)
  - [Prerequisites](#prerequisites)
  - [Downloading](#downloading)
  - [Create .env files](#create-env-files)
  - [Installing packages](#installing-packages)
- [Running the App](#running-the-app)
  - [Option 1: Hybrid](#option-1-hybrid--infrastructure-in-docker-app-locally-recommended-for-development)
  - [Option 2: Everything in Docker](#option-2-everything-in-docker)
- [Testing](#testing)
- [Run linter and formatter](#run-linter-and-formatter)
- [Docker & Database](#docker--database)
  - [Vector Database (Qdrant)](#vector-database-qdrant)
  - [Database commands (Prisma)](#database-commands-prisma)
- [AI Integration (Gemini API)](#ai-integration-gemini-api)
  - [Obtaining a Gemini API Key](#obtaining-a-gemini-api-key)
  - [Models](#models)
  - [AI & RAG Endpoints](#ai--rag-endpoints)
  - [Known Limitations](#known-limitations)
- [RAG Module](doc/rag.md)
- [Logging](#logging)

## Overview

**Knowledge Hub** is a REST API platform that lets users create, edit, and organize articles by categories and tags. The API is extended with an **AI integration** module powered by Google Gemini and a **RAG (Retrieval-Augmented Generation)** pipeline: articles are chunked, embedded, and stored in a Qdrant vector database, enabling semantic search over the knowledge base and grounded, context-aware answers to user queries.

**Stack:** NestJS · PostgreSQL · Qdrant · Google Gemini · Docker · JWT

The goal was to consolidate the topics covered throughout the course in a single non-trivial application:

- Node.js fundamentals
- Network communication
- Testing Node.js applications
- Web APIs (REST)
- Databases — SQL, PostgreSQL, Qdrant
- Containerization with Docker
- Logging and error handling
- Authentication & authorization, JWT
- The NestJS framework
- Integration with the Gemini API

This is a pet project built as the capstone assignment for the [Node.js Course](https://rs.school/courses/nodejs) by The Rolling Scopes School.

## Quick Start

```bash
cp config/.env.docker.example config/.env.docker
npm run docker:up
```

OpenAPI documentation will be available at http://localhost:4000/doc/

> **Note:** the default `.env.docker` works out of the box, but **AI and RAG endpoints will not work** until you set a valid `GEMINI_API_KEY` in `config/.env.docker` — see [Obtaining a Gemini API Key](#obtaining-a-gemini-api-key).

## Project Setup

### Prerequisites

- Git - [Download & Install Git](https://git-scm.com/downloads).
- Node.js 24 and npm - [Download & Install Node.js and the npm](https://nodejs.org/en/download/).
- Docker - [Download & Install Docker](https://docs.docker.com/desktop/).

### Downloading

```bash
git clone git@github.com:only1design/nodejs-2026q1-knowledge-hub.git knowledge-hub
cd knowledge-hub
```

### Create .env files
The default values work out of the box. Only `GEMINI_API_KEY` is required to be updated with a valid Gemini API key to use the AI features.

```bash
cp config/.env.docker.example config/.env.docker
cp config/.env.local.example config/.env.local
```

### Installing packages

```bash
npm install
```

## Running the App

After starting the app on port (4000 as default) you can open
in your browser OpenAPI documentation by typing http://localhost:4000/doc/.

There are two ways to run the application depending on your workflow.

### Option 1: Hybrid — infrastructure in Docker, app locally (recommended for development)

Run infrastructure in Docker, and Nest locally with hot reload.

#### Running infrastructure

```bash
npm run docker:up:deps
```

#### Apply pending migrations

```bash
npx prisma migrate deploy
```

#### Run seed (populate database with initial data)

```bash
npx prisma db seed
```

#### Running application

```bash
npm run start:dev
```

**When to use:** day-to-day development. Fast hot reload, easy IDE debugging, debugger works out of the box.

### Option 2: Everything in Docker

Run both the infrastructure and the app in containers.

```bash
npm run docker:up
```

Pending migrations are applied automatically on container start.

## Testing

Unit tests run without a server. Integration tests require the running app.

Run all tests (unit and integration, server must be running):

```bash
npm run test
```

Unit tests only (no server needed):

```bash
npm run test:unit
```

Unit tests with coverage (no server needed):

```bash
npm run test:coverage
```

E2E tests by category (server must be running):

```bash
npm run test:auth
npm run test:refresh
npm run test:rbac
```

## Run linter and formatter

```bash
npm run lint
```

```bash
npm run format
```

## Docker & Database

Application image size: 101.18 MB (Compressed) and 492.98 MB (Plain) - [Docker Hub Repository](https://hub.docker.com/repository/docker/245091236523498/knowledge-hub-app/general)

The Docker Scout scan revealed no critical (C) vulnerabilities. See the full report in [scout-report.txt](doc/scout-report.txt).

Use debug profile to start Adminer database management tool at http://localhost:8080:

```bash
npm run docker:up:debug
```

### Vector Database (Qdrant)

The RAG layer stores article embeddings in [Qdrant](https://qdrant.tech/) `v1.17.1`, started as the `vectordb` service in `docker-compose.yml` on port `6333`. The `app` service waits for `vectordb` to become healthy before starting.

The collection is created automatically on app startup with named dense (768-dim, cosine) and sparse (TF + server-side IDF) vectors. To inspect the collection visually, open the Qdrant dashboard at http://localhost:6333/dashboard.

### Database commands (Prisma)

Apply pending migrations:

```bash
npx prisma migrate deploy
```

Run seed (populate database with initial data):

```bash
npx prisma db seed
```

Create a new migration after schema changes:

```bash
npx prisma migrate dev --name <migration_name>
```

Open Prisma Studio (visual database browser):

```bash
npx prisma studio
```

Reset database (drops all data, re-applies migrations):

```bash
npx prisma migrate reset
```

## AI Integration (Gemini API)

The app integrates with Google Gemini API to provide AI-powered article analysis, summarization, and translation. It also ships a Retrieval-Augmented Generation pipeline over the article corpus — see [RAG module documentation](doc/rag.md) for the design, indexing flow, hybrid search, and MMR reranking details.

### Obtaining a Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Select or create a project
5. Copy the generated API key

### Models

| Purpose | Model (default) | Env variable |
|---|---|---|
| Text generation (summarization, translation, RAG answers) | `gemini-3-flash-preview` | `GEMINI_MODEL` |
| Embeddings (RAG indexing & retrieval) | `gemini-embedding-2` | `GEMINI_EMBEDDING_MODEL` |

Both models use the same `GEMINI_API_KEY`. Embedding output dimensionality is configurable via `EMBEDDING_DIMENSION` (default 768).

### AI & RAG Endpoints

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

| Scenario   | Path |
|------------|---|
| Local run  | `./logs/app.log` |
| Docker run | `/usr/src/app/logs/app.log` inside the container |

To view logs from Docker container:

```bash
docker compose exec app cat logs/app.log
```

To stream logs in real time:

```bash
docker compose logs -f app
```
