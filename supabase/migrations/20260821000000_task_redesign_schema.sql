-- Migration: Task Management Redesign Schema (Phase 1)
-- 1. Add created_by column to tasks
ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES employees(id) ON DELETE SET NULL;

-- 2. Create task_feedback table
CREATE TABLE IF NOT EXISTS task_feedback (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES employees(id),
  message text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- 3. RLS for task_feedback
ALTER TABLE task_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "task_feedback_same_company_select" ON task_feedback;
CREATE POLICY "task_feedback_same_company_select" ON task_feedback
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN employees e ON e.company_id = t.company_id
      WHERE t.id = task_feedback.task_id
      AND e.id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "task_feedback_same_company_insert" ON task_feedback;
CREATE POLICY "task_feedback_same_company_insert" ON task_feedback
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tasks t
      JOIN employees e ON e.company_id = t.company_id
      WHERE t.id = task_feedback.task_id
      AND e.id = auth.uid()
    )
  );

-- 4. Fix tasks UPDATE & DELETE RLS policies
DROP POLICY IF EXISTS "Enable update for users in the same company" ON tasks;
DROP POLICY IF EXISTS "Enable delete for users in the same company" ON tasks;
DROP POLICY IF EXISTS "tasks_update_authorized" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_authorized" ON tasks;

CREATE POLICY "tasks_update_authorized" ON tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = auth.uid()
      AND e.company_id = tasks.company_id
      AND (
        tasks.assigned_to = auth.uid()
        OR tasks.created_by = auth.uid()
        OR e.role IN ('admin', 'superadmin')
      )
    )
  );

CREATE POLICY "tasks_delete_authorized" ON tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = auth.uid()
      AND e.company_id = tasks.company_id
      AND (
        tasks.assigned_to = auth.uid()
        OR tasks.created_by = auth.uid()
        OR e.role IN ('admin', 'superadmin')
      )
    )
  );
