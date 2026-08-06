-- ======================================================================
-- RLS: Tenant-scoped tables
-- Applies to: tickets, chat_messages, ticket_comments,
--             ticket_assignments, ticket_ratings, ticket_logs, client_metrics
-- Also fixes the 'companies' policy which incorrectly referenced 'profiles'
-- ======================================================================

-- ──────────────────────────────────────────────
-- TICKETS
-- ──────────────────────────────────────────────
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tickets_select_own_company" ON tickets
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = tickets.company_id
    )
  );

CREATE POLICY "tickets_insert_own_company" ON tickets
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = tickets.company_id
    )
  );

CREATE POLICY "tickets_update_own_company" ON tickets
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = tickets.company_id
    )
  );

CREATE POLICY "tickets_delete_admin_or_superadmin" ON tickets
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND (
        employees.company_id = tickets.company_id
        AND employees.role IN ('admin', 'superadmin')
      )
    )
  );

-- ──────────────────────────────────────────────
-- CHAT MESSAGES
-- ──────────────────────────────────────────────
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "chat_messages_select_own_company" ON chat_messages
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = chat_messages.company_id
    )
  );

CREATE POLICY "chat_messages_insert_own_company" ON chat_messages
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = chat_messages.company_id
    )
  );

CREATE POLICY "chat_messages_update_own_company" ON chat_messages
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = chat_messages.company_id
    )
  );

-- ──────────────────────────────────────────────
-- TICKET COMMENTS
-- Joins via tickets to get company_id
-- ──────────────────────────────────────────────
ALTER TABLE ticket_comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ticket_comments_select_own_company" ON ticket_comments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN employees e ON e.company_id = t.company_id
      WHERE t.id = ticket_comments.ticket_id
      AND e.id = auth.uid()
    )
  );

CREATE POLICY "ticket_comments_insert_own_company" ON ticket_comments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN employees e ON e.company_id = t.company_id
      WHERE t.id = ticket_comments.ticket_id
      AND e.id = auth.uid()
    )
  );

CREATE POLICY "ticket_comments_update_own_company" ON ticket_comments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN employees e ON e.company_id = t.company_id
      WHERE t.id = ticket_comments.ticket_id
      AND e.id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────
-- TICKET ASSIGNMENTS
-- Joins via tickets to get company_id
-- ──────────────────────────────────────────────
ALTER TABLE ticket_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ticket_assignments_select_own_company" ON ticket_assignments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN employees e ON e.company_id = t.company_id
      WHERE t.id = ticket_assignments.ticket_id
      AND e.id = auth.uid()
    )
  );

CREATE POLICY "ticket_assignments_insert_admin" ON ticket_assignments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN employees e ON e.company_id = t.company_id
      WHERE t.id = ticket_assignments.ticket_id
      AND e.id = auth.uid()
      AND e.role IN ('admin', 'superadmin', 'sales_agent')
    )
  );

-- ──────────────────────────────────────────────
-- TICKET RATINGS
-- Scoped to the client who owns the ticket (auth.uid = client_id)
-- or any employee from the same company
-- ──────────────────────────────────────────────
ALTER TABLE ticket_ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ticket_ratings_select" ON ticket_ratings
  FOR SELECT
  USING (
    client_id = auth.uid()
    OR EXISTS (
      SELECT 1 FROM tickets t
      JOIN employees e ON e.company_id = t.company_id
      WHERE t.id = ticket_ratings.ticket_id
      AND e.id = auth.uid()
    )
  );

CREATE POLICY "ticket_ratings_insert_client" ON ticket_ratings
  FOR INSERT
  WITH CHECK (client_id = auth.uid());

-- ──────────────────────────────────────────────
-- TICKET LOGS
-- ──────────────────────────────────────────────
ALTER TABLE ticket_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "ticket_logs_select_own_company" ON ticket_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN employees e ON e.company_id = t.company_id
      WHERE t.id = ticket_logs.ticket_id
      AND e.id = auth.uid()
    )
  );

CREATE POLICY "ticket_logs_insert_own_company" ON ticket_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM tickets t
      JOIN employees e ON e.company_id = t.company_id
      WHERE t.id = ticket_logs.ticket_id
      AND e.id = auth.uid()
    )
  );

-- ──────────────────────────────────────────────
-- CLIENT METRICS
-- ──────────────────────────────────────────────
ALTER TABLE client_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "client_metrics_select_own_company" ON client_metrics
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = client_metrics.company_id
    )
  );

CREATE POLICY "client_metrics_insert_own_company" ON client_metrics
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = client_metrics.company_id
    )
  );

-- ──────────────────────────────────────────────
-- FIX: COMPANIES policy was referencing 'profiles' table
-- which the app does not use for RBAC. Replace with 'employees'.
-- Drop the old policy and create a correct one.
-- ──────────────────────────────────────────────
DROP POLICY IF EXISTS "Profiles can only view their own company" ON companies;

-- Employees can view their own company
CREATE POLICY "companies_select_own_company" ON companies
  FOR SELECT
  USING (
    id = (
      SELECT company_id FROM employees WHERE id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.role = 'superadmin'
    )
  );

-- Only superadmins can insert/update/delete companies
CREATE POLICY "companies_write_superadmin_only" ON companies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.role = 'superadmin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.role = 'superadmin'
    )
  );
