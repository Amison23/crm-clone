# Cloudora CRM — Security Audit, Antigravity Task List (Phased, DoD-Gated)

## How to run this in Antigravity

Paste this whole file as the agent's task brief. Run it **phase by phase**, not as one giant task — each phase should produce its own Artifact (task list + findings table + evidence) that you review and approve before the next phase starts. Do not let the agent bundle phases; a single 5000-line diff with "security fixes" is unauditable.

For every phase, the agent must produce an **Artifact** containing:
1. The list of checks it ran, each mapped to file(s)/route(s)/RLS policy inspected
2. Evidence — the actual code, query, or policy it read (not a paraphrase — quote the relevant lines)
3. A verdict per check: `PASS` (server-side enforcement confirmed, cite it) / `FINDING` (logged to the findings table) / `N/A` (with a one-line reason the check doesn't apply to this codebase)

No check may be silently dropped. If a phase's Artifact has fewer verdicts than checks listed, that's a failed DoD, not a finding-free phase.

---

## Global rules (apply to every phase)

- This is Victor's own application (`Amison23/crm-clone` — Next.js 16 App Router, Supabase Postgres/Auth/RLS, Vercel). Authorized for testing and modification.
- **RLS is the primary authorization boundary in this app.** Any check that only looks at frontend role gating or route-level checks without also reading the matching RLS policy (or confirming server-role bypass) is incomplete. This codebase has one confirmed precedent (`reassignTicket`, removed this session) of a server action bypassing RLS via the service role — treat that as a known pattern to hunt for elsewhere, not a one-off.
- Never trust a client-side role check (`if (role === 'admin')` in a component) as evidence of anything. It only matters if the matching server action/route/RLS policy independently enforces the same thing.
- Cross-system boundary to keep in the threat model: LMS (`Cloudora_LMS`) uses a **separate Supabase project and separate auth system**. Any code path that could let an LMS identity act against the CRM's `auth.users`-scoped tables is a cross-tenant/cross-system finding, not routine IDOR.
- Every finding needs: name, severity (Critical/High/Medium/Low), affected file(s)/route(s)/policy, exact reproduction (as an HTTP request or DevTools action, not prose), and a proposed fix. No severity without a stated blast radius (single tenant? all tenants? single role? platform-wide?).

---

## Phase 0 — Architecture & threat model
**DoD:** Artifact contains a component inventory (frontend / API routes / server actions / RLS policies / auth / storage / background jobs / third-party integrations / secrets) and a threat-model table (attacker type × what they could reach) with every row populated — no "N/A" without a one-line reason.

- Map: unauthenticated attacker, authenticated normal user, authenticated malicious user (any of the 7 roles), cross-tenant attacker, cross-system attacker (LMS side), attacker replaying/crafting raw HTTP requests, attacker with DevTools access to their own authenticated session.
- Explicitly note where the frontend enforces something the backend doesn't re-check (this is the #1 known failure mode in this codebase already).

## Phase 1 — Authentication
**DoD:** every Supabase Auth flow in use (email/password, magic link, OAuth if any, invite-code signup, password reset) has a PASS/FINDING verdict with the exact code path cited.

- Session handling, token lifetime, invite-code validation/expiry/reuse, password reset flow, any custom auth middleware, login rate limiting (or absence of it), credential exposure in logs/URLs/client bundles.

## Phase 2 — Authorization / IDOR / RLS (highest priority phase for this app)
**DoD:** every table with tenant- or role-scoped data has its RLS policy read and verified against at least one corresponding client/server code path that touches it. Cross-reference against the existing role-capability matrix rather than rebuilding it from scratch — extend it with a pass/fail column instead.

- For every server action and API route: does it rely on RLS alone, on an explicit server-side role check, or (worst case) neither?
- Hunt specifically for other instances of the `reassignTicket` pattern — service-role client usage that bypasses RLS — across all server actions, not just tickets.
- IDOR sweep: can a `sales_agent` or `admin` manipulate an ID (ticket ID, tenant ID, company ID, product ID, lead ID) in a request to reach another tenant's row? Test this against RLS policy text, not assumed behavior.
- Confirm the `ticket_assignments` integrity gap from the existing audit (INSERT allowed for 3 roles, but paired `tickets.assigned_to` UPDATE is `server_admin`-only) — resolve whether `sales_agent` can currently reach `handleAssign()` and produce a fake audit row.
- Mass assignment: do any server actions accept a full object body and write it through without allowlisting fields (e.g., could a `sales_agent` submit a body containing `role: 'superadmin'`)?

## Phase 3 — API / HTTP security
**DoD:** every route under `app/api` and every server action has a verdict for: missing auth, missing authz, input validation, output over-exposure, CSRF exposure, SSRF exposure, open redirects.

- Assume the attacker skips the UI entirely and hand-crafts requests.
- Specifically re-check `/api/v1/tickets` (already known to be missing `client_id` handling) — confirm it's genuinely unreachable from any code path in either repo before deprioritizing it, since "uncalled today" can change.

## Phase 4 — Frontend / browser trust boundaries
**DoD:** every place the app reads from localStorage/sessionStorage/cookies/DOM is listed with a verdict on whether server-side logic trusts that value for anything security-relevant.

- XSS (stored/reflected/DOM), CSP presence, secrets or service-role keys accidentally bundled into client JS, source maps in production, cookie flags (`Secure`/`HttpOnly`/`SameSite`).

## Phase 5 — Injection
**DoD:** confirm 100% of database access goes through Supabase's parameterized client (no raw string-concatenated SQL anywhere) — cite the one or two places, if any, that don't.

- SQL injection, log injection (anything user-controlled written to logs unescaped), template/HTML injection in any server-rendered content.

## Phase 6 — File handling
**DoD:** N/A verdict is acceptable here only after confirming there is in fact no file upload/download surface in the app — check for one explicitly (avatars, attachments, exports) before marking N/A.

## Phase 7 — Secrets & sensitive data
**DoD:** full repo + git history scanned; every match triaged as false positive / rotate-required, with rotation (not just deletion) recommended for anything real.

- Service-role key exposure risk is elevated here given the known RLS-bypass pattern — confirm the service-role key is never reachable from any client-shipped code.

## Phase 8 — Database
**DoD:** every table lacking an RLS policy entirely is listed explicitly (not just tables that have one) — an un-policied table is a finding, not a gap in the audit.

- Least-privilege of the service role's usage, encryption at rest (Supabase default), migration safety, missing NOT NULL/FK constraints (the `/api/v1/tickets` missing-`client_id` bug is a known instance — check for siblings).

## Phase 9 — Business logic
**DoD:** every multi-step workflow (ticket lifecycle, tenant provisioning, invite-code redemption, assignment handoff) has its invariants stated explicitly and a verdict on whether any step can be skipped or replayed out of order.

- Ticket auto-assign trigger (fires unconditionally on INSERT) — confirm nothing can insert a ticket in a way that dodges the trigger.
- Invite-code reuse/expiry, tenant/company CRUD ordering assumptions.

## Phase 10 — Rate limiting / abuse
**DoD:** every sensitive operation (login, invite-code redemption, ticket creation, tenant creation) has an explicit PASS/FINDING for rate limiting — "not implemented" is a valid FINDING verdict, don't leave it blank.

## Phase 11 — Infrastructure / deployment
**DoD:** Vercel env var scoping (server-only vs. exposed-to-client), Supabase project settings (public schema exposure, anon key scope), any debug/dev-only routes reachable in production.

## Phase 12 — Dependencies
**DoD:** `npm audit` (or equivalent) run and output triaged — every High/Critical CVE gets a verdict (upgrade path exists / blocked by breaking change / accepted risk with reason).

## Phase 13 — Security headers
**DoD:** current header configuration (or absence) documented for CSP, HSTS, X-Content-Type-Options, Referrer-Policy, frame-ancestors, cookie flags — with a note on what breaks if each is added, before proposing changes.

## Phase 14 — Logging & detection
**DoD:** confirm what's currently logged for auth failures, privilege changes, and admin actions — most likely verdict here is FINDING (nothing structured exists yet), which is fine, just don't skip stating it.

## Phase 15 — Consolidated remediation report
**DoD:** one findings table, all phases combined, columns: Finding / Severity / Blast radius / Evidence / Repro / Fix / Status. This is the actual deliverable — everything above is process to get here honestly.

---

## What NOT to do
- Don't let the agent "fix as it finds" without a findings table first — you lose the audit trail and can't tell what was actually broken vs. hardened preemptively.
- Don't accept a phase Artifact that says "no issues found" without the per-check evidence backing it — that's an unverified claim, not a clean audit.
- Don't scope Phase 2 down to "the tables I already know about" — the RLS sweep needs to touch every table, including ones not mentioned in prior sessions.
