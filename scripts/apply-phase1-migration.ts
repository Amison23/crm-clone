import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function run() {
  console.log("Testing connection and executing migration statements...");

  // Execute DDL via RPC or direct SQL query endpoint if configured, or check table structure via REST
  const { data, error } = await supabase.rpc('exec_sql', {
    sql_query: `
      ALTER TABLE tasks ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES employees(id) ON DELETE SET NULL;
      
      CREATE TABLE IF NOT EXISTS task_feedback (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        task_id uuid NOT NULL REFERENCES tasks(id) ON DELETE CASCADE,
        author_id uuid NOT NULL REFERENCES employees(id),
        message text NOT NULL,
        created_at timestamptz DEFAULT now() NOT NULL
      );
      
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
    `
  });

  if (error) {
    console.error("RPC exec_sql error:", error);
  } else {
    console.log("Migration executed successfully via RPC exec_sql:", data);
  }
}

run();
