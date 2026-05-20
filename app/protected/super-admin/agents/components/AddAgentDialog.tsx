"use client";

import { useState, ReactNode } from "react";
import { 
  UserPlus, 
  Loader2, 
  Shield, 
  Mail, 
  User, 
  Building2, 
  ShieldCheck,
  X
} from "lucide-react";
import { createAgent } from "@/app/protected/super-admin/actions";
import { toast } from "react-hot-toast";

interface Company {
  id: string;
  name: string;
}

export default function AddAgentDialog({ 
  companies, 
  onSuccess 
}: { 
  companies: Company[], 
  onSuccess: (agent: any) => void 
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    full_name: "",
    email_address: "",
    role: "sales_agent",
    company_id: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createAgent({
        ...formData,
        company_id: formData.company_id || null
      });
      if (result.success) {
        toast.success("Identity provisioned successfully");
        onSuccess(result.data);
        setIsOpen(false);
        setFormData({ full_name: "", email_address: "", role: "sales_agent", company_id: "" });
      } else {
        toast.error(result.error || "Failed to provision identity");
      }
    } catch (err) {
      toast.error("System connection failure");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="px-6 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-xl active:scale-95"
      >
        <UserPlus size={14} /> Add Agent
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-slate-900 w-full max-w-md rounded-[3rem] shadow-2xl border border-slate-800 overflow-hidden transform animate-in zoom-in-95 duration-300">
            {/* Header */}
            <div className="px-10 py-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-4">
                <div className="bg-primary/20 p-3 rounded-2xl text-primary">
                  <UserPlus size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white uppercase tracking-tighter">
                    Provision Agent
                  </h3>
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">
                    Master Identity Configuration Node
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-slate-800 rounded-full transition-colors group"
              >
                <X size={20} className="text-slate-500 group-hover:text-white transition-colors" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-10 space-y-8">
              <div className="space-y-5">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    placeholder="Full Legal Name"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:border-primary transition-all text-white placeholder:text-slate-700"
                    value={formData.full_name}
                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                  />
                </div>

                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                  <input 
                    required
                    type="email"
                    placeholder="Work Email Address"
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-sm font-medium outline-none focus:border-primary transition-all text-white placeholder:text-slate-700"
                    value={formData.email_address}
                    onChange={e => setFormData({ ...formData, email_address: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="relative group">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary appearance-none cursor-pointer text-white"
                      value={formData.role}
                      onChange={e => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="sales_agent">Sales Agent</option>
                      <option value="admin">Company Admin</option>
                      <option value="support">Support</option>
                      <option value="billing">Billing</option>
                    </select>
                  </div>

                  <div className="relative group">
                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-slate-500 group-focus-within:text-primary transition-colors" />
                    <select 
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-[10px] font-black uppercase tracking-widest outline-none focus:border-primary appearance-none cursor-pointer text-white"
                      value={formData.company_id}
                      onChange={e => setFormData({ ...formData, company_id: e.target.value })}
                    >
                      <option value="">Global Command</option>
                      {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button 
                  type="button" 
                  onClick={() => setIsOpen(false)}
                  className="flex-1 py-4 bg-slate-800 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-slate-700 transition-all text-slate-300"
                >
                  Abort
                </button>
                <button 
                  type="submit" 
                  disabled={loading}
                  className="flex-1 py-4 bg-white text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-primary hover:text-white transition-all shadow-xl flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin size-4" /> : <ShieldCheck size={16} />}
                  Confirm Identity
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
