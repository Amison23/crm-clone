-- ==============================
-- CHAT MESSAGES
-- ==============================
CREATE TABLE chat_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid REFERENCES tickets (id),
  company_id uuid NOT NULL REFERENCES companies (id) ON DELETE CASCADE,
  author_id uuid NOT NULL REFERENCES auth.users (id),
  body text NOT NULL,
  is_team_message boolean DEFAULT FALSE, -- true if message is from the team, false if message is from the client
  created_at timestamptz DEFAULT now()
);

-- function to ensure that if is_team_message is `true`, then, ticket_id can be null??
