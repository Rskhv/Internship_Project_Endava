# Security notes

- Passwords use bcrypt with a cost factor of 12. No plaintext password is written to the database or logs.
- Sessions are stored in PostgreSQL and issued in an HTTP-only, SameSite=Lax cookie. Production cookies are Secure.
- Profile and watch-history routes scope database reads/writes to the authenticated user's owned profile. Admin functions require the `admin` role.
- Request bodies use Zod validation, database values are passed as query parameters, CORS is restricted to `CLIENT_ORIGIN`, JSON bodies are limited to 1 MB, Helmet sets security headers, and auth routes are rate-limited.
- The checkout endpoint is explicitly simulated; it does not accept payment credentials and computes the amount from the server-side plan record.
- Never commit `.env`. Set a long random `SESSION_SECRET`, use a database role with only required privileges, and use TLS for production PostgreSQL/HTTP.
- The prior implementation contained a hardcoded MySQL credential. Rotate it if it ever connected to a real database; do not reuse it for V2. Git history can retain old values, so repository history and any associated MySQL account should be treated accordingly.

## Remaining hardening before public production

Add a CSRF token strategy if the deployment's browser topology or cookie policy changes, email verification/password reset, account deletion/export flows, structured audit policies, backup/restore procedures, and security-focused integration testing with a dedicated database. Configure trusted proxy behavior and PostgreSQL TLS verification for the actual host. This project is currently a local/demo baseline, not a production billing or licensed-media service.
