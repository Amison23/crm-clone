-- Migration: 20260821000002_task_auto_archiving.sql
-- Description: Adds auto-archive settings to companies, auto_archive_tasks() procedure, and pg_cron schedule.

-- 1. Add configurable auto-archive columns to companies
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS archive_after_days integer DEFAULT 30,
  ADD COLUMN IF NOT EXISTS archive_count_threshold integer DEFAULT 20;

-- 2. Create idempotent auto_archive_tasks PL/pgSQL function
CREATE OR REPLACE FUNCTION auto_archive_tasks()
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  comp RECORD;
  completed_cnt integer;
  target_task RECORD;
  archived_cnt integer := 0;
  tasks_to_archive UUID[];
BEGIN
  FOR comp IN 
    SELECT id, COALESCE(archive_after_days, 30) AS after_days, COALESCE(archive_count_threshold, 20) AS threshold 
    FROM companies 
  LOOP
    -- Count non-archived completed tasks for this company
    SELECT COUNT(*) INTO completed_cnt
    FROM tasks
    WHERE company_id = comp.id
      AND status = 'completed'
      AND archived_at IS NULL;

    IF completed_cnt > comp.threshold THEN
      -- Find completed tasks older than archive_after_days
      SELECT ARRAY_AGG(id) INTO tasks_to_archive
      FROM tasks
      WHERE company_id = comp.id
        AND status = 'completed'
        AND archived_at IS NULL
        AND COALESCE(updated_at, created_at) < (NOW() - (comp.after_days || ' days')::interval);

      IF tasks_to_archive IS NOT NULL AND array_length(tasks_to_archive, 1) > 0 THEN
        FOR target_task IN SELECT unnest(tasks_to_archive) AS id LOOP
          UPDATE tasks
          SET archived_at = NOW(),
              archived_by = NULL
          WHERE id = target_task.id AND archived_at IS NULL;

          IF FOUND THEN
            archived_cnt := archived_cnt + 1;
            INSERT INTO audit_logs (actor_id, action, entity_type, entity_id, payload)
            VALUES (NULL, 'AUTO_ARCHIVE_TASK', 'task', target_task.id, jsonb_build_object('auto', true, 'company_id', comp.id));
          END IF;
        END LOOP;
      END IF;
    END IF;
  END LOOP;

  RETURN jsonb_build_object('archived_count', archived_cnt);
END;
$$;

-- 3. Schedule daily pg_cron job (safely wrapped if pg_cron is available)
DO $$
BEGIN
  CREATE EXTENSION IF NOT EXISTS pg_cron;
  PERFORM cron.schedule('daily_auto_archive_tasks', '0 0 * * *', 'SELECT auto_archive_tasks()');
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'pg_cron extension not active on this environment or cron job already exists.';
END;
$$;
