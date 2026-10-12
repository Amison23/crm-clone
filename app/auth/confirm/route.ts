import { createClient } from "@/lib/supabase/server";
import { type EmailOtpType } from "@supabase/supabase-js";
import { redirect } from "next/navigation";
import { type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const token_hash = searchParams.get("token_hash");
  const type = searchParams.get("type") as EmailOtpType | null;
  const next = searchParams.get("next") ?? "/auth/update-password";

  const supabase = await createClient();

  if (code) {
    // Defer PKCE code exchange to the client-side to prevent email scanners from consuming the token on GET requests
    const redirectUrl = new URL(next, request.url);
    redirectUrl.searchParams.set("code", code);
    return redirect(redirectUrl.toString());
  }

  if (token_hash && type) {
    // Defer OTP verification to the client-side to prevent email scanners from consuming the token on GET requests
    const redirectUrl = new URL(next, request.url);
    redirectUrl.searchParams.set("token_hash", token_hash);
    redirectUrl.searchParams.set("type", type);
    return redirect(redirectUrl.toString());
  }

  return redirect(`/auth/error?error=${encodeURIComponent("Invalid or expired authentication link")}`);
}
