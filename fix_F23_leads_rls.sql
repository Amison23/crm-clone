-- ============================================================
-- FIX: F-2-3 — Enable RLS on `leads` with recursion-safe policies
--
-- PREREQUISITE: fix_F21_employees_rls.sql must be applied first.
-- This migration uses the my_role() and my_company_id() SECURITY
-- DEFINER helpers created in that file.
--
-- WHY: Once employees RLS is live, any policy that does
--   EXISTS (SELECT 1 FROM employees WHERE ...)
-- is subject to employees' own RLS evaluation. Using the
-- SECURITY DEFINER helpers sidesteps this and is consistent
-- with the employees migration.
--
-- SCHEMA (confirmed from types/supabase.ts — no client_id column):
--   id, company_id, employee_id, first_name, last_name,
--   company_name, email, phone, source, status,
--   potential_value, notes, created_at, updated_at
--
-- BEFORE APPLYING: run \d leads in the SQL editor and verify
-- the live table matches the schema above exactly.
-- ============================================================

-- ── Step 1: Enable RLS ──

ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- ── Step 2: Drop ALL existing permissive policies on leads ──
-- Postgres ORs permissive policies together. If any old policy allows the action,
-- it bypasses the strict ones we are creating below. We wipe the slate clean.

DO $$ 
DECLARE 
  pol record;
BEGIN 
  FOR pol IN SELECT polname FROM pg_policy WHERE polrelid = 'leads'::regclass LOOP
    EXECUTE 'DROP POLICY IF EXISTS "' || pol.polname || '" ON leads';
  END LOOP;
END $$;

-- ── Step 3: SELECT — any employee in the same company can read leads ──

CREATE POLICY "leads_select_own_company" ON leads
  FOR SELECT
  USING (
    company_id = my_company_id()
    OR my_role() = 'superadmin'
  );

-- ── Step 4: INSERT — sales_agent, admin, and superadmin can create leads ──
-- company_id on the new row must match the caller's own company.

CREATE POLICY "leads_insert_own_company" ON leads
  FOR INSERT
  WITH CHECK (
    company_id = my_company_id()
    AND my_role() IN ('sales_agent', 'admin', 'superadmin')
    AND employee_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = employee_id AND e.company_id = leads.company_id
    )
  );

-- ── Step 5: UPDATE — assigned agent or admin/superadmin of same company ──

CREATE POLICY "leads_update_authorized" ON leads
  FOR UPDATE
  USING (
    company_id = my_company_id()
    AND (
      employee_id = auth.uid()
      OR my_role() IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    company_id = my_company_id()
    AND (
      employee_id = auth.uid()
      OR my_role() IN ('admin', 'superadmin')
    )
    AND EXISTS (
      SELECT 1 FROM employees e 
      WHERE e.id = employee_id AND e.company_id = leads.company_id
    )
  );

-- ── Step 6: DELETE — admin and superadmin of same company only ──

CREATE POLICY "leads_delete_admin_only" ON leads
  FOR DELETE
  USING (
    company_id = my_company_id()
    AND my_role() IN ('admin', 'superadmin')
  );
