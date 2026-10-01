import { getCurrentEmployee } from "@/lib/auth/current-employee";
import { NextResponse } from "next/server";

/**
 * SCOPED POWER AUTHORIZATION ENDPOINT
 * Validates server-side that superadmin-only system operations
 * reject admin (company_id scope) and lower roles with HTTP 403.
 */
export async function POST(request: Request) {
  try {
    const employee = await getCurrentEmployee();

    if (!employee) {
      return NextResponse.json(
        { error: "Unauthorized: Authentication required" },
        { status: 401 }
      );
    }

    // SERVER-SIDE ACL GATE: Superadmin only (role always from employees table)
    if (employee.role !== "superadmin") {
      return NextResponse.json(
        {
          error: "Forbidden: Action requires superadmin privileges",
          attempted_role: employee.role,
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
      executedBy: employee.userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
