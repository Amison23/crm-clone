"use client";

import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import { AlertCircle, RefreshCw } from "lucide-react";

export function UpdatePasswordForm({
  className,
  ...props
}: React.ComponentPropsWithoutRef<"div">) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isExpired, setIsExpired] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const router = useRouter();

  useEffect(() => {
    async function initAuthSession() {
      const supabase = createClient();
      setIsCheckingAuth(true);

      const fullUrl = window.location.href;
      const searchParams = new URLSearchParams(window.location.search);
      const hashParams = new URLSearchParams(window.location.hash.replace("#", "?"));

      const errorCode = searchParams.get("error_code") || hashParams.get("error_code");
      const errorDesc = searchParams.get("error_description") || hashParams.get("error_description");
      const errName = searchParams.get("error") || hashParams.get("error");
      const code = searchParams.get("code");

      // Handle invalid/expired link in URL or Hash
      if (errorCode === "otp_expired" || errName === "access_denied" || (errorDesc && errorDesc.includes("expired"))) {
        setIsExpired(true);
        setError("This password reset link is invalid or has expired. Password reset links can only be used once.");
        setIsCheckingAuth(false);
        return;
      }

      // If PKCE code is present in URL, exchange it for session
      if (code) {
        try {
          const { error: exchangeErr } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeErr) {
            setIsExpired(true);
            setError("This password reset link has already been used or expired. Please request a new link.");
            setIsCheckingAuth(false);
            return;
          }
        } catch (e: any) {
          console.error("Code exchange error:", e);
        }
      }

      // Check current user session
      const { data: { session } } = await supabase.auth.getSession();
      if (!session && !code) {
        // No session found and no code — user might have landed without auth context
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setError("No active password recovery session. Please request a new reset email.");
        }
      }

      setIsCheckingAuth(false);
    }

    initAuthSession();

    const supabase = createClient();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === "PASSWORD_RECOVERY") {
        setIsExpired(false);
        setError(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    const supabase = createClient();
    setIsLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;

      setSuccess(true);
      setTimeout(() => {
        router.push("/protected");
      }, 2000);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred while updating your password.";
      if (msg.includes("Auth session missing") || msg.includes("JWT")) {
        setIsExpired(true);
        setError("Your password recovery session has expired. Please request a new reset link.");
      } else {
        setError(msg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isCheckingAuth) {
    return (
      <Card className={cn("w-full max-w-sm", className)}>
        <CardContent className="py-12 flex flex-col items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 text-primary animate-spin" />
          <p className="text-xs text-muted-foreground">Verifying password reset link...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      {isExpired ? (
        <Card className="border-rose-200 dark:border-rose-900">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-1">
              <AlertCircle className="w-6 h-6" />
            </div>
            <CardTitle className="text-xl text-rose-600 dark:text-rose-400">Link Expired or Invalid</CardTitle>
            <CardDescription className="text-xs">
              Password reset links are single-use and expire after a short period, or if a newer link was requested.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Please click below to send a fresh password reset email.
            </p>
            <Button asChild className="w-full">
              <Link href="/auth/forgot-password">
                Request New Password Reset Link
              </Link>
            </Button>
          </CardContent>
        </Card>
      ) : success ? (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-emerald-600 dark:text-emerald-400">Password Updated!</CardTitle>
            <CardDescription>
              Your password has been reset successfully. Redirecting to your dashboard...
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-4">
              <div className="h-8 w-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <p className="text-xs text-center text-slate-500">
              Click <Link href="/protected" className="text-primary underline">here</Link> if you are not redirected automatically.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Reset Your Password</CardTitle>
            <CardDescription>
              Please enter your new password below.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdatePassword}>
              <div className="flex flex-col gap-6">
                <div className="grid gap-2">
                  <Label htmlFor="password">New Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter new password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Re-enter new password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                </div>
                {error && <p className="text-sm font-medium text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "Saving..." : "Save New Password"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
