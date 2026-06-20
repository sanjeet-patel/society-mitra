# Society Mitra

Community-first society management SaaS built with **Next.js**, **Supabase**, and **Vercel**.

## Stack

- **Frontend:** Next.js 15 App Router, Tailwind CSS, shadcn/ui, PWA
- **Backend:** Supabase (Postgres + Auth + Storage + RLS)
- **Hosting:** Vercel
- **Notifications:** Web Push (VAPID)

## Features (MVP)

- Multi-tenant societies via path routing (`/greenvalley`)
- Platform admin society creation
- Member directory with search
- Announcements with web push
- Emergency contact directory
- Local service directory with reviews
- Resident join/approval flow
- Installable PWA

## Getting Started

### Prerequisites

- Node.js 20+
- Supabase CLI
- Docker (for local Supabase)

### 1. Install dependencies

```bash
npm install
```

### 2. Start Supabase locally

```bash
supabase start
supabase db reset
```

### 3. Configure environment

Copy `.env.example` to `apps/web/.env.local` and fill in values from `supabase status`:

```bash
cp .env.example apps/web/.env.local
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### 5. Platform admin setup

1. Sign in with an email listed in `PLATFORM_ADMIN_EMAILS`
2. Visit `/admin/societies` to create a society
3. Share the society URL (e.g. `/greenvalley`) with residents

### Demo society

After `supabase db reset`, a demo society **Green Valley Apartments** is available at `/greenvalley` with emergency contacts and service providers pre-seeded.

## Deploy to Vercel + Supabase Cloud

### Vercel (frontend — `societymitra.info`)

1. Import the repo in [Vercel](https://vercel.com) with **Root Directory** set to `apps/web`
2. Add custom domains in **Project → Settings → Domains**:
   - `societymitra.info` (primary)
   - `www.societymitra.info` (redirects to apex via `vercel.json`)
3. At your domain registrar, point DNS to Vercel:
   - **A record** `@` → `76.76.21.21`
   - **CNAME** `www` → `cname.vercel-dns.com`
4. Set production environment variables (see `.env.example`):
   - `NEXT_PUBLIC_APP_URL=https://societymitra.info`

### Supabase (backend)

1. Create a Supabase project in **ap-south-1** (Mumbai)
2. Run migrations: `supabase db push`
3. In **Authentication → URL Configuration**:
   - **Site URL:** `https://societymitra.info`
   - **Redirect URLs:** `https://societymitra.info/auth/callback`
4. Add the same env vars in Vercel (Supabase keys, `PLATFORM_ADMIN_EMAILS`, VAPID keys)
5. Generate VAPID keys: `npx web-push generate-vapid-keys`

## Project Structure

```
society-mitra/
├── apps/web/          # Next.js application
├── packages/shared/   # Shared types, schemas, constants
├── supabase/          # Migrations and seed data
└── vercel.json        # Vercel deployment config
```

## License

Private — Society Mitra
