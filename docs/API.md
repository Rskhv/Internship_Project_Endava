# API (`/api/v1`)

Successful responses use `{ "data": ... }`; errors use `{ "error": { "message": ... } }`. Authenticated routes use the HTTP-only `streamify.sid` cookie. JSON requests must use same-origin or the configured `CLIENT_ORIGIN`.

| Method | Path | Purpose / access |
| --- | --- | --- |
| GET | `/health` | API health |
| POST | `/auth/register` | Create user and default profile; body `email,password,name,planId?` |
| POST | `/auth/login` | Start a session; body `email,password` |
| POST | `/auth/logout` | Destroy session |
| GET | `/auth/me` | Current user |
| GET, POST | `/profiles` | List/create own profiles |
| POST | `/profiles/:id/select` | Verify ownership and set active server-side profile |
| PATCH, DELETE | `/profiles/:id` | Update/delete an owned profile |
| GET | `/catalog` | Catalog with `page,limit,type,genre,search` query filters |
| GET | `/catalog/genres` | Genre list |
| GET | `/catalog/featured/one` | Featured title |
| GET | `/catalog/:id` | Title, metadata, and episodes |
| GET | `/history/:profileId` | Own profile watch history |
| GET | `/history/:profileId/continue` | Continue Watching list |
| PUT | `/history/:profileId/:contentId/progress` | Save percentage (0–100); 95% marks complete |
| DELETE | `/history/:profileId/:contentId` | Remove a history entry |
| GET | `/subscriptions/plans` | Active demo plans |
| GET | `/subscriptions/current` | Current user's active plan |
| GET | `/subscriptions/payments` | Current user's demo payment history |
| POST | `/subscriptions/demo-checkout` | Body `planId,outcome,paymentMethodLabel`; outcome is `success` or `failure`, method is a demo label only; no real charge |
| GET | `/catalog/admin/all` | Admin catalog page (`page,limit`) |
| GET | `/catalog/admin/:id` | Admin catalog detail, including edit metadata |
| POST, PATCH, DELETE | `/catalog/admin[/:id]` | Admin content create/edit/delete |
| POST, PATCH, DELETE | `/catalog/admin/genres[/:id]` | Admin genre management |
| POST, DELETE | `/catalog/admin/:id/episodes`, `/catalog/admin/episodes/:id` | Admin episode management |
| GET | `/subscriptions/admin/users` | Admin user list |
| GET | `/subscriptions/admin/subscriptions` | Admin subscription list |
| GET | `/subscriptions/admin/payments` | Admin demo payment list |

The catalog and admin list endpoints return a `pagination` object. Page size is capped in the API. Authentication endpoints are rate-limited; authenticated/admin routes enforce session and role ownership.
