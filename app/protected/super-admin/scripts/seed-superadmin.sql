-- SEED SUPER ADMIN
-- Run this script in the Supabase SQL Editor to create a functional Super Admin account.

DO $$
DECLARE
    v_user_id UUID := gen_random_uuid();
    v_email TEXT := 'admin@momentum-crm.com';
    v_password TEXT := 'Momentum2026!'; -- CHANGE THIS IN PRODUCTION
    v_encrypted_password TEXT := crypt(v_password, gen_salt('bf'));
BEGIN
    -- 1. Create entry in auth.users
    INSERT INTO auth.users (
        id, 
        instance_id, 
        email, 
        encrypted_password, 
        email_confirmed_at, 
        raw_app_meta_data, 
        raw_user_meta_data, 
        is_super_admin, 
        role
    )
    VALUES (
        v_user_id,
        '00000000-0000-0000-0000-000000000000',
        v_email,
        v_encrypted_password,
        NOW(),
        '{"provider":"email","providers":["email"]}',
        '{"full_name":"Momentum Super Admin"}',
        FALSE, -- This is the internal Supabase super admin, we keep it false.
        'authenticated'
    )
    ON CONFLICT (email) DO NOTHING;

    -- 2. Create entry in public.employees with 'superadmin' role
    -- Fetch the ID in case the user already existed in auth.users
    SELECT id INTO v_user_id FROM auth.users WHERE email = v_email;

    INSERT INTO public.employees (
        id, 
        full_name, 
        email_address, 
        role, 
        company_id
    )
    VALUES (
        v_user_id,
        'Momentum Super Admin',
        v_email,
        'superadmin',
        NULL -- Super Admins are not bound to a specific company
    )
    ON CONFLICT (id) DO UPDATE 
    SET role = 'superadmin', company_id = NULL;

    RAISE NOTICE 'Super Admin created with Email: % and Password: %', v_email, v_password;
END $$;
