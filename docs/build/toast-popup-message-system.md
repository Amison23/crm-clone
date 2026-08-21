# Pop-Up Toast & Notification Message System Documentation

**Application:** Cloudora CRM  
**Global Config Location:** [`app/layout.tsx`](file:///c:/Users/mbugu/Desktop/Code/React/crm-clone/app/layout.tsx#L37-L47)  
**Package:** `react-hot-toast`  
**Date:** August 21, 2026  

---

## 1. Overview

Pop-up notification messages (toasts) across Cloudora CRM are powered by `react-hot-toast`. They provide real-time visual feedback for asynchronous server action completions, authorization errors, background task status updates, and form submissions.

---

## 2. Global Provider Configuration

The notification provider (`<Toaster />`) is mounted globally at the root layout ([`app/layout.tsx`](file:///c:/Users/mbugu/Desktop/Code/React/crm-clone/app/layout.tsx#L37-L47)) inside Next-Themes' `<ThemeProvider>`:

```tsx
// app/layout.tsx
import { Toaster } from "react-hot-toast";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider attribute="class">
          {children}

          {/* Global Pop-Up Notification Toast Provider */}
          <Toaster 
            position="top-center"
            containerClassName="lg:ml-64 mt-4" // Offsets pop-up to clear left sidebar on desktop
            toastOptions={{
              className: "w-full shadow-xl !max-w-4xl",
              style: {
                maxWidth: "100%",
                width: "100%",
              }
            }} 
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Configuration Details
- **Position**: `top-center` (appears at the top center of the main viewport content area).
- **Sidebar Offset**: `containerClassName="lg:ml-64 mt-4"` prevents toasts from covering the left navigation sidebar.
- **Max Width**: Scaled up with `!max-w-4xl` for readable long error/status messages.

---

## 3. Usage Pattern in Client Components

To display pop-up messages from any client component (`"use client"`):

### Direct Invocation
```typescript
import toast from "react-hot-toast";

// 1. Success Pop-Up
toast.success("Task updated successfully!");

// 2. Error / Permission Rejection Pop-Up
toast.error("Access Denied: Insufficient permissions to modify this task.");

// 3. Informational / Neutral Pop-Up
toast("System configuration loaded.");
```

### Helper Wrapper Pattern (Used in `TasksClientWrapper`)
```typescript
const showToast = (type: "success" | "error", text: string) => {
  if (type === "success") toast.success(text);
  else toast.error(text);
};

// Usage inside async handlers:
const res = await updateTaskStatusAction(taskId, newStatus);
if (res.error) {
  showToast("error", res.error);
} else {
  showToast("success", "Task status updated!");
}
```

---

## 4. Features & Capabilities

1. **Auto Dismissal**: Pop-ups automatically fade out after 4 seconds (default).
2. **Manual Dismissal**: Users can click or swipe toasts away.
3. **Promise Toast Binding**: Supports automatic loading $\rightarrow$ success/error transition states:
   ```typescript
   toast.promise(archiveTaskAction(taskId), {
     loading: "Archiving task...",
     success: "Task archived successfully!",
     error: "Failed to archive task.",
   });
   ```
4. **Dark Mode Integration**: Inherits dark mode classes seamlessly.

---

## 5. Potential Upgrade / Customization Options

If you wish to customize or upgrade the pop-up notification system in the future:

1. **Option A: Custom Pop-Up Theme & Icons**
   - Override default icons, background colors, and borders directly in `<Toaster toastOptions={{ ... }} />`.
2. **Option B: Swap to `Sonner` (`@/components/ui/sonner`)**
   - If migrating to Shadcn UI standard toasts, `sonner` can be dropped in as a 1-to-1 replacement for `react-hot-toast`.
