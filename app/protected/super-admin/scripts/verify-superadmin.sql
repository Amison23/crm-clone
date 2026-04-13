-- CRM Platform: RLS Verification Suite
-- This script tests the integrity of tenant isolation and role-based access control.

-- 1. Setup Test Environment
-- Create a dummy company and a dummy admin
DO $$
DECLARE
    v_company_a UUID := 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    v_company_b UUID := 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb';
    v_admin_a UUID := '11111111-1111-1111-1111-111111111111';
    v_superadmin UUID := '00000000-0000-0000-0000-000000000000';
BEGIN
    -- Ensure companies exist
    INSERT INTO public.companies (id, name) VALUES (v_company_a, 'Test Corp A'), (v_company_b, 'Test Corp B') ON CONFLICT DO NOTHING;
    
    -- Ensure employees exist
    INSERT INTO public.employees (id, full_name, email_address, role, company_id) 
    VALUES 
        (v_admin_a, 'Admin A', 'admin@corp-a.com', 'admin', v_company_a),
        (v_superadmin, 'Global Super', 'super@platform.com', 'superadmin', NULL)
    ON CONFLICT DO NOTHING;
END $$;

-- 2. Test: Admin Isolation (Company A cannot see Company B)
-- Simulate session for Admin A
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "11111111-1111-1111-1111-111111111111", "role": "authenticated"}';

-- Expectation: Should only return 1 row (Company A)
SELECT name FROM public.companies;

-- 3. Test: Auto-Assignment Trigger
-- Admin A inserts an employee without company_id
INSERT INTO public.employees (id, full_name, email_address, role)
VALUES ('22222222-2222-2222-2222-222222222222', 'Auto Managed User', 'auto@corp-a.com', 'sales_agent');

-- Expectation: company_id should be 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
SELECT full_name, company_id FROM public.employees WHERE id = '22222222-2222-2222-2222-222222222222';

-- 4. Test: SuperAdmin Global Access
-- Simulate session for SuperAdmin
RESET ROLE;
SET ROLE authenticated;
SET request.jwt.claims TO '{"sub": "00000000-0000-0000-0000-000000000000", "role": "authenticated"}';

-- Expectation: Should return BOTH companies
SELECT name FROM public.companies;

-- 5. Cleanup
-- (Optional: remove test data)
-- DELETE FROM public.employees WHERE id IN ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', '22222222-2222-2222-2222-222222222222');
-- DELETE FROM public.companies WHERE id IN ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb');
