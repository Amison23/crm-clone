BEGIN;

-- PART A
DROP POLICY IF EXISTS "anon_select_company_existence" ON companies;

-- PART B
DROP POLICY IF EXISTS "leads_select_own_company" ON leads;
DROP POLICY IF EXISTS "leads_insert_own_company" ON leads;
DROP POLICY IF EXISTS "leads_update_authorized" ON leads;
DROP POLICY IF EXISTS "leads_delete_admin_only" ON leads;

DROP POLICY IF EXISTS "Users can access data in their tenant for tasks" ON tasks;
DROP POLICY IF EXISTS "Users can access data in their tenant for deals" ON deals;
DROP POLICY IF EXISTS "Users can access data in their tenant for interactions" ON interactions;

DROP POLICY IF EXISTS "email_crm_relations_select_own_company" ON email_crm_relations;
DROP POLICY IF EXISTS "email_crm_relations_insert_own_company" ON email_crm_relations;
DROP POLICY IF EXISTS "email_crm_relations_update_own_company" ON email_crm_relations;

DROP POLICY IF EXISTS "email_messages_select_own_company" ON email_messages;
DROP POLICY IF EXISTS "email_messages_insert_own_company" ON email_messages;
DROP POLICY IF EXISTS "email_messages_update_own_company" ON email_messages;

DROP POLICY IF EXISTS "email_participants_select_own_company" ON email_participants;
DROP POLICY IF EXISTS "email_participants_insert_own_company" ON email_participants;
DROP POLICY IF EXISTS "email_participants_update_own_company" ON email_participants;

-- PART C
DROP POLICY IF EXISTS "employees_select_own_company" ON employees;

CREATE POLICY "employees_roster_select" ON employees FOR SELECT TO authenticated
USING (
  company_id = current_user_company()
  AND current_user_role() IN ('admin','server_admin')
);

-- PART D
DROP POLICY IF EXISTS "audit_logs_staff_insert" ON audit_logs;

CREATE POLICY "audit_logs_staff_insert" ON audit_logs FOR INSERT TO public
WITH CHECK (
  company_id = current_user_company() 
  AND current_user_role() IN ('admin','server_admin','superadmin','dev','sales_agent')
);

DROP POLICY IF EXISTS "audit_logs_superadmin_all" ON audit_logs;

CREATE POLICY "audit_logs_superadmin_select" ON audit_logs FOR SELECT TO authenticated
USING (current_user_role() = 'superadmin');

-- PART E
DROP POLICY IF EXISTS "system_settings_superadmin_all" ON system_settings;

CREATE POLICY "system_settings_superadmin_all" ON system_settings FOR ALL TO public
USING (current_user_role() = 'superadmin');

DROP POLICY IF EXISTS "Only Super Admins can manage snapshots" ON analytics_snapshots;

CREATE POLICY "Only Super Admins can manage snapshots" ON analytics_snapshots FOR ALL TO authenticated
USING (current_user_role() = 'superadmin');

DROP POLICY IF EXISTS "Users can access data in their tenant for snapshots" ON analytics_snapshots;

CREATE POLICY "Users can access data in their tenant for snapshots" ON analytics_snapshots FOR SELECT TO authenticated
USING (current_user_role() = 'superadmin' OR tenant_id = current_user_company());

DROP POLICY IF EXISTS "Server health only viewable by admins" ON client_metrics;

CREATE POLICY "Server health only viewable by admins" ON client_metrics FOR SELECT TO authenticated
USING (current_user_role() IN ('superadmin', 'server_admin'));

-- PART F
CREATE POLICY "task_feedback_staff_select" ON task_feedback FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM tasks t WHERE t.id = task_feedback.task_id
  AND t.company_id = current_user_company()));

CREATE POLICY "task_feedback_staff_insert" ON task_feedback FOR INSERT TO authenticated
WITH CHECK (author_id = auth.uid() AND EXISTS (SELECT 1 FROM tasks t
  WHERE t.id = task_feedback.task_id AND t.company_id = current_user_company()));

-- PART G
CREATE POLICY "invite_codes_admin_select" ON invite_codes FOR SELECT TO authenticated
USING (company_id = current_user_company() AND current_user_role() = 'admin');

CREATE POLICY "invite_codes_admin_insert" ON invite_codes FOR INSERT TO authenticated
WITH CHECK (company_id = current_user_company() AND current_user_role() = 'admin'
  AND created_by = auth.uid());

CREATE POLICY "invite_codes_server_admin_select" ON invite_codes FOR SELECT TO authenticated
USING (company_id = current_user_company() AND current_user_role() = 'server_admin');

-- PART H
CREATE POLICY "products_admin_insert" ON products FOR INSERT TO authenticated
WITH CHECK (company_id = current_user_company() AND current_user_role() = 'admin');

CREATE POLICY "products_admin_update" ON products FOR UPDATE TO authenticated
USING (company_id = current_user_company() AND current_user_role() = 'admin')
WITH CHECK (company_id = current_user_company());

CREATE POLICY "products_staff_select" ON products FOR SELECT TO authenticated
USING (company_id = current_user_company());

-- PART I
CREATE POLICY "virtual_server_admin_select" ON virtual_numbers FOR SELECT TO authenticated
USING (current_user_role() = 'server_admin' AND company_id = current_user_company());

CREATE POLICY "gateways_server_admin_select" ON gateways FOR SELECT TO authenticated
USING (current_user_role() = 'server_admin');

-- PART J
CREATE POLICY "org_custom_roles_server_admin_select" ON org_custom_roles FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid()
  AND e.company_id = org_custom_roles.company_id AND e.role = 'server_admin'));

CREATE POLICY "org_custom_roles_server_admin_update" ON org_custom_roles FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid()
  AND e.company_id = org_custom_roles.company_id AND e.role = 'server_admin'))
WITH CHECK (EXISTS (SELECT 1 FROM employees e WHERE e.id = auth.uid()
  AND e.company_id = org_custom_roles.company_id AND e.role = 'server_admin'));

-- PART K
CREATE POLICY "tickets_client_select" ON tickets FOR SELECT TO authenticated
USING (client_id = auth.uid());

CREATE POLICY "ticket_comments_client_select" ON ticket_comments FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM tickets t WHERE t.id = ticket_comments.ticket_id
  AND t.client_id = auth.uid()) AND is_internal = false);

CREATE POLICY "ticket_ratings_client_select" ON ticket_ratings FOR SELECT TO authenticated
USING (client_id = auth.uid());

COMMIT;
