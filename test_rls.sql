BEGIN;

-- ============================================================
-- RLS TEST SUITE — test_logs pattern
-- Uses SET LOCAL request.jwt.claims to simulate authenticated
-- sessions. All data is rolled back at the end.
-- ============================================================

SET LOCAL role = postgres;

-- Seed data: drop FK constraints that reference auth.users to
-- allow inserting employees/tickets without real auth rows.
ALTER TABLE tickets DROP CONSTRAINT tickets_client_id_fkey;
ALTER TABLE ticket_comments DROP CONSTRAINT ticket_comments_author_id_fkey;

CREATE TEMP TABLE test_logs (test text, result text);
GRANT INSERT, SELECT ON test_logs TO anon, authenticated, public;

-- Insert company first (all other data depends on it)
INSERT INTO companies (id, name, slug) VALUES
  ('c1111111-1111-1111-1111-111111111111', 'Test Corp', 'test-corp');

-- Insert employees directly (bypasses handle_new_user trigger issues)
INSERT INTO employees (id, company_id, full_name, role) VALUES
  ('e1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Alice Admin',   'admin'),
  ('e2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'Bob Agent',     'sales_agent'),
  ('e3333333-3333-3333-3333-333333333333', 'c1111111-1111-1111-1111-111111111111', 'Charlie Server','server_admin'),
  ('e4444444-4444-4444-4444-444444444444', 'c1111111-1111-1111-1111-111111111111', 'Dave Super',   'superadmin');

INSERT INTO customers (id, company_id, email) VALUES
  ('c9999999-9999-9999-9999-999999999999', 'c1111111-1111-1111-1111-111111111111', 'client@test.com');

INSERT INTO leads (id, company_id, employee_id, first_name, phone) VALUES
  ('d1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'Own Lead',       '555-1234'),
  ('d2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Colleague Lead', '555-5678');

INSERT INTO tasks (id, company_id, assigned_to, created_by, title, due_date) VALUES
  ('f1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'e2222222-2222-2222-2222-222222222222', 'e2222222-2222-2222-2222-222222222222', 'Assigned Task',   '2030-01-01'),
  ('f2222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Unassigned Task', '2030-01-01');

INSERT INTO tickets (id, company_id, client_id, title, category) VALUES
  ('ee111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'c9999999-9999-9999-9999-999999999999', 'My Ticket',    'support'),
  ('ee222222-2222-2222-2222-222222222222', 'c1111111-1111-1111-1111-111111111111', 'c9999999-9999-9999-9999-999999999999', 'Other Ticket', 'support');

INSERT INTO ticket_comments (id, ticket_id, author_id, body, is_internal) VALUES
  (gen_random_uuid(), 'ee111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Public reply',  false),
  (gen_random_uuid(), 'ee111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Internal note', true);

INSERT INTO gateways (id, name) VALUES
  ('a1111111-1111-1111-1111-111111111111', 'Platform Gateway');

INSERT INTO virtual_numbers (id, company_id, number) VALUES
  ('b1111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', '555-0000');

INSERT INTO org_custom_roles (id, company_id, name) VALUES
  ('cc111111-1111-1111-1111-111111111111', 'c1111111-1111-1111-1111-111111111111', 'Custom Role 1');

-- Seed one audit_log row as postgres (bypasses RLS) so T05b has something to attempt to UPDATE
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, company_id)
  VALUES (gen_random_uuid(), 'e4444444-4444-4444-4444-444444444444', 'seed_event', 'test', '1', 'c1111111-1111-1111-1111-111111111111');

-- ============================================================
-- TEST 1 (Part A): anon cannot SELECT any company rows
-- ============================================================
SET LOCAL role = anon;
SET LOCAL request.jwt.claims TO '{"role":"anon"}';
INSERT INTO test_logs
  SELECT 'T01_A_anon_companies_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM companies) x;

-- ============================================================
-- TEST 2 (Part D): sales_agent can INSERT into audit_logs
-- ============================================================
SET LOCAL role = authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"e2222222-2222-2222-2222-222222222222","role":"authenticated"}';
DO $body$ BEGIN
  INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, company_id)
    VALUES (gen_random_uuid(), 'e2222222-2222-2222-2222-222222222222', 'test_event', 'lead', '1', 'c1111111-1111-1111-1111-111111111111');
  INSERT INTO test_logs VALUES ('T02_D_sales_agent_audit_insert', 'PASSED');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T02_D_sales_agent_audit_insert', 'FAILED - ' || SQLERRM);
END $body$;

-- ============================================================
-- TEST 3a (Part B): sales_agent CAN UPDATE their own lead
-- ============================================================
DO $body$
DECLARE v_rows int;
BEGIN
  UPDATE leads SET first_name = 'Updated Own' WHERE id = 'd1111111-1111-1111-1111-111111111111';
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 1 THEN
    INSERT INTO test_logs VALUES ('T03a_B_agent_update_own_lead', 'PASSED');
  ELSE
    INSERT INTO test_logs VALUES ('T03a_B_agent_update_own_lead', 'FAILED - expected 1 row, got ' || v_rows);
  END IF;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T03a_B_agent_update_own_lead', 'FAILED - ' || SQLERRM);
END $body$;

-- ============================================================
-- PRE-CHECK for T03b: confirm the colleague lead exists and IS
-- visible to admin (proving the row exists, not just filtered out)
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e1111111-1111-1111-1111-111111111111","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T03b_precheck_admin_sees_colleague_lead',
    'rows: ' || count(*) FROM (SELECT 1 FROM leads WHERE id = 'd2222222-2222-2222-2222-222222222222') x;

-- ============================================================
-- TEST 3b (Part B): sales_agent CANNOT UPDATE a colleague's lead
-- Uses GET DIAGNOSTICS — UPDATE silently returns 0 rows when
-- blocked by RLS (no exception thrown).
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e2222222-2222-2222-2222-222222222222","role":"authenticated"}';
DO $body$
DECLARE v_rows int;
BEGIN
  UPDATE leads SET first_name = 'Updated Other'
    WHERE id = 'd2222222-2222-2222-2222-222222222222';
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    INSERT INTO test_logs VALUES ('T03b_B_agent_update_other_lead',
      'CORRECTLY BLOCKED - 0 rows matched under RLS');
  ELSE
    INSERT INTO test_logs VALUES ('T03b_B_agent_update_other_lead',
      'FAILED - RLS DID NOT BLOCK THIS, ' || v_rows || ' row(s) written');
  END IF;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T03b_B_agent_update_other_lead',
    'CORRECTLY BLOCKED - ' || SQLERRM);
END $body$;

-- ============================================================
-- TEST 4a (Part C): sales_agent CANNOT SELECT employees roster
-- ============================================================
INSERT INTO test_logs
  SELECT 'T04a_C_agent_employees_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM employees WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- TEST 4b (Part C): admin CAN SELECT employees roster
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e1111111-1111-1111-1111-111111111111","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T04b_C_admin_employees_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM employees WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- TEST 4c (Part C): server_admin CAN SELECT employees roster
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e3333333-3333-3333-3333-333333333333","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T04c_C_server_admin_employees_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM employees WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- TEST 5a (Part D): superadmin CAN SELECT audit_logs
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e4444444-4444-4444-4444-444444444444","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T05a_D_superadmin_audit_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM audit_logs WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- PRE-CHECK for T05b: confirm superadmin can actually SEE the
-- seeded audit_log row (rules out a 0-row UPDATE from invisibility)
-- ============================================================
INSERT INTO test_logs
  SELECT 'T05b_precheck_superadmin_sees_audit_row',
    'rows: ' || count(*) FROM (SELECT 1 FROM audit_logs WHERE company_id = 'c1111111-1111-1111-1111-111111111111' AND action = 'seed_event') x;

-- ============================================================
-- TEST 5b (Part D): superadmin CANNOT UPDATE audit_logs
-- Uses GET DIAGNOSTICS — no UPDATE policy exists, so UPDATE
-- silently returns 0 rows (permissive model: no GRANT = no match).
-- ============================================================
DO $body$
DECLARE v_rows int;
BEGIN
  UPDATE audit_logs SET action = 'hacked'
    WHERE company_id = 'c1111111-1111-1111-1111-111111111111';
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 0 THEN
    INSERT INTO test_logs VALUES ('T05b_D_superadmin_audit_update',
      'CORRECTLY BLOCKED - 0 rows matched under RLS');
  ELSE
    INSERT INTO test_logs VALUES ('T05b_D_superadmin_audit_update',
      'FAILED - RLS DID NOT BLOCK THIS, ' || v_rows || ' row(s) written');
  END IF;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T05b_D_superadmin_audit_update',
    'CORRECTLY BLOCKED - ' || SQLERRM);
END $body$;

-- ============================================================
-- TEST 5c (Part D): admin audit_logs SELECT
-- (audit_logs_staff_select includes admin — expect rows > 0)
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e1111111-1111-1111-1111-111111111111","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T05c_D_admin_audit_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM audit_logs WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- TEST 6a (Part E): superadmin CAN SELECT client_metrics
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e4444444-4444-4444-4444-444444444444","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T06a_E_superadmin_client_metrics_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM client_metrics) x;

-- ============================================================
-- TEST 6b (Part E): server_admin CAN SELECT client_metrics
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e3333333-3333-3333-3333-333333333333","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T06b_E_server_admin_client_metrics_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM client_metrics) x;

-- ============================================================
-- TEST 6c (Part E): sales_agent CANNOT SELECT client_metrics
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e2222222-2222-2222-2222-222222222222","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T06c_E_agent_client_metrics_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM client_metrics) x;

-- ============================================================
-- TEST 7a (Part F + tasks_select): admin CAN insert task_feedback
-- (requires tasks_select EXISTS check to pass)
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e1111111-1111-1111-1111-111111111111","role":"authenticated"}';
DO $body$ BEGIN
  INSERT INTO task_feedback (id, task_id, author_id, message)
    VALUES (gen_random_uuid(), 'f1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', 'Great work');
  INSERT INTO test_logs VALUES ('T07a_F_admin_task_feedback_insert', 'PASSED');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T07a_F_admin_task_feedback_insert', 'FAILED - ' || SQLERRM);
END $body$;

-- ============================================================
-- TEST 7b (Part G): admin CAN insert invite_codes
-- ============================================================
DO $body$ BEGIN
  INSERT INTO invite_codes (id, company_id, code, created_by, expires_at)
    VALUES (gen_random_uuid(), 'c1111111-1111-1111-1111-111111111111', 'ADMINCODE', 'e1111111-1111-1111-1111-111111111111', '2030-01-01');
  INSERT INTO test_logs VALUES ('T07b_G_admin_invite_codes_insert', 'PASSED');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T07b_G_admin_invite_codes_insert', 'FAILED - ' || SQLERRM);
END $body$;

-- ============================================================
-- TEST 7c (Part G): sales_agent CANNOT insert invite_codes
-- (INSERT violations throw an exception — EXCEPTION pattern valid)
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e2222222-2222-2222-2222-222222222222","role":"authenticated"}';
DO $body$ BEGIN
  INSERT INTO invite_codes (id, company_id, code, created_by, expires_at)
    VALUES (gen_random_uuid(), 'c1111111-1111-1111-1111-111111111111', 'AGENTCODE', 'e2222222-2222-2222-2222-222222222222', '2030-01-01');
  INSERT INTO test_logs VALUES ('T07c_G_agent_invite_codes_insert', 'FAILED - RLS DID NOT BLOCK THIS, ROW WAS WRITTEN');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T07c_G_agent_invite_codes_insert', 'CORRECTLY BLOCKED - ' || SQLERRM);
END $body$;

-- ============================================================
-- TEST 7d (Part G): server_admin CANNOT insert invite_codes
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e3333333-3333-3333-3333-333333333333","role":"authenticated"}';
DO $body$ BEGIN
  INSERT INTO invite_codes (id, company_id, code, created_by, expires_at)
    VALUES (gen_random_uuid(), 'c1111111-1111-1111-1111-111111111111', 'SERVERCODE', 'e3333333-3333-3333-3333-333333333333', '2030-01-01');
  INSERT INTO test_logs VALUES ('T07d_G_server_admin_invite_codes_insert', 'FAILED - RLS DID NOT BLOCK THIS, ROW WAS WRITTEN');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T07d_G_server_admin_invite_codes_insert', 'CORRECTLY BLOCKED - ' || SQLERRM);
END $body$;

-- ============================================================
-- TEST 7e (Part H): admin CAN insert products
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e1111111-1111-1111-1111-111111111111","role":"authenticated"}';
DO $body$ BEGIN
  INSERT INTO products (id, created_at, company_id)
    VALUES (999999, now(), 'c1111111-1111-1111-1111-111111111111');
  INSERT INTO test_logs VALUES ('T07e_H_admin_products_insert', 'PASSED');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T07e_H_admin_products_insert', 'FAILED - ' || SQLERRM);
END $body$;

-- ============================================================
-- TEST 7f (Part H): sales_agent CANNOT insert products
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e2222222-2222-2222-2222-222222222222","role":"authenticated"}';
DO $body$ BEGIN
  INSERT INTO products (id, created_at, company_id)
    VALUES (999998, now(), 'c1111111-1111-1111-1111-111111111111');
  INSERT INTO test_logs VALUES ('T07f_H_agent_products_insert', 'FAILED - RLS DID NOT BLOCK THIS, ROW WAS WRITTEN');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T07f_H_agent_products_insert', 'CORRECTLY BLOCKED - ' || SQLERRM);
END $body$;

-- ============================================================
-- TEST 8a (Part K): client CAN SELECT their own tickets
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"c9999999-9999-9999-9999-999999999999","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T08a_K_client_tickets_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM tickets WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- TEST 8b (Part K): client sees public comments but NOT internal
-- ============================================================
INSERT INTO test_logs
  SELECT 'T08b_K_client_comments_public_only',
    'public: ' || coalesce((SELECT count(*)::text FROM ticket_comments tc
      JOIN tickets t ON t.id = tc.ticket_id
      WHERE t.client_id = 'c9999999-9999-9999-9999-999999999999'
        AND tc.is_internal = false), '0')
    || ', internal_visible: ' || coalesce((SELECT count(*)::text FROM ticket_comments tc
      JOIN tickets t ON t.id = tc.ticket_id
      WHERE t.client_id = 'c9999999-9999-9999-9999-999999999999'
        AND tc.is_internal = true), '0');

-- ============================================================
-- TEST 9a (Part I): server_admin CAN SELECT virtual_numbers
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e3333333-3333-3333-3333-333333333333","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T09a_I_server_admin_virtual_numbers_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM virtual_numbers WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- TEST 9b (Part I): server_admin CAN SELECT gateways
-- ============================================================
INSERT INTO test_logs
  SELECT 'T09b_I_server_admin_gateways_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM gateways) x;

-- ============================================================
-- TEST 9c (Part J): server_admin CAN SELECT org_custom_roles
-- ============================================================
INSERT INTO test_logs
  SELECT 'T09c_J_server_admin_org_custom_roles_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM org_custom_roles WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- TEST 9d (Part J): server_admin CAN UPDATE org_custom_roles
-- Positive test — EXCEPTION pattern is correct here.
-- ============================================================
DO $body$
DECLARE v_rows int;
BEGIN
  UPDATE org_custom_roles SET name = 'Updated Name'
    WHERE id = 'cc111111-1111-1111-1111-111111111111';
  GET DIAGNOSTICS v_rows = ROW_COUNT;
  IF v_rows = 1 THEN
    INSERT INTO test_logs VALUES ('T09d_J_server_admin_org_custom_roles_update', 'PASSED');
  ELSE
    INSERT INTO test_logs VALUES ('T09d_J_server_admin_org_custom_roles_update', 'FAILED - expected 1 row, got ' || v_rows);
  END IF;
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T09d_J_server_admin_org_custom_roles_update', 'FAILED - ' || SQLERRM);
END $body$;

-- ============================================================
-- PRE-CHECK for T09e: confirm the org_custom_role row IS visible
-- to server_admin (so a blocked INSERT can't be confused with
-- a missing row).
-- ============================================================
INSERT INTO test_logs
  SELECT 'T09e_precheck_server_admin_sees_org_custom_role',
    'rows: ' || count(*) FROM (SELECT 1 FROM org_custom_roles WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- TEST 9e (Part J): server_admin CANNOT INSERT org_custom_roles
-- (no INSERT policy defined — INSERT violations throw an exception,
-- so EXCEPTION pattern is the correct methodology here)
-- ============================================================
DO $body$ BEGIN
  INSERT INTO org_custom_roles (id, company_id, name)
    VALUES (gen_random_uuid(), 'c1111111-1111-1111-1111-111111111111', 'New Role');
  INSERT INTO test_logs VALUES ('T09e_J_server_admin_org_custom_roles_insert', 'FAILED - RLS DID NOT BLOCK THIS, ROW WAS WRITTEN');
EXCEPTION WHEN OTHERS THEN
  INSERT INTO test_logs VALUES ('T09e_J_server_admin_org_custom_roles_insert', 'CORRECTLY BLOCKED - ' || SQLERRM);
END $body$;

-- ============================================================
-- TEST 10a (tasks_select): sales_agent CAN SELECT their assigned tasks
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e2222222-2222-2222-2222-222222222222","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T10a_tasks_agent_assigned_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM tasks WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- TEST 10b (tasks_select): admin CAN SELECT all company tasks
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e1111111-1111-1111-1111-111111111111","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T10b_tasks_admin_all_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM tasks WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- TEST 10c (tasks_server_admin_dev_select): server_admin CAN SELECT all company tasks
-- ============================================================
SET LOCAL request.jwt.claims TO '{"sub":"e3333333-3333-3333-3333-333333333333","role":"authenticated"}';
INSERT INTO test_logs
  SELECT 'T10c_tasks_server_admin_select',
    'rows: ' || count(*) FROM (SELECT 1 FROM tasks WHERE company_id = 'c1111111-1111-1111-1111-111111111111') x;

-- ============================================================
-- RESULTS
-- ============================================================
SELECT * FROM test_logs ORDER BY test;

ROLLBACK;
