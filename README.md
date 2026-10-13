# Cloudora CRM

A **multi-tenant SaaS CRM** built on Next.js 16 (App Router) and Supabase. Designed for B2B teams to manage leads, support tickets, tasks, and team communication across multiple companies from a single platform.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| Language | TypeScript + React 19 |
| Styling | Tailwind CSS v3 + shadcn/ui |
| Backend / DB | Supabase (PostgreSQL + RLS + Auth) |
| Email | Resend API |
| Data fetching | Server Actions (mutations) + SWR (client reads) |

---

## Getting Started (Local Dev)

### Prerequisites

- **Node.js** v20+
- A **Supabase** project ([create one free](https://supabase.com/dashboard))

### 1. Clone and install

```bash
git clone <repo-url>
cd crm-clone
npm install
```

### 2. Configure environment variables

Copy the example file and fill in your Supabase credentials:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_SUPABASE_URL=https://<your-project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
RESEND_API_KEY=<your-resend-key>          # required for email features
```

Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are in your project's **Settings → API** in the Supabase dashboard.

### 3. Apply the database schema

```bash
supabase db push
```

> [!IMPORTANT]
> Never edit migration files manually. Create a new timestamped migration file in `supabase/migrations/` for any schema change.

### 4. Start the dev server

```bash
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000).

> [!NOTE]
> On Windows, the production build can exhaust Node's default heap. Always run builds with:
> ```powershell
> $env:NODE_OPTIONS="--max-old-space-size=4096"; npm run build
> ```

---

## Project Structure

```
crm-clone/
├── app/
│   ├── actions/            # Server Actions — all DB mutations go here
│   ├── api/                # Route Handlers (webhooks, external integrations)
│   ├── auth/               # Auth routes (login, signup, confirm, update-password)
│   └── protected/          # Authenticated app pages (role-gated)
│       └── super-admin/    # Superadmin-only platform control pages
├── components/
│   ├── admins/             # Admin and superadmin management UI
│   ├── common/             # DashboardShell, modals, page headers
│   ├── tickets/            # Support ticket views and forms
│   └── ui/                 # shadcn base components
├── lib/
│   ├── supabase/           # Supabase client singletons (server / client / middleware)
│   ├── nav.ts              # ⭐ Single source of truth for navigation items per role
│   ├── features.ts         # ⭐ Feature flags (telephony, ivrBuilder, softphone, botBuilder)
│   └── auth/               # Session helpers (getCurrentEmployee, etc.)
├── supabase/
│   └── migrations/         # PostgreSQL schema, triggers, RLS policies (in order)
├── docs/
│   ├── developer-guide.md  # Deep-dive architecture and RBAC docs
│   └── ui-audit/           # UI audit reports from the Phase 0 cleanup
└── types/
    └── supabase.ts         # Auto-generated Supabase TypeScript types
```

---

## Roles & Access

The platform uses **7 roles** stored in `employees.role`. Access is enforced at two layers: the UI (nav filtering) and the database (PostgreSQL RLS).

| Role | Description |
|---|---|
| `superadmin` | Platform-wide access — all tenants, infrastructure, audit logs |
| `admin` | Tenant-scoped company admin |
| `sales_agent` | Standard CRM user (leads, tasks, tickets, chat) |
| `server_admin` | Infrastructure + support ticket resolver |
| `dev` | Engineering workspace + ticket access |
| `unassigned` | Default state — pending org assignment, redirected on login |

> `client` / `customer` roles exist in the DB schema for historical reasons but are **not served any UI** in this codebase. The ticket and nav systems only handle internal team roles.

### Navigation config

All sidebar nav items live in **[`lib/nav.ts`](lib/nav.ts)**. To add or change a route's visibility, edit only that file — `DashboardShell` reads from it automatically.

```ts
// lib/nav.ts
export const navItems: NavItem[] = [
  { href: "/protected/crm-leads-table", label: "Leads", icon: "groups", roles: ["sales_agent", "admin"] },
  // ...
];
```

---

## Feature Flags

Experimental/incomplete features are gated in **[`lib/features.ts`](lib/features.ts)**:

```ts
export const features = {
  telephony: false,    // Super-admin telephony infrastructure page
  ivrBuilder: false,   // Visual IVR flow builder
  softphone: false,    // In-browser softphone
  botBuilder: false,   // Visual FAQ / chatbot builder
} as const;
```

- When a flag is `false`: the nav item is hidden **and** the page returns a Next.js `notFound()` (404).
- To enable a feature: set it to `true` here. No other changes needed.

---

## Branch Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready, stable code |
| `dev` | Active development; merge into `main` via PR |

**Rules:**
- Stage files by explicit path only (`git add <file>`). Never `git add .` or `git commit -a`.
- One logical commit per feature/fix.
- Never push directly to `main`.

---

## Key Conventions

- **Server Actions** (`app/actions/`) handle all writes. Route Handlers (`app/api/`) are for external integrations and webhooks only.
- **Never read role from `auth.users.user_metadata`**. Always query `employees.role` directly from the DB.
- **DB isolation**: Every non-superadmin query is scoped by `company_id` via RLS. A DB trigger overwrites any manually supplied `company_id` at the DB level.
- **Auth**: Login route is `/auth/login`. There is no `/login`. Redirects anywhere else will 404.

---

## Further Reading

- [`docs/developer-guide.md`](docs/developer-guide.md) — Architecture deep-dive, RBAC patterns, DB schema ERD
- [`docs/ui-audit/`](docs/ui-audit/) — Phase 0 audit reports (IA, routes, components, roles)
- [Supabase RLS docs](https://supabase.com/docs/guides/database/postgres/row-level-security)
- [Next.js App Router docs](https://nextjs.org/docs/app)
