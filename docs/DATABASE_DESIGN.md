# Database design

The authoritative schema is `database/migrations/001_initial.sql`. It uses PostgreSQL generated identity keys, foreign keys, uniqueness constraints, checks, JSONB audit details, timestamps, and indexes for common catalog/history queries.

| Area | Tables | Relationships |
| --- | --- | --- |
| Identity | `users`, `profiles` | One user has many profiles; passwords are stored as hashes; roles are constrained to user/admin. |
| Catalog | `content`, `genres`, `content_genres`, `actors`, `directors`, `content_actors`, `content_directors`, `episodes` | Content may have many genres, cast, directors, and TV episodes. |
| Playback | `watch_history` | Unique profile/title pair stores progress, last-watched timestamp, and completion. |
| Demo billing | `subscription_plans`, `user_subscriptions`, `payments` | User plans and fake payment outcomes are kept separately; no payment credentials exist. |
| Audit | `audit_logs` | Records account creation, admin catalog additions, and simulated checkout outcomes. |

## Catalog import

`npm run db:seed` inserts sample plans and, if the ignored local `data/raw/netflix_titles.csv` exists, imports its metadata with a stable `source_key`. Seed inserts use conflict handling so rerunning the command does not duplicate catalog/plan rows. Without that CSV, three fictional demo titles are inserted. The import preserves title, synopsis, type, year, maturity label, duration value, genres, cast, and directors. The source duration is not normalized for TV seasons, and the source does not carry posters/backdrops or episodes; add clean metadata through the admin dashboard as needed.

The legacy MySQL schema and notebooks are kept for reference. They are not applied by the new application.
