-- Migration: RBAC Schema Expansion (Cleaned & Standardized 6 Roles)
-- Canonical Roles: 'superadmin', 'admin', 'sales_agent', 'server_admin', 'dev', 'client'

-- 1. Standardize profiles table constraint if profiles table exists
DO $$
DECLARE
  constraint_name text;
BEGIN
  IF to_regclass('public.profiles') IS NOT NULL THEN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'profiles'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%role%';

    IF constraint_name IS NOT NULL THEN
      EXECUTE 'ALTER TABLE profiles DROP CONSTRAINT ' || constraint_name;
    END IF;

    -- Update legacy values to canonical strings
    EXECUTE 'UPDATE profiles SET role = ''superadmin'' WHERE role = ''super_admin''';
    EXECUTE 'UPDATE profiles SET role = ''admin'' WHERE role = ''company_admin''';

    EXECUTE 'ALTER TABLE profiles ADD CONSTRAINT profiles_role_check CHECK (role IN (''superadmin'', ''admin'', ''sales_agent'', ''server_admin'', ''dev'', ''client''))';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 2. Standardize employees table constraint if employees table exists
DO $$
DECLARE
  constraint_name text;
BEGIN
  IF to_regclass('public.employees') IS NOT NULL THEN
    SELECT conname INTO constraint_name
    FROM pg_constraint
    WHERE conrelid = 'employees'::regclass AND contype = 'c' AND pg_get_constraintdef(oid) LIKE '%role%';

    IF constraint_name IS NOT NULL THEN
      EXECUTE 'ALTER TABLE employees DROP CONSTRAINT ' || constraint_name;
    END IF;

    -- Update legacy values to canonical strings
    EXECUTE 'UPDATE employees SET role = ''superadmin'' WHERE role = ''super_admin''';
    EXECUTE 'UPDATE employees SET role = ''admin'' WHERE role = ''company_admin''';
    EXECUTE 'UPDATE employees SET role = ''client'' WHERE role = ''customer''';

    EXECUTE 'ALTER TABLE employees ADD CONSTRAINT employees_role_check CHECK (role IN (''superadmin'', ''admin'', ''sales_agent'', ''server_admin'', ''dev'', ''client''))';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- 3. RLS Policies for server_admin and dev on core tenant tables

-- Tasks RLS for server_admin & dev
DO $$
BEGIN
  IF to_regclass('public.tasks') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "tasks_server_admin_dev_select" ON tasks';
    EXECUTE 'CREATE POLICY "tasks_server_admin_dev_select" ON tasks FOR SELECT USING (EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid() AND e.company_id = tasks.company_id AND e.role IN (''server_admin'', ''dev'')))';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Leads RLS for server_admin & dev
DO $$
BEGIN
  IF to_regclass('public.leads') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "leads_server_admin_dev_select" ON leads';
    EXECUTE 'CREATE POLICY "leads_server_admin_dev_select" ON leads FOR SELECT USING (EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid() AND e.company_id = leads.company_id AND e.role IN (''server_admin'', ''dev'')))';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Chat messages RLS for server_admin & dev
DO $$
BEGIN
  IF to_regclass('public.chat_messages') IS NOT NULL THEN
    EXECUTE 'DROP POLICY IF EXISTS "chat_messages_server_admin_dev_select" ON chat_messages';
    EXECUTE 'CREATE POLICY "chat_messages_server_admin_dev_select" ON chat_messages FOR SELECT USING (EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid() AND e.company_id = chat_messages.company_id AND e.role IN (''server_admin'', ''dev'')))';
  END IF;
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;
