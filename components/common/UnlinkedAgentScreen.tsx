"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { joinTenantWithCode } from "@/app/actions/tenant";
import { toast } from "react-hot-toast";

export default function UnlinkedAgentScreen() {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      toast.error("Please enter an invite code.");
      return;
    }
    
    setLoading(true);
    try {
      const res = await joinTenantWithCode(code.trim().toUpperCase());
      if (res.success) {
        toast.success("Successfully linked to company!");
        // Force a hard reload so the layout fetches the new company_id and lets them through
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to link to company.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col">
      <div className="p-4 flex justify-end">
        <button
          onClick={handleLogout}
          className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg transition-colors flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-[18px]">logout</span>
          Sign Out
        </button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 p-8 text-center">
          <div className="size-16 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">domain_add</span>
          </div>
          
          <h1 className="text-2xl font-black text-slate-900 dark:text-white mb-2">
            Join Your Organization
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm">
            Enter the 8-character invite code provided by your administrator to securely link your account.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="e.g. A1B2C3D4"
                maxLength={8}
                className="w-full text-center tracking-[0.2em] font-mono text-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-4 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 uppercase"
              />
            </div>
            
            <button
              type="submit"
              disabled={loading || code.length < 6}
              className="w-full bg-indigo-600 text-white font-black text-xs uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all active:scale-95 disabled:opacity-50 disabled:active:scale-100 flex items-center justify-center gap-2"
            >
              {loading ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              )}
              {loading ? "Linking..." : "Link Account"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
