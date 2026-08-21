-- Migration: 20260821000001_task_manual_archiving.sql
-- Description: Adds archived_at and archived_by columns to tasks table and updates RLS policy.

ALTER TABLE tasks 
  ADD COLUMN IF NOT EXISTS archived_at timestamptz DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS archived_by uuid REFERENCES employees(id) ON DELETE SET NULL;

-- Update RLS policy to ensure tasks_update_authorized covers archived_at and archived_by updates
-- (Same strict condition: auth user must be assignee, creator, or admin/superadmin)

DROP POLICY IF EXISTS "tasks_update_authorized" ON tasks;

CREATE POLICY "tasks_update_authorized" ON tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees e
      WHERE e.id = auth.uid()
        AND e.company_id = tasks.company_id
        AND (
          tasks.assigned_to = auth.uid() OR
          tasks.created_by = auth.uid() OR
          e.role IN ('admin', 'superadmin')
        )
    )
  );
