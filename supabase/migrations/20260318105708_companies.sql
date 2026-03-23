-- ==============================
-- COMPANIES
-- ==============================
CREATE TABLE companies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  logo text,
  pricing_tier text DEFAULT 'free' CHECK (
    pricing_tier IN ('free', 'starter', 'pro', 'enterprise')
  ), -- just a placeholder for now, will be updated later with relevant info and data
  is_active boolean DEFAULT TRUE, -- to allow for soft deletes
  phone text,
  email text,
  address text,
  website text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- function to ensure that if is_active is `false`, then, agent is prompted to ask if they are good, or an email is sent to check if they would like to renew contracts etc
-- RLS policies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- policies
-- check if profile created has a company_id, if not, prompt to create one
CREATE POLICY "Profiles can only view their own company" ON companies FOR
SELECT
  USING (
    id = (
      SELECT
        company_id
      FROM
        profiles
      WHERE
        id = auth.uid ()
    )
  );
