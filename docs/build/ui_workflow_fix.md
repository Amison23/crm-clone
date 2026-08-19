This bundles a bug fix and a UI redesign — worth splitting into phases so the redesign doesn't get rushed while chasing the bug, and vice versa.

---

**Prompt:**

> Work in phases. After each phase, check it against that phase's Definition of Done, report the result, and stop for my confirmation before starting the next phase.
>
> **Phase 1 — Diagnose the task assignment bug**
>
> Context: When a task is created and assigned to the `sales_agent` (Amison, `amison011@gmail.com`), it does not appear on his end (`/protected/crm-leads-table` workspace).
>
> Tasks:
> - Trace the full task creation → assignment → fetch path: the create-task action/mutation, how `assigned_to` (or equivalent field) is set, and the query Amison's dashboard uses to fetch his tasks.
> - Check for tenant/company_id mismatches, RLS policy issues on the tasks table, incorrect role/user ID references, or a query filter that excludes newly created tasks.
> - Do NOT fix anything yet — first report exactly where the breakage is and why.
>
> Definition of Done:
> - [ ] Full data path traced from task creation to Amison's task view
> - [ ] Root cause identified with evidence (e.g. specific query, RLS policy, or field mismatch)
> - [ ] Confirmed whether this affects only Amison/sales_agent or all non-admin roles
> - [ ] Written explanation provided before any code changes are made
>
> Do not proceed to Phase 2 until root cause is confirmed and reported.
>
> **Phase 2 — Fix the task assignment bug**
>
> Tasks:
> - Implement the fix based on the confirmed root cause from Phase 1.
> - Test by creating a task assigned to Amison and confirming it appears on his workspace.
>
> Definition of Done:
> - [ ] Task created by admin/superadmin and assigned to Amison appears correctly on his `/protected/crm-leads-table` view
> - [ ] Fix does not break task visibility for other roles (dev, admin, superadmin)
> - [ ] No regression in existing task board functionality (`/protected/task-management-board`)
> - [ ] `npx tsc --noEmit` passes with 0 errors
>
> Do not proceed to Phase 3 until every box above is checked and reported.
>
> **Phase 3 — Redesign "My Workspace" quick access view**
>
> Context: The current "My Workspace" view (sales_agent quick access) has a "futuristic" visual style that's inconsistent with the rest of the system's design language, and doesn't surface data that actually helps the sales agent work faster.
>
> Tasks:
> - Audit the current My Workspace component for styling inconsistencies vs. the rest of the app (check `frontend-design` conventions already used elsewhere in the system).
> - Propose and implement a redesign that matches the system's existing visual language.
> - Replace decorative/futuristic elements with data relevant to a sales agent's daily workflow — e.g. assigned leads, upcoming follow-ups, open tickets, recent activity, task deadlines (confirm exact relevant data with me before finalizing if unclear).
>
> Definition of Done:
> - [ ] Visual style (colors, typography, spacing, components) matches the rest of the system — no standalone "futuristic" theme
> - [ ] All displayed data is real and relevant to the sales_agent role's daily tasks (no filler/decorative widgets)
> - [ ] Assigned tasks (post-Phase-2-fix) are visible and correctly populated for Amison
> - [ ] Component is responsive and renders without console errors
> - [ ] `npx tsc --noEmit` passes with 0 errors
> - [ ] Summary of all changes provided
>
> Constraints (apply to all phases):
> - Do not change database schema without flagging it to me first.
> - Do not alter admin, superadmin, or dev dashboards — scope is task assignment + sales_agent workspace only.