# Secure Booking, Payments, and Authentication Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add verified email/password and Google authentication, safe Razorpay payment reconciliation, sensible parcel limits, and a guided worldwide structured-address booking flow.

**Architecture:** Keep serviceability in Prisma while using a static worldwide geography directory for dependent selectors. Extend pricing with country-pair international rates, centralize validation, and make signed Razorpay webhooks an idempotent recovery path.

**Tech Stack:** Next.js App Router, TypeScript, Auth.js/NextAuth, Prisma/PostgreSQL, Zod, Razorpay, Resend, country-state-city, Vitest.

---

### Task 1: Shared parcel and pricing rules

**Files:**
- Create: `src/lib/orders/order-input.ts`
- Modify: `src/lib/pricing/rate-engine.ts`
- Test: `tests/order-input.test.ts`
- Test: `tests/rate-engine.test.ts`

- [ ] Write failing tests proving 200 cm/100 kg limits and international country-pair rate selection.
- [ ] Run `npm test -- tests/order-input.test.ts tests/rate-engine.test.ts` and confirm the new assertions fail for missing behavior.
- [ ] Implement shared Zod order validation and international rate selection with country codes.
- [ ] Re-run the focused tests and confirm they pass.

### Task 2: Service geography and international pricing persistence

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `prisma/migrations/20260702090000_secure_booking/migration.sql`
- Modify: `prisma/seed.ts`

- [ ] Add `State`, state-aware `City`, structured `Address` fields, `INTERNATIONAL` route type, and `InternationalRateCard`.
- [ ] Add migration SQL that preserves existing city/address/order data while introducing nullable transition fields safely.
- [ ] Seed Delhi and Maharashtra states plus India↔US test rate cards and a serviceable New York area.
- [ ] Run `npx prisma format`, `npx prisma validate`, and `npx prisma generate`.

### Task 3: Guided structured booking

**Files:**
- Modify: `src/app/(dashboard)/customer/orders/new/page.tsx`
- Modify: `src/components/order/order-form.tsx`
- Modify: `src/app/(dashboard)/customer/orders/actions.ts`
- Modify: `src/app/(dashboard)/customer/orders/[id]/page.tsx`
- Modify: `src/app/globals.css`

- [ ] Install `country-state-city`.
- [ ] Replace the single page form with Pickup → Delivery → Parcel → Review & Pay state while retaining one final server action.
- [ ] Filter configured service areas by selected country/state/city and block advancing when a city is unsupported.
- [ ] Use split address fields, client max attributes, and the shared server schema.
- [ ] Display structured addresses and international route pricing in order detail.

### Task 4: Verified credentials and Google sign-in

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/lib/auth.ts`
- Create: `src/lib/auth/email-verification.ts`
- Create: `src/lib/auth/send-verification-email.ts`
- Modify: `src/app/api/register/route.ts`
- Create: `src/app/api/auth/verify-email/route.ts`
- Create: `src/app/api/auth/resend-verification/route.ts`
- Create: `src/app/(auth)/verify-email/page.tsx`
- Modify: `src/app/(auth)/login/page.tsx`
- Modify: `src/app/(auth)/register/page.tsx`
- Modify: `.env.example`
- Test: `tests/email-verification.test.ts`

- [ ] Write and run failing OTP tests for hashing, expiry, and constant-time verification.
- [ ] Add optional password hashes, verified timestamps, OAuth accounts, and hashed OTP challenges.
- [ ] Add Google provider configuration and reject unverified credential logins.
- [ ] Send OTPs on registration, implement verify/resend endpoints, and add the verification screen.
- [ ] Add a Google sign-in button and clear unverified-account guidance.

### Task 5: Razorpay webhook reconciliation

**Files:**
- Modify: `src/lib/payments/razorpay.ts`
- Create: `src/lib/payments/payment-transitions.ts`
- Create: `src/app/api/payments/razorpay/webhook/route.ts`
- Modify: `src/app/api/payments/razorpay/order/route.ts`
- Modify: `src/app/api/payments/razorpay/verify/route.ts`
- Modify: `.env.example`
- Test: `tests/razorpay-signature.test.ts`
- Test: `tests/payment-transitions.test.ts`

- [ ] Write failing webhook-signature and idempotent-transition tests.
- [ ] Implement raw-body webhook HMAC verification and event parsing.
- [ ] Reconcile captured/failed payments transactionally without duplicate tracking events.
- [ ] Prevent duplicate pending provider orders and preserve immediate checkout verification.

### Task 6: Final verification and operator guidance

**Files:**
- Create: `docs/razorpay-webhook-setup.md`
- Modify: `README.md` if present

- [ ] Document the Razorpay test webhook URL, events, secret, local tunnel caveat, and test procedure.
- [ ] Run `npm test`.
- [ ] Run `npx prisma validate`.
- [ ] Run `npm run build`.
- [ ] Review the diff for secrets and unrelated changes before reporting completion.
