-- ==============================
-- PROFILES
-- ==============================
CREATE TABLE profiles (
  id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  company_id uuid REFERENCES companies (id) ON DELETE RESTRICT,
  full_name text,
  role text DEFAULT 'client' CHECK (
    role IN (
      'client',
      'super_admin',
      'company_admin',
      'sales_agent',
      'server_admin'
    )
  ),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
