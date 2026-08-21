# Custom Glassmorphic Toast & Notification System Documentation

**Application:** Cloudora CRM  
**Global Provider Location:** [`app/layout.tsx`](file:///c:/Users/mbugu/Desktop/Code/React/crm-clone/app/layout.tsx#L37-L43)  
**Custom Component Location:** [`lib/toast.tsx`](file:///c:/Users/mbugu/Desktop/Code/React/crm-clone/lib/toast.tsx)  
**Date:** August 21, 2026  

---

## 1. Overview

The notification toast system across Cloudora CRM has been upgraded from full-width banners to **Custom Glassmorphic Cards** (`lib/toast.tsx`) powered by `react-hot-toast` custom renders.

It provides clean, elevated floating notifications with:
- **Dark Mode Support**: Adapts automatically with backdrop blur (`backdrop-blur-md bg-white/95 dark:bg-slate-950/95`).
- **Smooth Animations**: Animated entrance (`animate-in fade-in slide-in-from-top-4`) and exit transitions.
- **Contextual Color Badges**: Elevated icons for `success` (Emerald green), `error` (Rose red), and `info` (Indigo blue).
- **Manual Dismissal**: Interactive close button (`X`) on every toast.

---

## 2. Global Provider Configuration ([`app/layout.tsx`](file:///c:/Users/mbugu/Desktop/Code/React/crm-clone/app/layout.tsx#L37-L43))

```tsx
// app/layout.tsx
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class">
          {children}

          {/* Clean Floating Pop-Up Notification Provider */}
          <Toaster 
            position="top-right"
            containerClassName="mt-2 mr-2 z-[9999]"
            toastOptions={{
              duration: 3500,
            }} 
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

---

## 3. Custom Toast Implementation ([`lib/toast.tsx`](file:///c:/Users/mbugu/Desktop/Code/React/crm-clone/lib/toast.tsx))

```tsx
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
```

---

## 4. Usage Pattern in Client Components

To display pop-ups from any component:

```typescript
import { showToast } from "@/lib/toast";

// Success Pop-Up
showToast("success", "Task status updated!");

// Error Pop-Up
showToast("error", "Access Denied: Insufficient permissions.");

// Info Pop-Up with Optional Subtitle
showToast("info", "Task Auto-Archiving Completed", "3 completed tasks archived.");
```
