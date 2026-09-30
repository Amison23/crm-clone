BEGIN;

-- ============================================================
-- RLS TEST SUITE â€” test_logs pattern
-- ============================================================

-- Apply Migration C (UNCOMMENT THIS LINE WHEN RUNNING 'WITH C')
-- Migration C: Vital Fixes

ALTER TABLE employees ALTER COLUMN company_id DROP NOT NULL;

-- 1. employees
DROP POLICY IF EXISTS "employees_select" ON employees;
DROP POLICY IF EXISTS "employees_update_admin" ON employees;
DROP POLICY IF EXISTS "employees_delete_admin" ON employees;

DROP POLICY IF EXISTS "employees_self_select" ON employees;
CREATE POLICY "employees_self_select" ON employees FOR SELECT TO authenticated
USING (id = auth.uid());

DROP POLICY IF EXISTS "employees_roster_select" ON employees;
CREATE POLICY "employees_roster_select" ON employees FOR SELECT TO authenticated
USING (company_id = my_company_id() AND my_role() IN ('admin','server_admin'));

DROP POLICY IF EXISTS "employees_admin_update" ON employees;
CREATE POLICY "employees_admin_update" ON employees FOR UPDATE TO authenticated
USING (company_id = my_company_id() AND my_role()='admin' AND role NOT IN ('admin','superadmin','server_admin'))
WITH CHECK (company_id = my_company_id() AND my_role()='admin' AND role IN ('sales_agent','dev'));

DROP POLICY IF EXISTS "employees_admin_delete" ON employees;
CREATE POLICY "employees_admin_delete" ON employees FOR DELETE TO authenticated
USING (company_id = my_company_id() AND my_role()='admin' AND id <> auth.uid() AND role NOT IN ('admin','superadmin','server_admin'));

DROP POLICY IF EXISTS "employees_self_update" ON employees;
CREATE POLICY "employees_self_update" ON employees FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid() AND role = my_role() AND company_id IS NOT DISTINCT FROM my_company_id());


-- 2. messages
DROP POLICY IF EXISTS "messages_insert_anon" ON messages;
DROP POLICY IF EXISTS "messages_insert_bot" ON messages;
DROP POLICY IF EXISTS "messages_insert_agent" ON messages;

DROP POLICY IF EXISTS "messages_anon_insert" ON messages;
CREATE POLICY "messages_anon_insert" ON messages FOR INSERT TO anon
WITH CHECK (role='user' AND is_bot_response=false AND sender_id IS NULL AND EXISTS (SELECT 1 FROM chat_sessions cs WHERE cs.id = messages.chat_session_id AND cs.session_token = current_chat_token() AND cs.company_id = messages.company_id));

DROP POLICY IF EXISTS "messages_staff_select" ON messages;
CREATE POLICY "messages_staff_select" ON messages FOR SELECT TO authenticated
USING (company_id = my_company_id() AND my_role() IN ('admin','server_admin','dev','sales_agent'));

DROP POLICY IF EXISTS "messages_staff_insert" ON messages;
CREATE POLICY "messages_staff_insert" ON messages FOR INSERT TO authenticated
WITH CHECK (company_id = my_company_id() AND my_role() IN ('admin','server_admin','dev','sales_agent') AND role='agent' AND sender_id = auth.uid());


-- 3. audit_logs
DROP POLICY IF EXISTS "audit_logs_staff_insert" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_insert_authorized" ON audit_logs;
DROP POLICY IF EXISTS "audit_logs_select_admin" ON audit_logs;

DROP POLICY IF EXISTS "audit_logs_insert_staff" ON audit_logs;
CREATE POLICY "audit_logs_insert_staff" ON audit_logs FOR INSERT TO authenticated
WITH CHECK (company_id = my_company_id() AND actor_id = auth.uid() AND my_role() IN ('admin','server_admin','dev','sales_agent'));

DROP POLICY IF EXISTS "audit_logs_insert_superadmin" ON audit_logs;
CREATE POLICY "audit_logs_insert_superadmin" ON audit_logs FOR INSERT TO authenticated
WITH CHECK (actor_id = auth.uid() AND my_role()='superadmin');

DROP POLICY IF EXISTS "audit_logs_select_staff" ON audit_logs;
CREATE POLICY "audit_logs_select_staff" ON audit_logs FOR SELECT TO authenticated
USING (company_id = my_company_id() AND my_role() IN ('admin','server_admin','dev'));

DROP POLICY IF EXISTS "audit_logs_select_superadmin" ON audit_logs;
CREATE POLICY "audit_logs_select_superadmin" ON audit_logs FOR SELECT TO authenticated
USING (my_role()='superadmin');


-- 4. leads
DROP POLICY IF EXISTS "leads_staff_select" ON leads;
DROP POLICY IF EXISTS "leads_staff_insert" ON leads;
DROP POLICY IF EXISTS "leads_update_authorized" ON leads;

CREATE POLICY "leads_staff_select" ON leads FOR SELECT TO authenticated
USING (company_id = my_company_id() AND my_role() IN ('sales_agent','dev','server_admin','admin'));

CREATE POLICY "leads_staff_insert" ON leads FOR INSERT TO authenticated
WITH CHECK (company_id = my_company_id() AND my_role() IN ('sales_agent','dev','server_admin','admin'));

CREATE POLICY "leads_update_authorized" ON leads FOR UPDATE TO authenticated
USING (company_id = my_company_id() AND my_role() IN ('admin','sales_agent','dev','server_admin') AND (my_role() = 'admin' OR employee_id = auth.uid() OR employee_id IS NULL))
WITH CHECK (company_id = my_company_id() AND my_role() IN ('admin','sales_agent','dev','server_admin') AND (my_role() = 'admin' OR employee_id = auth.uid()));


-- 5. redeem_invite_code
CREATE OR REPLACE FUNCTION public.redeem_invite_code(p_code text)
RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_company uuid;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'not authenticated'; END IF;
  IF EXISTS (SELECT 1 FROM employees WHERE id = auth.uid()
             AND (company_id IS NOT NULL OR role <> 'unassigned')) THEN
    RAISE EXCEPTION 'already belongs to a company';
  END IF;
  UPDATE invite_codes SET used_at = now(), used_by = auth.uid()
   WHERE code = p_code AND used_at IS NULL AND revoked = false
     AND (expires_at IS NULL OR expires_at > now())
  RETURNING company_id INTO v_company;
  RETURN v_company;
END $$;
REVOKE ALL ON FUNCTION public.redeem_invite_code(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.redeem_invite_code(text) TO authenticated;


SET LOCAL role = postgres;

-- Drop FK constraints that reference auth.users if any exist
ALTER TABLE tickets DROP CONSTRAINT IF EXISTS tickets_client_id_fkey;
ALTER TABLE ticket_comments DROP CONSTRAINT IF EXISTS ticket_comments_author_id_fkey;

CREATE TEMP TABLE test_logs (test text, result text);
GRANT INSERT, SELECT ON test_logs TO anon, authenticated, public;



-- Insert companies
INSERT INTO companies (id, name, slug) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Test Corp A', 'test-corp-a'),
  ('c2222222-2222-2222-2222-222222222222', 'Test Corp B', 'test-corp-b');


-- Insert into auth.users (as postgres)
INSERT INTO auth.users (id, email, raw_user_meta_data) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'e1@test.com', '{"company_id":"c1111111-1111-1111-1111-111111111111", "role":"admin"}'::jsonb),
  ('e2222222-2222-2222-2222-222222222222', 'e2@test.com', '{"company_id":"c1111111-1111-1111-1111-111111111111", "role":"sales_agent"}'::jsonb),
  ('e3333333-3333-3333-3333-333333333333', 'e3@test.com', '{"company_id":"c1111111-1111-1111-1111-111111111111", "role":"dev"}'::jsonb),
  ('e4444444-4444-4444-4444-444444444444', 'e4@test.com', '{"company_id":"c1111111-1111-1111-1111-111111111111", "role":"superadmin"}'::jsonb),
  ('e5555555-5555-5555-5555-555555555555', 'e5@test.com', '{"company_id":"c2222222-2222-2222-2222-222222222222", "role":"sales_agent"}'::jsonb),
  ('e6666666-6666-6666-6666-666666666666', 'e6@test.com', '{"company_id":"c2222222-2222-2222-2222-222222222222", "role":"admin"}'::jsonb),
  ('e8888888-8888-8888-8888-888888888888', 'e8@test.com', '{"company_id":"c1111111-1111-1111-1111-111111111111", "role":"server_admin"}'::jsonb);

DO $$
BEGIN
  INSERT INTO auth.users (id, email) VALUES
    ('e7777777-7777-7777-7777-777777777777', 'e7@test.com');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$; 

-- Insert employees
-- Note: If Migration C is not applied, the e7777777 insert will fail due to NOT NULL constraint.
-- To allow testing 'WITHOUT C', we will create a savepoint or bypass it if it fails.
DO $$ 
BEGIN
  INSERT INTO employees (id, company_id, full_name, role) VALUES
    ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Admin A',   'admin'),
    ('e2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Agent A',   'sales_agent'),
    ('e3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Dev A',     'dev'),
    ('e4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'Superadmin','superadmin'),
    ('e5555555-5555-5555-5555-555555555555', 'c2222222-2222-2222-2222-222222222222', 'Agent B',   'sales_agent'),
    ('e6666666-6666-6666-6666-666666666666', 'c2222222-2222-2222-2222-222222222222', 'Admin B',   'admin'),
    ('e8888888-8888-8888-8888-888888888888', 'c1111111-1111-1111-1111-111111111111', 'Server Admin A', 'server_admin');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Attempt unassigned user. If without C, this fails silently.
DO $$ 
BEGIN
  INSERT INTO employees (id, company_id, full_name, role) VALUES
    ('e7777777-7777-7777-7777-777777777777', NULL, 'Unassigned User', 'unassigned');
EXCEPTION WHEN OTHERS THEN
  NULL;
END $$;

-- Customers for Tickets
INSERT INTO customers (id, company_id, email) VALUES
  ('c3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'c1@test.com'),
  ('c4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'c2@test.com');

INSERT INTO leads (id, company_id, employee_id, first_name, status, phone) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'Agent A Lead', 'new', '123'),
  ('a2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', NULL, 'Unassigned A', 'new', '123'),
  ('a3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'e3333333-3333-3333-3333-333333333333', 'Dev A Lead', 'new', '123'),
  ('a4444444-4444-4444-4444-444444444444', 'c2222222-2222-2222-2222-222222222222', 'e5555555-5555-5555-5555-555555555555', 'Agent B Lead', 'new', '123');

INSERT INTO tasks (id, company_id, assigned_to, created_by, title, due_date) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'Task A', '2030-01-01'),
  ('b2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'e5555555-5555-5555-5555-555555555555', 'e5555555-5555-5555-5555-555555555555', 'Task B', '2030-01-01');

INSERT INTO tickets (id, company_id, client_id, title, category) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'c3333333-3333-3333-3333-333333333333', 'Ticket A', 'support'),
  ('d2222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'c4444444-4444-4444-4444-444444444444', 'Ticket B', 'support');

INSERT INTO ticket_comments (id, ticket_id, author_id, body, is_internal) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'd1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Reply', false);

INSERT INTO org_custom_roles (id, company_id, name) VALUES
  ('ab111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Custom Role A');

-- Chat sessions & Messages
INSERT INTO chat_sessions (id, company_id, status, session_token) VALUES 
  ('ce111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'active', 'ee111111-1111-1111-1111-111111111111'),
  ('ce222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'active', 'ee222222-2222-2222-2222-222222222222');

INSERT INTO messages (id, chat_session_id, company_id, content, sender_id, role) VALUES 
  ('f2222222-2222-2222-2222-222222222222', 'ce111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Msg A', 'e2222222-2222-2222-2222-222222222222', 'agent'),
  ('f3333333-3333-3333-3333-333333333333', 'ce222222-2222-2222-2222-222222222222', 'c2222222-2222-2222-2222-222222222222', 'Msg B', 'e5555555-5555-5555-5555-555555555555', 'agent');

-- Invite Codes
INSERT INTO invite_codes (id, company_id, code, created_by, expires_at) VALUES
  ('cd111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'VALID123', 'e1111111-1111-1111-1111-111111111111', now() + interval '1 day');

-- Run Tests
DO $test_suite$
DECLARE 
  v_rows int;
  v_company_id uuid;
  v_has_priv boolean;
BEGIN
  -- ==========================================
  -- 1. ADMIN EMPLOYEE UPDATES
  -- ==========================================
  SET LOCAL role = authenticated;
  SET LOCAL request.jwt.claims TO '{"sub":"e1111111-1111-1111-1111-111111111111","role":"authenticated"}';

  -- Admin promotes agent to superadmin (blocked)
  BEGIN
    UPDATE employees SET role = 'superadmin' WHERE id = 'e2222222-2222-2222-2222-222222222222';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('Admin_Promote_Superadmin', 'PASSED (0 rows)');
    ELSE INSERT INTO test_logs VALUES ('Admin_Promote_Superadmin', 'FAILED - ALLOWED'); END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_logs VALUES ('Admin_Promote_Superadmin', 'PASSED (BLOCKED)');
  END;

  -- Admin promotes agent to server_admin (blocked)
  BEGIN
    UPDATE employees SET role = 'server_admin' WHERE id = 'e2222222-2222-2222-2222-222222222222';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('Admin_Promote_ServerAdmin', 'PASSED (0 rows)');
    ELSE INSERT INTO test_logs VALUES ('Admin_Promote_ServerAdmin', 'FAILED - ALLOWED'); END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_logs VALUES ('Admin_Promote_ServerAdmin', 'PASSED (BLOCKED)');
  END;

  -- Admin promotes agent to dev (positive control)
  UPDATE employees SET role = 'dev' WHERE id = 'e2222222-2222-2222-2222-222222222222';
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 1 THEN INSERT INTO test_logs VALUES ('Admin_Promote_Agent', 'PASSED (1 row)');
  ELSE INSERT INTO test_logs VALUES ('Admin_Promote_Agent', 'FAILED - 0 ROWS'); END IF;

  -- Admin updates employee in another company (0 rows)
  UPDATE employees SET full_name = 'Hack' WHERE id = 'e5555555-5555-5555-5555-555555555555';
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('Admin_Cross_Tenant_Update', 'PASSED (0 rows)');
  ELSE INSERT INTO test_logs VALUES ('Admin_Cross_Tenant_Update', 'FAILED - ALLOWED'); END IF;

  -- Admin deletes employee in another company (0 rows)
  DELETE FROM employees WHERE id = 'e5555555-5555-5555-5555-555555555555';
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('Admin_Cross_Tenant_Delete', 'PASSED (0 rows)');
  ELSE INSERT INTO test_logs VALUES ('Admin_Cross_Tenant_Delete', 'FAILED - ALLOWED'); END IF;

  -- Admin deletes server_admin (0 rows)
  DELETE FROM employees WHERE id = 'e8888888-8888-8888-8888-888888888888';
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('Admin_Delete_ServerAdmin', 'PASSED (0 rows)');
  ELSE INSERT INTO test_logs VALUES ('Admin_Delete_ServerAdmin', 'FAILED - ALLOWED'); END IF;

  -- ==========================================
  -- 2. AGENT EMPLOYEE SELECTS
  -- ==========================================
  SET LOCAL request.jwt.claims TO '{"sub":"e2222222-2222-2222-2222-222222222222","role":"authenticated"}';

  -- Agent selects other employees
  IF NOT EXISTS (SELECT 1 FROM employees WHERE id = 'e1111111-1111-1111-1111-111111111111') THEN
    INSERT INTO test_logs VALUES ('Agent_Select_Others', 'PASSED (0 rows)');
  ELSE INSERT INTO test_logs VALUES ('Agent_Select_Others', 'FAILED - READ ALLOWED'); END IF;

  -- Agent selects own row
  IF EXISTS (SELECT 1 FROM employees WHERE id = 'e2222222-2222-2222-2222-222222222222') THEN
    INSERT INTO test_logs VALUES ('Agent_Select_Self', 'PASSED (1 row)');
  ELSE INSERT INTO test_logs VALUES ('Agent_Select_Self', 'FAILED - CANNOT READ'); END IF;

  -- ==========================================
  -- 3. ANON MESSAGES
  -- ==========================================
  SET LOCAL role = anon;
  SET LOCAL request.jwt.claims TO '{"role":"anon"}';
  
  -- anon inserts role=user into another company's session
  BEGIN
    SET LOCAL request.headers TO '{"x-chat-token":"ee222222-2222-2222-2222-222222222222"}';
    INSERT INTO messages (id, chat_session_id, company_id, content, sender_id, role)
    VALUES (gen_random_uuid(), 'ce111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Msg', NULL, 'user');
    INSERT INTO test_logs VALUES ('Anon_Insert_Message_Cross', 'FAILED - ALLOWED');
  EXCEPTION WHEN SQLSTATE '42501' THEN
    INSERT INTO test_logs VALUES ('Anon_Insert_Message_Cross', 'PASSED (BLOCKED)');
  END;

  -- anon inserts role=user into valid session
  BEGIN
    SET LOCAL request.headers TO '{"x-chat-token":"ee111111-1111-1111-1111-111111111111"}';
    INSERT INTO messages (id, chat_session_id, company_id, content, sender_id, role)
    VALUES (gen_random_uuid(), 'ce111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Msg', NULL, 'user');
    INSERT INTO test_logs VALUES ('Anon_Insert_Message_Valid', 'PASSED');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_logs VALUES ('Anon_Insert_Message_Valid', 'FAILED - ' || SQLERRM);
  END;

  -- anon inserts role=assistant
  BEGIN
    SET LOCAL request.headers TO '{"x-chat-token":"ee111111-1111-1111-1111-111111111111"}';
    INSERT INTO messages (id, chat_session_id, company_id, content, sender_id, role)
    VALUES (gen_random_uuid(), 'ce111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Msg', NULL, 'assistant');
    INSERT INTO test_logs VALUES ('Anon_Insert_Message_Bot', 'FAILED - ALLOWED');
  EXCEPTION WHEN SQLSTATE '42501' THEN
    INSERT INTO test_logs VALUES ('Anon_Insert_Message_Bot', 'PASSED (BLOCKED)');
  END;

  -- authenticated inserts role=user
  SET LOCAL role = authenticated;
  SET LOCAL request.jwt.claims TO '{"sub":"e2222222-2222-2222-2222-222222222222","role":"authenticated"}';
  BEGIN
    INSERT INTO messages (id, chat_session_id, company_id, content, sender_id, role)
    VALUES (gen_random_uuid(), 'ce111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Msg', NULL, 'user');
    INSERT INTO test_logs VALUES ('Auth_Insert_Message_User', 'FAILED - ALLOWED');
  EXCEPTION WHEN SQLSTATE '42501' THEN
    INSERT INTO test_logs VALUES ('Auth_Insert_Message_User', 'PASSED (BLOCKED)');
  END;

  -- ==========================================
  -- 4. STAFF MESSAGES SELECT
  -- ==========================================
  -- Staff SELECT own company messages
  IF EXISTS (SELECT 1 FROM messages WHERE id = 'f2222222-2222-2222-2222-222222222222') THEN
    INSERT INTO test_logs VALUES ('Staff_Select_Message_Self', 'PASSED');
  ELSE INSERT INTO test_logs VALUES ('Staff_Select_Message_Self', 'FAILED (0 rows)'); END IF;

  -- Cross-tenant staff SELECT
  IF NOT EXISTS (SELECT 1 FROM messages WHERE id = 'f3333333-3333-3333-3333-333333333333') THEN
    INSERT INTO test_logs VALUES ('Staff_Select_Message_Cross', 'PASSED (0 rows)');
  ELSE INSERT INTO test_logs VALUES ('Staff_Select_Message_Cross', 'FAILED - ALLOWED'); END IF;

  -- ==========================================
  -- 5. AUDIT LOGS
  -- ==========================================
  -- Forged actor blocked
  BEGIN
    INSERT INTO audit_logs (id, actor_id, company_id, action, entity_type, entity_id, payload)
    VALUES (gen_random_uuid(), 'e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'TEST', 'test', 'id', '{}');
    INSERT INTO test_logs VALUES ('Audit_Insert_Forged', 'FAILED - ALLOWED');
  EXCEPTION WHEN SQLSTATE '42501' THEN
    INSERT INTO test_logs VALUES ('Audit_Insert_Forged', 'PASSED (BLOCKED)');
  END;

  -- Valid actor succeeds
  BEGIN
    INSERT INTO audit_logs (id, actor_id, company_id, action, entity_type, entity_id, payload)
    VALUES (gen_random_uuid(), 'e2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'TEST', 'test', 'id', '{}');
    INSERT INTO test_logs VALUES ('Audit_Insert_Valid', 'PASSED');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_logs VALUES ('Audit_Insert_Valid', 'FAILED - ' || SQLERRM);
  END;

  -- superadmin insert with null company
  SET LOCAL request.jwt.claims TO '{"sub":"e4444444-4444-4444-4444-444444444444","role":"authenticated"}';
  BEGIN
    INSERT INTO audit_logs (id, actor_id, company_id, action, entity_type, entity_id, payload)
    VALUES (gen_random_uuid(), 'e4444444-4444-4444-4444-444444444444', NULL, 'TEST', 'test', 'id', '{}');
    INSERT INTO test_logs VALUES ('Audit_Insert_Superadmin', 'PASSED');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_logs VALUES ('Audit_Insert_Superadmin', 'FAILED - ' || SQLERRM);
  END;

  -- superadmin SELECT count > 0
  SELECT count(*) INTO v_rows FROM audit_logs;
  IF v_rows > 0 THEN INSERT INTO test_logs VALUES ('Audit_Select_Superadmin', 'PASSED');
  ELSE INSERT INTO test_logs VALUES ('Audit_Select_Superadmin', 'FAILED (0 rows)'); END IF;

  -- dev SELECT count > 0
  SET LOCAL request.jwt.claims TO '{"sub":"e3333333-3333-3333-3333-333333333333","role":"authenticated"}';
  SELECT count(*) INTO v_rows FROM audit_logs;
  IF v_rows > 0 THEN INSERT INTO test_logs VALUES ('Audit_Select_Dev', 'PASSED');
  ELSE INSERT INTO test_logs VALUES ('Audit_Select_Dev', 'FAILED (0 rows)'); END IF;

  -- agent SELECT 0
  SET LOCAL request.jwt.claims TO '{"sub":"e2222222-2222-2222-2222-222222222222","role":"authenticated"}';
  SELECT count(*) INTO v_rows FROM audit_logs;
  IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('Audit_Select_Agent', 'PASSED (0 rows)');
  ELSE INSERT INTO test_logs VALUES ('Audit_Select_Agent', 'FAILED - ALLOWED'); END IF;

  -- ==========================================
  -- 6. LEADS
  -- ==========================================
  -- role outside staff list gets 0 rows (use client)
  SET LOCAL request.jwt.claims TO '{"sub":"c3333333-3333-3333-3333-333333333333","role":"authenticated"}';
  SELECT count(*) INTO v_rows FROM leads WHERE company_id = 'c1111111-1111-1111-1111-111111111111';
  IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('Leads_Select_Client', 'PASSED (0 rows)');
  ELSE INSERT INTO test_logs VALUES ('Leads_Select_Client', 'FAILED - ALLOWED'); END IF;

  -- ==========================================
  -- 7. REDEEM INVITE CODE (REAL)
  -- ==========================================
  -- Note: If function doesn't exist (WITHOUT C), these tests will report FAILED - Function not found.
  BEGIN
    SELECT has_function_privilege('anon', 'redeem_invite_code(text)', 'execute') INTO v_has_priv;
    IF v_has_priv THEN INSERT INTO test_logs VALUES ('Redeem_Priv_Anon', 'FAILED - ALLOWED');
    ELSE INSERT INTO test_logs VALUES ('Redeem_Priv_Anon', 'PASSED (BLOCKED)'); END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_logs VALUES ('Redeem_Priv_Anon', 'FAILED (No Function)');
  END;

  SET LOCAL request.jwt.claims TO '{"sub":"e7777777-7777-7777-7777-777777777777","role":"authenticated"}';
  BEGIN
    -- unassigned user redeems
    v_company_id := redeem_invite_code('VALID123');
    IF v_company_id = 'c1111111-1111-1111-1111-111111111111' THEN 
      INSERT INTO test_logs VALUES ('Redeem_Valid_Code', 'PASSED');
    ELSE INSERT INTO test_logs VALUES ('Redeem_Valid_Code', 'FAILED - Wrong ID'); END IF;
    
    -- same code again
    v_company_id := redeem_invite_code('VALID123');
    IF v_company_id IS NULL THEN 
      INSERT INTO test_logs VALUES ('Redeem_Used_Code', 'PASSED');
    ELSE INSERT INTO test_logs VALUES ('Redeem_Used_Code', 'FAILED'); END IF;
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_logs VALUES ('Redeem_Valid_Code', 'FAILED - ' || SQLERRM);
    INSERT INTO test_logs VALUES ('Redeem_Used_Code', 'FAILED - ' || SQLERRM);
  END;

  -- already assigned user
  SET LOCAL request.jwt.claims TO '{"sub":"e2222222-2222-2222-2222-222222222222","role":"authenticated"}';
  BEGIN
    v_company_id := redeem_invite_code('VALID123');
    INSERT INTO test_logs VALUES ('Redeem_Already_Assigned', 'FAILED - ALLOWED');
  EXCEPTION WHEN OTHERS THEN
    INSERT INTO test_logs VALUES ('Redeem_Already_Assigned', 'PASSED (EXCEPTION)');
  END;

  -- ==========================================
  -- 8. SUPERADMIN B TESTS (For positive control)
  -- ==========================================
  SET LOCAL request.jwt.claims TO '{"sub":"e4444444-4444-4444-4444-444444444444","role":"authenticated"}';
  
  IF EXISTS (SELECT 1 FROM tickets WHERE id = 'd1111111-1111-1111-1111-111111111111') THEN 
    UPDATE tickets SET status = 'closed' WHERE id = 'd1111111-1111-1111-1111-111111111111';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('B_Superadmin_Tickets', 'PASSED (precheck + 0 rows)');
    ELSE INSERT INTO test_logs VALUES ('B_Superadmin_Tickets', 'FAILED - ROW WRITTEN'); END IF;
  ELSE INSERT INTO test_logs VALUES ('B_Superadmin_Tickets', 'FAILED - CANNOT READ'); END IF;

  IF EXISTS (SELECT 1 FROM tasks WHERE id = 'b1111111-1111-1111-1111-111111111111') THEN 
    UPDATE tasks SET title = 'Changed' WHERE id = 'b1111111-1111-1111-1111-111111111111';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('B_Superadmin_Tasks', 'PASSED (precheck + 0 rows)');
    ELSE INSERT INTO test_logs VALUES ('B_Superadmin_Tasks', 'FAILED - ROW WRITTEN'); END IF;
  ELSE INSERT INTO test_logs VALUES ('B_Superadmin_Tasks', 'FAILED - CANNOT READ'); END IF;

  IF EXISTS (SELECT 1 FROM ticket_comments WHERE id = 'f1111111-1111-1111-1111-111111111111') THEN 
    UPDATE ticket_comments SET body = 'Changed' WHERE id = 'f1111111-1111-1111-1111-111111111111';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('B_Superadmin_TicketComments', 'PASSED (precheck + 0 rows)');
    ELSE INSERT INTO test_logs VALUES ('B_Superadmin_TicketComments', 'FAILED - ROW WRITTEN'); END IF;
  ELSE INSERT INTO test_logs VALUES ('B_Superadmin_TicketComments', 'FAILED - CANNOT READ'); END IF;

  IF EXISTS (SELECT 1 FROM employees WHERE id = 'e1111111-1111-1111-1111-111111111111') THEN 
    UPDATE employees SET full_name = 'Changed' WHERE id = 'e1111111-1111-1111-1111-111111111111';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('B_Superadmin_Employees', 'PASSED (precheck + 0 rows)');
    ELSE INSERT INTO test_logs VALUES ('B_Superadmin_Employees', 'FAILED - ROW WRITTEN'); END IF;
  ELSE INSERT INTO test_logs VALUES ('B_Superadmin_Employees', 'FAILED - CANNOT READ'); END IF;

  IF EXISTS (SELECT 1 FROM org_custom_roles WHERE id = 'ab111111-1111-1111-1111-111111111111') THEN 
    UPDATE org_custom_roles SET name = 'Changed' WHERE id = 'ab111111-1111-1111-1111-111111111111';
    GET DIAGNOSTICS v_rows = ROW_COUNT;
    IF v_rows = 0 THEN INSERT INTO test_logs VALUES ('B_Superadmin_OrgCustomRoles', 'PASSED (precheck + 0 rows)');
    ELSE INSERT INTO test_logs VALUES ('B_Superadmin_OrgCustomRoles', 'FAILED - ROW WRITTEN'); END IF;
  ELSE INSERT INTO test_logs VALUES ('B_Superadmin_OrgCustomRoles', 'FAILED - CANNOT READ'); END IF;

END $test_suite$;

SELECT * FROM test_logs ORDER BY test;

ROLLBACK;










