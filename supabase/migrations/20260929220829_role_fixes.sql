BEGIN;

-- ==========================================
-- MIGRATION A
-- ==========================================

-- 1. messages
DROP POLICY IF EXISTS "anon_insert_message" ON messages;
DROP POLICY IF EXISTS "messages_insert_authorized" ON messages;
DROP POLICY IF EXISTS "messages_insert_anon" ON messages;
DROP POLICY IF EXISTS "messages_insert_agent" ON messages;
DROP POLICY IF EXISTS "messages_insert_bot" ON messages;
DROP POLICY IF EXISTS "staff_all_messages" ON messages;

CREATE POLICY "messages_insert_anon" ON messages FOR INSERT TO anon, authenticated
WITH CHECK (role = 'user' AND sender_id IS NULL AND is_bot_response = false);

CREATE POLICY "messages_insert_agent" ON messages FOR INSERT TO authenticated
WITH CHECK (company_id = my_company_id() AND role = 'agent' AND sender_id = auth.uid());

CREATE POLICY "messages_insert_bot" ON messages FOR INSERT TO anon, authenticated
WITH CHECK (role = 'assistant' AND sender_id IS NULL AND is_bot_response = true);

-- 2. audit_logs
DROP POLICY IF EXISTS "audit_logs_staff_insert" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_authorized" ON audit_logs;
CREATE POLICY "audit_logs_insert_authorized" ON audit_logs FOR INSERT TO authenticated
WITH CHECK (
  company_id = my_company_id() 
  AND actor_id = auth.uid()
  AND my_role() IN ('admin', 'sales_agent', 'dev', 'server_admin')
);

-- 3. leads (prevent unassigning)
DROP POLICY IF EXISTS "leads_update" ON leads;
DROP POLICY IF EXISTS "leads_update_authorized" ON leads;
CREATE POLICY "leads_update_authorized" ON leads FOR UPDATE TO authenticated
USING (company_id = my_company_id() AND (my_role() IN ('admin', 'superadmin') OR (my_role() IN ('sales_agent', 'dev', 'server_admin') AND (employee_id = auth.uid() OR employee_id IS NULL))))
WITH CHECK (company_id = my_company_id() AND (my_role() IN ('admin', 'superadmin') OR (my_role() IN ('sales_agent', 'dev', 'server_admin') AND employee_id = auth.uid())));


-- ==========================================
-- MIGRATION B
-- ==========================================

-- 1. Employees (Keep SELECT, Drop ALL/UPDATE/DELETE)
DROP POLICY IF EXISTS "employees_superadmin_all" ON employees;
DROP POLICY IF EXISTS "employees_superadmin_update" ON employees;
DROP POLICY IF EXISTS "employees_delete_superadmin" ON employees;
DROP POLICY IF EXISTS "employees_superadmin_select" ON employees;
CREATE POLICY "employees_superadmin_select" ON employees FOR SELECT TO authenticated
USING (current_user_role() = 'superadmin');

-- 2. Tasks
DROP POLICY IF EXISTS "tasks_delete_authorized" ON tasks;
DROP POLICY IF EXISTS "tasks_delete_authorized" ON tasks;
CREATE POLICY "tasks_delete_authorized" ON tasks FOR DELETE TO authenticated
USING (EXISTS ( SELECT 1 FROM employees e WHERE ((e.id = auth.uid()) AND (e.company_id = tasks.company_id) AND ((tasks.assigned_to = auth.uid()) OR (tasks.created_by = auth.uid()) OR (e.role = 'admin')))));

DROP POLICY IF EXISTS "tasks_update_authorized" ON tasks;
DROP POLICY IF EXISTS "tasks_update_authorized" ON tasks;
CREATE POLICY "tasks_update_authorized" ON tasks FOR UPDATE TO authenticated
USING (EXISTS ( SELECT 1 FROM employees e WHERE ((e.id = auth.uid()) AND (e.company_id = tasks.company_id) AND ((tasks.assigned_to = auth.uid()) OR (tasks.created_by = auth.uid()) OR (e.role = 'admin')))));

DROP POLICY IF EXISTS "tasks_superadmin_select" ON tasks;
DROP POLICY IF EXISTS "tasks_superadmin_select" ON tasks;
CREATE POLICY "tasks_superadmin_select" ON tasks FOR SELECT TO authenticated
USING (current_user_role() = 'superadmin');

-- 3. Tickets
DROP POLICY IF EXISTS "tickets_delete_admin_only" ON tickets;
DROP POLICY IF EXISTS "tickets_delete_admin_only" ON tickets;
CREATE POLICY "tickets_delete_admin_only" ON tickets FOR DELETE TO authenticated
USING (company_id = my_company_id() AND my_role() = 'admin');

DROP POLICY IF EXISTS "tickets_insert_authorized" ON tickets;
DROP POLICY IF EXISTS "tickets_insert_authorized" ON tickets;
CREATE POLICY "tickets_insert_authorized" ON tickets FOR INSERT TO authenticated
WITH CHECK (company_id = my_company_id() AND my_role() IN ('admin', 'server_admin'));

DROP POLICY IF EXISTS "tickets_update_authorized" ON tickets;
DROP POLICY IF EXISTS "tickets_update_authorized" ON tickets;
CREATE POLICY "tickets_update_authorized" ON tickets FOR UPDATE TO authenticated
USING (company_id = my_company_id() AND my_role() IN ('admin', 'server_admin'))
WITH CHECK (company_id = my_company_id() AND my_role() IN ('admin', 'server_admin'));

-- 4. Ticket Comments
DROP POLICY IF EXISTS "ticket_comments_delete_own_or_admin" ON ticket_comments;
DROP POLICY IF EXISTS "ticket_comments_delete_own_or_admin" ON ticket_comments;
CREATE POLICY "ticket_comments_delete_own_or_admin" ON ticket_comments FOR DELETE TO authenticated
USING (author_id = auth.uid() OR (my_role() = 'admin' AND EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_comments.ticket_id AND t.company_id = my_company_id())));

DROP POLICY IF EXISTS "ticket_comments_update_own_or_admin" ON ticket_comments;
DROP POLICY IF EXISTS "ticket_comments_update_own_or_admin" ON ticket_comments;
CREATE POLICY "ticket_comments_update_own_or_admin" ON ticket_comments FOR UPDATE TO authenticated
USING (author_id = auth.uid() OR (my_role() = 'admin' AND EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_comments.ticket_id AND t.company_id = my_company_id())))
WITH CHECK (author_id = auth.uid() OR (my_role() = 'admin' AND EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_comments.ticket_id AND t.company_id = my_company_id())));

DROP POLICY IF EXISTS "ticket_comments_insert_own_company" ON ticket_comments;
DROP POLICY IF EXISTS "ticket_comments_insert_own_company" ON ticket_comments;
CREATE POLICY "ticket_comments_insert_own_company" ON ticket_comments FOR INSERT TO authenticated
WITH CHECK (author_id = auth.uid() AND EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_comments.ticket_id AND t.company_id = my_company_id()));

-- 5. Org Custom Roles
DROP POLICY IF EXISTS "org_custom_roles_admin_insert" ON org_custom_roles;
DROP POLICY IF EXISTS "org_custom_roles_admin_insert" ON org_custom_roles;
CREATE POLICY "org_custom_roles_admin_insert" ON org_custom_roles FOR INSERT TO authenticated
WITH CHECK (EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid() AND e.company_id = org_custom_roles.company_id AND current_user_role() = 'admin'));

DROP POLICY IF EXISTS "org_custom_roles_admin_update" ON org_custom_roles;
DROP POLICY IF EXISTS "org_custom_roles_admin_update" ON org_custom_roles;
CREATE POLICY "org_custom_roles_admin_update" ON org_custom_roles FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid() AND e.company_id = org_custom_roles.company_id AND current_user_role() = 'admin'))
WITH CHECK (EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid() AND e.company_id = org_custom_roles.company_id AND current_user_role() = 'admin'));

DROP POLICY IF EXISTS "org_custom_roles_admin_delete" ON org_custom_roles;
DROP POLICY IF EXISTS "org_custom_roles_admin_delete" ON org_custom_roles;
CREATE POLICY "org_custom_roles_admin_delete" ON org_custom_roles FOR DELETE TO authenticated
USING (EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid() AND e.company_id = org_custom_roles.company_id AND current_user_role() = 'admin'));

DROP POLICY IF EXISTS "org_custom_roles_superadmin_select" ON org_custom_roles;
DROP POLICY IF EXISTS "org_custom_roles_superadmin_select" ON org_custom_roles;
CREATE POLICY "org_custom_roles_superadmin_select" ON org_custom_roles FOR SELECT TO authenticated
USING (current_user_role() = 'superadmin');

-- 6. Clean up duplicate system settings policies
DROP POLICY IF EXISTS "settings_superadmin_all" ON system_settings; 

COMMIT;
