import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

  if (!supabaseUrl || !serviceKey || !anonKey) {
    return NextResponse.json({ error: "Missing env vars" });
  }

  const adminClient = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const browserClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const testEmail = `test.auth.${Date.now()}@example.com`;
  const initialPassword = "InitialPassword123!";
  const resetPassword = "ResetPassword456!";

  try {
    // 1. Create User
    const { data: createData, error: createError } = await adminClient.auth.admin.createUser({
      email: testEmail,
      password: initialPassword,
      email_confirm: true,
    });

    if (createError) throw new Error(`Create failed: ${createError.message}`);
    const userId = createData.user.id;

    // 2. Test Login with Initial Password
    const { error: login1Error } = await browserClient.auth.signInWithPassword({
      email: testEmail,
      password: initialPassword,
    });

    if (login1Error) throw new Error(`Initial login failed: ${login1Error.message}`);

    // 3. Reset Password
    const { error: resetError } = await adminClient.auth.admin.updateUserById(userId, {
      password: resetPassword,
      email_confirm: true,
    });

    if (resetError) throw new Error(`Reset failed: ${resetError.message}`);

    // 4. Test Login with Reset Password
    const { error: login2Error } = await browserClient.auth.signInWithPassword({
      email: testEmail,
      password: resetPassword,
    });

    if (login2Error) throw new Error(`Reset login failed: ${login2Error.message}`);

    // Cleanup
    await adminClient.auth.admin.deleteUser(userId);

    return NextResponse.json({
      success: true,
      message: "All auth flows worked perfectly. The issue must be user input or sync.",
      email: testEmail
    });

  } catch (err: any) {
    return NextResponse.json({
      success: false,
      error: err.message
    });
  }
}
