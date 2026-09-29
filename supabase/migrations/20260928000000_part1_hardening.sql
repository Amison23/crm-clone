-- 1. faq_entries RLS
ALTER TABLE faq_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "faq_entries_select" ON faq_entries
FOR SELECT
USING (
  is_active = true AND (
    EXISTS (SELECT 1 FROM chat_sessions cs WHERE cs.session_token = current_chat_token() AND cs.company_id = faq_entries.company_id)
    OR EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid() AND e.company_id = faq_entries.company_id)
  )
);

CREATE POLICY "faq_entries_admin_all" ON faq_entries
FOR ALL
USING (
  EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid() AND e.company_id = faq_entries.company_id AND e.role IN ('admin', 'superadmin'))
)
WITH CHECK (
  EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid() AND e.company_id = faq_entries.company_id AND e.role IN ('admin', 'superadmin'))
);

CREATE OR REPLACE FUNCTION increment_faq_usage(p_faq_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_company_id uuid;
BEGIN
    SELECT company_id INTO v_company_id FROM public.faq_entries WHERE id = p_faq_id;
    IF NOT FOUND THEN RETURN; END IF;
    
    IF EXISTS (
        SELECT 1 FROM chat_sessions cs WHERE cs.session_token = current_chat_token() AND cs.company_id = v_company_id
    ) OR EXISTS (
        SELECT 1 FROM employees e WHERE e.id = auth.uid() AND e.company_id = v_company_id
    ) THEN
        UPDATE public.faq_entries SET usage_count = usage_count + 1 WHERE id = p_faq_id;
    END IF;
END;
$$;

-- 2. modules RLS
ALTER TABLE modules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "modules_select_authenticated" ON modules
FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "modules_all_superadmin" ON modules
FOR ALL
USING (current_user_role() = 'superadmin')
WITH CHECK (current_user_role() = 'superadmin');

-- 3. role_permissions superadmin fix
DROP POLICY IF EXISTS "role_permissions_superadmin_all" ON role_permissions;

CREATE POLICY "role_permissions_superadmin_all" ON role_permissions
FOR ALL
USING (current_user_role() = 'superadmin')
WITH CHECK (current_user_role() = 'superadmin');

-- 4. Drop employees_insert_self
DROP POLICY IF EXISTS "employees_insert_self" ON employees;

-- 5. REVOKE anon from employees
REVOKE INSERT, UPDATE, DELETE ON employees FROM anon;
