# Comprehensive CRM UI & Architecture Audit Report (`analysis_ui.md`)

This document provides a complete audit of all user interface pages, design system consistencies, data query scoping, and dynamic server rendering configurations across the entire CRM platform.

---

## 1. Executive Summary & Design System Standards

### 🎨 Target Design System Language
- **Background Palette**: Soft neutral slate (`bg-slate-50/50` light mode / `bg-slate-950` dark mode).
- **Cards & Containers**: Clean rounded borders (`rounded-3xl` or `rounded-2xl`, `border border-slate-200/80 dark:border-slate-800`, `shadow-sm`).
- **Primary Color Accents**: Indigo (`indigo-600`), Emerald (`emerald-500`), Slate (`slate-900`/`white`).
- **Typography & Hierarchy**: Inter / Outfit bold headings (`font-black tracking-tight`), uppercase tracking-wider subheaders (`text-[10px] uppercase tracking-wider text-slate-400`).
- **Data Density**: High-density structured tables with clear headers, status pills, and interactive filter controls.

### ⚠️ Inconsistencies & Legacy Anti-Patterns Audited
1. **Standalone "Futuristic" Styling**: Some legacy pages (e.g. older versions of `/protected/sales-agent` and `/protected/server-admin`) used dark neon glow borders, "Node ID" sci-fi text, and non-actionable charts instead of real daily tables.
2. **Missing Dynamic Render Directives**: Several server component routes lacked `export const dynamic = "force-dynamic"` and `export const revalidate = 0`, causing Vercel builds to serve stale static HTML instead of fetching live database updates on route load.
3. **Role Scoping Gaps**: Some pages queried data strictly by single `user.id`, causing Admins/Superadmins inspecting operator pages to see empty `0` results.

---

## 2. Page-by-Page Audit & Technical Status

### 📱 Route 1: Portal Home (`/protected`)
- **File**: `app/protected/page.tsx`
- **Role Access**: `superadmin`, `admin`, `sales_agent`, `dev`, `server_admin`
- **Design System Compliance**: ✅ High. Uses modern clean greeting, stats row, and module quick links.
- **Dynamic Render**: ✅ Configured with live database fallback.
- **Query Scoping**: ✅ Role-aware stats queries for superadmin, admin, and agent.

---

### 📱 Route 2: Sales Agent Workspace (`/protected/sales-agent`)
- **File**: `app/protected/sales-agent/page.tsx`
- **Role Access**: `sales_agent`, `admin`, `superadmin`, `dev`
- **Design System Compliance**: ✅ Recently updated. Replaced sci-fi glow widgets with Actionable Tasks Table, Assigned Leads Pipeline, and Support Tickets.
- **Dynamic Render**: ✅ `export const dynamic = "force-dynamic"; export const revalidate = 0;` added.
- **Query Scoping**: ✅ Dual-scoped: `sales_agent` sees personal assigned data; `admin`/`superadmin` see company-wide data.

---

### 📱 Route 3: CRM Leads Pipeline (`/protected/crm-leads-table`)
- **File**: `app/protected/crm-leads-table/page.tsx` & `components/crm/leads-client-wrapper.tsx`
- **Role Access**: `sales_agent`, `admin`, `superadmin`
- **Design System Compliance**: ✅ High. Structured table with filters (Status, Agent, Source), bulk CSV upload, and assigned tasks summary banner.
- **Dynamic Render**: ✅ `export const dynamic = "force-dynamic"; export const revalidate = 0;` added.
- **Query Scoping**: ✅ Fetches `getLeads()` and `getTasks()` in parallel; admin view includes agent assignment selector.

---

### 📱 Route 4: Task Management Board (`/protected/task-management-board`)
- **File**: `app/protected/task-management-board/page.tsx` & `components/crm/tasks-client-wrapper.tsx`
- **Role Access**: `sales_agent`, `admin`, `superadmin`, `dev`, `server_admin`
- **Design System Compliance**: ✅ High. Kanban task status columns (`To Do`, `In Progress`, `Review`, `Completed`) with add task modal.
- **Dynamic Render**: Needs verification for `export const dynamic = "force-dynamic"`.
- **Query Scoping**: ✅ `getTasks()` filters by `assigned_to` for agents and company-wide for admins.

---

### 📱 Route 5: Support Desk (`/protected/tickets`)
- **File**: `app/protected/tickets/page.tsx` & `components/tickets/TicketTable.tsx`
- **Role Access**: `sales_agent`, `admin`, `superadmin`, `dev`, `server_admin`
- **Design System Compliance**: ✅ High. Clean ticket table with status pills (`open`, `in_progress`, `closed`), search, and priority badges.
- **Dynamic Render**: Needs verification for `export const dynamic = "force-dynamic"`.
- **Query Scoping**: ✅ Admin/Superadmin see all company tickets; agents see assigned tickets.

---

### 📱 Route 6: Executive Dashboard (`/protected/executive-dashboard`)
- **File**: `app/protected/executive-dashboard/page.tsx`
- **Role Access**: `admin`, `superadmin` (Redirects `sales_agent` to `/protected/sales-agent`)
- **Design System Compliance**: ✅ High. Revenue yield summary cards, win-rate charts, and executive insights.
- **Dynamic Render**: Needs verification for `export const dynamic = "force-dynamic"`.
- **Query Scoping**: ✅ Company/tenant scoped.

---

### 📱 Route 7: Superadmin Command Console (`/protected/super-admin`)
- **File**: `app/protected/super-admin/page.tsx` & subroutes (`/users`, `/analytics`, `/logs`, `/settings`)
- **Role Access**: `superadmin` only
- **Design System Compliance**: ✅ High. Multi-tenant company switcher, employee management table, audit logs viewer, and password reset trigger modals.
- **Dynamic Render**: ✅ Server actions with `revalidatePath`.
- **Query Scoping**: ✅ Platform-wide unconstrained query access.

---

### 📱 Route 8: Dev Workspace (`/protected/dev`)
- **File**: `app/protected/dev/page.tsx` & `components/dev/DevWorkspaceView.tsx`
- **Role Access**: `dev`, `superadmin`
- **Design System Compliance**: ✅ High. Includes developer task board, API telemetry, and internal chat access.
- **Dynamic Render**: Needs verification for `export const dynamic = "force-dynamic"`.
- **Query Scoping**: ✅ Scoped to developer assigned tasks and company environment.

---

### 📱 Route 9: Omnichannel Chat Inbox (`/protected/omnichannel-chat-inbox`)
- **File**: `app/protected/omnichannel-chat-inbox/page.tsx`
- **Role Access**: `sales_agent`, `admin`, `superadmin`, `dev`, `server_admin`
- **Design System Compliance**: ✅ High. Two-column messaging interface with real-time room list and chat input.
- **Dynamic Render**: Client-side dynamic state with Supabase Realtime subscriptions.

---

## 3. Recommended Multi-Phase Alignment Plan

Use this structure when crafting comprehensive prompt instructions:

```markdown
Phase 1: Dynamic Route Directives Audit
- Audit all page.tsx files under /app/protected/... to ensure `export const dynamic = "force-dynamic"` and `export const revalidate = 0` are exported.

Phase 2: Complete UI Design System Polish
- Standardize all borders, cards, button shapes, and typography across remaining legacy routes to match the Slate/Indigo design language.

Phase 3: Role-Based Query & Navigation Double Check
- Verify that every workspace route correctly displays relevant data when viewed by both Sales Agents and Admins/Superadmins inspecting the page.
```
