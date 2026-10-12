-- Migration 1: chat_schema

-- 1. Additions to existing tables
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'employees' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE public.employees ADD COLUMN is_active boolean NOT NULL DEFAULT true;
    END IF;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'employees_id_company_id_key') THEN
        ALTER TABLE public.employees ADD CONSTRAINT employees_id_company_id_key UNIQUE (id, company_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'leads_id_company_id_key') THEN
        ALTER TABLE public.leads ADD CONSTRAINT leads_id_company_id_key UNIQUE (id, company_id);
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'customers_id_company_id_key') THEN
        ALTER TABLE public.customers ADD CONSTRAINT customers_id_company_id_key UNIQUE (id, company_id);
    END IF;
END $$;

-- 2. New tables

-- chat_conversations
CREATE TABLE IF NOT EXISTS public.chat_conversations (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('direct', 'group', 'lead')),
    title text CHECK (char_length(title) <= 100),
    created_by uuid REFERENCES public.employees(id) ON DELETE SET NULL,
    lead_id uuid,
    customer_id uuid,
    direct_key text,
    last_message_at timestamptz,
    last_message_preview text,
    created_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT chat_conversations_id_company_id_key UNIQUE (id, company_id),
    CONSTRAINT chat_conversations_direct_key_check CHECK (
        (type = 'direct' AND direct_key IS NOT NULL) OR (type != 'direct' AND direct_key IS NULL)
    ),
    CONSTRAINT chat_conversations_lead_fk FOREIGN KEY (lead_id, company_id) REFERENCES public.leads(id, company_id),
    CONSTRAINT chat_conversations_customer_fk FOREIGN KEY (customer_id, company_id) REFERENCES public.customers(id, company_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS chat_conversations_direct_unique_idx ON public.chat_conversations (company_id, direct_key) WHERE type = 'direct';
CREATE UNIQUE INDEX IF NOT EXISTS chat_conversations_lead_unique_idx ON public.chat_conversations (lead_id) WHERE type = 'lead';

ALTER TABLE public.chat_conversations ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_conversations FROM anon;

-- chat_participants
CREATE TABLE IF NOT EXISTS public.chat_participants (
    id uuid PRIMARY KEY,
    conversation_id uuid NOT NULL,
    company_id uuid NOT NULL,
    employee_id uuid,
    lead_id uuid,
    customer_id uuid,
    role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    last_read_at timestamptz,
    muted boolean NOT NULL DEFAULT false,
    joined_at timestamptz NOT NULL DEFAULT now(),
    left_at timestamptz,
    CONSTRAINT chat_participants_identity_check CHECK (num_nonnulls(employee_id, lead_id, customer_id) = 1),
    CONSTRAINT chat_participants_conversation_fk FOREIGN KEY (conversation_id, company_id) REFERENCES public.chat_conversations(id, company_id) ON DELETE CASCADE,
    CONSTRAINT chat_participants_employee_fk FOREIGN KEY (employee_id, company_id) REFERENCES public.employees(id, company_id),
    CONSTRAINT chat_participants_lead_fk FOREIGN KEY (lead_id, company_id) REFERENCES public.leads(id, company_id),
    CONSTRAINT chat_participants_customer_fk FOREIGN KEY (customer_id, company_id) REFERENCES public.customers(id, company_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS chat_participants_employee_unique_idx ON public.chat_participants (conversation_id, employee_id) WHERE employee_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS chat_participants_lead_unique_idx ON public.chat_participants (conversation_id, lead_id) WHERE lead_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS chat_participants_customer_unique_idx ON public.chat_participants (conversation_id, customer_id) WHERE customer_id IS NOT NULL;

ALTER TABLE public.chat_participants ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_participants FROM anon;

-- chat_messages
CREATE TABLE IF NOT EXISTS public.chat_messages (
    id uuid PRIMARY KEY,
    conversation_id uuid NOT NULL,
    company_id uuid NOT NULL,
    sender_type text NOT NULL CHECK (sender_type IN ('employee','lead','customer','bot','system')),
    sender_employee_id uuid,
    sender_lead_id uuid,
    sender_customer_id uuid,
    body text NOT NULL CHECK (char_length(body) BETWEEN 1 AND 4000),
    kind text NOT NULL DEFAULT 'text' CHECK (kind IN ('text','system')),
    reply_to_id uuid REFERENCES public.chat_messages(id) ON DELETE SET NULL,
    client_msg_id uuid,
    channel text,
    external_id text,
    delivery_status text,
    created_at timestamptz NOT NULL DEFAULT now(),
    edited_at timestamptz,
    deleted_at timestamptz,
    CONSTRAINT chat_messages_sender_check CHECK (
        (sender_type = 'employee' AND sender_employee_id IS NOT NULL AND sender_lead_id IS NULL AND sender_customer_id IS NULL) OR
        (sender_type = 'lead' AND sender_lead_id IS NOT NULL AND sender_employee_id IS NULL AND sender_customer_id IS NULL) OR
        (sender_type = 'customer' AND sender_customer_id IS NOT NULL AND sender_employee_id IS NULL AND sender_lead_id IS NULL) OR
        (sender_type IN ('bot','system') AND sender_employee_id IS NULL AND sender_lead_id IS NULL AND sender_customer_id IS NULL)
    ),
    CONSTRAINT chat_messages_conversation_fk FOREIGN KEY (conversation_id, company_id) REFERENCES public.chat_conversations(id, company_id) ON DELETE CASCADE,
    CONSTRAINT chat_messages_employee_fk FOREIGN KEY (sender_employee_id, company_id) REFERENCES public.employees(id, company_id),
    CONSTRAINT chat_messages_lead_fk FOREIGN KEY (sender_lead_id, company_id) REFERENCES public.leads(id, company_id),
    CONSTRAINT chat_messages_customer_fk FOREIGN KEY (sender_customer_id, company_id) REFERENCES public.customers(id, company_id)
);

CREATE UNIQUE INDEX IF NOT EXISTS chat_messages_client_msg_id_idx ON public.chat_messages (conversation_id, client_msg_id) WHERE client_msg_id IS NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS chat_messages_external_id_idx ON public.chat_messages (channel, external_id) WHERE external_id IS NOT NULL;

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.chat_messages FROM anon;

-- Additional Indexes
CREATE INDEX IF NOT EXISTS chat_messages_conv_created_id_idx ON public.chat_messages (conversation_id, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS chat_participants_active_employee_idx ON public.chat_participants (employee_id) WHERE left_at IS NULL;
CREATE INDEX IF NOT EXISTS chat_participants_conversation_idx ON public.chat_participants (conversation_id);
CREATE INDEX IF NOT EXISTS chat_conversations_comp_last_msg_idx ON public.chat_conversations (company_id, last_message_at DESC NULLS LAST);

-- Indexing all foreign key columns to avoid advisor flags
CREATE INDEX IF NOT EXISTS chat_conversations_created_by_idx ON public.chat_conversations (created_by);
CREATE INDEX IF NOT EXISTS chat_conversations_lead_id_idx ON public.chat_conversations (lead_id);
CREATE INDEX IF NOT EXISTS chat_conversations_customer_id_idx ON public.chat_conversations (customer_id);

CREATE INDEX IF NOT EXISTS chat_participants_company_id_idx ON public.chat_participants (company_id);
CREATE INDEX IF NOT EXISTS chat_participants_employee_id_idx ON public.chat_participants (employee_id);
CREATE INDEX IF NOT EXISTS chat_participants_lead_id_idx ON public.chat_participants (lead_id);
CREATE INDEX IF NOT EXISTS chat_participants_customer_id_idx ON public.chat_participants (customer_id);

CREATE INDEX IF NOT EXISTS chat_messages_company_id_idx ON public.chat_messages (company_id);
CREATE INDEX IF NOT EXISTS chat_messages_conversation_id_idx ON public.chat_messages (conversation_id);
CREATE INDEX IF NOT EXISTS chat_messages_sender_employee_id_idx ON public.chat_messages (sender_employee_id);
CREATE INDEX IF NOT EXISTS chat_messages_sender_lead_id_idx ON public.chat_messages (sender_lead_id);
CREATE INDEX IF NOT EXISTS chat_messages_sender_customer_id_idx ON public.chat_messages (sender_customer_id);
CREATE INDEX IF NOT EXISTS chat_messages_reply_to_id_idx ON public.chat_messages (reply_to_id);

-- Trigger for chat_conversations last_message_at and last_message_preview
CREATE OR REPLACE FUNCTION public.trg_chat_messages_after_insert()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    UPDATE public.chat_conversations
    SET 
        last_message_at = NEW.created_at,
        last_message_preview = pg_catalog.left(NEW.body, 120)
    WHERE public.chat_conversations.id = NEW.conversation_id;
    
    RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.trg_chat_messages_after_insert() FROM public, anon, authenticated;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'chat_messages_after_insert') THEN
        CREATE TRIGGER chat_messages_after_insert
        AFTER INSERT ON public.chat_messages
        FOR EACH ROW
        EXECUTE FUNCTION public.trg_chat_messages_after_insert();
    END IF;
END $$;
