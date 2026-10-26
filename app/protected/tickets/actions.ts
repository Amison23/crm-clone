"use server";

import { createClient, createAdminClient } from "@/lib/supabase/server";
import { sendNotificationEmail } from "@/lib/notifications/email";
import { revalidatePath } from "next/cache";

export interface FollowUpResult {
  success: boolean;
  notifiedName?: string;
  notifiedRole?: string;
  error?: string;
}

/**
 * Triggers a follow-up notification for a ticket.
 * If the ticket is assigned to an agent, notifies that agent.
 * If the ticket is unassigned, notifies the server admin (or admin) of the company so they can assign it.
 * Logs the follow-up event into ticket_comments for an auditable history.
 */
export async function requestTicketFollowUp(ticketId: string): Promise<FollowUpResult> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const admin = createAdminClient();

    // 1. Fetch current requester details
    const { data: requester } = await admin
      .from("employees")
      .select("id, full_name, email_address, role, company_id")
      .eq("id", user.id)
      .maybeSingle();

    const requesterName =
      requester?.full_name || requester?.email_address || user.email || "A team member";

    // 2. Fetch the ticket
    const { data: ticket, error: ticketErr } = await admin
      .from("tickets")
      .select("id, title, status, priority, assigned_to, company_id, client_id, ticket_type")
      .eq("id", ticketId)
      .single();

    if (ticketErr || !ticket) {
      return { success: false, error: "Ticket not found" };
    }

    const ticketDisplayId = `#${ticket.id.slice(0, 8).toUpperCase()}`;

    // 3. Determine recipient:
    // If assigned: notify the assigned employee
    // If unassigned: notify the server_admin (or admin) of the company
    let targetEmployee: {
      id: string;
      full_name: string | null;
      email_address: string;
      role: string;
    } | null = null;

    if (ticket.assigned_to) {
      const { data: assignedEmp } = await admin
        .from("employees")
        .select("id, full_name, email_address, role")
        .eq("id", ticket.assigned_to)
        .maybeSingle();

      if (assignedEmp?.email_address) {
        targetEmployee = assignedEmp;
      }
    }

    // If still no recipient (unassigned or assignee missing email), fallback to server_admin or admin
    if (!targetEmployee) {
      const { data: admins } = await admin
        .from("employees")
        .select("id, full_name, email_address, role")
        .eq("company_id", ticket.company_id)
        .in("role", ["server_admin", "admin", "superadmin"])
        .order("role", { ascending: false }); // server_admin first

      const serverAdmin = admins?.find((a) => a.role === "server_admin") || admins?.[0];
      if (serverAdmin?.email_address) {
        targetEmployee = serverAdmin;
      }
    }

    if (!targetEmployee) {
      return {
        success: false,
        error: "No assigned agent or server admin found to receive notification.",
      };
    }

    // 4. Send email notification
    const isAssigned = !!ticket.assigned_to;
    const emailSubject = `[Follow-Up] Ticket ${ticketDisplayId}: ${ticket.title}`;
    const emailBody = `
      <p>Hello <strong>${targetEmployee.full_name || "Team Member"}</strong>,</p>
      <p>A follow-up has been requested on ticket <strong>${ticketDisplayId}</strong> by <strong>${requesterName}</strong> (${requester?.role?.replace("_", " ") || "Staff"}).</p>
      <div style="background: #f8fafc; padding: 12px 16px; border-radius: 8px; margin: 16px 0; border-left: 4px solid #6366f1;">
        <p style="margin: 4px 0;"><strong>Subject:</strong> ${ticket.title}</p>
        <p style="margin: 4px 0;"><strong>Status:</strong> ${ticket.status}</p>
        <p style="margin: 4px 0;"><strong>Priority:</strong> ${ticket.priority}</p>
        <p style="margin: 4px 0;"><strong>Assignment:</strong> ${
          isAssigned
            ? `Assigned to you (${targetEmployee.full_name})`
            : '<span style="color: #ef4444; font-weight: bold;">Unassigned — Please assign an agent</span>'
        }</p>
      </div>
      <p>${
        isAssigned
          ? "Please review the ticket and provide an update or resolution."
          : "As a Server Administrator, please review and assign this ticket to an appropriate agent. Subsequent follow-ups will notify the new assignee."
      }</p>
    `;

    await sendNotificationEmail({
      recipientEmail: targetEmployee.email_address,
      recipientName: targetEmployee.full_name || undefined,
      eventType: "TICKET_FOLLOW_UP",
      subject: emailSubject,
      body: emailBody,
      metadata: {
        ticketId: ticket.id,
        requestedBy: user.id,
        targetRole: targetEmployee.role,
        isAssigned,
      },
    });

    // 5. Add audit log comment into ticket_comments
    const roleTitle =
      targetEmployee.role === "server_admin"
        ? "Server Admin"
        : targetEmployee.role === "admin"
        ? "Admin"
        : "Assigned Agent";
    const commentBody = `🔔 Follow-up requested by ${requesterName}. Notification sent to ${targetEmployee.full_name || targetEmployee.email_address} (${roleTitle}).`;

    await admin.from("ticket_comments").insert({
      ticket_id: ticket.id,
      author_id: user.id,
      body: commentBody,
      is_internal: true,
    });

    revalidatePath("/protected/tickets");

    return {
      success: true,
      notifiedName: targetEmployee.full_name || targetEmployee.email_address,
      notifiedRole: roleTitle,
    };
  } catch (err: any) {
    console.error("[requestTicketFollowUp] Error:", err);
    return {
      success: false,
      error: err?.message || "Failed to process follow-up request",
    };
  }
}

export async function resolveTicket(ticketId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr,
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return { success: false, error: "Not authenticated" };
    }

    const admin = createAdminClient();

    // Fetch user details for audit comment
    const { data: resolver } = await admin
      .from("employees")
      .select("id, full_name, email_address")
      .eq("id", user.id)
      .maybeSingle();

    const resolverName = resolver?.full_name || resolver?.email_address || user.email || "Support Agent";

    const now = new Date().toISOString();

    const { error: updateErr } = await admin
      .from("tickets")
      .update({
        status: "resolved",
        resolved_at: now,
        updated_at: now,
      })
      .eq("id", ticketId);

    if (updateErr) {
      console.error("[resolveTicket] Update error:", updateErr);
      return { success: false, error: updateErr.message };
    }

    // Add resolution comment / audit log
    await admin.from("ticket_comments").insert({
      ticket_id: ticketId,
      author_id: user.id,
      body: `Ticket marked as resolved by ${resolverName}.`,
      is_internal: false,
    });

    revalidatePath("/protected/tickets");
    return { success: true };
  } catch (err: any) {
    console.error("[resolveTicket] Error:", err);
    return { success: false, error: err?.message || "Failed to resolve ticket" };
  }
}

