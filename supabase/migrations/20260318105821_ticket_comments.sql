-- ==============================
-- TICKET COMMENTS
-- ==============================
CREATE TABLE ticket_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES tickets (id),
  author_id uuid NOT NULL REFERENCES auth.users (id),
  body text NOT NULL,
  is_internal boolean DEFAULT FALSE, -- true if comment is internal, false if comment is public which allows for community responses/ai chat box responses
  created_at timestamptz DEFAULT now()
);
