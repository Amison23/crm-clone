# CRM Platform Database Schema

This document outlines the complete PostgreSQL database schema for the CRM platform, powered by Supabase.

## Complete Entity Relationship Diagram (ERD)

```mermaid
erDiagram
    %% Core Tenancy & Auth
    COMPANIES ||--o{ EMPLOYEES : "employs"
    COMPANIES ||--o{ LEADS : "owns"
    COMPANIES ||--o{ TASKS : "owns"
    COMPANIES ||--o{ TICKETS : "owns"
    COMPANIES ||--o{ CHAT_MESSAGES : "owns"
    
    %% Users & Profiles
    EMPLOYEES ||--o{ LEADS : "assigned to"
    EMPLOYEES ||--o{ TASKS : "assigned to/created by"
    EMPLOYEES ||--o{ TICKETS : "assigned to"
    EMPLOYEES ||--o{ TICKET_COMMENTS : "authors"
    EMPLOYEES ||--o{ CHAT_MESSAGES : "sends/receives"
    EMPLOYEES ||--o{ AGENT_PRODUCTS : "assigned"
    
    %% CRM & Tasks
    TASKS ||--o{ TASK_FEEDBACK : "has"
    TICKETS ||--o{ TICKET_COMMENTS : "has"
    
    %% Products
    PRODUCTS ||--o{ AGENT_PRODUCTS : "linked via"

    %% Infrastructure & Global
    COMPANIES ||--o{ VIRTUAL_NUMBERS : "assigned"
    GATEWAYS ||--o{ SIM_PORTS : "connects"
    SIM_PORTS ||--o{ VIRTUAL_NUMBERS : "links"
    EMPLOYEES ||--o{ AUDIT_LOGS : "performs"
    ROLE_PERMISSIONS }o--|| MODULES : "governs"

    COMPANIES {
        uuid id PK
        text name
        text slug
        timestamp deleted_at
    }

    EMPLOYEES {
        uuid id PK
        uuid company_id FK
        text full_name
        text email_address
        text role
    }

    PROFILES {
        uuid id PK
        uuid company_id
        text full_name
        text role
    }

    LEADS {
        uuid id PK
        uuid company_id FK
        uuid employee_id FK
        text first_name
        text last_name
        text email
        text phone
        text status
        number potential_value
    }

    TASKS {
        uuid id PK
        uuid company_id FK
        uuid assigned_to FK
        text title
        text status
        timestamp due_date
        timestamp archived_at
    }

    TASK_FEEDBACK {
        uuid id PK
        uuid task_id FK
        uuid author_id FK
        text message
    }

    TICKETS {
        uuid id PK
        uuid company_id FK
        uuid assigned_to FK
        text title
        text status
        text priority
    }

    TICKET_COMMENTS {
        uuid id PK
        uuid ticket_id FK
        uuid author_id FK
        text content
    }

    CHAT_MESSAGES {
        uuid id PK
        uuid company_id FK
        uuid sender_id FK
        uuid receiver_id FK
        text message
    }

    PRODUCTS {
        uuid id PK
        text name
        text api_key
    }

    AGENT_PRODUCTS {
        uuid id PK
        uuid agent_id FK
        uuid product_id FK
    }

    AUDIT_LOGS {
        uuid id PK
        uuid actor_id FK
        text action
        text entity_type
    }

    ROLE_PERMISSIONS {
        uuid id PK
        text role
        text module
        boolean can_read
        boolean can_write
    }

    SYSTEM_SETTINGS {
        text key PK
        jsonb value
    }

    ANALYTICS_SNAPSHOTS {
        uuid id PK
        uuid tenant_id FK
        number leads_count
        number conversion_rate
    }
    
    GATEWAYS {
        uuid id PK
        text name
        text ip_address
    }
    
    SIM_PORTS {
        uuid id PK
        text phone_number
        uuid company_id FK
    }
    
    VIRTUAL_NUMBERS {
        uuid id PK
        text number
        uuid company_id FK
    }
```

## Table Definitions & Purpose

### 1. Tenancy & Authorization
- **`companies`**: The core tenant table. Every record in the system belongs to a company to enforce strict Row-Level Security (RLS) isolation.
- **`employees`**: Maps Supabase Auth UUIDs to a specific `company_id` and assigns a `role` (`superadmin`, `admin`, `sales_agent`, `server_admin`, `dev`, `client`, `unassigned`).
- **`profiles`**: Public-facing read-only profile data mirroring employee state.

### 2. CRM & Sales
- **`leads`**: Customer Relationship pipeline records. Tracks contact info, assigned agent, status, and potential deal value.
- **`products` & `agent_products`**: Product catalog and the junction table mapping sales agents to the products they are authorized to sell/support.

### 3. Task Management
- **`tasks`**: Internal objectives and SLA tasks with due dates, assignees, and a complex 3-phase archiving lifecycle (`archived_at`, `unarchive_used`).
- **`task_feedback`**: Comments and updates left on specific tasks.

### 4. Support & Incidents
- **`tickets`**: Internal or customer-facing incident reports with status and priority tracking.
- **`ticket_comments`**: Audit trail of communication and resolution updates on a ticket.

### 5. Communication
- **`chat_messages`**: Real-time omnichannel chat messages tied to a specific company workspace.

### 6. Platform Infrastructure & Global (Super Admin)
- **`audit_logs`**: Immutable ledger of all destructive or sensitive administrative actions.
- **`role_permissions`**: Matrix configuration that defines cross-tenant RBAC permissions for various modules.
- **`system_settings`**: Global key-value store for platform configurations (e.g., maintenance mode).
- **`analytics_snapshots`**: Time-series snapshots of tenant performance (lead count, task completion rates) for the Executive Dashboard.
- **`gateways`, `sim_ports`, `virtual_numbers`**: Telephony infrastructure routing physical SIM ports to company-assigned virtual numbers.
