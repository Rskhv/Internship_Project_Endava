# Streamify V2

A local-first, Netflix-inspired **streaming-service simulation** built with React, Vite, Express, and PostgreSQL. Playback advances a timer and progress bar only. The app does not upload, store, host, or stream video. Checkout is a labeled demo and never charges money.

## Prerequisites

- Node.js 20.19+ (or 22.12+) and npm.
- PostgreSQL 15+ running locally or a PostgreSQL-compatible hosted database.

## Quick start

```powershell
npm install
Copy-Item .env.example .env
```

Edit `.env` with a unique local database password, a URL containing the same password, and a randomly generated session secret. For Docker Desktop, start the included local-only PostgreSQL service with `docker compose up -d db`. Without Docker, create a PostgreSQL user/database that match your `.env`. Then:

```powershell
npm run db:migrate
npm run db:seed
npm run dev
```

Open the Vite URL shown in the terminal (normally `http://localhost:5173`). The API runs on port 3000. If `data/raw/netflix_titles.csv` exists locally, the seed command imports its **metadata**. Otherwise it inserts three fictional demo titles. No video content is imported.

To create the first administrator, set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (at least 12 characters) in `.env` before `npm run db:seed`. Do not use a password you use elsewhere. The seed creates or updates that administrator account.

## Useful commands

```powershell
npm run dev          # Vite and Express together
npm run dev:web      # Frontend only
npm run dev:api      # API only
npm run db:migrate   # Apply the PostgreSQL schema
npm run db:seed      # Seed plans and import the catalog
npm run build        # Production frontend build
npm start            # Express API (serves frontend/dist in production)
npm test             # Automated tests
```

For production, set `NODE_ENV=production`, `DATABASE_URL`, `SESSION_SECRET`, and `CLIENT_ORIGIN` to secure deployment values, then run the migration, seed, frontend build, and `npm start`. HTTPS is required for secure production cookies.

See [SETUP](docs/SETUP.md), [Architecture](docs/ARCHITECTURE.md), [Database design](docs/DATABASE_DESIGN.md), [API](docs/API.md), and [Security](docs/SECURITY.md).

## Repository notes

The previous static prototype, MySQL SQL, CSV source, and notebook are retained as references. The legacy MySQL credential in the prior implementation must be rotated if it was ever valid; it is intentionally not repeated here. The `.env` file is ignored by Git. Only synthetic playback and fake checkout are provided.
