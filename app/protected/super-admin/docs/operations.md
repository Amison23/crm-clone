# Super Admin: Operation Manual

This guide provides step-by-step instructions for everyday administrative tasks within the Super Admin module.

## 🏢 Tenant (Company) Management

The **Tenants** page is the starting point for managing the platform's multi-tenant ecosystem.

### Onboarding a New Company
1.  Navigate to `/protected/super-admin/tenants`.
2.  Click **"Add New Tenant"**.
3.  Enter the company name and any metadata.
4.  Once created, the company will be assigned a unique `UUID`.

### Offboarding a Company
You have two options for offboarding:
-   **Archive**: Sets `deleted_at`, which hides the tenant from standard views but preserves data.
-   **Purge**: Permanently deletes the tenant and all associated data. **Use with caution.**

---

## 👥 User & Role Management

The **Users** page manages all accounts across all companies.

### Adjusting User Roles
1.  Search for the user by email or name.
2.  Click **"Edit Role"**.
3.  Select the desired role (`superadmin`, `admin`, `sales_agent`, etc.).
4.  **Note**: Promoting a user to `superadmin` gives them global access.

### Reassigning a User
If a user moves to a different company, update their `Company ID` in the user edit dialog.

---

## 📞 Telephony & SIM Port Management

Managed via the **Telephony** submodule.

### Provisioning a Virtual Number
1.  Navigate to `/protected/super-admin/telephony`.
2.  Click **"Provision Virtual Number"**.
3.  Enter the number and assign it to a company.
4.  (Optional) Link it to an active `SIM Port`.

### Gateway Configuration
1.  Add a new gateway by providing a name and **Static IP Address**.
2.  Gateways serve as the central nodes for telephony traffic.

---

## 🔐 RBAC (Permissions) Configuration

The **Permissions** grid allows you to set global access rules.

### Defining Role Access
1.  Navigate to `/protected/super-admin/permissions`.
2.  Select a role (e.g., `sales_agent`).
3.  Toggle `Read`, `Write`, `Delete`, and `Export` permissions for each core module (e.g., `Clients`, `Leads`, `Calendar`).
4.  Changes are applied in **real-time** across the entire platform.
