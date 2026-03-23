-- ==============================
-- CLIENT METRICS TABLE
-- ==============================
CREATE TABLE client_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id uuid not null references companies(id) on delete restrict,
  server_state text check (server_state in ('online', 'offline', 'maintenance')) not null,
  cpu_usage float NOT NULL,
  memory_usage float NOT NULL,
  disk_usage float NOT NULL,
  network_usage float NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);