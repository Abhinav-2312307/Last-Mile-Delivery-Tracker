"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    const form = new FormData(event.currentTarget);
    const result = await signIn("credentials", {
      email: form.get("email"),
      password: form.get("password"),
      callbackUrl: "/portal",
      redirect: false,
    });

    if (result?.error) {
      setError("Email/password is incorrect, or this email is not verified yet.");
      setPending(false);
      return;
    }
    window.location.href = result?.url ?? "/portal";
  }

  function signInWithGoogle() {
    void signIn("google", { callbackUrl: "/portal" });
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <Link className="brand-link" href="/">
          Last-Mile Delivery Tracker
        </Link>
        <div>
          <p className="eyebrow">Secure access</p>
          <h1>Sign in to your portal</h1>
          <p className="muted">
            Customers, field agents, managers, and administrators use one
            secure entry point.
          </p>
        </div>
        <button
          className="button button-secondary"
          onClick={signInWithGoogle}
          type="button"
        >
          Continue with Google
        </button>
        <div className="auth-divider">or use email and password</div>
        <form className="form-stack" onSubmit={submit}>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-primary" disabled={pending}>
            {pending ? "Signing in..." : "Sign in"}
          </button>
        </form>
        <p className="muted text-sm">
          New customer? <Link href="/register">Create an account</Link>
        </p>
        <p className="muted text-sm">
          Need OTP again? <Link href="/verify-email">Verify your email</Link>
        </p>
      </section>
      <aside className="auth-aside">
        <p className="eyebrow">Operations overview</p>
        <h2>One platform, four focused workspaces.</h2>
        <dl className="auth-role-list">
          <div><dt>Customer</dt><dd>Book, pay, track, reschedule</dd></div>
          <div><dt>Agent</dt><dd>Assignments and delivery updates</dd></div>
          <div><dt>Manager</dt><dd>Dispatch and exception handling</dd></div>
          <div><dt>Admin</dt><dd>Rates, zones, users, and audit</dd></div>
        </dl>
      </aside>
    </main>
  );
}
