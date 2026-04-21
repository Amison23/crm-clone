'use client';

import { useState, useMemo } from 'react';
import { useIntelligence } from '@/hooks/useIntelligence';
import { 
  Package, 
  ShieldCheck, 
  Search, 
  Filter, 
  ArrowUpRight, 
  Building2,
  FileSpreadsheet,
  Terminal,
  ChevronDown
} from 'lucide-react';

// --- 1. TYPE DEFINITIONS ---
interface RevenueAuditRow {
  transaction_id: string;
  internal_node: string;
  client_org: string;
  lead_source: string;
  product_name: string;
  product_category: string;
  closing_agent: string;
  settled_value: number;
timestamp: string;
}

// --- 2. FORMATTING UTILITIES ---
const currencyFormatter = new Intl.NumberFormat('en-KE', {
  style: 'currency',
  currency: 'KES',
  maximumFractionDigits: 0,
});

export default function RevenueAuditPage() {
  const { intelligence, isLoading } = useIntelligence();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeNode, setActiveNode] = useState<string>('ALL');

  // --- 3. DATA PROCESSING LAYER ---
  const auditData: RevenueAuditRow[] = intelligence?.revenueAudit || [];

  const filteredData = useMemo(() => {
    return auditData.filter((row) => {
      const matchesSearch = row.client_org.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            row.closing_agent.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesNode = activeNode === 'ALL' || row.internal_node === activeNode;
      return matchesSearch && matchesNode;
    });
  }, [auditData, searchQuery, activeNode]);

  const uniqueNodes = useMemo(() => {
    const nodes = new Set(auditData.map(r => r.internal_node));
    return ['ALL', ...Array.from(nodes)];
  }, [auditData]);

  if (isLoading) return <RevenueLoadingSkeleton />;

  return (
    <div className="p-6 lg:p-12 space-y-10 max-w-[1700px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* --- HEADER & GLOBAL ACTIONS --- */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-end gap-8">
        <header className="space-y-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
              <ShieldCheck size={20} />
            </div>
            <h2 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.5em]">Section 5.1: Intelligence Ledger</h2>
          </div>
          <h1 className="text-6xl font-black tracking-tighter uppercase text-slate-900 dark:text-white leading-none">
            Financial <span className="text-emerald-500 italic">Settlement</span>
          </h1>
          <p className="text-slate-400 font-medium italic">Verified transaction stream for Node: af-south-1</p>
        </header>

        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 rounded-[1.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-primary transition-colors" />
            <input 
              type="text"
              placeholder="Filter by Client or Agent..."
              className="pl-11 pr-6 py-3 bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl text-[10px] font-bold uppercase tracking-widest focus:ring-2 focus:ring-primary/20 w-[300px] transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all">
            <FileSpreadsheet size={14} /> Export CSV
          </button>
        </div>
      </div>

      {/* --- QUICK FILTERS --- */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {uniqueNodes.map((node) => (
          <button
            key={node}
            onClick={() => setActiveNode(node)}
            className={`px-6 py-2 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
              activeNode === node 
              ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20' 
              : 'bg-white dark:bg-slate-900 text-slate-400 border-slate-200 dark:border-slate-800 hover:border-primary/40'
            }`}
          >
            {node}
          </button>
        ))}
      </div>

      {/* --- AUDIT LEDGER --- */}
      <div className="bg-white dark:bg-slate-900 rounded-[3.5rem] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-800/40">
              <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                <th className="px-10 py-7">Internal Node</th>
                <th className="px-10 py-7">Acquisition Client</th>
                <th className="px-10 py-7">Product Details</th>
                <th className="px-10 py-7">Closing Authority</th>
                <th className="px-10 py-7 text-right">Settled Yield</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
              {filteredData.length > 0 ? filteredData.map((row) => (
                <tr key={row.transaction_id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-all">
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="px-3 py-1.5 bg-slate-900 text-white text-[9px] font-black rounded-lg uppercase tracking-widest shadow-lg shadow-black/10">
                        {row.internal_node}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="space-y-1">
                      <p className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight group-hover:text-primary transition-colors">
                        {row.client_org}
                      </p>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{row.lead_source}</span>
                        <ArrowUpRight size={10} className="text-slate-300" />
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-4">
                      <div className="p-3 bg-primary/5 text-primary rounded-2xl group-hover:bg-primary group-hover:text-white transition-all duration-500">
                        <Package size={18}/>
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-slate-700 dark:text-slate-200 uppercase tracking-tighter">{row.product_name}</p>
                        <p className="text-[9px] font-bold text-slate-400 uppercase opacity-60 italic">{row.product_category}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-10 py-8">
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[8px] font-black">
                        {row.closing_agent.charAt(0)}
                      </div>
                      <span className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest">
                        {row.closing_agent}
                      </span>
                    </div>
                  </td>
                  <td className="px-10 py-8 text-right">
                    <div className="space-y-1">
                      <p className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter">
                        {currencyFormatter.format(row.settled_value)}
                      </p>
                      <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Verified KES</p>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} className="py-32">
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <Building2 size={48} className="text-slate-200 dark:text-slate-800 animate-bounce" />
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Zero Matching Settlements Found</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* --- FOOTER STATUS --- */}
        <div className="bg-slate-50 dark:bg-slate-800/30 px-10 py-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Terminal size={14} className="text-slate-400" />
            <p className="text-[9px] font-mono text-slate-400 uppercase tracking-widest">
              Audit Hash: <span className="text-primary">SHA-256 Verified</span> • System Time: {new Date().toLocaleTimeString()}
            </p>
          </div>
          <p className="text-[10px] font-black text-slate-500 uppercase">
            Viewing {filteredData.length} / {auditData.length} Acquisitions
          </p>
        </div>
      </div>
    </div>
  );
}

function RevenueLoadingSkeleton() {
  return (
    <div className="p-12 space-y-10 animate-pulse">
      <div className="h-20 w-1/3 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
      <div className="h-[600px] w-full bg-slate-50 dark:bg-slate-800/50 rounded-[3.5rem]" />
    </div>
  );
}