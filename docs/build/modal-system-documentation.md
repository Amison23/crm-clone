# Modal & Drawer System Architecture Documentation

**Application:** Cloudora CRM  
**Location:** [`components/crm/tasks-client-wrapper.tsx`](file:///c:/Users/mbugu/Desktop/Code/React/crm-clone/components/crm/tasks-client-wrapper.tsx)  
**Date:** August 21, 2026  

---

## 1. Overview

Currently, Cloudora CRM does not rely on external UI primitive libraries (like Radix UI or Headless UI) for dialogs. Instead, all modals and slide-over drawers are built using **Pure React Component State** combined with **Tailwind CSS Backdrop Overlays**.

This document outlines the current implementation patterns, state management, styling tokens, and event behavior so it can be reviewed or refactored easily in the future.

---

## 2. Modal & Drawer Implementation Patterns

### Pattern A: Form Modal Dialog (`AddTaskForm` Modal)

Used for creating new records (e.g. adding a new task).

```tsx
{isOpen && (
  <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
    <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative mx-auto my-8">
      {/* Close Button */}
      <button
        onClick={() => setIsOpen(false)}
        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Add New Task</h2>
        <p className="text-sm text-slate-500 mt-1">Create a new task to track progress.</p>
      </div>

      {/* Child Form */}
      <AddTaskForm
        onSuccess={() => setIsOpen(false)}
        onMessage={showToast}
        agents={agents}
        isAdmin={isAdmin}
      />
    </div>
  </div>
)}
```

---

### Pattern B: Detail & Feedback Drawer (`selectedTask` Drawer)

Used for inspecting item details, viewing thread activity, and submitting feedback.

```tsx
{selectedTask && (
  <div
    className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
    onClick={() => setSelectedTask(null)} // Click outside backdrop closes modal
  >
    <div
      className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-xl p-6 relative mx-auto my-8 max-h-[90vh] flex flex-col"
      onClick={(e) => e.stopPropagation()} // Prevents inner container clicks from closing modal
    >
      {/* Close Icon Button */}
      <button
        onClick={() => setSelectedTask(null)}
        className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header & Meta */}
      <div className="mb-4 pr-8">
        <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">{selectedTask.title}</h2>
      </div>

      {/* Scrollable Content Body */}
      <div className="space-y-4 overflow-y-auto flex-1 pr-1">
        {/* Metadata Grid, Description & Feedback Thread */}
      </div>
    </div>
  </div>
)}
```

---

## 3. Key Design & Technical Specifications

| Feature | Implementation | Details |
| :--- | :--- | :--- |
| **Backdrop Container** | `fixed inset-0 z-50 bg-black/60` | Fullscreen fixed overlay with 60% black opacity. |
| **Centering & Layout** | `flex items-center justify-center p-4 overflow-y-auto` | Flexbox centering, prevents viewport overflow. |
| **Card Styling** | `bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl` | Full light & dark mode support, rounded corners. |
| **Max Constraints** | `w-full max-w-lg` (Form) / `max-w-xl max-h-[90vh]` (Drawer) | Responsive max widths and viewport height bounds. |
| **Backdrop Dismiss** | `onClick={() => setSelectedTask(null)}` | Outer backdrop click closes modal. |
| **Event Propagation** | `onClick={(e) => e.stopPropagation()}` | Inner container click event propagation is stopped. |

---

## 4. Strengths & Limitations of Current System

### Strengths
- **Zero Heavy Dependencies**: No external dialog libraries required, keeping bundle size small.
- **Fast Execution**: Pure React state (`useState`) without complex provider context setups.
- **Tailwind Native**: Styled seamlessly with existing application color palette and dark mode tokens.

### Limitations / Potential Improvements
- **Accessibility (ARIA)**: Lacks native `role="dialog"`, `aria-modal="true"`, and automatic screen reader focus trapping (`focus-trap`).
- **Keyboard Navigation**: Pressing `Escape` to close is not bound by default unless explicitly added via `useEffect` event listener.
- **Portal Rendering**: Rendered inside the component tree rather than at document `body` level via React `createPortal`.

---

## 5. Upgrade & Refactoring Options (For Future Consideration)

If you decide to refactor or standardize the modal system across the application, here are the two recommended approaches:

1. **Option 1: Add `@radix-ui/react-dialog` Primitives**
   - Provides accessible `Dialog.Root`, `Dialog.Portal`, `Dialog.Overlay`, `Dialog.Content`, `Dialog.Title`, and automatic focus trapping.
2. **Option 2: Create Reusable `@/components/ui/modal.tsx` Wrapper**
   - Wrap the existing backdrop overlay pattern into a single reusable `<Modal isOpen onClose title>` component with React `createPortal` and an `Escape` key event listener.
