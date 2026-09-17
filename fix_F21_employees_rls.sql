-- ============================================================
-- FIX: F-2-1 — Enable RLS on `employees` with recursion-safe policies
--
-- PROBLEM SOLVED: A policy on `employees` that subqueries `employees`
-- to check the caller's role causes infinite recursion in Postgres.
-- SOLUTION: Two SECURITY DEFINER functions that bypass RLS when
-- resolving the current user's own role and company_id. These run
-- as the function owner (postgres superuser) and are read-only,
-- so they cannot be abused to escalate privilege.
--
-- SELF-SIGNUP PATH CONFIRMED:
--   joinTenantWithCode (app/actions/tenant.ts:46) writes to `employees`
--   using the anon-key client — the INSERT policy must allow a user
--   to upsert their own row. employees_insert_self covers this.
--
--   linkExistingUser (app/actions/tenant.ts:203) updates `employees`
--   using the acting admin's anon-key session. employees_update_authorized
--   covers this (admin updating a row in their own company).
--
-- ALL other writes to `employees` (provisionAgent, createTenant) go
-- through createAdminClient() (service-role key) and bypass RLS
-- entirely — they are unaffected by these policies.
-- ============================================================

-- ── Step 0: Privilege Escalation Prevention Trigger ──

CREATE OR REPLACE FUNCTION prevent_self_privilege_escalation()
RETURNS trigger AS $$
BEGIN
  IF NEW.id = auth.uid() AND OLD.role NOT IN ('superadmin') THEN
    IF NEW.role IS DISTINCT FROM OLD.role 
       OR NEW.company_id IS DISTINCT FROM OLD.company_id THEN
      RAISE EXCEPTION 'Cannot modify role or company_id via self-update';
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS trg_prevent_self_privilege_escalation ON employees;
CREATE TRIGGER trg_prevent_self_privilege_escalation
BEFORE UPDATE ON employees
FOR EACH ROW EXECUTE FUNCTION prevent_self_privilege_escalation();

-- ── Step 1: Helper functions (must come before any policy that uses them) ──

CREATE OR REPLACE FUNCTION my_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT role FROM employees WHERE id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION my_company_id()
RETURNS uuid
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT company_id FROM employees WHERE id = auth.uid()
$$;

-- ── Step 2: Enable RLS ──

ALTER TABLE employees ENABLE ROW LEVEL SECURITY;

-- ── Step 3: SELECT — see colleagues in your own company, superadmin sees all ──

CREATE POLICY "employees_select_own_company" ON employees
  FOR SELECT
  USING (
    company_id = my_company_id()
    OR my_role() = 'superadmin'
  );

-- ── Step 4: INSERT — allow a user to upsert their own row only ──
-- This covers joinTenantWithCode where the newly-authenticated user
-- writes their own employee record after redeeming an invite code.
-- All other employee creation goes through the service-role client
-- and is unaffected by this policy.

CREATE POLICY "employees_insert_self" ON employees
  FOR INSERT
  WITH CHECK (
    id = auth.uid()
    AND role NOT IN ('admin', 'superadmin')
    AND EXISTS (
      SELECT 1 FROM invite_codes
      WHERE invite_codes.used_by = auth.uid()
      AND invite_codes.company_id = employees.company_id
    )
  );

-- ── Step 5: UPDATE ──
-- A user can update their own row.
-- An admin can update rows within their own company.
-- A superadmin can update any row.
-- This covers linkExistingUser (admin updating a target employee's company/role).

CREATE POLICY "employees_update_authorized" ON employees
  FOR UPDATE
  USING (
    id = auth.uid()
    OR (my_role() IN ('admin', 'superadmin') AND company_id = my_company_id())
    OR my_role() = 'superadmin'
  )
  WITH CHECK (
    id = auth.uid()
    OR (my_role() IN ('admin', 'superadmin') AND company_id = my_company_id())
    OR my_role() = 'superadmin'
  );

-- ── Step 6: DELETE — superadmin only ──

CREATE POLICY "employees_delete_superadmin" ON employees
  FOR DELETE
  USING (
    my_role() = 'superadmin'
  );
