-- ======================================================================
-- Email Integration Schema
-- ======================================================================

-- 1. Enable pgcrypto for credential encryption
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Table: connected_email_accounts
CREATE TABLE IF NOT EXISTS connected_email_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    provider TEXT NOT NULL CHECK (provider IN ('google', 'microsoft')),
    provider_account_id TEXT NOT NULL,
    email_address TEXT NOT NULL,
    display_name TEXT,
    access_token BYTEA,
    refresh_token BYTEA,
    token_expires_at TIMESTAMPTZ,
    scopes TEXT,
    sync_status TEXT DEFAULT 'pending' CHECK (sync_status IN ('pending', 'syncing', 'error', 'active', 'disconnected')),
    sync_cursor TEXT,
    last_successful_sync TIMESTAMPTZ,
    last_sync_error TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(company_id, provider_account_id)
);

CREATE INDEX idx_connected_email_accounts_employee_id ON connected_email_accounts(employee_id);
CREATE INDEX idx_connected_email_accounts_company_id ON connected_email_accounts(company_id);

-- 3. Table: email_messages
CREATE TABLE IF NOT EXISTS email_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    connected_account_id UUID NOT NULL REFERENCES connected_email_accounts(id) ON DELETE CASCADE,
    provider_message_id TEXT NOT NULL,
    provider_thread_id TEXT,
    internet_message_id TEXT,
    direction TEXT NOT NULL CHECK (direction IN ('inbound', 'outbound')),
    subject TEXT,
    body_preview TEXT,
    sent_at TIMESTAMPTZ,
    received_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(connected_account_id, provider_message_id)
);

CREATE INDEX idx_email_messages_company_id_sent_at ON email_messages(company_id, sent_at DESC);
CREATE INDEX idx_email_messages_provider_thread_id ON email_messages(provider_thread_id);

-- 4. Table: email_participants (Normalized)
CREATE TABLE IF NOT EXISTS email_participants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email_message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    participant_type TEXT NOT NULL CHECK (participant_type IN ('from', 'to', 'cc', 'bcc')),
    email_address TEXT NOT NULL,
    display_name TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_email_participants_message_id ON email_participants(email_message_id);
CREATE INDEX idx_email_participants_email_address ON email_participants(company_id, email_address);

-- 5. Table: email_crm_relations
CREATE TABLE IF NOT EXISTS email_crm_relations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
    email_message_id UUID NOT NULL REFERENCES email_messages(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('lead', 'employee', 'company', 'task', 'ticket')),
    entity_id UUID NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(email_message_id, entity_type, entity_id)
);

CREATE INDEX idx_email_crm_relations_entity ON email_crm_relations(company_id, entity_type, entity_id);

-- ======================================================================
-- Row-Level Security
-- ======================================================================
ALTER TABLE connected_email_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_crm_relations ENABLE ROW LEVEL SECURITY;

-- ──────────────────────────────────────────────
-- CONNECTED EMAIL ACCOUNTS
-- Admins/Superadmins can view all in their company.
-- Regular users can only view their own.
-- ──────────────────────────────────────────────
CREATE POLICY "connected_accounts_select" ON connected_email_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = connected_email_accounts.company_id
      AND (
        employees.id = connected_email_accounts.employee_id
        OR employees.role IN ('admin', 'superadmin')
      )
    )
  );

CREATE POLICY "connected_accounts_insert" ON connected_email_accounts
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = connected_email_accounts.company_id
      AND employees.id = connected_email_accounts.employee_id
    )
  );

CREATE POLICY "connected_accounts_update" ON connected_email_accounts
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = connected_email_accounts.company_id
      AND (
        employees.id = connected_email_accounts.employee_id
        OR employees.role IN ('admin', 'superadmin')
      )
    )
  );

CREATE POLICY "connected_accounts_delete" ON connected_email_accounts
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = connected_email_accounts.company_id
      AND (
        employees.id = connected_email_accounts.employee_id
        OR employees.role IN ('admin', 'superadmin')
      )
    )
  );

-- ──────────────────────────────────────────────
-- EMAIL MESSAGES
-- Shared across the company so agents can see emails linked to leads.
-- ──────────────────────────────────────────────
CREATE POLICY "email_messages_select_own_company" ON email_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_messages.company_id
    )
  );

CREATE POLICY "email_messages_insert_own_company" ON email_messages
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_messages.company_id
    )
  );

CREATE POLICY "email_messages_update_own_company" ON email_messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_messages.company_id
    )
  );

CREATE POLICY "email_messages_delete_own_company" ON email_messages
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_messages.company_id
    )
  );

-- ──────────────────────────────────────────────
-- EMAIL PARTICIPANTS
-- ──────────────────────────────────────────────
CREATE POLICY "email_participants_select_own_company" ON email_participants
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_participants.company_id
    )
  );

CREATE POLICY "email_participants_insert_own_company" ON email_participants
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_participants.company_id
    )
  );

CREATE POLICY "email_participants_update_own_company" ON email_participants
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_participants.company_id
    )
  );

CREATE POLICY "email_participants_delete_own_company" ON email_participants
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_participants.company_id
    )
  );

-- ──────────────────────────────────────────────
-- EMAIL CRM RELATIONS
-- ──────────────────────────────────────────────
CREATE POLICY "email_crm_relations_select_own_company" ON email_crm_relations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_crm_relations.company_id
    )
  );

CREATE POLICY "email_crm_relations_insert_own_company" ON email_crm_relations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_crm_relations.company_id
    )
  );

CREATE POLICY "email_crm_relations_update_own_company" ON email_crm_relations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_crm_relations.company_id
    )
  );

CREATE POLICY "email_crm_relations_delete_own_company" ON email_crm_relations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM employees
      WHERE employees.id = auth.uid()
      AND employees.company_id = email_crm_relations.company_id
    )
  );
