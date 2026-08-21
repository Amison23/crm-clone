'use client';

import { 
  Building2, 
  Globe, 
  ShieldCheck, 
  Zap, 
  ExternalLink, 
  Activity,
  AlertCircle,
  Database,
  Lock,
  Unlock,
  TrendingUp
} from 'lucide-react';
import Link from 'next/link';

// Perfectly aligned with your Intelligence Engine v3.0 Schema
export interface Tenant {
  id: string;
  name: string;
  slug: string;
  pricing_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  plan_type: string | null;
  is_active: boolean;
  email: string | null;
  website: string | null;
  total_revenue?: number; // Calculated via view_company_revenue_by_product
  created_at: string;
}

export default function TenantTable({ tenants }: { tenants: Tenant[] }) {
  
  // Logic: Unified Currency Formatter for KES
  const formatYield = (value: any) => {
    const amount = Number(value) || 0;
    return new Intl.NumberFormat('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };
  console.log('Rendering TenantTable with tenants:', tenants); // Debugging log to verify data structure

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[3.5rem] overflow-hidden shadow-2xl transition-all selection:bg-primary selection:text-white">
      
      {/* --- 1. INFRASTRUCTURE HEADER --- */}
      <div className="px-12 py-10 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-slate-900 dark:bg-white rounded-2xl shadow-xl">
              <Database className="w-6 h-6 text-white dark:text-slate-900" />
            </div>
            <h3 className="font-black text-slate-900 dark:text-white tracking-tighter text-3xl uppercase leading-none">
              Node Registry
            </h3>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em] ml-14 italic">
            Global Infrastructure Audit • af-south-1
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-3 px-6 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-sm">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            <span className="text-[11px] font-black text-slate-600 dark:text-slate-300 uppercase tracking-widest leading-none">
              {tenants.length} Workspaces Mounted
            </span>
          </div>
          <button className="px-6 py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 active:scale-95 transition-all">
            + Provision Node
          </button>
        </div>
      </div>

      {/* --- 2. DATA GRID --- */}
      {/* Mobile Cards (< md) */}
      <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
        {tenants.map((t) => (
          <div key={t.id} className="p-4 space-y-3">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-500 shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight text-base">{t.name}</h4>
                  <p className="text-[10px] text-slate-400 font-mono">node-{t.slug}</p>
                </div>
              </div>

              <div className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase border shrink-0 ${
                t.pricing_tier === 'enterprise' 
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100' 
                  : t.pricing_tier === 'pro'
                  ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-500'
              }`}>
                {t.pricing_tier}
              </div>
            </div>

            <div className="flex items-center justify-between text-xs bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl">
              <div className="flex items-center gap-2">
                <div className={`h-2.5 w-2.5 rounded-full ${t.is_active ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <span className="font-bold text-slate-700 dark:text-slate-200 uppercase text-[10px]">
                  {t.is_active ? 'Nominal' : 'Lockdown'}
                </span>
              </div>

              <div className="text-right">
                <span className="text-[9px] font-bold text-slate-400 uppercase block">Settled Yield</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                  KES {formatYield(t.total_revenue)}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-1">
              <Link 
                href={`/protected/super-admin/tenants/${t.id}`}
                className="px-3 py-1.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-xs font-bold uppercase flex items-center gap-1"
              >
                Inspect Node <ExternalLink size={12} />
              </Link>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table (>= md) */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.3em] border-b border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-800/10">
              <th className="px-12 py-6">Organization & Node ID</th>
              <th className="px-12 py-6">Tier Architecture</th>
              <th className="px-12 py-6">Protocol Status</th>
              <th className="px-12 py-6 text-right">Settled Yield (KES)</th>
              <th className="px-12 py-6 text-right">Operations</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
            {tenants.map((t) => (
              <tr 
                key={t.id} 
                className="group hover:bg-slate-50/50 dark:hover:bg-primary/5 transition-all cursor-default"
              >
                {/* COLUMN 1: IDENTITY */}
                <td className="px-12 py-8">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-[1.25rem] bg-slate-100 dark:bg-slate-800 flex items-center justify-center font-black text-slate-400 group-hover:bg-primary group-hover:text-white group-hover:rotate-6 transition-all duration-500 shadow-inner">
                      {t.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-black text-slate-900 dark:text-white text-lg uppercase tracking-tighter leading-none mb-1.5 group-hover:text-primary transition-colors">
                        {t.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono uppercase tracking-tight">
                        <Globe className="w-3 h-3 text-slate-300" />
                        <span className="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded italic">node-{t.slug}</span>
                        <span className="opacity-30">|</span>
                        <span>{t.email || 'offline-node'}</span>
                      </div>
                    </div>
                  </div>
                </td>

                {/* COLUMN 2: TIERING */}
                <td className="px-12 py-8">
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                    t.pricing_tier === 'enterprise' 
                      ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-800/50' 
                      : t.pricing_tier === 'pro'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50'
                      : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  }`}>
                    {t.pricing_tier === 'enterprise' ? <ShieldCheck className="w-3.5 h-3.5" /> : <Zap className="w-3.5 h-3.5" />}
                    {t.pricing_tier}
                  </div>
                  <p className="text-[9px] font-bold text-slate-300 dark:text-slate-600 uppercase mt-2 ml-1">
                    {t.plan_type || 'Custom Instance'}
                  </p>
                </td>

                {/* COLUMN 3: SYSTEM PULSE */}
                <td className="px-12 py-8">
                  <div className="flex items-center gap-4">
                    <div className={`h-3 w-3 rounded-full ${t.is_active ? 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)] animate-pulse' : 'bg-rose-500 shadow-[0_0_12px_rgba(244,63,94,0.5)]'}`} />
                    <div className="flex flex-col">
                      <span className="text-[11px] font-black text-slate-900 dark:text-slate-100 uppercase tracking-tighter leading-none">
                        {t.is_active ? 'Nominal' : 'Lockdown'}
                      </span>
                      <span className="text-[9px] font-mono text-slate-400 uppercase italic mt-1">
                        Node-{t.id.slice(0, 8)}
                      </span>
                    </div>
                  </div>
                </td>

                {/* COLUMN 4: REVENUE (YIELD) - LOGIC UPDATED */}
                <td className="px-12 py-8 text-right">
                  <div className="flex flex-col items-end group/yield">
                    <div className="flex items-baseline gap-2">
                       <span className="text-[10px] font-black text-slate-400 uppercase">Kes</span>
                       <p className="font-mono font-black text-slate-900 dark:text-slate-100 text-2xl tracking-tighter leading-none group-hover/yield:text-emerald-500 transition-colors">
                        {formatYield(t.total_revenue)}
                       </p>
                       <TrendingUp size={14} className="text-emerald-500 opacity-0 group-hover/yield:opacity-100 transition-opacity ml-1" />
                    </div>
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2 opacity-60 italic border-t border-slate-100 dark:border-slate-800 pt-1">
                      Settled Acquisition
                    </p>
                  </div>
                </td>

                {/* COLUMN 5: CONTROL ACTIONS */}
                <td className="px-12 py-8 text-right">
                  <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all translate-x-4 group-hover:translate-x-0">
                    <button 
                      className={`p-3 rounded-xl border transition-all ${
                        t.is_active 
                          ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-500 hover:text-white' 
                          : 'bg-emerald-50 border-emerald-100 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                      }`}
                      title={t.is_active ? "Initiate Lockdown" : "Authorize Node"}
                    >
                      {t.is_active ? <Lock size={16} /> : <Unlock size={16} />}
                    </button>
                    <Link 
                      href={`/protected/super-admin/tenants/${t.id}`}
                      className="p-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl hover:shadow-xl transition-all active:scale-90"
                    >
                      <ExternalLink size={16} />
                    </Link>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* --- 3. SYSTEM LOGS FOOTER --- */}
      <div className="px-12 py-6 bg-slate-50/30 dark:bg-slate-800/30 flex justify-between items-center border-t border-slate-50 dark:border-slate-800">
        <div className="flex items-center gap-4">
           <Activity size={12} className="text-emerald-500" />
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">
             Verified Node Cluster af-south-1 • Security Protocol v3.4.2
           </p>
        </div>
        <div className="flex items-center gap-2 text-rose-500/40">
           <AlertCircle size={12} />
           <p className="text-[9px] font-mono uppercase tracking-tighter italic">SuperAdmin Credentials Verified</p>
        </div>
      </div>
    </div>
  );
}