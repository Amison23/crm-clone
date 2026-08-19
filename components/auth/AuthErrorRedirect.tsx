"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function AuthErrorRedirect() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const searchParams = new URLSearchParams(window.location.search);
    const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));

    const errorCode = searchParams.get("error_code") || hashParams.get("error_code");
    const err = searchParams.get("error") || hashParams.get("error");
    const errorDesc = searchParams.get("error_description") || hashParams.get("error_description");

    if (errorCode === "otp_expired" || err === "access_denied" || (errorDesc && errorDesc.includes("expired"))) {
      router.replace("/auth/forgot-password?error_code=otp_expired");
    }
  }, [router]);

  return null;
}
