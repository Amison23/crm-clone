'use client';

// Aligned with public.tenants SQL Schema
interface Tenant {
  id: string;
  name: string;
  slug: string;
  pricing_tier: 'free' | 'starter' | 'pro' | 'enterprise';
  is_active: boolean;
  email: string;
  created_at: string; // ISO timestamp
  updated_at?: string; // Optional: helps track the last config change
  total_revenue: number;
}

export default function TenantTable({ tenants }: { tenants: Tenant[] }) {
  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-xl shadow-gray-100/40 dark:shadow-none transition-all">
      
      {/* --- TABLE HEADER --- */}
      <div className="px-8 py-6 border-b border-gray-100 dark:border-slate-800 bg-gray-50/30 dark:bg-slate-800/50 flex justify-between items-center">
        <div>
          <h3 className="font-black text-gray-900 dark:text-white tracking-tight text-xl">Global Tenant Registry</h3>
          <p className="text-[10px] font-bold text-gray-400 dark:text-slate-500 uppercase tracking-widest mt-1">
            System Infrastructure & Tier Audit
          </p>
        </div>
        <span className="px-3 py-1 bg-white dark:bg-slate-700 border border-gray-200 dark:border-slate-600 rounded-xl text-[10px] font-black text-gray-500 dark:text-slate-300 shadow-sm">
          {tenants.length} NODES ACTIVE
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50 dark:bg-slate-800/30 border-b border-gray-100 dark:border-slate-800">
            <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-[0.2em]">
              <th className="px-8 py-4">Company & Slug</th>
              <th className="px-8 py-4">Service Tier</th>
              <th className="px-8 py-4">Operational Status</th>
              <th className="px-8 py-4 text-right">MRR (KES)</th>
              <th className="px-8 py-4 text-right">Config</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100 dark:divide-slate-800 text-sm">
            {tenants.map((t) => (
              <tr 
                key={t.id} 
                className="group hover:bg-blue-50/30 dark:hover:bg-blue-900/10 transition-colors duration-200"
              >
                <td className="px-8 py-5">
                  <p className="font-bold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {t.name}
                  </p>
                  <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono mt-0.5 uppercase">
                    /{t.slug} • {t.email}
                  </p>
                </td>

                <td className="px-8 py-5">
                  <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border ${
                    t.pricing_tier === 'enterprise' 
                      ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-100 dark:border-purple-800/50' 
                      : t.pricing_tier === 'pro'
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-800/50'
                      : t.pricing_tier === 'starter'
                      ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50'
                      : 'bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700'
                  }`}>
                    {t.pricing_tier}
                  </span>
                </td>

                <td className="px-8 py-5">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${t.is_active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
                    <span className="text-[10px] font-bold text-gray-600 dark:text-slate-400 uppercase tracking-tight">
                        {t.is_active ? 'System Active' : 'Suspended'}
                    </span>
                  </div>
                </td>

                <td className="px-8 py-5 text-right font-mono font-bold text-gray-900 dark:text-slate-100">
                  {t.total_revenue ? t.total_revenue.toLocaleString() : '0'}
                </td>

                <td className="px-8 py-5 text-right">
                  <button className="px-4 py-1.5 bg-white dark:bg-slate-800 hover:bg-gray-900 dark:hover:bg-white text-gray-600 dark:text-slate-300 hover:text-white dark:hover:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest border border-gray-200 dark:border-slate-700 transition-all active:scale-95 shadow-sm">
                    Manage
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 py-4 bg-gray-50/30 dark:bg-slate-800/30 text-center">
        <p className="text-[10px] font-bold text-gray-300 dark:text-slate-600 uppercase tracking-widest">
          SaaS Infrastructure Audit Pool • {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}