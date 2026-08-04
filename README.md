# Wandern Ops

Internal ops tool for Wandern Co. — single-user, deployed on Vercel, installable as a home-screen PWA.

Stack: Next.js (App Router) + TypeScript + Tailwind, Prisma + Postgres, Vercel Blob for file uploads.

## Local development

1. Copy the env template and fill in values:

   ```bash
   cp .env.example .env
   ```

   - `DATABASE_URL` — a Postgres connection string. Easiest local option:
     ```bash
     npx prisma dev
     ```
     This spins up a local Postgres via Docker and prints a `DATABASE_URL` to paste into `.env`. Requires Docker Desktop running.
   - `APP_PASSWORD` — whatever password you want to gate the app with.
   - `SESSION_SECRET` — random string, e.g. `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
   - `BLOB_READ_WRITE_TOKEN` — only needed once a module uses file uploads; leave blank for now.

2. Apply the schema:

   ```bash
   npx prisma migrate dev --name init
   ```

3. Run the app:

   ```bash
   npm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000) — you'll land on the password gate, then `/tasks`.

## Deploying to Vercel

1. Push this repo to GitHub, then import it in the Vercel dashboard (or `vercel link` from the CLI).
2. In the Vercel project, add a **Postgres** storage integration (Storage tab → Postgres) — this sets `DATABASE_URL` automatically.
3. Add a **Blob** storage integration the same way, once a module needs file uploads — this sets `BLOB_READ_WRITE_TOKEN` automatically.
4. Add `APP_PASSWORD` and `SESSION_SECRET` as project environment variables manually (Settings → Environment Variables).
5. Deploy. The `build` script runs `prisma migrate deploy` automatically before `next build`, so schema changes ship with each deploy.
6. On your phone, open the deployed URL in the browser and use "Add to Home Screen" (Safari) or the install prompt (Chrome/Android) — the app manifest and icons are already wired up.

## Project structure

- `prisma/schema.prisma` — data model. Currently only the `Task` module; more modules (Shipments, Techpacks, Contacts, Cases, Content Calendar, Finance) get added here as they're built, per the priority order in the PRD.
- `src/lib/auth.ts` + `src/proxy.ts` — the password gate. A single shared password (`APP_PASSWORD`) protects every route except `/login`, using a signed HttpOnly cookie (no user accounts, since this is single-user).
- `src/app/tasks/` — the Tasks module: page, server actions (`actions.ts`), and UI components.
