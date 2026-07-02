"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const data = Object.fromEntries(new FormData(event.currentTarget));
    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    const result = await response.json();

    if (!response.ok) {
      setError(result.error);
      setPending(false);
      return;
    }
    router.push(`/verify-email?email=${encodeURIComponent(result.email ?? String(data.email))}`);
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="brand-link" href="/">
          Last-Mile Delivery Tracker
        </Link>
        <div>
          <p className="eyebrow">Customer account</p>
          <h1>Create your account</h1>
          <p className="muted">
            Book and monitor deliveries from one place. We will verify your
            email with a 6-digit OTP before login.
          </p>
        </div>
        <form className="form-stack" onSubmit={submit}>
          <label>Full name<input name="name" required minLength={2} /></label>
          <label>Email<input name="email" type="email" required /></label>
          <label>Phone<input name="phone" type="tel" required minLength={8} /></label>
          <label>Password<input name="password" type="password" required minLength={8} /></label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-primary" disabled={pending}>
            {pending ? "Creating..." : "Create account"}
          </button>
        </form>
        <p className="muted text-sm">
          Already registered? <Link href="/login">Sign in</Link>
        </p>
      </section>
      <aside className="auth-aside">
        <p className="eyebrow">Delivery data</p>
        <h2>Clear charges before you confirm.</h2>
        <p>
          Rates use order type, route zones, actual weight, volumetric weight,
          and COD fees. Every status update remains visible in your timeline.
        </p>
      </aside>
    </main>
  );
}
