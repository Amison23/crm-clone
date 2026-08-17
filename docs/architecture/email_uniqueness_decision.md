# Architectural Decision Record (ADR): Global Case-Insensitive Email Uniqueness

## Status
Accepted

## Context
In a multi-tenant CRM application, user accounts interact across roles (Super Admin, Admin, Sales Agent, Server Admin, Dev, Client). Allowing identical email addresses under different letter cases (e.g. `user@company.com` vs `User@company.com`) or allowing identical email addresses across separate organization scopes creates severe security risks:
1. **Account Takeover & Identity Confusion**: Impersonation by signing up with a different casing or organization scope.
2. **Authentication Ambiguity**: Supabase Auth normalizes email addresses centrally. If the application allows case variations or per-org duplicates in custom tables, queries can return ambiguous profiles or fail to join correctly.
3. **Communication Failures**: System notification emails dispatched to raw email inputs could reach unexpected recipients.

## Decision
1. **Global Uniqueness**: Email uniqueness is enforced **globally across all tenants/organizations**. A given email address identifies a single unique user account across the entire system platform.
2. **Case-Insensitive Normalization**: All email addresses are normalized using `normalizeEmail()` (trim whitespace + convert to lowercase) at every system entry point (signup, login, admin user provisioning, forgot password, tenant creation, and API endpoints).
3. **Database-Level Enforcement**: A case-insensitive unique index (`CREATE UNIQUE INDEX ... ON employees(LOWER(email_address))`) enforces this policy at the storage engine layer.
4. **Atomic Conflict Resolution**: User creation flows rely on `INSERT`-then-catch-conflict (`23505` constraint violation) rather than non-atomic check-then-insert loops to eliminate race conditions under concurrent requests.
5. **Clear Error Messaging & Bot Verification**: UI entry points provide intuitive, user-friendly error messages (e.g. "An account with this email address already exists. Please login or reset your password.") and verification UI controls to prevent spam signups.
