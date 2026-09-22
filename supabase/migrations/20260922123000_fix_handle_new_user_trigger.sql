-- Migration: Fix handle_new_user Auto-Superadmin Vulnerability
-- Replaces the dangerous trigger function that gave superadmin privileges to all public signups.

ALTER TABLE public.employees DROP CONSTRAINT IF EXISTS employees_role_check;
ALTER TABLE public.employees ADD CONSTRAINT employees_role_check CHECK (
  role IN (
    'client',
    'customer',
    'superadmin',
    'admin',
    'sales_agent',
    'server_admin',
    'dev',
    'unassigned'
  )
);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $function$
DECLARE
  v_role text;
  v_company_id uuid;
BEGIN
  IF new.raw_user_meta_data->>'company_id' IS NOT NULL
  AND new.raw_user_meta_data->>'role' IS NOT NULL THEN
    v_role := CASE (new.raw_user_meta_data->>'role')
      WHEN 'admin' THEN 'admin'
      WHEN 'superadmin' THEN 'superadmin'
      WHEN 'sales_agent' THEN 'sales_agent'
      WHEN 'server_admin' THEN 'server_admin'
      WHEN 'client' THEN 'client'
      ELSE 'client'
    END;
    v_company_id := (new.raw_user_meta_data->>'company_id')::uuid;
  ELSE
    -- Public signup → quarantine as unassigned with no company access
    v_role := 'unassigned';
    v_company_id := NULL;
  END IF;

  INSERT INTO public.employees (id, email_address, full_name, role, company_id)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'full_name', ''),
    v_role,
    v_company_id
  );
  RETURN new;
END;
$function$;
