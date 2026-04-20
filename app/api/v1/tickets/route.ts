import {createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs"

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(req: NextRequest){
  try{
    const authHeader = req.headers.get("authorization") || "";
    const apiKey = authHeader.startsWith("Bearer")
    ? authHeader.split(" ")[1] : null;

    if(!apiKey) {
      return NextResponse.json(
        { error: "Missing API Key" },
        { status: 401 }
      )
    }

    const {data: company, error:companyError} = await supabase
    .from("companies")
    .select("id, name, is_active, api_key")
    .eq("api_key", apiKey)
    .single()

    if(companyError || !company){
      return NextResponse.json(
        { error: "This tenant account is inactive" },
        { status: 403 }
      )
    }

    const body = await req.json()
    const { subject, description, message, category, priority, metadata } = body

    if(!subject || (!description && !message)){
      return NextResponse.json(
      { error: "Subject and description (or message) are required" },
      { status: 400 }
    )
  }

  const VALID_PRIORITIES = ["low", "medium", "high", "critical"]
  const VALID_CATEGORIES = ['technical', 'billing', 'general', 'feature_request']

  const priorityMap: Record<string, string> = {
    low: "low",
    normal: "medium",
    medium: "medium",
    high: "high",
    urgent: "critical",
    critical: "critical"
  }

  const mappedPriority = (priority ? priorityMap[priority.toLowerCase()] : null) ?? "medium"

  if(priority && !priorityMap[priority.toLowerCase()]){
    return NextResponse.json(
      { error: `Invalid priority. Allowed priorities: low, medium, high, critical, normal, urgent` },
      { status: 400 }
    )
  }

  if(category && !VALID_CATEGORIES.includes(category)){
    return NextResponse.json(
      { error: `Invalid category. Category must be one of ${VALID_CATEGORIES.join(", ")}` },
      { status: 400 }
    )
  }

  const {data: ticket, error: ticketError} = await supabase
  .from("tickets")
  .insert({
    company_id: company.id,
    title: subject,
    description: description || message,
    category: category || "general",
    priority: mappedPriority,
    status: "open",
    metadata: metadata ?? {},
  })
  .select("id, status, created_at")
  .single()

  if(ticketError){
    console.error("[CRM API] Ticket insert error:", ticketError)
    return NextResponse.json(
      { error: "Failed to create ticket", details: ticketError.message },
      { status: 500 }
    )
  }

  return NextResponse.json({
    message: "Ticket created successfully", 
    ticket: {
      id: ticket.id,
      status: ticket.status,
      created_at: ticket.created_at,
      company: company.name
    }
  },
  { status: 201 }
  )

} catch(error){
  console.error("Error creating ticket:", error)
  return NextResponse.json(
    { error: "Failed to create ticket" },
    { status: 500 }
  )
}

}

export async function GET(){
  return NextResponse.json({status: 200, message: "OK", endpoint:"tickets/v1"})
}
  


