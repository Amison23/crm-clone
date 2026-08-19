# Password Reset Flow Migration Specification

Switch the password reset email flow in this project from Resend back to Supabase's default auth email service. Work in phases. After each phase, check it against that phase's Definition of Done, report the result, and stop for confirmation before starting the next phase.

---

## Phase 1 — Remove Resend from the Reset Action

### Tasks:
- In `app/protected/super-admin/actions.ts`, remove the call to `lib/email/resend.ts` inside `adminResetUserPassword`.
- Do **NOT** delete `lib/email/resend.ts` — just stop importing/calling it.

### Definition of Done:
- [x] No import or call of `lib/email/resend.ts` remains in `actions.ts`
- [x] `lib/email/resend.ts` file still exists, untouched
- [x] `adminResetUserPassword` still generates/sets the password successfully (logic untouched aside from email removal)
- [x] `npx tsc --noEmit` passes with 0 errors
- [x] Audit logging in `adminResetUserPassword` still fires as before

> **Note:** Do not proceed to Phase 2 until every box above is checked and reported.

---

## Phase 2 — Update the Modal UI

### Tasks:
- In `components/common/ResetPasswordModal.tsx`, remove or disable the "send automated transactional email" checkbox/option.
- Ensure the generated/custom password is clearly visible on-screen with a working Copy Credentials button.

### Definition of Done:
- [x] "Send automated email" checkbox no longer present or is disabled with no dead state tied to it
- [x] No unused state/props left behind from removing the email checkbox (e.g. no orphaned `sendEmail` boolean passed to the server action)
- [x] Generated password displays on-screen after generation
- [x] Copy Credentials button still copies the correct password
- [x] Component renders without console errors or TypeScript errors
- [x] `npx tsc --noEmit` passes with 0 errors

> **Note:** Do not proceed to Phase 3 until every box above is checked and reported.

---

## Phase 3 — Verify and Finalize

### Tasks:
- Confirm `components/forgot-password-form.tsx` and `app/auth/confirm/route.ts` use Supabase's native auth methods, not Resend.
- Provide a full summary of all changes.

### Definition of Done:
- [x] Confirmed `forgot-password-form.tsx` uses Supabase auth methods only (no Resend references)
- [x] Confirmed `app/auth/confirm/route.ts` uses Supabase auth methods only (no Resend references)
- [x] No remaining references to Resend anywhere in the password-reset-related flow except the untouched `lib/email/resend.ts` file itself
- [x] Final `npx tsc --noEmit` passes with 0 errors
- [x] Summary provided listing every file touched and what changed

---

## Constraints (Apply to All Phases):
- Do **not** modify Supabase redirect URL configuration or any DNS/domain settings — this is a code-level change only.
- Do **not** delete `lib/email/resend.ts`.