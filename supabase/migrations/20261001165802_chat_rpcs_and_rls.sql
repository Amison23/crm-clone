-- Migration 2: chat_rpcs_and_rls

-- =====================================================================================
-- TYPES
-- =====================================================================================
DO $$ 
BEGIN
    CREATE TYPE public.chat_actor_type AS (
        employee_id uuid,
        company_id uuid,
        role text
    );
EXCEPTION WHEN duplicate_object THEN 
    NULL;
END $$;


-- =====================================================================================
-- HELPERS
-- =====================================================================================

-- chat_actor()
CREATE OR REPLACE FUNCTION public.chat_actor()
RETURNS public.chat_actor_type
LANGUAGE sql
SECURITY DEFINER STABLE
SET search_path = ''
AS $$
    SELECT id, company_id, role
    FROM public.employees
    WHERE id = (SELECT auth.uid())
      AND company_id IS NOT NULL
      AND is_active = true
      AND role IN ('admin', 'sales_agent', 'dev', 'server_admin');
$$;

REVOKE ALL ON FUNCTION public.chat_actor() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.chat_actor() TO authenticated;


-- chat_is_member()
CREATE OR REPLACE FUNCTION public.chat_is_member(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER STABLE
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.chat_participants
        WHERE conversation_id = p_conversation_id
          AND employee_id = (SELECT auth.uid())
          AND left_at IS NULL
    );
$$;

REVOKE ALL ON FUNCTION public.chat_is_member(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.chat_is_member(uuid) TO authenticated;


-- chat_can_read()
CREATE OR REPLACE FUNCTION public.chat_can_read(p_conversation_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER STABLE
SET search_path = ''
AS $$
DECLARE
    v_actor public.chat_actor_type;
    v_conv record;
    v_has_active_employee boolean;
BEGIN
    IF public.chat_is_member(p_conversation_id) THEN
        RETURN true;
    END IF;

    v_actor := public.chat_actor();
    IF v_actor.employee_id IS NULL THEN
        RETURN false;
    END IF;

    SELECT type, company_id INTO v_conv
    FROM public.chat_conversations
    WHERE id = p_conversation_id;

    IF NOT FOUND THEN
        RETURN false;
    END IF;

    IF v_conv.type = 'lead' AND v_conv.company_id = v_actor.company_id THEN
        IF v_actor.role = 'admin' THEN
            RETURN true;
        END IF;

        IF v_actor.role = 'sales_agent' THEN
            SELECT EXISTS (
                SELECT 1 FROM public.chat_participants
                WHERE conversation_id = p_conversation_id
                  AND employee_id IS NOT NULL
                  AND left_at IS NULL
            ) INTO v_has_active_employee;

            IF NOT v_has_active_employee THEN
                RETURN true;
            END IF;
        END IF;
    END IF;

    RETURN false;
END;
$$;

REVOKE ALL ON FUNCTION public.chat_can_read(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.chat_can_read(uuid) TO authenticated;


-- chat_is_owner()
CREATE OR REPLACE FUNCTION public.chat_is_owner(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER STABLE
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.chat_participants
        WHERE conversation_id = p_conversation_id
          AND employee_id = (SELECT auth.uid())
          AND left_at IS NULL
          AND role = 'owner'
    );
$$;

REVOKE ALL ON FUNCTION public.chat_is_owner(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.chat_is_owner(uuid) TO authenticated;


-- =====================================================================================
-- RPCs
-- =====================================================================================

-- chat_company_directory()
CREATE OR REPLACE FUNCTION public.chat_company_directory()
RETURNS TABLE (
    id uuid,
    full_name text,
    role text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor public.chat_actor_type;
BEGIN
    v_actor := public.chat_actor();
    IF v_actor.employee_id IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authorized';
    END IF;

    RETURN QUERY
    SELECT e.id, e.full_name, e.role
    FROM public.employees e
    WHERE e.company_id = v_actor.company_id
      AND e.id != v_actor.employee_id
      AND e.is_active = true
      AND e.role IN ('admin', 'sales_agent', 'dev', 'server_admin');
END;
$$;
REVOKE ALL ON FUNCTION public.chat_company_directory() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.chat_company_directory() TO authenticated;


-- get_or_create_direct_conversation()
CREATE OR REPLACE FUNCTION public.get_or_create_direct_conversation(p_other_employee_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor public.chat_actor_type;
    v_other_exists boolean;
    v_direct_key text;
    v_conv_id uuid;
BEGIN
    v_actor := public.chat_actor();
    IF v_actor.employee_id IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authorized';
    END IF;

    IF p_other_employee_id = v_actor.employee_id THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Cannot create direct conversation with self';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.employees
        WHERE id = p_other_employee_id
          AND company_id = v_actor.company_id
          AND is_active = true
          AND role IN ('admin', 'sales_agent', 'dev', 'server_admin')
    ) INTO v_other_exists;

    IF NOT v_other_exists THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Invalid target user';
    END IF;

    IF v_actor.employee_id < p_other_employee_id THEN
        v_direct_key := v_actor.employee_id::text || ':' || p_other_employee_id::text;
    ELSE
        v_direct_key := p_other_employee_id::text || ':' || v_actor.employee_id::text;
    END IF;

    INSERT INTO public.chat_conversations (company_id, type, created_by, direct_key)
    VALUES (v_actor.company_id, 'direct', v_actor.employee_id, v_direct_key)
    ON CONFLICT (company_id, direct_key) WHERE type = 'direct' DO NOTHING
    RETURNING id INTO v_conv_id;

    IF v_conv_id IS NULL THEN
        SELECT id INTO v_conv_id
        FROM public.chat_conversations
        WHERE company_id = v_actor.company_id AND direct_key = v_direct_key AND type = 'direct';
    END IF;

    INSERT INTO public.chat_participants (id, conversation_id, company_id, employee_id, role)
    VALUES (gen_random_uuid(), v_conv_id, v_actor.company_id, v_actor.employee_id, 'member')
    ON CONFLICT (conversation_id, employee_id) WHERE employee_id IS NOT NULL DO NOTHING;

    INSERT INTO public.chat_participants (id, conversation_id, company_id, employee_id, role)
    VALUES (gen_random_uuid(), v_conv_id, v_actor.company_id, p_other_employee_id, 'member')
    ON CONFLICT (conversation_id, employee_id) WHERE employee_id IS NOT NULL DO NOTHING;

    RETURN v_conv_id;
END;
$$;
REVOKE ALL ON FUNCTION public.get_or_create_direct_conversation(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.get_or_create_direct_conversation(uuid) TO authenticated;


-- create_group_conversation()
CREATE OR REPLACE FUNCTION public.create_group_conversation(p_title text, p_member_ids uuid[])
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor public.chat_actor_type;
    v_conv_id uuid;
    v_valid_count integer;
    v_all_members uuid[];
    v_member_id uuid;
BEGIN
    v_actor := public.chat_actor();
    IF v_actor.employee_id IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authorized';
    END IF;

    SELECT array_agg(DISTINCT m) INTO v_all_members
    FROM unnest(array_append(p_member_ids, v_actor.employee_id)) AS m;

    IF array_length(v_all_members, 1) < 2 OR array_length(v_all_members, 1) > 50 THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Group must have between 2 and 50 members';
    END IF;

    SELECT count(*) INTO v_valid_count
    FROM public.employees
    WHERE id = ANY(v_all_members)
      AND company_id = v_actor.company_id
      AND is_active = true
      AND role IN ('admin', 'sales_agent', 'dev', 'server_admin');

    IF v_valid_count != array_length(v_all_members, 1) THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'One or more members are invalid';
    END IF;

    INSERT INTO public.chat_conversations (company_id, type, title, created_by)
    VALUES (v_actor.company_id, 'group', p_title, v_actor.employee_id)
    RETURNING id INTO v_conv_id;

    FOREACH v_member_id IN ARRAY v_all_members LOOP
        INSERT INTO public.chat_participants (id, conversation_id, company_id, employee_id, role)
        VALUES (
            gen_random_uuid(),
            v_conv_id,
            v_actor.company_id,
            v_member_id,
            CASE WHEN v_member_id = v_actor.employee_id THEN 'owner' ELSE 'member' END
        );
    END LOOP;

    RETURN v_conv_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_group_conversation(text, uuid[]) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_group_conversation(text, uuid[]) TO authenticated;


-- mark_conversation_read()
CREATE OR REPLACE FUNCTION public.mark_conversation_read(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor public.chat_actor_type;
BEGIN
    v_actor := public.chat_actor();
    IF v_actor.employee_id IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authorized';
    END IF;

    UPDATE public.chat_participants
    SET last_read_at = now()
    WHERE conversation_id = p_conversation_id
      AND employee_id = v_actor.employee_id
      AND left_at IS NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.mark_conversation_read(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.mark_conversation_read(uuid) TO authenticated;


-- list_my_conversations()
CREATE OR REPLACE FUNCTION public.list_my_conversations()
RETURNS TABLE (
    id uuid,
    type text,
    title text,
    last_message_at timestamptz,
    last_message_preview text,
    unread_count bigint,
    counterpart_name text
)
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = ''
AS $$
BEGIN
    RETURN QUERY
    SELECT 
        c.id,
        c.type,
        c.title,
        c.last_message_at,
        c.last_message_preview,
        (
            SELECT count(*)
            FROM public.chat_messages m
            WHERE m.conversation_id = c.id
              AND (p.last_read_at IS NULL OR m.created_at > p.last_read_at)
              AND m.deleted_at IS NULL
              AND NOT (m.sender_type = 'employee' AND m.sender_employee_id = (SELECT auth.uid()))
        ) AS unread_count,
        (
            CASE WHEN c.type = 'direct' THEN
                (
                    SELECT e.full_name
                    FROM public.chat_participants cp
                    JOIN public.employees e ON e.id = cp.employee_id
                    WHERE cp.conversation_id = c.id
                      AND cp.employee_id != (SELECT auth.uid())
                    LIMIT 1
                )
            ELSE NULL END
        ) AS counterpart_name
    FROM public.chat_conversations c
    JOIN public.chat_participants p ON p.conversation_id = c.id
    WHERE p.employee_id = (SELECT auth.uid())
      AND p.left_at IS NULL
    ORDER BY c.last_message_at DESC NULLS LAST;
END;
$$;
REVOKE ALL ON FUNCTION public.list_my_conversations() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.list_my_conversations() TO authenticated;


-- create_lead_conversation()
CREATE OR REPLACE FUNCTION public.create_lead_conversation(p_lead_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor public.chat_actor_type;
    v_lead record;
    v_conv_id uuid;
BEGIN
    v_actor := public.chat_actor();
    IF v_actor.employee_id IS NULL OR v_actor.role NOT IN ('admin', 'sales_agent') THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authorized';
    END IF;

    SELECT company_id, employee_id INTO v_lead
    FROM public.leads
    WHERE id = p_lead_id AND company_id = v_actor.company_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Lead not found';
    END IF;

    INSERT INTO public.chat_conversations (company_id, type, created_by, lead_id)
    VALUES (v_actor.company_id, 'lead', v_actor.employee_id, p_lead_id)
    ON CONFLICT (lead_id) WHERE type = 'lead' DO NOTHING
    RETURNING id INTO v_conv_id;

    IF v_conv_id IS NULL THEN
        SELECT id INTO v_conv_id
        FROM public.chat_conversations
        WHERE lead_id = p_lead_id AND type = 'lead';
    END IF;

    -- Add lead participant
    INSERT INTO public.chat_participants (id, conversation_id, company_id, lead_id, role)
    VALUES (gen_random_uuid(), v_conv_id, v_actor.company_id, p_lead_id, 'member')
    ON CONFLICT (conversation_id, lead_id) WHERE lead_id IS NOT NULL DO NOTHING;

    -- If lead has employee assigned, add them as owner
    IF v_lead.employee_id IS NOT NULL THEN
        INSERT INTO public.chat_participants (id, conversation_id, company_id, employee_id, role)
        VALUES (gen_random_uuid(), v_conv_id, v_actor.company_id, v_lead.employee_id, 'owner')
        ON CONFLICT (conversation_id, employee_id) WHERE employee_id IS NOT NULL DO NOTHING;
    END IF;

    RETURN v_conv_id;
END;
$$;
REVOKE ALL ON FUNCTION public.create_lead_conversation(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.create_lead_conversation(uuid) TO authenticated;


-- claim_lead_conversation()
CREATE OR REPLACE FUNCTION public.claim_lead_conversation(p_conversation_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor public.chat_actor_type;
    v_conv record;
    v_has_owner boolean;
BEGIN
    v_actor := public.chat_actor();
    IF v_actor.employee_id IS NULL OR v_actor.role NOT IN ('admin', 'sales_agent') THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authorized';
    END IF;

    -- Lock conversation row
    SELECT id, company_id, type INTO v_conv
    FROM public.chat_conversations
    WHERE id = p_conversation_id FOR UPDATE;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Conversation not found';
    END IF;

    IF v_conv.type != 'lead' OR v_conv.company_id != v_actor.company_id THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Invalid conversation';
    END IF;

    SELECT EXISTS (
        SELECT 1 FROM public.chat_participants
        WHERE conversation_id = p_conversation_id
          AND employee_id IS NOT NULL
          AND role = 'owner'
          AND left_at IS NULL
    ) INTO v_has_owner;

    IF v_has_owner THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Conversation already claimed';
    END IF;

    INSERT INTO public.chat_participants (id, conversation_id, company_id, employee_id, role)
    VALUES (gen_random_uuid(), p_conversation_id, v_actor.company_id, v_actor.employee_id, 'owner')
    ON CONFLICT (conversation_id, employee_id) WHERE employee_id IS NOT NULL 
    DO UPDATE SET role = 'owner', left_at = NULL;
END;
$$;
REVOKE ALL ON FUNCTION public.claim_lead_conversation(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.claim_lead_conversation(uuid) TO authenticated;


-- delete_chat_message()
CREATE OR REPLACE FUNCTION public.delete_chat_message(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor public.chat_actor_type;
    v_msg record;
BEGIN
    v_actor := public.chat_actor();
    IF v_actor.employee_id IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authorized';
    END IF;

    SELECT sender_type, sender_employee_id, company_id INTO v_msg
    FROM public.chat_messages
    WHERE id = p_message_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Message not found';
    END IF;

    IF v_msg.company_id != v_actor.company_id OR v_msg.sender_type != 'employee' OR v_msg.sender_employee_id != v_actor.employee_id THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authorized to delete this message';
    END IF;

    UPDATE public.chat_messages
    SET deleted_at = now(),
        body = '[deleted]'
    WHERE id = p_message_id;
END;
$$;
REVOKE ALL ON FUNCTION public.delete_chat_message(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.delete_chat_message(uuid) TO authenticated;


-- =====================================================================================
-- POLICIES
-- =====================================================================================

DO $$
BEGIN
    DROP POLICY IF EXISTS chat_conversations_select_policy ON public.chat_conversations;
    DROP POLICY IF EXISTS chat_conversations_update_policy ON public.chat_conversations;
    DROP POLICY IF EXISTS chat_participants_select_policy ON public.chat_participants;
    DROP POLICY IF EXISTS chat_messages_select_policy ON public.chat_messages;
    DROP POLICY IF EXISTS chat_messages_insert_policy ON public.chat_messages;
END $$;

-- chat_conversations: SELECT, UPDATE
CREATE POLICY chat_conversations_select_policy ON public.chat_conversations
FOR SELECT TO authenticated
USING (public.chat_can_read(id));

CREATE POLICY chat_conversations_update_policy ON public.chat_conversations
FOR UPDATE TO authenticated
USING (type = 'group' AND public.chat_is_owner(id))
WITH CHECK (type = 'group' AND public.chat_is_owner(id));

-- Limit authenticated to only UPDATE title if possible
REVOKE UPDATE ON public.chat_conversations FROM authenticated;
GRANT UPDATE (title) ON public.chat_conversations TO authenticated;


-- chat_participants: SELECT
CREATE POLICY chat_participants_select_policy ON public.chat_participants
FOR SELECT TO authenticated
USING (public.chat_can_read(conversation_id));


-- chat_messages: SELECT, INSERT
CREATE POLICY chat_messages_select_policy ON public.chat_messages
FOR SELECT TO authenticated
USING (public.chat_can_read(conversation_id));

CREATE POLICY chat_messages_insert_policy ON public.chat_messages
FOR INSERT TO authenticated
WITH CHECK (
    sender_type = 'employee' AND
    sender_employee_id = (SELECT auth.uid()) AND
    public.chat_is_member(conversation_id) AND
    kind = 'text' AND
    channel IS NULL AND
    external_id IS NULL AND
    delivery_status IS NULL
);
