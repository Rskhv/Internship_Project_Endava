# Setup and local run

## Install

1. Install Node 20.19+ (or 22.12+) and PostgreSQL 15+, or Docker Desktop.
2. Copy `.env.example` to `.env`, replace the sample password and session secret, and keep `DATABASE_URL` in sync with the database password.
3. With Docker, run `docker compose up -d db`. For an existing PostgreSQL install, create an app user and `streamify` database matching `.env`.
4. Run `npm install`.
5. Set a random `SESSION_SECRET` (32+ characters) and `CLIENT_ORIGIN=http://localhost:5173`.
6. Optional admin: set `ADMIN_EMAIL` and a unique `ADMIN_PASSWORD` (12+ characters), then seed.
7. Run `npm run db:migrate`, `npm run db:seed`, and `npm run dev`.
8. Browse to `http://localhost:5173`.

## Database operations

`npm run db:migrate` applies all pending SQL migrations transactionally. `npm run db:seed` creates sample plans and imports `data/raw/netflix_titles.csv` when present. Data files under `data/` remain ignored and are not included in Git. To repeat the catalog seed safely, rerun `npm run db:seed`.

## Build and serve

Run `npm run build` to create `frontend/dist`. Set `NODE_ENV=production`, `PORT`, `DATABASE_URL`, `SESSION_SECRET`, and `CLIENT_ORIGIN` for the API process; set `TRUST_PROXY` to the number of trusted reverse proxies when deployed behind one. Run `npm start`. Express serves the build in production. Use HTTPS so the session cookie is marked Secure.

## Troubleshooting

- `Invalid environment configuration`: copy `.env.example` and set the required database URL and session secret.
- Database connection errors: confirm PostgreSQL is running, the database exists, and the connection string has the right credentials.
- Empty title list: run `npm run db:seed`; the local Netflix metadata CSV is optional and excluded from Git.
- Browser API errors in development: start with `npm run dev` or run `npm run dev:web` and `npm run dev:api` in separate terminals. Ensure the client origin matches `CLIENT_ORIGIN`.
