# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Next.js dev server (port 3000)
npm run build        # Production build
npm run lint         # ESLint

npm run db:generate  # Regenerate Prisma client after schema changes
npm run db:push      # Sync schema to DB (no migration file)
npm run db:migrate   # Create + run migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio GUI
```

No test suite configured.

## Stack

- **Next.js 15** (App Router) + **TypeScript** + **Tailwind CSS 4**
- **PostgreSQL** via **Prisma** ORM
- **BetterAuth** for authentication (email/password + Google/Facebook OAuth)

## Architecture

```
src/
├── app/           # App Router: pages, API routes, (admin)/, (auth)/, dashboard/
├── components/    # React components grouped by feature (blog/, layout/, ui/)
├── lib/           # Core logic: auth.ts, db.ts, actions/ (server actions)
├── middleware.ts  # Route protection — /admin/* needs admin role, /dashboard/* needs session
└── types/         # Shared TypeScript types
```

**Request flow:** Client → Next.js page/API → `lib/actions/*` server actions → Prisma → PostgreSQL

**Auth flow:** BetterAuth handles sessions via cookies. On user creation, a `Member` record auto-creates with a generated membership number and an `ActivityLog` entry (hook in `src/lib/auth.ts`). Session fetched server-side via `/api/auth/get-session`.

## Key Domain Models

- **Member** — linked 1:1 to User; holds profile, employment, branch assignment, avatar
- **Post** — blog articles with markdown content, slug, category (`NEWS | STATEMENT | ANALYSIS | ANNOUNCEMENT | INTERVIEW`), status (`DRAFT | PUBLISHED`)
- **Comment** — nested threads on posts
- **BranchUpdate / Resource** — branch-specific announcements and shared links
- **ActivityLog / Notification** — audit trail and user notifications
- **Donation / Volunteer / ContactMessage** — simple form submission models

## Environment Variables

```
DATABASE_URL
BETTER_AUTH_SECRET
BETTER_AUTH_URL
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
FACEBOOK_CLIENT_ID / FACEBOOK_CLIENT_SECRET
NEXT_PUBLIC_APP_URL
```

After any `prisma/schema.prisma` change, run `db:generate` before starting the dev server.
