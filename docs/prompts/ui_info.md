Since the audit doc already flags gaps but doesn't tell you exactly what data each role is missing on each page, the smart move is a discovery phase first — have Antigravity verify the current state page-by-page and report back before touching any code. That way you're not guessing at "what data helps a sales agent" from your end; Antigravity pulls the actual queries/components and tells you.

---

**Prompt:**

> Work in phases. After each phase, check it against that phase's Definition of Done, report the result, and stop for my confirmation before starting the next phase. Do not make code changes in Phase 1 — it's discovery only.
>
> Context: I have an audit report (`analysis_ui.md`) claiming most routes are already compliant with a Slate/Indigo design system and correctly role-scoped. I don't trust this fully — I need it independently verified against the actual codebase before we act on it, since some pages may still have leftover "futuristic" styling or be missing data a role actually needs to work efficiently.
>
> **Phase 1 — Independent verification audit**
>
> For every route listed below, inspect the actual `page.tsx` and its child components (not just the audit doc's claims):
> - `/protected` (`app/protected/page.tsx`)
> - `/protected/sales-agent`
> - `/protected/crm-leads-table`
> - `/protected/task-management-board`
> - `/protected/tickets`
> - `/protected/executive-dashboard`
> - `/protected/super-admin` (+ subroutes: `/users`, `/analytics`, `/logs`, `/settings`)
> - `/protected/dev`
> - `/protected/omnichannel-chat-inbox`
>
> For each route, report:
> 1. **Styling check** — does it actually match the target design system (slate/indigo palette, `rounded-2xl`/`rounded-3xl`, `border-slate-200/80`, `font-black tracking-tight` headings, etc.), or does it still have leftover inconsistent/legacy styling? Be specific about what's off, not just pass/fail.
> 2. **Dynamic render check** — does the file actually export `export const dynamic = "force-dynamic"` and `export const revalidate = 0`? Confirm directly from the file, don't assume from the audit doc.
> 3. **Data relevance check** — list exactly what data/widgets are currently shown to the primary role(s) on that page, and flag anything that's decorative/non-actionable or, conversely, missing data that role would need to do their job faster (e.g. a sales agent needing today's follow-ups, a dev needing recent error logs, an admin needing team workload at a glance).
> 4. **Role scoping check** — confirm queries are scoped correctly per role (agent sees own data, admin/superadmin see company-wide) by checking the actual query code, not assuming.
>
> Definition of Done:
> - [ ] All 9 routes (+ super-admin subroutes) inspected directly in the codebase
> - [ ] Each route has a styling verdict with specifics (not just ✅/❌)
> - [ ] Each route has a confirmed dynamic-render verdict
> - [ ] Each route has a list of current data shown + gaps identified per role
> - [ ] Each route has a confirmed query-scoping verdict
> - [ ] A prioritized list of routes that actually need work (styling, data, or scoping) is presented to me, distinct from routes that are genuinely fine
> - [ ] No code has been changed in this phase
>
> Stop here and present the findings. I will review and tell you which routes/issues to prioritize before you proceed.
>
> **Phase 2 — Fix dynamic render directives (only for routes confirmed missing them in Phase 1)**
>
> Definition of Done:
> - [ ] `export const dynamic = "force-dynamic"` and `export const revalidate = 0` added to every route confirmed missing them
> - [ ] No routes that already had these directives were touched unnecessarily
> - [ ] `npx tsc --noEmit` passes with 0 errors
> - [ ] Confirm each affected page still loads and fetches live data (not stale/cached)
>
> **Phase 3 — Design system alignment (only for routes flagged in Phase 1)**
>
> Definition of Done:
> - [ ] Flagged routes now match the target design system (palette, border radius, typography) consistently with already-compliant pages
> - [ ] No new inconsistencies introduced (spot-check against a known-good page like `/protected/sales-agent`)
> - [ ] Responsive layout preserved
> - [ ] `npx tsc --noEmit` passes with 0 errors
>
> **Phase 4 — Role-relevant data upgrades (only for routes flagged in Phase 1)**
>
> Definition of Done:
> - [ ] Each flagged route now surfaces the specific missing data identified in Phase 1 for its primary role
> - [ ] Decorative/non-actionable widgets identified in Phase 1 are removed or replaced with real, queried data
> - [ ] Data is correctly role-scoped (verified against Phase 1 findings, not assumed)
> - [ ] `npx tsc --noEmit` passes with 0 errors
> - [ ] Full summary of every file touched across all phases, and what changed
>
> Constraints (apply to all phases):
> - Do not change database schema without flagging it to me first.
> - Do not touch routes that Phase 1 confirms are already compliant.
> - Do not skip Phase 1's stop-and-report gate — I need to see the real findings before any code changes happen.