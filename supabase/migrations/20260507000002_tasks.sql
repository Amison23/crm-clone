-- ==============================
-- TASKS
-- ==============================
CREATE TABLE tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  assigned_to uuid REFERENCES employees(id) ON DELETE SET NULL,
  title text NOT NULL,
  description text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'review', 'completed')),
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  due_date timestamptz,
  created_at timestamptz DEFAULT now() NOT NULL
);

-- RLS
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Enable read for users in the same company" ON tasks
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = tasks.company_id
    )
  );

CREATE POLICY "Enable insert for users in the same company" ON tasks
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = tasks.company_id
    )
  );

CREATE POLICY "Enable update for users in the same company" ON tasks
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = tasks.company_id
    )
  );

CREATE POLICY "Enable delete for users in the same company" ON tasks
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = tasks.company_id
    )
  );
