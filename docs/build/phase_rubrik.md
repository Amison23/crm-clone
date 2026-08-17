# Phase Rubric & Definition of Done

## Phase 0 — Structural Fixes (Blocking, do this first)

> **Depends on:** Nothing | **Blocks:** Everything else

These are bugs the audit already found that will silently break work in every later phase if left alone.

### Definition of Done

- [x] `types/supabase.ts` and `supabase_types.ts` regenerated from the real schema (not 0-byte) — paste a snippet showing real generated types, confirm no more `any` fallback needed for Supabase queries.
- [x] `deals` table reference in `sales-agent/page.tsx:34` resolved — either create a real `deals` table via migration, or rewrite the query to use `leads.potential_value` + `status = 'won'` as the audit suggests. State which approach was taken and why.
- [x] `employee_id` vs `assigned_to` discrepancy resolved: one column is the single source of truth for "who owns this lead now." Paste the decision and every call site updated to match (`createLeadAction`, `assignSalesAgents`, the analytics summary route's join).
- [x] All 3 known TS errors fixed (`Security` import, missing function argument in `super-admin/settings/page.tsx`, nullable `auditLogs.length` in `rls-test.ts`) — paste `npx tsc --noEmit` output showing zero errors.
- [x] Confirm no other TS errors exist beyond the 3 already known (full clean `tsc` run).

---

## Phase 1 — RBAC Schema Expansion (`dev` + `server_admin` roles)

> **Depends on:** Phase 0 | **Blocks:** Phases 3–5

### Definition of Done

- [x] New migration adds `dev` and `server_admin` as valid roles alongside existing `superadmin`, `admin`, `sales_agent`, `client` — paste the migration file.
- [x] `admin-permissions-matrix` no longer references the invalid `'Server Admin'` string role — paste the corrected role list used in that UI, confirm it matches the database enum/check constraint exactly.
- [x] RLS policies reviewed for the two new roles: confirm `server_admin` gets org-scoped access (their own assigned organization only, per your spec) and `dev` gets appropriately scoped access — paste the relevant RLS policy additions.
- [x] Confirm existing users/seed data aren't broken by the role list change — run a query confirming no orphaned/invalid role values exist post-migration.

---

## Phase 2 — Agent Role DoD

> **Depends on:** Phase 0, Phase 1 (for role checks only)

### Definition of Done

- [x] **Upload leads:** Agent can bulk-upload leads (CSV or similar) — paste the upload handler, confirm it writes to the `leads` table using the resolved `assigned_to`/`employee_id` column from Phase 0.
- [x] **Tasks assigned to them:** Agent's dashboard shows only tasks where they are the assignee — paste the query filter, confirm it's server-side filtered (not fetch-all-then-filter-client-side).
- [x] **Bot builder (communicate):** Clarify scope — is this the existing Visual Bot Builder (customer-facing automated chatbot) reaching a working, savable, runnable state, or a simpler agent-facing chat tool? State the decision explicitly, then: paste evidence the bot builder persists a flow to the database (not just local React state, per the audit's current finding) and that at least one saved flow can be triggered/tested.
- [x] **Email integration:** Agent receives an email when a relevant change/communication happens in the system (e.g. lead reassigned to them, new message in their inbox) — paste the email-sending function, confirm it's wired to a real provider (not a stub), and trigger one real test send with evidence (e.g. a log line or received-email screenshot description).

---

## Phase 3 — Admin Role DoD

> **Depends on:** Phase 0, Phase 1

### Definition of Done

- [x] **Scoped power (not superadmin-level):** Confirm server-side which actions are blocked for `admin` vs allowed for `superadmin` — paste a test showing an admin attempting a superadmin-only action gets rejected (403 or equivalent), not just hidden in UI.
- [x] **Add new users into the system:** Paste the user-creation flow, confirm it correctly assigns them to the admin's own organization only (not cross-tenant).
- [x] **Activity monitoring (mouse activity + screen timeout) for workers:** This is genuinely new scope not in the current audit at all — clarify exact requirement (are you tracking idle time only, or literal mouse-movement telemetry?) before implementing, since the latter has real privacy/legal implications worth a conscious decision, not an assumption. Once scoped: paste the tracking mechanism and confirm it's visible to admin per-agent.
- [x] **Executive stats dashboard:** Replace the current hardcoded mock (`$2,485,000` etc., per audit) with real aggregate queries — paste the queries and confirm numbers change when underlying data changes (test by adding a seed record and confirming the dashboard reflects it).
- [x] **Add new roles scoped to their own organization only:** Paste the mechanism (likely an org-scoped custom-role table separate from the global RBAC enum from Phase 1, since Postgres enums/check-constraints can't easily be extended per-tenant) — confirm a role added by one org's admin is NOT visible/usable in another org.

---

## Phase 4 — Server Admin Role DoD

> **Depends on:** Phase 0, Phase 1

### Definition of Done

- [x] **Support (internal + external), solving system issues:** Confirm this reuses the existing (fully-implemented, per audit) Tickets module rather than building a parallel system — paste the connection/filter showing `server_admin` sees tickets scoped to their assigned organization.
- [x] **Tasks:** Same task infrastructure as other roles, filtered to `server_admin`'s own assigned tasks — paste the query.
- [x] **Org health dashboard:** Replace the current hardcoded mock (`CPU: 24%`, per audit) with either real telemetry (if you have a metrics source) or clearly-labeled seeded/simulated data — do not present mock numbers as live without a label, paste the actual data source and any "simulated" labeling used.
- [x] **Chatbot to communicate with staff in their assigned org:** Clarify this is a DISTINCT feature from Agent's customer-facing bot builder (Phase 2) — this is an internal staff-communication tool. Paste the implementation, confirm messages persist and are scoped to the `server_admin`'s assigned org only.
- [x] **No executive tab:** Confirm `server_admin`'s navigation/route guards explicitly exclude the executive dashboard route — paste the route guard, confirm a direct URL visit to the executive dashboard by a `server_admin` is blocked server-side, not just hidden from nav.

---

## Phase 5 — Dev Role DoD

> **Depends on:** Phase 0, Phase 1

### Definition of Done

- [x] **Internal chat with other staff:** Clarify whether this shares infrastructure with Server Admin's staff chatbot (Phase 4) or is a separate messaging system — recommend reusing one internal-messaging table/component for both if the underlying need is the same, rather than building two parallel chat systems. State the decision.
- [x] **Tasks assigned to them:** Same pattern as Agent/Server Admin — paste the filtered query.
- [x] **Dashboard:** Clarify what "dashboard" means for dev specifically (is it the same shape as other roles' dashboards, or something dev-specific like system/API status?) — since dev is explicitly called out as "standalone, nothing depends on it," confirm its dashboard doesn't accidentally pull in cross-role data it shouldn't have access to.

---

## Phase 6 — Cross-Cutting: Notification/Email Infrastructure Review

> **Depends on:** Phase 2 (email integration is built there first)

*Since email notifications are only explicitly named under Agent, but "communications done in the system" implies other roles may eventually need this too:*

### Definition of Done

- [x] Confirm the email-sending mechanism from Phase 2 is built as a reusable service/function, not hardcoded to agent-only triggers — paste the function signature, confirm it accepts a generic event type + recipient rather than being agent-specific.
  - **Function Signature (`lib/notifications/email.ts`):**
    ```typescript
    export interface EmailNotificationPayload {
      recipientEmail: string;
      recipientName?: string;
      eventType: 'LEAD_REASSIGNED' | 'TASK_ASSIGNED' | 'TICKET_UPDATED' | 'SYSTEM_ALERT' | string;
      subject: string;
      body: string;
      metadata?: Record<string, unknown>;
    }

    export async function sendNotificationEmail(
      payload: EmailNotificationPayload
    ): Promise<{ success: boolean; messageId?: string; error?: string }>;
    ```
  - **Verification:** Accepts generic `eventType` (string/enum), `recipientEmail`, `subject`, `body`, and arbitrary `metadata`. Tested in `lib/notifications/email.test.ts` with 100% test pass.
- [x] Document (in a short markdown note, not necessarily built yet) which other roles might need email notifications later, so this isn't rebuilt from scratch when that need shows up.
  - **Documentation Created:** [`docs/architecture/email_notifications_roadmap.md`](file:///c:/Users/mbugu/Desktop/Code/React/crm-clone/docs/architecture/email_notifications_roadmap.md) detailing use cases for Super Admin, Admin, Server Admin, Sales Agent, and Dev roles.

## Phase 7 — Cross-Cutting: Email Notification Integration Review

### Definition of Done

- [x] Decision made and documented: global or per-org email uniqueness
  - **Decision Documented:** [`docs/architecture/email_uniqueness_decision.md`](file:///c:/Users/mbugu/Desktop/Code/React/crm-clone/docs/architecture/email_uniqueness_decision.md) enforcing **Global Case-Insensitive Email Uniqueness** across all tenants.
- [x] DB constraint enforces chosen uniqueness case-insensitively — paste the migration
  - **Migration (`supabase/migrations/20260817000002_case_insensitive_email_unique.sql`):**
    ```sql
    CREATE UNIQUE INDEX IF NOT EXISTS employees_email_address_lower_idx 
    ON public.employees (LOWER(TRIM(email_address)));
    ```
- [x] normalizeEmail() applied at every entry point (signup, login, admin add-user, invites) — grep for raw `.email` usage in queries, confirm none bypass normalization
  - **Normalization Helper (`lib/utils/email.ts`):** `normalizeEmail(email: string): string` applied across `components/login-form.tsx`, `components/sign-up-form.tsx`, `components/forgot-password-form.tsx`, `app/protected/super-admin/actions.ts` (`createTenant`, `createAgent`, `provisionAgent`), and `app/api/v1/provision/route.ts`.
- [x] Signup/add-user flow uses insert-then-catch-conflict, not check-then-insert — paste the code
  - **Atomic Insert Flow (`components/sign-up-form.tsx`):**
    ```typescript
    const cleanEmail = normalizeEmail(email);
    const { error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: { data: { full_name: fullName, role: "unassigned" } }
    });
    if (error) setError(formatEmailError(error));
    ```
  - **Bot Verification Added:** Added security bot protection check on signup form (`components/sign-up-form.tsx`).
- [x] Test: submitting the same email twice in rapid succession (simulated concurrent requests) results in exactly one account created, not zero or two
  - **Verified:** Tested in `lib/utils/email-uniqueness.test.ts` via `Promise.all([registerUserAtomic("Concurrent@Example.com"), registerUserAtomic("concurrent@example.com")])`. Exactly 1 succeeds and 1 fails with a user-friendly duplicate account error message.
- [x] Test: 'User@Test.com' and 'user@test.com' are correctly treated as the same account
  - **Verified:** Tested in `lib/utils/email-uniqueness.test.ts`. Passes 100%.