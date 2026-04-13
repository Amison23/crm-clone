'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCcw, Home, ShieldAlert } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Super Admin Exception:', error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white dark:bg-slate-900 rounded-[2.5rem] border border-red-100 dark:border-red-900/30 shadow-2xl p-10 text-center animate-in fade-in zoom-in-95 duration-500">
        
        <div className="relative mb-8 inline-block">
          <div className="absolute inset-0 bg-red-500/20 blur-2xl rounded-full scale-110 animate-pulse" />
          <div className="relative h-20 w-20 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <ShieldAlert className="h-10 w-10 text-white" />
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-2 italic">
          System <span className="text-red-500">Interrupted</span>
        </h1>
        
        <p className="text-slate-500 dark:text-slate-400 font-medium italic mb-8 mx-auto max-w-[280px]">
             An unhandled exception occurred within the core administrative runtime.
        </p>

        <div className="bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 p-4 rounded-2xl mb-8 text-left group">
          <div className="flex items-center gap-2 mb-1 text-red-600 dark:text-red-400 uppercase font-black text-[10px] tracking-widest">
            <AlertCircle className="size-3" />
            Error Diagnostic
          </div>
          <p className="text-[11px] font-mono text-red-500 break-all leading-relaxed line-clamp-2 italic">
            {error.message || "Unknown cryptographic or system failure detected."}
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <button
            onClick={() => reset()}
            className="flex items-center justify-center gap-2 w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:scale-[1.02] active:scale-95 transition-all shadow-xl group"
          >
            <RefreshCcw className="size-4 group-hover:rotate-180 transition-transform duration-700" />
            Reinitialize Module
          </button>
          
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 w-full py-4 border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all"
          >
            <Home className="size-4" />
            Safe Return to Dashboard
          </Link>
        </div>

        <p className="mt-8 text-[9px] font-bold text-slate-400 uppercase tracking-widest italic opacity-50">
            * Fault isolation protocols active
        </p>
      </div>
    </div>
  );
}
