-- Migration 3: chat_hardening

-- 1. Defaults
ALTER TABLE public.chat_messages ALTER COLUMN id SET DEFAULT gen_random_uuid();
ALTER TABLE public.chat_participants ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- 2. Membership
CREATE OR REPLACE FUNCTION public.chat_is_member(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER STABLE
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.chat_participants cp
        JOIN public.employees e ON e.id = cp.employee_id
        WHERE cp.conversation_id = p_conversation_id
          AND cp.employee_id = (SELECT auth.uid())
          AND cp.left_at IS NULL
          AND e.is_active = true
          AND e.role IN ('admin', 'sales_agent', 'dev', 'server_admin')
    );
$$;
REVOKE ALL ON FUNCTION public.chat_is_member(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.chat_is_member(uuid) TO authenticated;


CREATE OR REPLACE FUNCTION public.chat_is_owner(p_conversation_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER STABLE
SET search_path = ''
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.chat_participants cp
        JOIN public.employees e ON e.id = cp.employee_id
        WHERE cp.conversation_id = p_conversation_id
          AND cp.employee_id = (SELECT auth.uid())
          AND cp.left_at IS NULL
          AND cp.role = 'owner'
          AND e.is_active = true
          AND e.role IN ('admin', 'sales_agent', 'dev', 'server_admin')
    );
$$;
REVOKE ALL ON FUNCTION public.chat_is_owner(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.chat_is_owner(uuid) TO authenticated;


-- 3. Privileges on the three chat_ tables
REVOKE ALL ON public.chat_conversations FROM authenticated;
REVOKE ALL ON public.chat_participants FROM authenticated;
REVOKE ALL ON public.chat_messages FROM authenticated;

GRANT SELECT ON public.chat_conversations TO authenticated;
GRANT UPDATE (title) ON public.chat_conversations TO authenticated;

GRANT SELECT ON public.chat_participants TO authenticated;

GRANT SELECT ON public.chat_messages TO authenticated;
GRANT INSERT (conversation_id, company_id, sender_type, sender_employee_id, body, client_msg_id) ON public.chat_messages TO authenticated;


-- 4. delete_chat_message
CREATE OR REPLACE FUNCTION public.delete_chat_message(p_message_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
    v_actor public.chat_actor_type;
    v_msg record;
    v_conv_last_msg_at timestamptz;
BEGIN
    v_actor := public.chat_actor();
    IF v_actor.employee_id IS NULL THEN
        RAISE EXCEPTION USING ERRCODE = '42501', MESSAGE = 'Not authorized';
    END IF;

    SELECT sender_type, sender_employee_id, company_id, conversation_id, created_at INTO v_msg
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

    -- Check if it was the latest message
    SELECT last_message_at INTO v_conv_last_msg_at
    FROM public.chat_conversations
    WHERE id = v_msg.conversation_id;

    IF v_conv_last_msg_at = v_msg.created_at THEN
        UPDATE public.chat_conversations
        SET last_message_preview = '[deleted]'
        WHERE id = v_msg.conversation_id;
    END IF;
END;
$$;
REVOKE ALL ON FUNCTION public.delete_chat_message(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.delete_chat_message(uuid) TO authenticated;


-- 5. list_my_conversations
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
