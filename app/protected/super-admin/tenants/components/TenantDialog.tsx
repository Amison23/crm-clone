"use client";

import { useState, ReactNode } from "react";
import { 
  Building2, 
  X, 
  Loader2,
  ChevronDown,
  CreditCard,
  ShieldCheck,
  UserCog,
  Briefcase,
  Mail
} from "lucide-react";
import { createTenant, updateTenant } from "../../actions";
import { toast } from "react-hot-toast";

interface TenantDialogProps {
  children?: ReactNode;
  mode: "create" | "edit";
  tenant?: { id: string; name: string };
  onSuccess?: () => void;
}

export default function TenantDialog({ children, mode, tenant, onSuccess }: TenantDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [name, setName] = useState(tenant?.name || "");
  const [adminEmail, setAdminEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
        toast.error("Company name is required");
        return;
    }
    setIsSubmitting(true);

    try {
        if (mode === "create") {
            if (!adminEmail.trim()) {
                toast.error("Admin Email Address is required");
                setIsSubmitting(false);
                return;
            }
            const result = await createTenant(name, adminEmail);
            if (result.success) {
                const creds = ('credentials' in result) ? result.credentials as { email: string, password: string } : null;
                if (creds) {
                    toast((t) => (
                        <div className="flex flex-col gap-3 w-full">
                            <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                                <span>Tenant "{name}" provisioned successfully</span>
                            </div>
                            <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                <p className="text-[10px] text-slate-500 mb-2 uppercase font-black tracking-widest">Admin Credentials</p>
                                <div className="space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                                    <p>Email: <span className="text-indigo-600 dark:text-indigo-400 select-all">{creds.email}</span></p>
                                    <p>Password: <span className="text-indigo-600 dark:text-indigo-400 select-all">{creds.password}</span></p>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => {
                                    e.preventDefault();
                                    navigator.clipboard.writeText(`Login URL: ${window.location.origin}\nEmail: ${creds.email}\nPassword: ${creds.password}`);
                                    toast.success("Credentials copied to clipboard!");
                                    toast.dismiss(t.id);
                                }}
                                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-500/20"
                            >
                                Copy Credentials
                            </button>
                        </div>
                    ), { duration: 30000, position: "bottom-right", style: { minWidth: '300px' } });
                } else {
                    toast.success(`Tenant "${name}" provisioned successfully`);
                }
                setIsOpen(false);
                setName("");
                setAdminEmail("");
                onSuccess?.();
            } else {
                toast.error(result.error || "Failed to create tenant");
            }
        } else {
            const result = await updateTenant(tenant!.id, name);
            if (result.success) {
                toast.success("Tenant configuration updated");
                setIsOpen(false);
                onSuccess?.();
            } else {
                toast.error(result.error || "Failed to update tenant");
            }
        }
    } catch (err) {
        toast.error("System connection failure");
    } finally {
        setIsSubmitting(false);
    }
  };

  return (
    <>
      <div onClick={() => setIsOpen(true)} className="cursor-pointer">
        {children}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-[2.5rem] shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="px-8 py-6 border-b border-slate-50 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                <div className="bg-orange-500 p-2 rounded-lg text-white">
                  <Building2 className="size-5" />
                </div>
                <div>
                  <h3 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">
                    {mode === "create" ? "Provision" : "Update"} Tenant
                  </h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">
                    Infrastructure Node Configuration
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X className="size-5 text-slate-400" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="px-8 py-6 space-y-6">
              <div className="space-y-2">
                <label htmlFor="company-name" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Name</label>
                <div className="relative group/input">
                  <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    id="company-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Acme Corp"
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>

              {mode === "create" && (
                <div className="space-y-2">
                  <label htmlFor="admin-email" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Admin Email Address</label>
                  <div className="relative group/input">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                    <input
                      type="email"
                      id="admin-email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      placeholder="admin@acmecorp.com"
                      className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                    />
                  </div>
                </div>
              )}
              
              <div>
                <label htmlFor="company-logo">Company Logo</label>
                <input
                  type="file"
                  id="company-logo"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="company-subscription-plan" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                  Subscription Plan
                </label>
                <div className="relative group/select">
                  <CreditCard className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/select:text-indigo-500 transition-colors" />
                  <select
                    id="company-subscription-plan"
                    className="w-full pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="free">Free</option>
                    <option value="basic">Basic</option>
                    <option value="pro">Pro</option>
                    <option value="enterprise">Enterprise</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none group-hover/select:text-slate-600 transition-colors" />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="company-status" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Status</label>
                <div className="relative group/select">
                  <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/select:text-indigo-500 transition-colors" />
                  <select
                    id="company-status"
                    className="w-full pl-12 pr-10 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none appearance-none cursor-pointer"
                  >
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 pointer-events-none group-hover/select:text-slate-600 transition-colors" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="company-agent-incharge" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Agent Incharge</label>
                <div className="relative group/input">
                  <UserCog className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    id="company-agent-incharge"
                    placeholder="Search or select agent..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="company-internal-agent" className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Internal Agent</label>
                <div className="relative group/input">
                  <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-400 group-focus-within/input:text-indigo-500 transition-colors" />
                  <input
                    type="text"
                    id="company-internal-agent"
                    placeholder="Internal reference ID..."
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-indigo-500/20 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="size-3 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    mode === "create" ? "Add Company" : "Update Company"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
