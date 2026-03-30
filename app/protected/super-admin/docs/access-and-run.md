# Super Admin: Access & Running Tests

How to navigate and verify the functionality of the highest privilege tier in the CRM Tool.

## Accessing the Module

The module is located in the **protected** routing segment of the Next.js application.

### Target URL
`https://[domain]/protected/super-admin`

### Required Authentication
1.  **Login**: Use the platform's authentication provider.
2.  **Role**: Ensure your user in the `employees` table has `role = 'superadmin'`.
3.  **Permissions**: Access is granted globally to this role.

### Development Credentials
For testing purposes in a development/staging environment, use the following:
- **Email**: `admin@momentum-crm.com`
- **Password**: `Momentum2026!`
- **Setup**: Run `app/protected/super-admin/scripts/seed-superadmin.sql` in the Supabase SQL Editor to initialize this user.

---

## Verifying Functionality

Several scripts and tests are available to ensure the Super Admin module and its associated RLS policies are working correctly.

### Automated RLS Verification Script
Run the `rls-test.ts` to verify that tenants are isolated and the Super Admin has global access.

**Run via command line:**
```bash
npx vitest app/protected/super-admin/tests/rls-test.ts
```

### Database Verification Suite
Run the `verify-superadmin.sql` script directly in the Supabase SQL Editor.

**Run via SQL Editor:**
1.  Copy the content of `app/protected/super-admin/scripts/verify-superadmin.sql`.
2.  Paste it into the Supabase SQL Editor.
3.  **Expectation**: The resulting tables should show correct role isolation and auto-assignment triggers.

---

## Technical Support
For issues related to the Super Admin module, contact the platform development team at `dev@crm-tool.internal`.
