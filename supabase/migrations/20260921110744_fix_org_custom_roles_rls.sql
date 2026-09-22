-- Migration: Fix cross-tenant modification gap in org_custom_roles
-- Drops the overly permissive FOR ALL policy and replaces it with strict, scoped policies using WITH CHECK clauses.

DO $$
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "org_custom_roles_admin_all" ON public.org_custom_roles';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 1. SELECT: Admins can view roles for their company
CREATE POLICY "org_custom_roles_admin_select" ON public.org_custom_roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = auth.uid() 
      AND e.company_id = org_custom_roles.company_id 
      AND current_user_role() IN ('admin', 'superadmin')
    )
  );

-- 2. INSERT: Admins can only insert roles for their own company
CREATE POLICY "org_custom_roles_admin_insert" ON public.org_custom_roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = auth.uid() 
      AND e.company_id = org_custom_roles.company_id 
      AND current_user_role() IN ('admin', 'superadmin')
    )
  );

-- 3. UPDATE: Admins can only update roles in their own company
CREATE POLICY "org_custom_roles_admin_update" ON public.org_custom_roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = auth.uid() 
      AND e.company_id = org_custom_roles.company_id 
      AND current_user_role() IN ('admin', 'superadmin')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = auth.uid() 
      AND e.company_id = org_custom_roles.company_id 
      AND current_user_role() IN ('admin', 'superadmin')
    )
  );

-- 4. DELETE: Admins can only delete roles in their own company
CREATE POLICY "org_custom_roles_admin_delete" ON public.org_custom_roles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.employees e 
      WHERE e.id = auth.uid() 
      AND e.company_id = org_custom_roles.company_id 
      AND current_user_role() IN ('admin', 'superadmin')
    )
  );
