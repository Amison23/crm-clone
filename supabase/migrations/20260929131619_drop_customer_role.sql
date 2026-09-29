-- Migration: drop_customer_role
-- Remove 'customer' as a valid role value. The 20260817000000_rbac_expansion
-- migration already ran: UPDATE employees SET role = 'client' WHERE role = 'customer'.
-- Zero live rows hold 'customer'. This migration drops it from the CHECK constraint
-- and also updates any remaining rows as a safety net.

BEGIN;

-- Safety net: migrate any straggler rows (should be 0)
UPDATE employees SET role = 'client' WHERE role = 'customer';

-- Drop the old constraint and recreate it without 'customer'
ALTER TABLE employees DROP CONSTRAINT employees_role_check;

ALTER TABLE employees ADD CONSTRAINT employees_role_check
  CHECK (role IN ('client', 'superadmin', 'admin', 'sales_agent', 'server_admin', 'dev', 'unassigned'));

COMMIT;
