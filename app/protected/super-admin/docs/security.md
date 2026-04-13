# Super Admin: Security & Compliance

The Super Admin module is the platform's highest privilege tier and adheres to strict security standards.

## Authorization & RBAC

The base role for access is `superadmin`.

### Identity Verification
The `checkSuperAdmin` utility verifies identity via Supabase Auth and checks the `employees` table:
```typescript
export async function checkSuperAdmin(supabase: any) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;
  
  const { data: profile } = await supabase
    .from("employees")
    .select("role")
    .eq("id", user.id)
    .single();

  return profile?.role === "superadmin";
}
```

## Immutable Audit Logging

Every change made through a Super Admin Server Action is recorded in the `audit_logs` table.

### Logged Data
- **`actor_id`**: The UUID of the admin who performed the change.
- **`action`**: A string representing the operation (e.g., `CREATE_TENANT`, `UPDATE_PERMISSION`).
- **`entity_type`**: The target table (e.g., `company`, `employee`).
- **`entity_id`**: The UUID of the affected row.
- **`payload`**: JSONB content including the `prev` and `next` states for diffing.

## Zero Trust Tenant Isolation

Even though Super Admins have global visibility, the platform enforces data isolation for all other roles using **PostgreSQL Row Level Security (RLS)**.

### Policy Rules
1.  **Isolation**: Standard tenants cannot `SELECT` or `DML` any row not belonging to their `company_id`.
2.  **Triggers**: Database-level triggers prevent manual `company_id` spoofing by overwriting any provided `company_id` with the authenticated user's actual `company_id`.
3.  **Encrypted Transport**: All communication between the app and Supabase is encrypted via TLS.
4.  **JWT Verification**: Supabase automatically verifies the JWT for every request.
