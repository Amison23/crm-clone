"use client";

import { useState, ReactNode } from "react";
import { 
  Building2, 
  X, 
  Loader2 
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
        if (mode === "create") {
            const result = await createTenant(name);
            if (result.success) {
                toast.success(`Tenant "${name}" provisioned successfully`);
                setIsOpen(false);
                setName("");
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
            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">
                  Tenant Business Name
                </label>
                <input
                  required
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Corporation"
                  className="w-full px-5 py-4 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-all outline-none text-slate-900 dark:text-white"
                />
              </div>

              <div className="pt-4 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-6 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-200 dark:hover:bg-slate-700 transition-all active:scale-95"
                >
                  Cancel
                </button>
                <button
                  disabled={isSubmitting}
                  type="submit"
                  className="flex-1 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center"
                >
                  {isSubmitting ? <Loader2 className="animate-spin size-4" /> : (mode === "create" ? "Provision Now" : "Update Node")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
