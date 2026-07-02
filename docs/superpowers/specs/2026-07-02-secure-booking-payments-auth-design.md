# Secure Booking, Payments, and Authentication Design

## Goal

Make booking and prepaid checkout safe enough for public use by adding verified customer identities, reliable Razorpay reconciliation, bounded parcel inputs, a guided address experience, and country-aware pricing.

## Decisions

- Customers can sign in with email/password or Google.
- Email/password registrations must verify a six-digit email OTP. Codes expire after 10 minutes, are stored only as hashes, and can be resent with throttling. Google emails are treated as verified by the provider.
- Booking uses the selected four-step flow: Pickup, Delivery, Parcel, Review & Pay.
- Pickup and delivery each use dependent Country → State/UT → City → Service area selectors. The country/state/city directory is worldwide, while checkout is allowed only when both selected cities have a configured service area.
- Address data is split into building/flat, street/locality/landmark, postal code, contact name, and contact phone.
- Existing intra-zone and inter-zone pricing remains. A new international rate is selected when pickup and delivery countries differ, allowing an administrator to configure prices per origin/destination country pair and order type.
- Parcel dimensions are limited to 0.1–200 cm per side and actual weight to 0.1–100 kg. The same schema is used for browser hints and server validation.
- Razorpay client verification gives immediate feedback, while a signed webhook is the authoritative recovery path for captured/failed payments. Processing is idempotent.

## Architecture

`country-state-city` supplies the worldwide cascading directory in the client. Database `Country`, `State`, `City`, and `Area` rows remain the serviceability and dispatch source of truth. The booking screen maps a worldwide selection to configured areas; an unsupported city cannot advance.

The pricing engine receives pickup/drop country codes as well as zone IDs. Same-country routes use existing rate cards. Cross-country routes use `InternationalRateCard`, preserving the current billable-weight formula and immutable order price snapshot.

Auth.js keeps the credentials provider and adds Google. The database user record gains `emailVerified`, optional `passwordHash`, and OAuth account records. Credentials authorization rejects unverified users. Registration creates an OTP challenge and sends it through Resend.

Razorpay webhook handling reads the raw request body, validates `x-razorpay-signature` with `RAZORPAY_WEBHOOK_SECRET`, finds the existing provider order, and applies state transitions only when needed. Duplicate webhook delivery cannot create duplicate tracking events.

## Error Handling and Safety

- Zod validates every registration, verification, order, payment, and webhook boundary.
- OTP responses do not reveal whether unrelated accounts exist; resend is throttled.
- OAuth never upgrades an existing staff role and only links by a verified Google email.
- Server-side order creation re-loads areas and pricing; browser-calculated totals are never trusted.
- Payment endpoints require order ownership. Webhook processing does not require a browser session but does require a valid signature.
- Unsupported routes, missing rate cards, expired OTPs, and invalid parcel values produce actionable user messages.

## Testing

Vitest covers parcel limits, international rate selection, OTP hashing/expiry, Razorpay checkout and webhook signatures, and idempotent payment transition decisions. Prisma validation, the complete test suite, and a production Next.js build form the final verification gate.
