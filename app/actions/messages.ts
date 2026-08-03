"use server";

import { createClient } from "@/lib/supabase/server";

export async function getTeamMessages() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.company_id) {
    return { success: false, error: "Unauthorized" };
  }

  // Fetch messages where ticket_id is null (internal channel) for the company
  const { data: messages, error } = await supabase
    .from("chat_messages")
    .select(`
      id,
      body,
      created_at,
      author_id,
      is_team_message,
      profiles:author_id (full_name, avatar_url)
    `)
    .eq("company_id", profile.company_id)
    .is("ticket_id", null)
    .order("created_at", { ascending: true })
    .limit(100);

  if (error) {
    // If profiles join fails because of schema, fallback
    const { data: fallback, error: fallbackError } = await supabase
      .from("chat_messages")
      .select("*")
      .eq("company_id", profile.company_id)
      .is("ticket_id", null)
      .order("created_at", { ascending: true })
      .limit(100);
      
    if (fallbackError) return { success: false, error: fallbackError.message };
    return { success: true, messages: fallback };
  }

  return { success: true, messages };
}

export async function postTeamMessage(body: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "Unauthorized" };

  const { data: profile } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", user.id)
    .single();

  if (!profile || !profile.company_id) {
    return { success: false, error: "Unauthorized" };
  }

  const { data, error } = await supabase
    .from("chat_messages")
    .insert({
      company_id: profile.company_id,
      author_id: user.id,
      body,
      is_team_message: true,
      ticket_id: null
    })
    .select()
    .single();

  if (error) return { success: false, error: error.message };
  return { success: true, message: data };
}
