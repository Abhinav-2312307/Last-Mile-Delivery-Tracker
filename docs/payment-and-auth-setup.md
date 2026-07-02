# Payment and authentication setup

This app now supports:

- email + password registration with a 6-digit email OTP
- direct Google sign-in
- Razorpay test-mode checkout
- Razorpay webhooks for server-side payment reconciliation

## Environment variables

Copy `.env.example` to `.env` and fill these values.

```env
AUTH_SECRET="generate-a-strong-secret"
NEXTAUTH_SECRET="same-as-auth-secret"
AUTH_URL="http://localhost:3000"
NEXTAUTH_URL="http://localhost:3000"

GOOGLE_CLIENT_ID="..."
GOOGLE_CLIENT_SECRET="..."

EMAIL_VERIFICATION_SECRET="generate-a-strong-secret"
RESEND_API_KEY="..."
RESEND_FROM_EMAIL="Last Mile Delivery <notifications@yourdomain.com>"
EMAIL_FROM="Last Mile Delivery <notifications@yourdomain.com>"

RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_KEY_SECRET="..."
NEXT_PUBLIC_RAZORPAY_KEY_ID="rzp_test_..."
RAZORPAY_WEBHOOK_SECRET="..."
```

Generate strong secrets with:

```bash
openssl rand -base64 32
```

## Google sign-in

1. Open Google Cloud Console.
2. Create or select a project.
3. Go to APIs & Services → OAuth consent screen.
4. Choose External while testing, fill the app name, support email, and developer email.
5. Add your test users if the app is still in testing mode.
6. Go to APIs & Services → Credentials → Create credentials → OAuth client ID.
7. Choose Web application.
8. Add authorized JavaScript origins:
   - `http://localhost:3000`
   - your production domain, for example `https://yourdomain.com`
9. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google`
10. Copy the client ID and client secret into `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`.
11. Restart the Next.js server.

Google users are marked verified only when Google returns a verified email.

## Email OTP verification

1. Create a Resend account.
2. Verify your sending domain in Resend.
3. Create an API key.
4. Add the key to `RESEND_API_KEY`.
5. Set `RESEND_FROM_EMAIL` to a verified sender, for example:
   - `Last Mile Delivery <notifications@yourdomain.com>`
6. Restart the Next.js server.

Password registration creates a customer account and sends a 6-digit OTP. The user must verify OTP before email/password login works.

## Razorpay test checkout

1. Open Razorpay Dashboard in Test Mode.
2. Go to Account & Settings → API Keys.
3. Generate/copy the test key ID and key secret.
4. Add them to:
   - `RAZORPAY_KEY_ID`
   - `RAZORPAY_KEY_SECRET`
   - `NEXT_PUBLIC_RAZORPAY_KEY_ID`
5. Restart the Next.js server.

## Razorpay webhook

Use a public URL for webhook delivery. Razorpay will not deliver webhooks to
plain localhost, and some common tunnel/testing domains are blocked. The most
reliable options are:

- a deployed staging URL, or
- a local tunnel that Razorpay accepts, such as zrok.

Then create the webhook in Razorpay:

1. Open Razorpay Dashboard in Test Mode.
2. Go to Developers → Webhooks.
3. Click Add New Webhook.
4. Webhook URL:
   - local tunnel: `https://your-public-tunnel.example/api/payments/razorpay/webhook`
   - production: `https://yourdomain.com/api/payments/razorpay/webhook`
5. Set a strong webhook secret and copy the same value to `RAZORPAY_WEBHOOK_SECRET`.
6. Enable these events:
   - `payment.captured`
   - `payment.failed`
7. Save the webhook and restart the app after updating `.env`.

The webhook is idempotent: duplicate captured events will not create duplicate tracking events or notifications.
