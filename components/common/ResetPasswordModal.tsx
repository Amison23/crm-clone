"use client";

import { useState } from "react";
import { KeyRound, Copy, Check, RefreshCw, X, ShieldAlert, MailCheck, Mail } from "lucide-react";
import { adminResetUserPassword } from "@/app/protected/super-admin/actions";
import { toast } from "react-hot-toast";

interface ResetPasswordModalProps {
  user: {
    id: string;
    email_address: string;
    full_name?: string;
    role?: string | null;
  };
  onClose: () => void;
}

export function ResetPasswordModal({ user, onClose }: ResetPasswordModalProps) {
  const [customPassword, setCustomPassword] = useState("");
  const [sendEmail, setSendEmail] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<{ email: string; generatedPassword: string; emailDispatched?: boolean } | null>(null);
  const [copied, setCopied] = useState(false);

  const generateRandom = () => {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";
    let rand = "";
    for (let i = 0; i < 8; i++) {
      rand += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setCustomPassword(`Pass!${rand}`);
  };

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await adminResetUserPassword(user.id, customPassword.trim() || undefined, sendEmail);
      if (res.success && res.generatedPassword) {
        setResult({
          email: res.email || user.email_address,
          generatedPassword: res.generatedPassword,
          emailDispatched: res.emailDispatched,
        });
        toast.success("Worker password updated successfully!");
      } else {
        toast.error(res.error || "Failed to reset user password");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    const text = `Email: ${result.email}\nPassword: ${result.generatedPassword}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Credentials copied to clipboard!");
    setTimeout(() => setCopied(false), 3000);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800">
        
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-950/40">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-2xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <KeyRound className="size-5" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base">Administrative Password Reset</h3>
              <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">Credential Management</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-8 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Target Profile Info */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div className="size-10 rounded-xl bg-indigo-600 text-white font-black flex items-center justify-center text-sm uppercase">
              {user.full_name?.substring(0, 2) || user.email_address?.substring(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-bold text-sm text-slate-900 dark:text-white truncate">{user.full_name || "Staff Member"}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user.email_address}</p>
            </div>
            {user.role && (
              <span className="px-2.5 py-1 bg-indigo-100 dark:bg-indigo-900/40 text-indigo-700 dark:text-indigo-300 text-[10px] font-black uppercase rounded-lg">
                {user.role.replace("_", " ")}
              </span>
            )}
          </div>

          {result ? (
            /* SUCCESS DISPLAY CREDENTIALS CARD */
            <div className="space-y-4 animate-in zoom-in-95 duration-200">
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-2xl text-center space-y-2">
                <p className="text-xs font-black uppercase text-emerald-600 dark:text-emerald-400 tracking-wider">New Password Generated</p>
                <div className="p-3 bg-white dark:bg-slate-900 border border-emerald-200 dark:border-emerald-800 rounded-xl font-mono text-lg font-bold text-slate-900 dark:text-white tracking-widest selection:bg-emerald-200">
                  {result.generatedPassword}
                </div>
                
                {result.emailDispatched ? (
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 mt-2">
                    <MailCheck className="size-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Automated email notification sent to <strong>{result.email}</strong></span>
                  </div>
                ) : (
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Share these credentials securely with the worker so they can log in.
                  </p>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="flex-1 py-3 px-4 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-500 transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  {copied ? <Check className="size-4" /> : <Copy className="size-4" />}
                  {copied ? "Copied!" : "Copy Credentials"}
                </button>

                <button
                  type="button"
                  onClick={onClose}
                  className="py-3 px-5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* PASSWORD GENERATION FORM */
            <form onSubmit={handleReset} className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    New Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandom}
                    className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
                  >
                    <RefreshCw className="size-3" /> Auto-Generate
                  </button>
                </div>

                <input
                  type="text"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="Leave empty to auto-generate"
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-mono font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                />
                <p className="text-[10px] text-slate-400 mt-1.5">
                  Minimum 6 characters. If left empty, a secure password will be randomly generated.
                </p>
              </div>

              {/* EMAIL DISPATCH OPTION CHECKBOX */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3 cursor-pointer" onClick={() => setSendEmail(!sendEmail)}>
                <input
                  type="checkbox"
                  id="sendEmail"
                  checked={sendEmail}
                  onChange={(e) => setSendEmail(e.target.checked)}
                  className="size-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="sendEmail" className="text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer flex items-center gap-2">
                  <Mail className="size-4 text-indigo-500 shrink-0" />
                  <span>Send password notification email to worker</span>
                </label>
              </div>

              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl flex items-start gap-2.5 text-[11px] text-amber-800 dark:text-amber-300">
                <ShieldAlert className="size-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
                <span>
                  This immediately updates the user&apos;s authentication credential in Supabase Auth.
                </span>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 py-3 bg-indigo-600 text-white font-bold text-xs uppercase tracking-wider rounded-xl hover:bg-indigo-500 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20"
                >
                  {isSubmitting ? (
                    <RefreshCw className="size-4 animate-spin" />
                  ) : (
                    <KeyRound className="size-4" />
                  )}
                  {isSubmitting ? "Updating..." : "Reset Password"}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
