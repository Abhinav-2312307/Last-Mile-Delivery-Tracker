# Last-Mile Delivery Platform Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a full-stack Next.js last-mile delivery platform that satisfies the assignment requirements and supports customer, agent, manager, and admin workflows.

**Architecture:** The app uses Next.js App Router for pages and backend endpoints, Prisma for a Neon PostgreSQL schema, Auth.js credentials for role sessions, and focused domain modules for pricing, assignment, tracking, notifications, and payments. Core business logic is tested independently with Vitest before being wired into UI and API routes.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Auth.js, bcryptjs, Razorpay, Resend, Twilio, Zod, Vitest.

---

## File Structure

- `src/lib/pricing/rate-engine.ts`: pure rate calculation logic.
- `src/lib/assignment/assignment-engine.ts`: pure agent ranking logic.
- `src/lib/tracking/status-lifecycle.ts`: allowed transitions and tracking event helpers.
- `src/lib/notifications/notification-service.ts`: database notification creation and provider dispatch wrappers.
- `src/lib/payments/razorpay.ts`: Razorpay test-mode order creation and signature verification.
- `src/lib/auth.ts`: Auth.js configuration and role callbacks.
- `src/lib/db.ts`: Prisma client singleton.
- `prisma/schema.prisma`: relational data model.
- `prisma/seed.ts`: demo users, zones, cities, rate cards, agents, and orders.
- `src/app/(auth)/*`: login/register pages.
- `src/app/(dashboard)/customer/*`: customer order and tracking flows.
- `src/app/(dashboard)/agent/*`: agent assigned-order and status flows.
- `src/app/(dashboard)/manager/*`: manager operations flows.
- `src/app/(dashboard)/admin/*`: admin configuration and analytics flows.
- `src/app/api/*`: API endpoints for auth-adjacent actions, payments, notifications, and order actions.
- `tests/*`: engine and lifecycle tests.
- `README.md`, `.env.example`, `docs/system-design.md`: submission documentation.

## Tasks

### Task 1: Scaffold Project

**Files:**
- Create: `package.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `postcss.config.mjs`
- Create: `tailwind.config.ts`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`

- [ ] Create a Next.js TypeScript app with Tailwind CSS and scripts for `dev`, `build`, `lint`, `test`, `prisma:generate`, `prisma:migrate`, and `db:seed`.
- [ ] Install minimal dependencies: Next.js, React, Prisma, Auth.js, bcryptjs, zod, Razorpay, Resend, Twilio, Vitest, Tailwind.
- [ ] Add a functional home page that redirects users toward login and explains no marketing fluff beyond the product name and role entry.
- [ ] Run `npm run build` and fix scaffold errors.

### Task 2: Database Schema and Seed Data

**Files:**
- Create: `prisma/schema.prisma`
- Create: `prisma/seed.ts`
- Create: `src/lib/db.ts`

- [ ] Define enums for role, order type, payment type, payment status, order status, route type, notification channel, notification status, and agent availability.
- [ ] Define models for users, auth accounts/sessions as needed by Auth.js, countries, cities, areas, zones, zone agents, addresses, rate cards, COD surcharges, agent profiles, orders, tracking events, payments, reschedules, and notifications.
- [ ] Add indexes for order status, pickup/drop zone, assigned agent, created date, and tracking event order.
- [ ] Seed demo accounts: admin, manager, two agents, and two customers with known passwords for README.
- [ ] Seed practical locations: India-focused cities and areas plus a few international city entries, grouped into zones.
- [ ] Seed B2B/B2C intra-zone and inter-zone rate cards, COD surcharges, and agent profiles.
- [ ] Run Prisma generation and migration against the configured database.

### Task 3: Core Business Logic Tests

**Files:**
- Create: `src/lib/pricing/rate-engine.ts`
- Create: `src/lib/assignment/assignment-engine.ts`
- Create: `src/lib/tracking/status-lifecycle.ts`
- Create: `tests/rate-engine.test.ts`
- Create: `tests/assignment-engine.test.ts`
- Create: `tests/status-lifecycle.test.ts`

- [ ] Write Vitest coverage for volumetric weight, billable weight, B2B/B2C rate selection, intra/inter-zone route detection, COD surcharge, and missing rate-card errors.
- [ ] Write Vitest coverage for assignment ranking by zone match, distance, availability, and workload.
- [ ] Write Vitest coverage for valid and invalid order status transitions and admin override behavior.
- [ ] Implement the pricing, assignment, and status modules until all tests pass.

### Task 4: Auth and Role Routing

**Files:**
- Create: `src/lib/auth.ts`
- Create: `src/middleware.ts`
- Create: `src/app/(auth)/login/page.tsx`
- Create: `src/app/(auth)/register/page.tsx`
- Create: `src/app/api/auth/[...nextauth]/route.ts`

- [ ] Configure Auth.js credentials login with bcrypt password verification.
- [ ] Add session role data to JWT/session callbacks.
- [ ] Protect dashboard routes by role.
- [ ] Route each role to its dashboard after login.
- [ ] Add customer registration with email/password and `CUSTOMER` role.

### Task 5: Customer Order Flow

**Files:**
- Create: `src/app/(dashboard)/customer/orders/new/page.tsx`
- Create: `src/app/(dashboard)/customer/orders/actions.ts`
- Create: `src/app/(dashboard)/customer/orders/[id]/page.tsx`
- Create: `src/components/order/order-form.tsx`
- Create: `src/components/order/charge-preview.tsx`

- [ ] Build pickup/drop address selection using seeded countries, cities, and areas.
- [ ] Capture dimensions, weight, B2B/B2C order type, and prepaid/COD payment type.
- [ ] Preview the rate before confirmation using the tested rate engine.
- [ ] Create confirmed orders with pricing snapshots and initial tracking events.
- [ ] Show order status and full tracking timeline to the customer.

### Task 6: Razorpay Test Payments

**Files:**
- Create: `src/lib/payments/razorpay.ts`
- Create: `src/app/api/payments/razorpay/order/route.ts`
- Create: `src/app/api/payments/razorpay/verify/route.ts`
- Modify: `src/components/order/charge-preview.tsx`

- [ ] Create Razorpay test orders for prepaid customer orders.
- [ ] Verify Razorpay payment signatures.
- [ ] Store payment status, provider order id, provider payment id, and amount.
- [ ] Allow COD orders to skip online payment and move to assignment flow.

### Task 7: Admin and Manager Operations

**Files:**
- Create: `src/app/(dashboard)/admin/page.tsx`
- Create: `src/app/(dashboard)/admin/zones/page.tsx`
- Create: `src/app/(dashboard)/admin/rates/page.tsx`
- Create: `src/app/(dashboard)/admin/orders/page.tsx`
- Create: `src/app/(dashboard)/manager/page.tsx`
- Create: `src/app/(dashboard)/manager/orders/page.tsx`
- Create: `src/components/admin/order-table.tsx`
- Create: `src/components/admin/rate-card-form.tsx`
- Create: `src/components/admin/zone-form.tsx`

- [ ] Add admin CRUD screens for zones, areas, rate cards, and COD surcharges.
- [ ] Add admin order creation on behalf of customers.
- [ ] Add order filters by status, zone, agent, and date.
- [ ] Add manual agent assignment and auto-assignment action.
- [ ] Add admin status override with required reason and tracking event.
- [ ] Add manager views for operations, failed deliveries, reschedules, and assignment.

### Task 8: Agent Workflow

**Files:**
- Create: `src/app/(dashboard)/agent/page.tsx`
- Create: `src/app/(dashboard)/agent/orders/[id]/page.tsx`
- Create: `src/app/(dashboard)/agent/actions.ts`
- Create: `src/components/agent/status-actions.tsx`

- [ ] Show assigned orders and operational summary.
- [ ] Let agents update availability, current zone, and approximate coordinates.
- [ ] Let agents update valid statuses only.
- [ ] Ensure every update writes immutable tracking history and triggers notifications.

### Task 9: Failed Delivery and Reschedule

**Files:**
- Create: `src/app/(dashboard)/customer/orders/[id]/reschedule/page.tsx`
- Create: `src/components/order/reschedule-form.tsx`
- Modify: `src/app/(dashboard)/manager/orders/page.tsx`
- Modify: `src/lib/tracking/status-lifecycle.ts`

- [ ] When an order is marked failed, create email and SMS notification records.
- [ ] Let customers request a new delivery date and note.
- [ ] Move rescheduled orders back into pending assignment/reassignment.
- [ ] Preserve full previous tracking history.

### Task 10: Notifications

**Files:**
- Create: `src/lib/notifications/notification-service.ts`
- Create: `src/lib/notifications/providers/resend.ts`
- Create: `src/lib/notifications/providers/twilio.ts`
- Create: `src/app/(dashboard)/admin/notifications/page.tsx`

- [ ] Create email and SMS notification rows for each status change.
- [ ] Send email through Resend when `RESEND_API_KEY` is configured.
- [ ] Send SMS through Twilio when Twilio env vars are configured.
- [ ] Store sent, skipped, or failed status with provider response/error details.
- [ ] Add admin notification audit screen.

### Task 11: Dashboards, Analytics, and Polish

**Files:**
- Create: `src/components/dashboard/stat-card.tsx`
- Create: `src/components/dashboard/status-chart.tsx`
- Modify: role dashboard pages

- [ ] Add role-specific summaries: order counts, failed deliveries, active agents, revenue estimate, and pending assignment.
- [ ] Add practical empty/loading/error states.
- [ ] Ensure responsive layouts work on desktop and mobile.
- [ ] Keep visual style operational and not marketing-heavy.

### Task 12: Documentation and Submission

**Files:**
- Create: `.env.example`
- Create: `README.md`
- Create: `docs/system-design.md`
- Create: `docs/api.md`
- Create: `docs/db-schema.md`

- [ ] Document setup, environment variables, Neon, Razorpay, Resend, Twilio, Prisma migration, seed, dev, build, and deployment.
- [ ] Document API/server-action behavior and role permissions.
- [ ] Document DB schema and rate calculation logic.
- [ ] Write the required 800-word maximum system design write-up.
- [ ] Verify `.env`, build artifacts, and dependency folders are excluded from submission.

## Verification

- [ ] `npm run test` passes.
- [ ] `npm run build` passes.
- [ ] Seeded admin can log in and manage zones/rates/orders.
- [ ] Seeded customer can create order, preview rate, pay prepaid test order or choose COD, and track timeline.
- [ ] Seeded agent can update statuses.
- [ ] Failed delivery creates notification records and supports reschedule/reassignment.
- [ ] README can be followed from a fresh clone.
