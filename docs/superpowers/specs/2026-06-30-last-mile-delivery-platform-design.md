# Last-Mile Delivery Platform Design

## Goal

Build a submission-ready but realistic last-mile delivery management platform in Next.js. The app must satisfy every requirement from the assignment PDF while presenting as a credible operational prototype with separate customer, admin, manager, and delivery-agent interfaces.

## Stack

- Next.js App Router with TypeScript
- Neon PostgreSQL free tier
- Prisma ORM
- Auth.js / NextAuth credentials login
- Razorpay test mode for prepaid orders
- Resend for email notifications
- Twilio trial/test SMS integration
- Tailwind CSS for UI
- Vitest for core engine tests

## Roles and Interfaces

The platform has four roles. `CUSTOMER` can create orders, preview charges, pay prepaid orders, track deliveries, and reschedule failed deliveries. `AGENT` can manage availability, current zone/location, assigned orders, and status updates. `MANAGER` can monitor operations, assign or reassign agents, handle failed/rescheduled orders, and manage zone operations. `ADMIN` has full control over users, zones, areas, cities, rate cards, COD surcharges, orders, status overrides, and analytics.

## Data Model

The relational schema centers on `User`, `Address`, `Country`, `City`, `Area`, `Zone`, `RateCard`, `CodSurcharge`, `AgentProfile`, `Order`, `TrackingEvent`, `Payment`, `RescheduleRequest`, and `Notification`. Areas belong to cities and zones. Agents are linked to one or more zones and maintain availability and approximate latitude/longitude. Orders store pickup/drop addresses, detected zones, package dimensions, actual weight, volumetric weight, billable weight, order type, payment type, calculated charge, status, assigned agent, and audit metadata. Tracking events are append-only and store status, timestamp, actor, and notes.

## Rate Calculation

The rate engine detects pickup and drop zones from the selected pickup/drop areas. Volumetric weight is calculated as `lengthCm * breadthCm * heightCm / 5000`. Billable weight is the maximum of actual and volumetric weight. The engine chooses the correct active rate card based on order type (`B2B` or `B2C`) and route type (`INTRA_ZONE` when pickup and drop zones match, otherwise `INTER_ZONE`). It multiplies billable weight by the configured price per kilogram and adds the configured COD surcharge when payment type is `COD`. The calculated amount is shown before final order confirmation and saved as an immutable pricing snapshot on the order.

## Assignment and Status Lifecycle

Admins and managers can manually assign agents. Auto-assignment ranks available agents by matching drop zone first, then shortest distance from the pickup coordinates, then lowest active workload. Agents can move an order through `PICKED_UP`, `IN_TRANSIT`, `OUT_FOR_DELIVERY`, `DELIVERED`, and `FAILED`. Admins can override status with a required reason. Every status change creates a tracking event and notification records.

## Failed Delivery Flow

When an agent marks an order as failed, the customer receives email and SMS notifications. The customer can request a new delivery date. A reschedule record is created, the order moves to a rescheduled/pending assignment state, and manager/admin can trigger reassignment or use auto-assignment again. The previous tracking history remains immutable.

## Notifications

Every status change creates database notification rows for email and SMS. Resend sends email when configured. Twilio sends SMS when configured and allowed by trial/test account rules. Failed provider calls are stored with error details so the app remains auditable during demo and review.

## UI Direction

The UI should feel like a functional logistics operations tool: dense, calm, clear, and dashboard-oriented. It should avoid looking like a generic AI-generated landing page. The first screen after login routes users to their role-specific dashboard. Customer screens prioritize order creation and tracking. Admin and manager screens prioritize tables, filters, configuration forms, and exception handling. Agent screens prioritize mobile-friendly assigned jobs and quick status actions.

## Delivery Phases

Phase 1 implements the mandatory assignment contract end to end: auth, roles, schema, seeded data, rate engine, orders, assignment, tracking, notifications, failed delivery, payments, and docs. Phase 2 adds richer operational prototype features: manager analytics, broader city/rate controls, improved dashboards, workload views, and polish.

## Documentation and Submission

The repository must include `.env.example`, setup guide, API documentation, database schema explanation, rate calculation explanation, seeded demo accounts, and an 800-word maximum system design write-up. The main branch must be public/downloadable and exclude `.env`, `node_modules`, build artifacts, temporary files, and editor folders.
