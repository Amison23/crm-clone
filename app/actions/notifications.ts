"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";

export interface SystemNotification {
  id: string;
  icon: string;
  color: string;
  bg: string;
  title: string;
  body: string;
  time: string;
  link?: string;
  unread?: boolean;
}

export async function getNotifications(): Promise<{
  success: boolean;
  notifications: SystemNotification[];
  error?: string;
}> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return { success: false, notifications: [], error: "Unauthorized" };
    }

    const admin = createAdminClient();

    // 1. Fetch current employee's role and company
    const { data: employee } = await admin
      .from("employees")
      .select("id, role, company_id, full_name")
      .eq("id", user.id)
      .maybeSingle();

    const companyId = employee?.company_id;
    const role = employee?.role || "sales_agent";
    const isAdmin = ["admin", "superadmin", "server_admin"].includes(role);

    const items: SystemNotification[] = [];

    // 2. Fetch ticket assignments (either assigned to me, or if admin/superadmin, all recent assignments in company)
    let assignQuery = admin
      .from("ticket_assignments")
      .select("id, ticket_id, assigned_to, assigned_by, created_at")
      .order("created_at", { ascending: false })
      .limit(10);

    if (!isAdmin) {
      assignQuery = assignQuery.eq("assigned_to", user.id);
    }

    const { data: assignments } = await assignQuery;

    // Collect ticket IDs to fetch titles
    const ticketIdsToFetch = new Set<string>();
    (assignments ?? []).forEach((a) => {
      if (a.ticket_id) ticketIdsToFetch.add(a.ticket_id);
    });

    // 3. Fetch recent tickets assigned to me or relevant status changes
    let ticketsQuery = admin
      .from("tickets")
      .select("id, title, status, priority, updated_at, resolved_at, created_at, assigned_to, client_id, company_id")
      .order("updated_at", { ascending: false })
      .limit(15);

    if (companyId && role !== "superadmin") {
      ticketsQuery = ticketsQuery.eq("company_id", companyId);
    }
    if (!isAdmin) {
      ticketsQuery = ticketsQuery.or(`assigned_to.eq.${user.id},client_id.eq.${user.id}`);
    }

    const { data: recentTickets } = await ticketsQuery;
    (recentTickets ?? []).forEach((t) => ticketIdsToFetch.add(t.id));

    // 4. Fetch recent comments / follow-ups
    let commentsQuery = admin
      .from("ticket_comments")
      .select("id, ticket_id, author_id, body, is_internal, created_at")
      .order("created_at", { ascending: false })
      .limit(15);

    const { data: recentComments } = await commentsQuery;

    // Filter comments: if not admin, only comments on tickets user is involved with or follow-ups
    const relevantComments = (recentComments ?? []).filter((c) => {
      // Don't notify self for own comments
      if (c.author_id === user.id) return false;
      if (isAdmin) return true;
      return ticketIdsToFetch.has(c.ticket_id);
    });

    relevantComments.forEach((c) => ticketIdsToFetch.add(c.ticket_id));

    // Fetch details for all relevant tickets
    const ticketMap = new Map<string, { id: string; title: string; status: string }>();
    if (ticketIdsToFetch.size > 0) {
      const { data: ticketDetails } = await admin
        .from("tickets")
        .select("id, title, status")
        .in("id", Array.from(ticketIdsToFetch));

      (ticketDetails ?? []).forEach((t) => {
        ticketMap.set(t.id, t);
      });
    }

    // A. Add Assignment notifications
    (assignments ?? []).forEach((a) => {
      const ticket = ticketMap.get(a.ticket_id);
      const isAssignedToMe = a.assigned_to === user.id;
      const displayCode = a.ticket_id.slice(0, 8).toUpperCase();
      
      items.push({
        id: `assign-${a.id}`,
        icon: "confirmation_number",
        color: "text-indigo-500",
        bg: "bg-indigo-50 dark:bg-indigo-900/30",
        title: isAssignedToMe ? "Ticket Assigned to You" : "Ticket Assigned",
        body: ticket?.title
          ? `[#${displayCode}] ${ticket.title}`
          : `Ticket #${displayCode} was assigned`,
        time: a.created_at,
        link: "/protected/tickets",
        unread: true,
      });
    });

    // B. Add Follow-up & Comment notifications
    relevantComments.forEach((c) => {
      const isFollowUp = c.body?.startsWith("🔔 Follow-up");
      const ticket = ticketMap.get(c.ticket_id);
      const displayCode = c.ticket_id?.slice(0, 8).toUpperCase();

      if (isFollowUp) {
        items.push({
          id: `comment-${c.id}`,
          icon: "notifications_active",
          color: "text-amber-500",
          bg: "bg-amber-50 dark:bg-amber-900/30",
          title: "Follow-up Alert",
          body: ticket?.title
            ? `Follow-up requested on #${displayCode}: ${ticket.title}`
            : c.body,
          time: c.created_at,
          link: "/protected/tickets",
          unread: true,
        });
      } else {
        items.push({
          id: `comment-${c.id}`,
          icon: c.is_internal ? "lock" : "chat_bubble",
          color: c.is_internal ? "text-violet-500" : "text-sky-500",
          bg: c.is_internal ? "bg-violet-50 dark:bg-violet-900/30" : "bg-sky-50 dark:bg-sky-900/30",
          title: c.is_internal ? "Internal Note Added" : "New Ticket Comment",
          body: ticket?.title
            ? `Comment on #${displayCode}: ${c.body?.slice(0, 70)}...`
            : `${c.body?.slice(0, 80)}...`,
          time: c.created_at,
          link: "/protected/tickets",
          unread: false,
        });
      }
    });

    // C. Add Resolved status notifications
    (recentTickets ?? [])
      .filter((t) => t.status === "resolved")
      .forEach((t) => {
        const displayCode = t.id.slice(0, 8).toUpperCase();
        items.push({
          id: `resolved-${t.id}`,
          icon: "check_circle",
          color: "text-emerald-500",
          bg: "bg-emerald-50 dark:bg-emerald-900/30",
          title: "Ticket Resolved",
          body: `Ticket #${displayCode} (${t.title}) was resolved.`,
          time: t.resolved_at || t.updated_at,
          link: "/protected/tickets",
          unread: false,
        });
      });

    // Deduplicate by ID and sort newest first
    const seen = new Set<string>();
    const unique = items.filter((item) => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

    unique.sort(
      (a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()
    );

    return {
      success: true,
      notifications: unique.slice(0, 10),
    };
  } catch (err: any) {
    console.error("[getNotifications] Error fetching notifications:", err);
    return {
      success: false,
      notifications: [],
      error: err.message || "Failed to load notifications",
    };
  }
}
