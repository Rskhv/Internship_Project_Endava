# Streamify

A Netflix-inspired streaming service prototype with a static web frontend, an Express API backed by MySQL, and a notebook for preparing catalog data.

## Project layout

- `frontend/app/` — HTML, CSS, browser JavaScript, and image assets.
- `backend/server.js` — Express API and static frontend server.
- `database/netflix_schema.sql` — database tables, sample SQL, and example queries/triggers.
- `database/Sql_Queries.java` — Java JDBC login example.
- `notebooks/Netflix_dataStream.ipynb` — catalog data preparation workflow.
- `data/raw/` — source catalog CSV (ignored by Git).
- `data/processed/` — generated table CSVs (ignored by Git).
- `archive/` — original ZIP archives retained for reference (ignored by Git).

## Run the web app

1. Install Node dependencies with `npm install`.
2. Create and populate the `netflix_db` MySQL database using `database/netflix_schema.sql` and configure the database connection in `backend/server.js` for your local MySQL instance.
3. Start the server from the project root with `npm start`.
4. Open `http://localhost:3000`.

The database connection currently uses local development settings in `backend/server.js`; update them for your environment before running the app.

## Data workflow

Open `notebooks/Netflix_dataStream.ipynb` from the project root. It reads `data/raw/netflix_titles.csv` and writes generated tables to `data/processed/`. These CSV datasets and generated table files are excluded from Git to avoid committing bulk data. Keep source code, SQL schema, and notebooks tracked.
