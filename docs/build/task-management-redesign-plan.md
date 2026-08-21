# Task Management Board Redesign Plan

## Overview
Redesigning Cloudora's task management board from a kanban view to a table-based view, matching the existing Leads/Tickets table pattern in this codebase (`components/crm/leads-client-wrapper.tsx`, `components/tickets/TicketTable.tsx`).

---

## Phase 1: Schema Changes

### Objectives
1. Create Supabase migration adding `created_by uuid REFERENCES employees(id) ON DELETE SET NULL` to `tasks`. Backfill existing rows with `NULL`.
2. Create Supabase migration for new `task_feedback` table:
   - `id` uuid PK
   - `task_id` uuid REFERENCES tasks(id) ON DELETE CASCADE
   - `author_id` uuid REFERENCES employees(id)
   - `message` text NOT NULL
   - `created_at` timestamptz DEFAULT now()
3. Add RLS policies on `task_feedback`:
   - SELECT for same-company employees only (join through `tasks -> company_id`).
   - INSERT for same-company employees only.
4. Fix RLS policies on `tasks`:
   - UPDATE and DELETE policies must only allow rows where `auth.uid() = assigned_to OR auth.uid() = created_by OR employee role IN ('admin', 'superadmin')`.

### Definition of Done (DoD)
- [ ] Migration files exist and run cleanly against Supabase instance
- [ ] `tasks` table has `created_by` column, confirmed via schema query output pasted in report
- [ ] `task_feedback` table exists with correct FKs, confirmed via schema query
- [ ] New RLS policies confirmed present via `SELECT * FROM pg_policies WHERE tablename IN ('tasks','task_feedback')` output pasted in report
- [ ] No existing task rows were deleted or had data loss (row count before == row count after)

---

## Phase 2: API Layer

### Objectives
1. Update `createTaskAction` to set `created_by = user.id`.
2. Add explicit authorization checks inside `updateTaskStatusAction` and `deleteTaskAction`:
   - Fetch task first
   - Verify `user.id` matches `assigned_to` OR `created_by` OR role is `admin`/`superadmin`
   - Return an error object `{ error: string }` if unauthorized.
3. Update `getTasks()` to return tasks grouped/taggable by relationship to current user:
   - Add `relation` field per task (`'mine' | 'assigned_by_me' | 'team'`).
4. Add `getTaskFeedback(taskId)` and `addTaskFeedback(taskId, message)` functions following existing action patterns (auth check, tenant check, audit log).
5. Add overdue detection helper (`due_date < now() && status != 'completed'`).

### Definition of Done (DoD)
- [ ] Attempting to update/delete a task as a non-owner, non-creator, non-admin returns an explicit error
- [ ] `getTasks()` output sample (JSON) shows `relation` field populated correctly for `'mine'`, `'assigned_by_me'`, and `'team'`
- [ ] `addTaskFeedback` writes a row and `getTaskFeedback` retrieves it
- [ ] All new/changed functions write `audit_logs` entries on mutation

---

## Phase 3: UI - Table View

### Objectives
1. Replace `TasksClientWrapper` kanban rendering with a table matching `leads-client-wrapper.tsx`'s structural pattern (Table components, badge styles, hover states, pagination footer).
2. Stat cards row at top: Pending / In Progress / Review / Completed / Overdue counts.
3. For `isAdmin`: render three tabs (My Tasks / Assigned by Me / Team) using the `relation` field. For non-admin: single table (no tabs).
4. Filter toolbar: Status, Priority dropdowns (+ Assignee dropdown if `isAdmin`).
5. Keep existing Add Task FAB and form unmodified.
6. Row click opens detail drawer showing description, feedback thread, and (if `isAdmin`) feedback input box wired to `addTaskFeedback`.

### Definition of Done (DoD)
- [ ] Screenshot of admin view showing all 3 tabs with correct task counts
- [ ] Screenshot of non-admin (sales_agent) view showing single filtered table
- [ ] Screenshot of detail drawer showing a submitted feedback message persisted after page refresh
- [ ] Overdue tasks visually flagged
- [ ] No console errors on load
- [ ] Existing Add Task flow works unmodified
