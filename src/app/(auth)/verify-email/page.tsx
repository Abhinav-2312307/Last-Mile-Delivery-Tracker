import Link from "next/link";

import { VerifyEmailForm } from "@/components/auth/verify-email-form";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="brand-link" href="/">
          Last-Mile Delivery Tracker
        </Link>
        <div>
          <p className="eyebrow">Email verification</p>
          <h1>Enter the OTP sent to your email</h1>
          <p className="muted">
            Password accounts must verify their email before booking and paying
            for deliveries.
          </p>
        </div>
        <VerifyEmailForm initialEmail={email ?? ""} />
        <p className="muted text-sm">
          Already verified? <Link href="/login">Sign in</Link>
        </p>
      </section>
      <aside className="auth-aside">
        <p className="eyebrow">Payment safety</p>
        <h2>Verified identity before checkout.</h2>
        <p>
          We verify customer email first, then allow Razorpay checkout and order
          tracking from the secure customer portal.
        </p>
      </aside>
    </main>
  );
}
