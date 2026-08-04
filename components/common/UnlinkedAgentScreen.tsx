"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { joinTenantWithCode } from "@/app/actions/tenant";
import { toast } from "react-hot-toast";

export default function UnlinkedAgentScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [userInitials, setUserInitials] = useState("?");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const email = user.email || "";
      setUserEmail(email);
      const name = user.user_metadata?.full_name || email.split("@")[0] || "?";
      setUserInitials(
        name
          .split(" ")
          .map((n: string) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      );
    });
  }, []);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return;

    setLoading(true);
    try {
      const res = await joinTenantWithCode(code.trim().toUpperCase());
      if (res.success) {
        toast.success("Successfully linked to your organization!");
        window.location.reload();
      } else {
        toast.error(res.error || "Invalid or expired code.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">

        {/* User Identity */}
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="size-16 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-black text-xl select-none">
            {userInitials}
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">{userEmail}</p>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">Account not linked to any organization</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-slate-200 dark:border-slate-800" />

        {/* Code Input */}
        <div className="space-y-4">
          <div className="space-y-1">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 text-center">
              Enter your invite code
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-600 text-center">
              Ask your administrator for an 8-character code
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="A1B2C3D4"
              maxLength={8}
              autoFocus
              className="w-full text-center tracking-[0.3em] font-mono text-2xl font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase placeholder:text-slate-300 dark:placeholder:text-slate-700 placeholder:tracking-normal placeholder:font-normal placeholder:text-base"
            />

            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full bg-indigo-600 text-white font-bold text-sm py-3.5 rounded-xl hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-40 disabled:pointer-events-none flex items-center justify-center gap-2"
            >
              {loading && (
                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
              )}
              {loading ? "Verifying..." : "Join Organization"}
            </button>
          </form>
        </div>

        {/* Sign out */}
        <div className="text-center">
          <button
            onClick={handleLogout}
            className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            Sign out
          </button>
        </div>

      </div>
    </div>
  );
}
