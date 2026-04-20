import { updateSession } from "@/lib/supabase/proxy";
import { type NextRequest, NextResponse } from "next/server";

export async function middleware(request: NextRequest) {
  // Bypass auth for all API routes — they handle their own auth via API key
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  return await updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|api/v1.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};