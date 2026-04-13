# Super Admin: Database Schema

The module manages several core tables for platform-wide data and infrastructure.

## Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    COMPANIES ||--o{ EMPLOYEES : "has"
    COMPANIES ||--o{ VIRTUAL_NUMBERS : "assigned"
    EMPLOYEES ||--o{ AUDIT_LOGS : "performs"
    GATEWAYS ||--o{ SIM_PORTS : "connects"
    SIM_PORTS ||--o{ VIRTUAL_NUMBERS : "links"
    ROLE_PERMISSIONS }o--|| MODULES : "governs"

    COMPANIES {
        uuid id PK
        text name
        timestamp deleted_at
    }

    EMPLOYEES {
        uuid id PK
        uuid company_id FK
        text full_name
        text role
    }

    AUDIT_LOGS {
        uuid id PK
        uuid actor_id FK
        text action
        text entity_type
        uuid entity_id
        jsonb payload
    }

    GATEWAYS {
        uuid id PK
        text name
        text ip_address
    }

    SIM_PORTS {
        uuid id PK
        uuid gateway_id FK
        uuid company_id FK
        text phone_number
    }

    VIRTUAL_NUMBERS {
        uuid id PK
        uuid company_id FK
        uuid sim_port_id FK
        text number
    }

    ROLE_PERMISSIONS {
        text role PK
        text module PK
        boolean can_read
        boolean can_write
        boolean can_delete
        boolean can_export
    }

    SYSTEM_SETTINGS {
        text key PK
        jsonb value
    }
```

## Table Definitions

### `companies` (Tenants)
The core tenant table. `deleted_at` is used for soft-deletion and archiving.

### `employees` (Users)
Users of the platform. The `role` column (`superadmin`, `admin`, `sales_agent`, `call_center_agent`, `technician`) determines permissions.

### `audit_logs`
A global immutable table for tracking administrative changes.

### `gateways` & `sim_ports`
Telephony infrastructure components. `sim_ports` are mapped to specific companies.

### `virtual_numbers`
The public-facing numbers assigned to tenants.

### `role_permissions`
Cross-tenant RBAC configuration. Defines which roles can access which modules.

### `system_settings`
Global configuration key-value pairs (e.g., `maintenance_mode`, `support_email`).
