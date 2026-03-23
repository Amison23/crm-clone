-- ==============================
-- TICKETS
-- ==============================
CREATE TABLE tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid NOT NULL REFERENCES companies (id) ON DELETE CASCADE, -- company that owns the tickets/system
  client_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE RESTRICT, -- client who owns the ticket
  category text NOT NULL, -- category of the ticket
  title text NOT NULL, -- title of the ticket
  description text, -- description of the ticket
  -- all tickets once initiated are default to open, state changes based on the ticket being responded to by respective parties
  status text DEFAULT 'open' CHECK (
    status IN (
      'open',
      'closed',
      'in_progress',
      'on_hold',
      'resolved'
    )
  ),
  assigned_to uuid REFERENCES auth.users (id) ON DELETE SET NULL, -- staff memeber responsible for the ticket at a given time
  priority text DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  resolved_at timestamptz DEFAULT NULL -- timestamp of when the ticket was resolved and confirmed by the client
);
