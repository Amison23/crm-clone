-- ========================================================
-- Migration: Case-Insensitive Unique Email Constraint
-- Enforces global case-insensitive uniqueness on employees email_address
-- ========================================================

-- Ensure any existing emails are cleaned up / trimmed in lower case
UPDATE public.employees 
SET email_address = LOWER(TRIM(email_address))
WHERE email_address IS NOT NULL;

-- Create case-insensitive unique index on employees(LOWER(email_address))
CREATE UNIQUE INDEX IF NOT EXISTS employees_email_address_lower_idx 
ON public.employees (LOWER(TRIM(email_address)));
