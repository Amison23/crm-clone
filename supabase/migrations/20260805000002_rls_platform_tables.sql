-- ======================================================================
-- RLS: Platform-only tables (superadmin access only, or scoped admin access)
-- Applies to: audit_logs, role_permissions, system_settings,
--             gateways, sim_ports, virtual_numbers, invite_codes
-- These tables are platform infrastructure — tenant-level users must not
-- read or write them. All policies are idempotent (safe to re-run).
-- ======================================================================

-- ──────────────────────────────────────────────
-- AUDIT LOGS
-- Read: superadmin only
-- Write: done via service role (admin client) in server actions — no user insert policy needed
-- ──────────────────────────────────────────────
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_logs_select_superadmin" ON audit_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.role = 'superadmin'
    )
  );

-- Inserts from server actions bypass RLS via the service role key.
-- This policy allows the anon/authenticated role to insert if needed:
CREATE POLICY "audit_logs_insert_superadmin" ON audit_logs
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.role = 'superadmin'
    )
  );

-- ──────────────────────────────────────────────
-- ROLE PERMISSIONS
-- Superadmin full access
-- ──────────────────────────────────────────────
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "role_permissions_all_superadmin" ON role_permissions
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

-- ──────────────────────────────────────────────
-- SYSTEM SETTINGS
-- Superadmin full access; read-only for admin (for platform-wide settings display)
-- ──────────────────────────────────────────────
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "system_settings_select_admin_and_above" ON system_settings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.role IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "system_settings_write_superadmin" ON system_settings
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

-- ──────────────────────────────────────────────
-- GATEWAYS
-- Superadmin full access; read-only for admin (so they can see their phone infrastructure)
-- ──────────────────────────────────────────────
ALTER TABLE gateways ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gateways_select_admin_and_above" ON gateways
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.role IN ('superadmin', 'admin')
    )
  );

CREATE POLICY "gateways_write_superadmin" ON gateways
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

-- ──────────────────────────────────────────────
-- SIM PORTS
-- Superadmin full access; admin can view their company's allocated ports
-- ──────────────────────────────────────────────
ALTER TABLE sim_ports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sim_ports_select_superadmin" ON sim_ports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND (
        employees.role = 'superadmin'
        OR (employees.role = 'admin' AND employees.company_id = sim_ports.company_id)
      )
    )
  );

CREATE POLICY "sim_ports_write_superadmin" ON sim_ports
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

-- ──────────────────────────────────────────────
-- VIRTUAL NUMBERS
-- Superadmin full access; admin can view their company's numbers
-- ──────────────────────────────────────────────
ALTER TABLE virtual_numbers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "virtual_numbers_select" ON virtual_numbers
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND (
        employees.role = 'superadmin'
        OR (employees.role = 'admin' AND employees.company_id = virtual_numbers.company_id)
      )
    )
  );

CREATE POLICY "virtual_numbers_write_superadmin" ON virtual_numbers
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

-- ──────────────────────────────────────────────
-- INVITE CODES
-- Superadmin: all; Admin: only their company's codes
-- ──────────────────────────────────────────────
ALTER TABLE invite_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "invite_codes_select" ON invite_codes
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND (
        employees.role = 'superadmin'
        OR (employees.role = 'admin' AND employees.company_id = invite_codes.company_id)
      )
    )
  );

CREATE POLICY "invite_codes_insert" ON invite_codes
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND (
        employees.role = 'superadmin'
        OR (employees.role = 'admin' AND employees.company_id = invite_codes.company_id)
      )
    )
  );

CREATE POLICY "invite_codes_update" ON invite_codes
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND (
        employees.role = 'superadmin'
        OR (employees.role = 'admin' AND employees.company_id = invite_codes.company_id)
      )
    )
  );

CREATE POLICY "invite_codes_delete_superadmin" ON invite_codes
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.role = 'superadmin'
    )
  );

-- ──────────────────────────────────────────────
-- MODULES
-- Read-only for all authenticated users (module list is needed by the permissions grid)
-- Write: superadmin only
-- ──────────────────────────────────────────────
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modules_select_authenticated" ON modules
  FOR SELECT
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "modules_write_superadmin" ON modules
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
