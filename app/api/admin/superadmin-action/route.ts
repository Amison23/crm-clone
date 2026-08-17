import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

/**
 * SCOPED POWER AUTHORIZATION ENDPOINT
 * Validates server-side that superadmin-only system operations
 * reject admin (company_id scope) and lower roles with HTTP 403.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    // Resolve role from user metadata or employees table
    let role = user.user_metadata?.role;

    if (!role) {
      const { data: employee } = await supabase
        .from("employees")
        .select("role")
        .eq("id", user.id)
        .single();
      role = employee?.role;
    }

    // SERVER-SIDE ACL GATE: Superadmin only
    if (role !== "superadmin") {
      return NextResponse.json(
        {
          error: "Forbidden: Action requires superadmin privileges",
          attempted_role: role || "unknown",
          allowed_roles: ["superadmin"],
        },
        { status: 403 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const action = body.action || "global_system_configuration";

    return NextResponse.json({
      success: true,
      actionExecuted: action,
      executedBy: user.id,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
