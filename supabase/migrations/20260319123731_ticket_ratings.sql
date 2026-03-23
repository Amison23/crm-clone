-- ==============================
-- TICKET RATINGS TABLE
-- ==============================
CREATE TABLE ticket_ratings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  rating int NOT NULL CHECK (rating >= 1 AND rating <= 5),
  comments text,
  created_at timestamp with time zone DEFAULT now()
);