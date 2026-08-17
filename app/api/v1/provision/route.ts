import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { normalizeEmail } from "@/lib/utils";

export async function POST (req: NextRequest){
  const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co',
      process.env.SUPABASE_SERVICE_ROLE_KEY || 'placeholder',
  );

  try {
    const authHeader = req.headers.get("authorization") || "";
    const masterKey = authHeader.startsWith("Bearer") 
    ? authHeader.split(" ")[1] : null


    if (!masterKey || masterKey !== process.env.CRM_MASTER_KEY){
      return NextResponse.json(
        {error: "Unauthorized"}, 
        {status: 401}
      )
    }

    const {name, slug, product, email: rawEmail, website} = await req.json()
    const email = rawEmail ? normalizeEmail(rawEmail) : null;

    if(!name || !slug || !product){
      return NextResponse.json(
        {error: "name, slug and product are required"},
        {status: 400}
      )
    }

    const {data: existing } = await supabase 
    .from("companies")
    .select("id")
    .eq("slug", slug)
    .single()

    if (existing){
      return NextResponse.json(
        {error:  `A company with slug '${slug}' already exists`},
        {status: 409}
      )
    }

    const apiKey = `sk_${product}_${crypto.randomBytes(24).toString("hex")}`

    const { data: company, error} =  await supabase
    .from("companies")
    .insert({
      name, 
      slug, 
      email: email ?? null,
      // website: website ?? null,
      plan_type: "external",
      is_active: true,
      api_key: apiKey
    })
    .select("id, name, slug, api_key, created_at")
    .single()

    if(error){
      console.error("[CRM Provision] Insert error:", error)
      return NextResponse.json(
        {error: "Failed to provision tenant", details: error.message},
        {status: 500}
      )
    }

    return NextResponse.json(
      {
        message: "Tenant provisioned successfully",
        company: {
          id: company.id,
          name: company.name,
          slug: company.slug,
          api_key: company.api_key,
          created_at: company.created_at,
        }
      },
      {status: 201}
    )
    
  } catch (error) {
    console.error("Error creating company:", error);
    return NextResponse.json({
      error: "Failed to create company",
    }, {status: 500})
  }
}
