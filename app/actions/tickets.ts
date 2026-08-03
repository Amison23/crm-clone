"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server";

export async function reassignTicket(ticketId: string, newAgentId: string | null, companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  // Verify the user is a company admin or superadmin
  const { data: profile } = await supabase
    .from("employees")
    .select("role, company_id")
    .eq("id", user.id)
    .single();

  if (!profile || (profile.role !== "admin" && profile.role !== "superadmin")) {
    return { success: false, error: "Unauthorized" };
  }
  
  if (profile.role === "admin" && profile.company_id !== companyId) {
    return { success: false, error: "Unauthorized" };
  }

  const adminClient = createAdminClient();

  // Validate the ticket belongs to the company
  const { data: ticket, error: ticketError } = await adminClient
    .from("tickets")
    .select("id, assigned_to")
    .eq("id", ticketId)
    .eq("company_id", companyId)
    .single();

  if (ticketError || !ticket) {
    return { success: false, error: "Ticket not found or unauthorized" };
  }

  const oldAgentId = ticket.assigned_to;

  // Validate the new agent belongs to the company (if not null)
  if (newAgentId) {
    const { data: newAgent, error: agentError } = await adminClient
      .from("employees")
      .select("id, email_address")
      .eq("id", newAgentId)
      .eq("company_id", companyId)
      .single();

    if (agentError || !newAgent) {
      return { success: false, error: "Invalid agent or agent does not belong to your company" };
    }
  }

  // Perform reassignment
  const { error: updateError } = await adminClient
    .from("tickets")
    .update({ assigned_to: newAgentId, updated_at: new Date().toISOString() })
    .eq("id", ticketId);

  if (updateError) {
    return { success: false, error: updateError.message };
  }

  // Create ticket log
  await adminClient
    .from("ticket_logs")
    .insert({
      ticket_id: ticketId,
      user_id: user.id,
      action: "reassigned",
      details: {
        old_agent_id: oldAgentId,
        new_agent_id: newAgentId,
        reassigned_by: user.id
      }
    });

  // Mock Notification
  console.log(`[Notification] Ticket ${ticketId} reassigned to agent ${newAgentId || 'Unassigned'} by user ${user.id}`);

  return { success: true };
}
