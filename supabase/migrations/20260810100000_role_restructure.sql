-- Drop the old check constraint on profiles and add the new one with 'dev'
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'profiles'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%role%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || constraint_name;
  END IF;
END $$;

ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (
  role IN (
    'client',
    'super_admin',
    'company_admin',
    'sales_agent',
    'server_admin',
    'dev'
  )
);

-- Similarly update employees role check if it exists
DO $$
DECLARE
  constraint_name text;
BEGIN
  SELECT conname INTO constraint_name
  FROM pg_constraint
  WHERE conrelid = 'employees'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%role%';

  IF constraint_name IS NOT NULL THEN
    EXECUTE 'ALTER TABLE employees DROP CONSTRAINT ' || constraint_name;
    -- Note: employees uses slightly different role names based on codebase (e.g. admin instead of company_admin)
    EXECUTE 'ALTER TABLE employees ADD CONSTRAINT employees_role_check CHECK (role IN (''client'', ''customer'', ''super_admin'', ''superadmin'', ''admin'', ''company_admin'', ''sales_agent'', ''server_admin'', ''dev'', ''unassigned''))';
  END IF;
EXCEPTION WHEN OTHERS THEN
  -- Ignore if table employees doesn't have such constraint or is a view
END $$;

-- Drop existing ticket policies
DROP POLICY IF EXISTS "tickets_select_own_company" ON tickets;
DROP POLICY IF EXISTS "tickets_insert_own_company" ON tickets;
DROP POLICY IF EXISTS "tickets_update_own_company" ON tickets;
DROP POLICY IF EXISTS "tickets_delete_admin_or_superadmin" ON tickets;

-- server_admin has full access, admin/superadmin have read-only, client sees their own
CREATE POLICY "tickets_select" ON tickets
  FOR SELECT
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = tickets.company_id
      AND employees.role IN ('server_admin', 'admin', 'superadmin', 'super_admin')
    )
  );

CREATE POLICY "tickets_insert" ON tickets
  FOR INSERT
  WITH CHECK (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = tickets.company_id
      AND employees.role = 'server_admin'
    )
  );

CREATE POLICY "tickets_update" ON tickets
  FOR UPDATE
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = tickets.company_id
      AND employees.role = 'server_admin'
    )
  );

CREATE POLICY "tickets_delete" ON tickets
  FOR DELETE
  USING (
    client_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = tickets.company_id
      AND employees.role = 'server_admin'
    )
  );

-- Also fix ticket_comments to restrict to server_admin (and admin for read-only) + clients for their tickets
DROP POLICY IF EXISTS "ticket_comments_select_own_company" ON ticket_comments;
DROP POLICY IF EXISTS "ticket_comments_insert_own_company" ON ticket_comments;
DROP POLICY IF EXISTS "ticket_comments_update_own_company" ON ticket_comments;

CREATE POLICY "ticket_comments_select" ON ticket_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_comments.ticket_id
      AND (
        t.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM employees e 
          WHERE e.company_id = t.company_id AND e.id = auth.uid() AND e.role IN ('server_admin', 'admin', 'superadmin', 'super_admin')
        )
      )
    )
  );

CREATE POLICY "ticket_comments_insert" ON ticket_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_comments.ticket_id
      AND (
        t.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM employees e 
          WHERE e.company_id = t.company_id AND e.id = auth.uid() AND e.role = 'server_admin'
        )
      )
    )
  );

CREATE POLICY "ticket_comments_update" ON ticket_comments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_comments.ticket_id
      AND (
        t.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM employees e 
          WHERE e.company_id = t.company_id AND e.id = auth.uid() AND e.role = 'server_admin'
        )
      )
    )
  );

-- Fix ticket_logs to restrict to server_admin (and admin for read-only) + clients for their tickets
DROP POLICY IF EXISTS "ticket_logs_select_own_company" ON ticket_logs;
DROP POLICY IF EXISTS "ticket_logs_insert_own_company" ON ticket_logs;

CREATE POLICY "ticket_logs_select" ON ticket_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_logs.ticket_id
      AND (
        t.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM employees e 
          WHERE e.company_id = t.company_id AND e.id = auth.uid() AND e.role IN ('server_admin', 'admin', 'superadmin', 'super_admin')
        )
      )
    )
  );

CREATE POLICY "ticket_logs_insert" ON ticket_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets t
      WHERE t.id = ticket_logs.ticket_id
      AND (
        t.client_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM employees e 
          WHERE e.company_id = t.company_id AND e.id = auth.uid() AND e.role = 'server_admin'
        )
      )
    )
  );

-- Trigger to auto-assign new tickets to a server_admin
CREATE OR REPLACE FUNCTION auto_assign_ticket()
RETURNS TRIGGER AS $$
DECLARE
  v_server_admin_id uuid;
BEGIN
  IF NEW.assigned_to IS NULL THEN
    -- Find the first server_admin for the company
    SELECT id INTO v_server_admin_id
    FROM employees
    WHERE company_id = NEW.company_id AND role = 'server_admin'
    LIMIT 1;

    IF v_server_admin_id IS NOT NULL THEN
      NEW.assigned_to := v_server_admin_id;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_auto_assign_ticket ON tickets;
CREATE TRIGGER trigger_auto_assign_ticket
  BEFORE INSERT ON tickets
  FOR EACH ROW
  EXECUTE FUNCTION auto_assign_ticket();
