# MJ Developer: website and admin panel (Next.js + MongoDB)

Rebuild of the PHP site as a single Next.js 16 app: the public website, the admin panel and the backend API all live here. Contact-form enquiries are stored in MongoDB and appear in the admin panel.

## Quick start (local, MongoDB in Docker)

```bash
cp .env.example .env.local      # then fill in the values (see below)
cp .env.local .env              # docker compose reads .env
docker compose up -d mongo      # starts MongoDB only
npm install
npm run dev                     # http://localhost:3000
```

Then create the admin account once at **http://localhost:3000/admin/setup**. You need the `SETUP_TOKEN` value from your env file. The setup page locks itself as soon as an admin exists. After that, sign in at `/admin/login`.

> If MongoDB is already installed natively on your machine (port 27017 taken), set `MONGO_PORT=27018` and use `localhost:27018` in `MONGODB_URI`.

### Run the production build in Docker too

```bash
docker compose --profile app up -d --build   # app on http://localhost:3000, talks to the mongo container
```

## Environment variables

| Name | What it is |
|---|---|
| `MONGODB_URI` | Connection string. Docker: `mongodb://user:pass@localhost:27017/?authSource=admin`. Atlas: `mongodb+srv://…` |
| `MONGODB_DB` | Database name (default `mjdeveloper`) |
| `SESSION_SECRET` | 32+ random characters, signs admin sessions. Changing it signs everyone out. |
| `SETUP_TOKEN` | 12+ characters, needed once to create the first admin. Remove it afterwards if you like. |
| `MONGO_ROOT_USER` / `MONGO_ROOT_PASSWORD` / `MONGO_PORT` | Only for the local Docker MongoDB |
| `NEXT_PUBLIC_SITE_URL` | Public URL, used for metadata |

Generate a secret: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"`

## Moving to MongoDB Atlas

1. Create a cluster and a database user in Atlas, and allow your host's IP under Network Access.
2. Set `MONGODB_URI` to the Atlas `mongodb+srv://` string. Nothing else changes: indexes are created automatically on first connection.
3. To copy local data across: `mongodump --uri "<local uri>" --db mjdeveloper` then `mongorestore --uri "<atlas uri>" dump/`.

Project photos are stored in MongoDB (GridFS, bucket `images`), so there is no uploads folder to copy and the app works on serverless hosts.

## Project map

```
app/(site)/          public website (one page, sections in components/site)
app/admin/           admin pages: login, setup, dashboard, enquiries, projects, settings
app/api/             backend endpoints (below)
components/site/     website sections and animation building blocks
components/admin/    admin UI
lib/site.ts          ALL website copy and contact details. Edit text here.
lib/db.ts            MongoDB connection, collections and indexes
lib/validation.ts    input rules shared by the API (zod)
proxy.ts             redirects signed-out visitors away from /admin pages
```

## API

Public:

| Method | Path | |
|---|---|---|
| POST | `/api/contact` | Submit an enquiry `{name, phone, email, service, message}` |
| GET | `/api/projects` | Published projects |
| GET | `/api/images/:id` | Project photo |
| GET | `/api/health` | `{ok, db}` for uptime checks |

Admin (session cookie required; writes must come from the same origin):

| Method | Path | |
|---|---|---|
| GET/POST | `/api/admin/setup` | Setup status / create first admin |
| POST | `/api/admin/login`, `/api/admin/logout` | Sign in / out |
| GET | `/api/admin/me` | Current admin + unread count |
| GET | `/api/admin/stats` | Dashboard numbers |
| GET | `/api/admin/enquiries?status=&q=&service=&page=` | List and search |
| PATCH/DELETE | `/api/admin/enquiries/:id` | Set status (`new`/`contacted`/`closed`) and note, or delete |
| GET | `/api/admin/enquiries/export` | CSV download (same filters) |
| GET/POST | `/api/admin/projects` | List / create (multipart with `image`) |
| PATCH/DELETE | `/api/admin/projects/:id` | Update (sends all fields; photo optional) / delete |
| POST | `/api/admin/password` | Change password |

## Security

- Passwords hashed with bcrypt (cost 12). Sessions are signed, httpOnly, SameSite=Lax cookies lasting 8 hours.
- Changing the password ends every other session.
- Every admin API call re-checks the session against the database. `proxy.ts` is only a first gate for the pages.
- State-changing requests must come from the same origin, which blocks cross-site request forgery.
- Login locks for 15 minutes after 5 failures from one IP. The contact form allows 5 enquiries per IP per hour and has a hidden spam trap. Both limits are stored in MongoDB, so they hold across server instances.
- Uploads are checked by their actual bytes (JPG/PNG/WebP only) and limited to 5 MB.
- CSV export defuses spreadsheet formulas typed into the form.
- Rate limits read the client IP from `X-Forwarded-For`. Run the app behind a proxy or host that sets that header (Vercel, Nginx, Cloudflare), not exposed directly.

## Scripts

`npm run dev` · `npm run build` · `npm start` · `npm run lint`
