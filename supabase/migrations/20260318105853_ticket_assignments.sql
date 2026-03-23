-- ==============================
-- TICKET ASSIGNMENTS
-- ==============================
CREATE TABLE ticket_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets (id) ON DELETE CASCADE,
  assigned_to uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  assigned_by uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT,
  created_at timestamptz DEFAULT now() NOT NULL
);
