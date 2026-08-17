# Email & Notification Infrastructure Roadmap

## 1. Overview

The notification infrastructure is centered around a generic, role-agnostic notification service defined in [`lib/notifications/email.ts`](file:///c:/Users/mbugu/Desktop/Code/React/crm-clone/lib/notifications/email.ts).

### Core Function Signature & Interface

```typescript
export interface EmailNotificationPayload {
  recipientEmail: string;
  recipientName?: string;
  eventType: 'LEAD_REASSIGNED' | 'TASK_ASSIGNED' | 'TICKET_UPDATED' | 'SYSTEM_ALERT' | string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export async function sendNotificationEmail(
  payload: EmailNotificationPayload
): Promise<{ success: boolean; messageId?: string; error?: string }>;
```

Because `sendNotificationEmail` accepts a generic `eventType` string and metadata record rather than hardcoded agent-specific fields, any component or background worker across all system roles can dispatch notifications without modifying the service contract.

---

## 2. Future Role Notification Use-Cases

The following cross-role email notification requirements are planned for expansion as system features scale:

### Super Admin
- **Security & Auth Alerts**: Suspicious login attempts, superadmin password resets, RBAC privilege modifications.
- **Tenant Lifecycle Events**: New tenant registration, subscription renewal, tenant account suspension or deletion.
- **Global System Alerts**: Critical database migration failures, storage threshold warnings.

### Admin (Org Level)
- **User Onboarding**: Notifications when new agents or server admins accept org invitations or are created.
- **Org Usage & Limits**: Reaching 80%+ of assigned seat limit, lead quota limits, or bot builder invocation limits.
- **Performance Summaries**: Weekly org activity digests and high-priority lead assignment updates.

### Server Admin
- **Ticket Escalations & SLA Breaches**: Immediate notification when a critical tier customer ticket is unassigned or exceeds response SLA.
- **Staff Chat Escalations**: Notification when an internal staff message is flagged for administrative review.
- **Org Telemetry Alerts**: Alerts for high error rates or service disruptions in their assigned organization.

### Sales Agent (Phase 2 Baseline + Enhancements)
- **Lead Events**: Reassignment of high-value lead, lead status changed to 'Won'/'Lost'.
- **Task Reminders**: Daily digest of overdue or upcoming tasks (`TASK_ASSIGNED`, `TASK_DUE`).
- **Omnichannel Inbox**: Email notice for unread customer messages after 15 minutes of inactivity.

### Dev
- **Error Spikes**: Automatic alerts triggered by unhandled API errors or unexpected runtime exceptions.
- **Build & Integration**: Webhook failure notices or API key expiration warnings.

---

## 3. Best Practices for Future Expansion

1. **Avoid Duplicating Email Logic**: All triggers must call `sendNotificationEmail(...)` from `@/lib/notifications/email`.
2. **Template Expansion**: Transition from plain text/HTML strings to standard email templates (e.g. React Email or Mustache templates) passed via `metadata`.
3. **Queueing & Async Dispatch**: As email volume grows, wrap `sendNotificationEmail` in a background job queue (e.g. Supabase Edge Functions or background queue worker) to prevent blocking main UI requests.
