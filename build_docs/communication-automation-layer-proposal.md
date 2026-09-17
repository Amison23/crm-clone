# Cloudora CRM — Communication & Automation Layer
## Architecture Proposal (Reviewed)

**Status:** Reviewed and locked for implementation. Do not deviate from the decisions below without a new review cycle.

**Scope boundary:** This phase covers *outbound* communication only. Staff company-domain email enforcement is explicitly **out of scope** — separate phase, separate ticket. Gmail/Outlook mailbox sync is existing, read-only, and must not be modified unless a genuine integration point is required.

---

## 1. Architectural boundary

- **Existing (untouched):** Gmail/Outlook OAuth → reads mailbox activity → CRM email history/activity timeline.
- **New:** CRM Event → Communication Layer → Channel (email, in-app now; WhatsApp/SMS/push later).
- Outbound sending never requires a recipient or internal user to have connected Gmail/Outlook.

## 2. Tenancy decision (resolved)

The existing CRM has **partial, inconsistent** multi-tenancy — some tables carry `tenant_id`, some don't — despite the product being intended as single-tenant. This is pre-existing debt, not a requirement of this phase.

**Decision:** New tables in this phase are **single-tenant** — no `tenant_id`, no cross-tenant RLS logic.

**Known future dependency (not solved now):** If the existing partial multi-tenancy is ever completed elsewhere in the app, someone will need to revisit whether `communication_events` / `communication_log` need backfilling with tenant scoping. Flag this in the codebase (comment + this doc) so it isn't forgotten.

## 3. Event model

`communication_events`
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| event_type | text | e.g. `customer.created`, `ticket.status_changed` — enumerate from actual existing domain events during implementation, do not invent events the app doesn't have |
| entity_type | text | e.g. `customer`, `ticket` |
| entity_id | uuid | |
| payload | jsonb | snapshot of relevant data at event time |
| created_at | timestamptz | |

A dispatcher process reads new events and matches them against active templates/rules per channel. Trigger code only ever writes an event row — it never calls a channel directly. This is what makes retries, audit, and future n8n subscription possible without touching trigger call sites later.

## 4. Templates

`communication_templates`
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| event_type | text | |
| channel | text | `email` \| `in_app` (extensible) |
| subject | text | nullable for non-email channels |
| body_html | text | |
| body_text | text | |
| variables | jsonb | expected placeholder keys, for validation |
| active | boolean | |
| created_at / updated_at | timestamptz | |

**No versioning table in v1.** Editing a template edits in place; `communication_log` does not retain a content snapshot. This is a known trade-off — if a template is edited after being used, historical "what did this email actually say" audit is not reconstructable from the DB. Acceptable per product decision; revisit only if a compliance/dispute need arises.

## 5. Delivery & idempotency

`communication_log`
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| event_id | uuid fk | |
| template_id | uuid fk | |
| channel | text | |
| recipient | text | |
| status | enum | queued, sent, delivered, bounced, failed |
| provider_message_id | text | Resend's ID, for webhook correlation |
| idempotency_key | text unique | `hash(event_id + template_id + recipient)` |
| attempt_count | int | |
| created_at / updated_at | timestamptz | |

- Before sending, look up `idempotency_key`. If a row exists with status `sent`/`delivered`, no-op.
- Resend webhook endpoint updates `status` on delivery/bounce/complaint events. **Signature verification required** on the webhook endpoint — do not trust unsigned payloads.
- Provider API acceptance (200 from Resend) sets status `sent`, never `delivered`. `delivered` only comes from the webhook.

**Local dev gap:** Resend webhooks require a public URL. Localhost development will not receive delivery-status updates without a tunnel (ngrok / Cloudflare Tunnel / similar). Set this up before relying on delivery tracking in dev — otherwise every message will appear stuck at `sent`.

## 6. In-app notifications

`notifications`
| column | type | notes |
|---|---|---|
| id | uuid pk | |
| recipient_id | uuid fk (user) | |
| title | text | |
| message | text | |
| entity_type / entity_id | text / uuid | for deep-linking |
| read | boolean | |
| created_at | timestamptz | |

- Delivered via **Supabase Realtime** (`postgres_changes` subscription), not polling.
- RLS: `recipient_id = auth.uid()` — since this phase is single-tenant, no additional tenant filter is needed. If multi-tenancy is ever completed elsewhere, this RLS policy is the first place to revisit.
- Separate table from `communication_log` — a notification is a channel *outcome*, not the source of truth for whether an event fired.
- If an existing notification system/table is found during inspection, extend it rather than introduce a second one — confirm shape compatibility with the schema above before diverging.

## 7. n8n boundary

- Not currently integrated (confirmed).
- `communication_events` optionally fires a fire-and-forget outbound webhook so n8n can subscribe later.
- Core email/in-app sending must never block on or depend on this webhook succeeding. n8n is additive, not load-bearing.

## 8. Security checklist

- Resend API key server-side only, never exposed to frontend.
- Authorization check on every action that can trigger a communication (no arbitrary user can fire an event at an arbitrary recipient).
- Webhook signature verification on the Resend delivery-status endpoint.
- No sensitive email body content logged in plaintext beyond what `communication_log` needs for audit.
- Idempotency key prevents duplicate sends on retry (see §5).
- Bulk-send rate limiting: **deferred** — no current use case sends to more than one recipient per event. Revisit if/when a bulk "notify all agents" style event is actually introduced.

## 9. Explicitly out of scope for this phase

- Staff company-domain email enforcement (separate phase).
- Mailbox provisioning via Google Workspace/M365 (separate, requires external provider decision).
- Template versioning/history.
- Multi-tenant scoping on new tables (see §2).
- Full n8n automation platform (webhook boundary only).

---

## Definition of Done

- [ ] `communication_events`, `communication_templates`, `communication_log`, `notifications` migrations created and applied, matching schemas above (no `tenant_id` columns).
- [ ] Dispatcher reads new `communication_events` rows and resolves matching active templates per channel.
- [ ] Email send path goes through `communication_log` with idempotency check before calling Resend.
- [ ] Resend webhook endpoint implemented, signature-verified, updates `communication_log.status`.
- [ ] `notifications` table wired to Supabase Realtime; a test notification appears client-side without page refresh.
- [ ] RLS confirmed on `notifications` (`recipient_id = auth.uid()`) with pasted evidence (e.g., a failed cross-user read attempt).
- [ ] At least one real event from the existing domain model (inspected, not invented) wired end-to-end: event fires → template resolves → email sends → log status updates → activity timeline shows it.
- [ ] Local dev webhook reachability addressed (tunnel configured) or explicitly deferred with a note.
