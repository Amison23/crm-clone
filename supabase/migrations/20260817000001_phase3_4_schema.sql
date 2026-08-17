-- Migration: Phase 3 & 4 Schema Expansion
-- Adds org_custom_roles table for tenant-scoped custom roles and worker_activity_logs for agent activity monitoring telemetry.

-- 1. Create org_custom_roles Table
CREATE TABLE IF NOT EXISTS public.org_custom_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    permissions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT org_custom_roles_unique_name_per_org UNIQUE (company_id, name)
);

-- Enable RLS for org_custom_roles
ALTER TABLE public.org_custom_roles ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "org_custom_roles_tenant_select" ON public.org_custom_roles';
    EXECUTE 'CREATE POLICY "org_custom_roles_tenant_select" ON public.org_custom_roles FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = auth.uid() AND e.company_id = org_custom_roles.company_id))';

    EXECUTE 'DROP POLICY IF EXISTS "org_custom_roles_admin_all" ON public.org_custom_roles';
    EXECUTE 'CREATE POLICY "org_custom_roles_admin_all" ON public.org_custom_roles FOR ALL USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = auth.uid() AND e.company_id = org_custom_roles.company_id AND e.role IN (''admin'', ''superadmin'')))';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;

-- 2. Create worker_activity_logs Table
CREATE TABLE IF NOT EXISTS public.worker_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'idle', 'offline')),
    idle_seconds INTEGER DEFAULT 0,
    last_mouse_activity TIMESTAMPTZ DEFAULT NOW(),
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS for worker_activity_logs
ALTER TABLE public.worker_activity_logs ENABLE ROW LEVEL SECURITY;

DO $$
BEGIN
    EXECUTE 'DROP POLICY IF EXISTS "worker_activity_logs_tenant_select" ON public.worker_activity_logs';
    EXECUTE 'CREATE POLICY "worker_activity_logs_tenant_select" ON public.worker_activity_logs FOR SELECT USING (EXISTS (SELECT 1 FROM public.employees e WHERE e.id = auth.uid() AND e.company_id = worker_activity_logs.company_id))';

    EXECUTE 'DROP POLICY IF EXISTS "worker_activity_logs_insert" ON public.worker_activity_logs';
    EXECUTE 'CREATE POLICY "worker_activity_logs_insert" ON public.worker_activity_logs FOR INSERT WITH CHECK (employee_id = auth.uid() OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = auth.uid() AND e.company_id = worker_activity_logs.company_id AND e.role IN (''admin'', ''superadmin'')));';

    EXECUTE 'DROP POLICY IF EXISTS "worker_activity_logs_update" ON public.worker_activity_logs';
    EXECUTE 'CREATE POLICY "worker_activity_logs_update" ON public.worker_activity_logs FOR UPDATE USING (employee_id = auth.uid() OR EXISTS (SELECT 1 FROM public.employees e WHERE e.id = auth.uid() AND e.company_id = worker_activity_logs.company_id AND e.role IN (''admin'', ''superadmin'')));';
EXCEPTION WHEN OTHERS THEN
    NULL;
END $$;
