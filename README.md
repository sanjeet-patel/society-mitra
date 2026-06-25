# Society Mitra

Community-first society management SaaS built with **Next.js**, **Supabase**, and **Vercel**.

## Stack

- **Frontend:** Next.js 15 App Router, Tailwind CSS, shadcn/ui, PWA
- **Backend:** Supabase (Postgres + Auth + Storage + RLS)
- **Hosting:** Vercel
- **Notifications:** Web Push (VAPID)

## Features (MVP)

- Multi-tenant societies via path routing (`/greenvalley`)
- **Admin-only onboarding** — society admins provision members (mobile + temp password)
- Platform super-admin dashboard with cross-society KPIs
- Society admin console with full CRUD (members, categories, vendors, classifieds, helpline, announcements)
- Member directory with search
- Announcements with web push
- Emergency contact directory
- Local service directory with reviews
- Classified ads
- Credential slip printing for offline handoff
- Force password change on first login
- Installable PWA

## Operating model & roles

| Role | Login | Capabilities |
|------|-------|--------------|
| **Platform super admin** | Mobile in `PLATFORM_ADMIN_PHONES` | Create/edit societies, assign society admins, platform dashboard, global categories |
| **Society admin** | Mobile + password (provisioned) | Create members, CRUD all society content, reset member passwords |
| **Member (owner/tenant)** | Mobile + password (provisioned) | Use society features; change password in Profile; add family under same login |
| **Block admin** | Same as member | Limited admin permissions (same console access as society admin in MVP) |

**Business rules:**

1. **Mobile number = login ID** (10-digit Indian mobile)
2. **One account per house/unit** — family members share the login; add family in Profile
3. **No public signup or self-join** — all accounts created by admins
4. **Offline credentials** — admins print/share credential slips; no SMS from the app
5. **First login** — users with a temporary password must change it before using the app

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

1. Sign in with mobile `9999999999` / `demo-admin` (or any number listed in `PLATFORM_ADMIN_PHONES`)
2. Visit `/admin` for the platform dashboard
3. Create a society at `/admin/societies`, then **Manage** → assign a society admin (mobile + temp password)
4. Society admin signs in, provisions members at `/{slug}/admin/members`, prints credential slips
5. Members sign in and change password under Profile

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
4. Add the same env vars in Vercel (Supabase keys, `PLATFORM_ADMIN_PHONES`, VAPID keys)
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
