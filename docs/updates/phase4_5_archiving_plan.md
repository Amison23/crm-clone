# Task Management System - Phase 4 & Phase 5 Specification

ROLE: Phased Execution Lead. Follow the Phased Execution Lead skill strictly.  
Do NOT proceed to the next phase without my explicit review and go-ahead.  
Do NOT self-grade any DoD item as complete — paste raw evidence (query output, console output, screenshots) for every checkbox. A description of what should have happened is not evidence.

CONTEXT: The Phase 1-3 report claimed authorization checks were added to `updateTaskStatusAction` and `deleteTaskAction`, and RLS was tightened. This was never independently verified. Before building further features on top of this, Phase 4 re-verifies that work with adversarial test cases, then adds manual archiving. Phase 5 adds automatic archiving.

---

## PHASE 4: Auth Verification & Manual Archiving

### PART A — Verify existing auth (do not modify code yet, just test and report)

1. As a `sales_agent` user, attempt to call `deleteTaskAction()` with a `taskId` belonging to a DIFFERENT employee (not assigned to them, not created by them). Paste the raw response.
2. As a `sales_agent` user, attempt to call `updateTaskStatusAction()` on the same kind of task (not theirs). Paste the raw response.
3. As a `sales_agent` user, attempt to directly query the `tasks` table for company tasks NOT assigned to them (bypassing the app's `getTasks()` scoping — e.g. via a raw Supabase client call) and confirm whether RLS blocks it or returns rows. Paste the raw response either way.
4. Pull current RLS policies via `SELECT * FROM pg_policies WHERE tablename = 'tasks'` and paste raw output.

> [!IMPORTANT]
> If ANY of tests 1-3 show an unauthorized action succeeding, or test 4 shows policies that don't match what was claimed in the prior report, STOP and report this to me before writing any fix code. Do not silently patch and re-claim success.

### PART B — Fix only what Part A proves is broken

- If `deleteTaskAction`/`updateTaskStatusAction` lack a real code-level check: add `checkTaskAuth(taskId, userId)` that fetches the task, verifies `userId === assigned_to OR userId === created_by OR role IN ('admin','superadmin')`, and returns `{ error: "Access Denied" }` before any mutation runs.
- If RLS policies don't match the claimed UPDATE/DELETE restriction, correct the migration and re-apply.

### PART C — Manual archiving

1. **SCHEMA**: Migration adding `archived_at timestamptz`, `archived_by uuid REFERENCES employees(id) ON DELETE SET NULL` to `tasks`. No backfill needed. Extend the tasks UPDATE RLS policy to permit setting these columns under the same auth condition as Part A/B (`assignee`, `creator`, or `admin`/`superadmin`) — do not create a separate weaker policy.
2. **API (`lib/api/tasks.ts`)**:
   - `archiveTaskAction(taskId)`: reuses `checkTaskAuth()`, sets `archived_at = now()`, `archived_by = user.id`, writes `ARCHIVE_TASK` audit log.
   - `unarchiveTaskAction(taskId)`: reuses `checkTaskAuth()`, clears both fields, writes `UNARCHIVE_TASK` audit log.
   - `bulkArchiveTasksAction(taskIds: string[])`: loops `checkTaskAuth()` per task, skips (not fails) unauthorized ones, returns `{ archivedCount, skippedIds }`.
   - `getTasks()`: filter `.is('archived_at', null)` by default.
   - `getArchivedTasks()`: same tenant/role scoping, filters `.not('archived_at', 'is', null)`.
3. **UI (`tasks-client-wrapper.tsx`)**:
   - "Archived" tab (4th tab for admin, toggle for non-admin), Unarchive action instead of Edit/Delete, no FAB.
   - Row action menu: add "Archive".
   - Checkbox column + "Archive selected" bulk button in toolbar.
   - Stat cards exclude archived tasks.

### Definition of Done (DoD - binary, paste raw evidence for each)
- [ ] Part A test 1 output (before fix, showing the actual vulnerability or its absence)
- [ ] Part A test 2 output
- [ ] Part A test 3 output
- [ ] Part A test 4 (`pg_policies` raw output)
- [ ] If a fix was needed: same tests 1-3 re-run AFTER the fix, showing rejection
- [ ] Migration: `information_schema.columns` output showing `archived_at`/`archived_by`
- [ ] `pg_policies` output showing updated UPDATE policy
- [ ] Archive as assignee $\rightarrow$ before/after query showing `archived_at` set
- [ ] Archive attempt by unauthorized employee $\rightarrow$ rejected, raw error pasted
- [ ] Unarchive $\rightarrow$ query showing `archived_at` reset to `NULL`
- [ ] Bulk archive with 1 authorized + 1 unauthorized task $\rightarrow$ response showing correct `archivedCount` and `skippedIds`
- [ ] Screenshot: table row count before archiving
- [ ] Screenshot: table row count after archiving (reduced)
- [ ] Screenshot: Archived tab with Unarchive option
- [ ] Screenshot: stat cards unaffected by archived tasks
- [ ] No console errors, raw console output pasted

STOP HERE. Wait for my review.

---

## PHASE 5: Automatic Archiving

CONTEXT: Manual archiving (Phase 4) is verified working before this begins. Auto-archive triggers on TWO conditions together, not age alone: a company must have MORE than a configurable completed-task-count threshold before old completed tasks get swept, so small/active teams are never auto-archived prematurely.

1. **SCHEMA**:
   - Add to `companies` table: `archive_after_days integer DEFAULT 30`, `archive_count_threshold integer DEFAULT 20`.
   - Migration must not break existing companies rows (defaults backfill automatically).
2. **LOGIC — pg_cron job (daily)**:
   - For each company: count non-archived tasks where `status = 'completed'`.
   - If that count > `archive_count_threshold`:
     archive completed tasks where `(now() - created_at_of_completion_or_updated_at) > archive_after_days`, oldest-first, using the SAME `archived_at`/`archived_by` mechanism as manual archiving (`archived_by = NULL` to signal system action, or a dedicated `'system'` sentinel — pick one and document it).
   - Write one `audit_logs` entry per task archived this way, `action = 'AUTO_ARCHIVE_TASK'`, actor clearly distinguishable from human archiving.
   - Job must be idempotent — running it twice in a row must not double-log or error on already-archived tasks.
3. **ADMIN SETTINGS UI**:
   - Simple settings control (wherever company settings currently live) for admin/superadmin to adjust `archive_after_days` and `archive_count_threshold`.
   - Input validation: both fields must be positive integers, reasonable upper bounds (e.g. `days <= 365`, `threshold <= 1000`).

### Definition of Done (DoD - binary, paste raw evidence)
- [ ] Migration: `information_schema.columns` output showing new companies columns with correct defaults
- [ ] `pg_cron` job definition pasted (`SELECT * FROM cron.job WHERE ...`)
- [ ] Manually trigger the job function against a seeded company with >threshold completed tasks, some old/some recent $\rightarrow$ paste before/after task counts proving only the old ones over threshold were archived
- [ ] Run the same job a second time immediately after $\rightarrow$ paste output proving no duplicate `audit_logs` entries and no errors (idempotency proof)
- [ ] `audit_logs` query showing `AUTO_ARCHIVE_TASK` entries with system-distinguishable actor
- [ ] Screenshot: admin settings UI with the two configurable fields
- [ ] Attempt to save an invalid value (e.g. negative number) $\rightarrow$ rejected, error shown
- [ ] Confirm a company with completed tasks BELOW threshold was untouched by the job run, paste before/after count
- [ ] No console/build errors, raw output pasted

STOP HERE. Wait for my final review.
