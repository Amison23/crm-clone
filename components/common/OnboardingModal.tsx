"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { completeOnboarding, requestInviteCodeEmail } from "@/app/actions/tenant";
import toast from "react-hot-toast";
import { createClient } from "@/lib/supabase/client";

export default function OnboardingModal({ 
  needsOnboarding, 
  initialName 
}: { 
  needsOnboarding: boolean;
  initialName: string;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(needsOnboarding);
  const [fullName, setFullName] = useState(initialName === "New Agent" || initialName.includes("@") ? "" : initialName);
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRequestingCode, setIsRequestingCode] = useState(false);
  const [codeRequested, setCodeRequested] = useState(false);

  if (!isOpen) return null;

  const handleClose = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (error) {
      console.error("Sign out error:", error);
    } finally {
      window.location.href = "/auth/login";
    }
  };

  const handleRequestCode = async () => {
    setIsRequestingCode(true);
    try {
      const res = await requestInviteCodeEmail();
      if (res.success) {
        toast.success("Verification code sent to your email!");
        setCodeRequested(true);
      } else {
        toast.error(res.error || "Failed to send verification code.");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsRequestingCode(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || fullName.trim().length < 2) {
      toast.error("Please enter your full name.");
      return;
    }
    if (!inviteCode.trim()) {
      toast.error("Please enter the company invite code.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const res = await completeOnboarding(fullName.trim(), inviteCode.trim());
      if (res.success) {
        toast.success("Profile updated successfully!");
        setIsOpen(false);
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update profile.");
      }
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="relative bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md border border-slate-200 dark:border-slate-800 overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={handleClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center"
            aria-label="Close and return to login"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="p-8">
          <div className="size-16 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="material-symbols-outlined text-3xl">waving_hand</span>
          </div>
          <h2 className="text-2xl font-black text-center text-slate-900 dark:text-white mb-2 tracking-tight">
            Welcome to Cloudora!
          </h2>
          <p className="text-sm text-center text-slate-500 dark:text-slate-400 mb-8 font-medium">
            Before you can access your dashboard, please complete your profile and enter your company's invite code to verify your access.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="fullName" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2">
                Your Full Name
              </label>
              <input
                id="fullName"
                type="text"
                autoFocus
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:font-medium placeholder:text-slate-400"
              />
            </div>
            
            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="inviteCode" className="block text-xs font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Company Invite Code
                </label>
                <button 
                  type="button" 
                  onClick={handleRequestCode}
                  disabled={isRequestingCode || codeRequested}
                  className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors disabled:opacity-50"
                >
                  {isRequestingCode ? "Sending..." : codeRequested ? "Code Sent!" : "Request via Email"}
                </button>
              </div>
              <input
                id="inviteCode"
                type="password"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value)}
                placeholder="Enter the code provided by your admin"
                className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 placeholder:font-sans placeholder:font-medium placeholder:text-slate-400 tracking-widest"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || fullName.trim().length < 2 || !inviteCode.trim()}
              className="w-full mt-2 py-3.5 bg-indigo-600 text-white font-black text-[11px] uppercase tracking-widest rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <span className="material-symbols-outlined animate-spin text-lg">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-lg">check_circle</span>
              )}
              {isSubmitting ? "Verifying..." : "Complete Setup"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
