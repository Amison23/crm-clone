import toast from "react-hot-toast";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

export function showToast(
  type: "success" | "error" | "info",
  title: string,
  description?: string
) {
  toast.custom((t) => (
    <div
      className={`${
        t.visible
          ? "animate-in fade-in slide-in-from-top-4 duration-200"
          : "animate-out fade-out slide-out-to-top-2 duration-150"
      } flex items-center gap-3 px-4 py-3.5 bg-white/95 dark:bg-slate-950/95 border border-slate-200/90 dark:border-slate-800/90 shadow-2xl shadow-slate-900/10 rounded-2xl max-w-sm w-full backdrop-blur-md pointer-events-auto`}
    >
      <div
        className={`size-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
          type === "success"
            ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
            : type === "error"
            ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
            : "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400"
        }`}
      >
        {type === "success" ? (
          <CheckCircle2 className="w-5 h-5" />
        ) : type === "error" ? (
          <AlertCircle className="w-5 h-5" />
        ) : (
          <Info className="w-5 h-5" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-900 dark:text-slate-100 leading-snug">
          {title}
        </p>
        {description && (
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-0.5 leading-normal">
            {description}
          </p>
        )}
      </div>

      <button
        onClick={() => toast.dismiss(t.id)}
        className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  ));
}
