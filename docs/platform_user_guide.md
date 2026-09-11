# Platform User Guide

Welcome to your new CRM workspace! This guide will help you understand how to navigate the platform, manage your daily workflows, and utilize your role-specific tools.

## 1. Getting Started

### Logging In
1. Navigate to the login page.
2. Enter your email and password.
3. If you have Multi-Factor Authentication (MFA) enabled, you will be prompted to enter your authenticator code.
4. Upon successful login, you will be directed to your **Main Dashboard**.

### Account Recovery & Password Reset
If you forget your password:
- Click **"Forgot Password?"** on the login screen.
- Enter your email address to receive a secure recovery link.
- Click the link in your email to be securely redirected to the Update Password screen.
- *(Note: Admins can also manually generate and email you a new temporary password from their dashboard).*

---

## 2. The Main Dashboard (`/protected`)
When you log in, the system automatically detects your **Role** and **Company Workspace**. 

The dashboard provides a personalized snapshot of your day:
- **Greeting & Status:** Confirms your active role (e.g., "Sales Agent · Active").
- **Metrics Row:** Displays your most important stats (e.g., "My Leads", "Pending Tasks", "Open Tickets").
- **Quick Access Grid:** A menu of modules (like Tickets, Tasks, or CRM) that you have permission to use.
- **Session Sidebar:** Displays your User ID, verified access status, and your assigned Platform/Company.

---

## 3. Workspaces by Role

Your experience is tailored to your job function. You will only see the tools you need.

### 📈 Sales Agents (`sales_agent`)
- **My Workspace:** Your primary hub for daily activities.
- **CRM Leads Table:** View, filter, and manage your pipeline. You can add new leads, update their statuses (e.g., New, Contacted, Qualified), and export data.
- **Lead 360 Profile:** Click on any lead to see their full interaction history, notes, and associated deals.

### 🏢 Company Admins (`admin`)
- **Company Admin Panel:** Manage your organization's settings.
- **Agent Management:** Invite new employees, assign them roles, or reset their passwords.
- **Executive Dashboard:** View high-level KPIs, total company pipeline revenue, and agent performance throughput.

### 🛠️ Server / Support Admins (`server_admin`)
- **Support Tickets:** Access the incident resolution queue. New tickets submitted by customers are often auto-assigned to you.
- **Server Node:** Monitor infrastructure health, system logs, and manage technical operations.

### 🌐 Global Super Admins (`superadmin`)
> **Note:** The Superadmin "Global Command" module is currently a Work-in-Progress (WIP).

The Global Command portal allows platform owners to manage multiple tenant companies, oversee global analytics, configure platform-wide permissions, and audit system logs.

**Everyday Administrative Tasks:**
- **Onboarding a New Company:** Go to `/protected/super-admin/tenants` -> click "Add New Tenant".
- **Offboarding a Company:** You can either *Archive* (soft delete, preserves data) or *Purge* (permanently deletes, use with caution).
- **Adjusting User Roles:** In the Users page, search for a user and click "Edit Role".
- **Telephony & SIM Port Management:** Go to `/protected/super-admin/telephony` to provision virtual numbers and map them to SIM ports and gateways.
- **Global RBAC:** Go to `/protected/super-admin/permissions` to toggle Read/Write/Delete access for modules across all tenants in real-time.

---

## 4. Managing Tasks & SLA Objectives
**Module:** `Task Management Board`

The Task Board helps you stay on top of your daily obligations.
- **Creating Tasks:** Assign tasks to yourself or team members, set due dates, and define priorities.
- **Tracking Progress:** Move tasks through statuses (Pending, In Progress, Completed).
- **Archiving:** Completed tasks can be archived. The system also features an automated archiving engine to keep your active board clean.

---

## 5. Support Tickets
**Module:** `Support Tickets`

A fully integrated ticketing system for resolving internal or customer-facing issues.
- **Creation:** Customers or agents can raise tickets with priority levels.
- **Audit Logs:** Every status change, assignment, and comment is permanently logged in the ticket's history for full transparency.
- **Resolution:** Once an issue is solved, mark it as "Closed". Customers can leave satisfaction ratings on closed tickets.

---

## 6. Settings & Profile
Click on the **Settings** icon in your sidebar to manage your personal account:
- Update your display name.
- Enroll in Multi-Factor Authentication (MFA) for added security.
- Adjust your UI theme preferences (Light/Dark mode).

---

## Need Help?
If you encounter any issues or need a permission upgrade, please contact your **Company Admin** or submit a Support Ticket directly through the platform.
