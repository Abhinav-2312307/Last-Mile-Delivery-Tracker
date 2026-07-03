"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FormEvent, useState, useEffect } from "react";

const roleMeta: Record<string, { title: string; subtitle: string; bgClass: string; roleCode: string }> = {
  customer: {
    title: "Customer Sign In",
    subtitle: "Book shipments and monitor deliveries from your desk.",
    bgClass: "customer-theme",
    roleCode: "CUSTOMER",
  },
  agent: {
    title: "Field Agent Login",
    subtitle: "Access active task sheets, coordinate updates and log status.",
    bgClass: "agent-theme",
    roleCode: "AGENT",
  },
  manager: {
    title: "Operations Hub Login",
    subtitle: "Dispatch parcels, reassign routes and manage fleet exceptions.",
    bgClass: "manager-theme",
    roleCode: "MANAGER",
  },
  admin: {
    title: "Control Room Login",
    subtitle: "Audit settings, update rate cards, configure areas and approve staff accounts.",
    bgClass: "admin-theme",
    roleCode: "ADMIN",
  },
};

export default function DynamicLoginPage() {
  const params = useParams();
  const router = useRouter();
  const roleParam = (params.role as string)?.toLowerCase() || "customer";

  const meta = roleMeta[roleParam] || roleMeta.customer;
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
      expectedRole: meta.roleCode,
      callbackUrl: "/portal",
      redirect: false,
    });

    if (result?.error) {
      setError("Incorrect email, password, or role mismatch.");
      setPending(false);
      return;
    }
    window.location.href = result?.url ?? "/portal";
  }

  function signInWithGoogle() {
    void signIn("google", { callbackUrl: "/portal" });
  }

  return (
    <main className={`auth-page ${meta.bgClass}`}>
      <section className="auth-panel">
        <Link className="brand-link" href="/">
          Last-Mile Delivery Tracker
        </Link>
        <div>
          <span className="eyebrow">{meta.title}</span>
          <h1>Access your workspace</h1>
          <p className="muted">{meta.subtitle}</p>
        </div>

        {roleParam === "customer" && (
          <>
            <button
              className="button button-secondary btn-full flex items-center justify-center gap-2"
              onClick={signInWithGoogle}
              type="button"
            >
              Continue with Google
            </button>
            <div className="auth-divider">or use credentials</div>
          </>
        )}

        <form className="form-stack" onSubmit={submit}>
          <label>
            Email
            <input name="email" type="email" required autoComplete="email" placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input
              name="password"
              type="password"
              required
              minLength={8}
              autoComplete="current-password"
              placeholder="••••••••"
            />
          </label>
          {error && <p className="form-error">{error}</p>}
          <button className="button button-primary btn-full" disabled={pending}>
            {pending ? "Signing in..." : "Sign in to workspace"}
          </button>
        </form>

        <p className="muted text-sm mt-4">
          Need an account?{" "}
          <Link href={roleParam === "customer" ? "/register" : `/register/${roleParam}`}>
            Register here
          </Link>
        </p>
      </section>

      <aside className="auth-aside">
        <div className="aside-features">
          <p className="eyebrow">Dedicated Workspace</p>
          <h2>Role-based system security.</h2>
          <p>
            Your account is locked to your operational role to preserve data governance and routing history.
          </p>
          <dl className="auth-role-list mt-8">
            <div>
              <dt>Strict Authentication</dt>
              <dd>Users can only access dashboard routes mapped directly to their assigned permissions profile.</dd>
            </div>
            <div>
              <dt>Terms of Operations</dt>
              <dd>All activity and status changes are signed and logged for platform audit capability.</dd>
            </div>
          </dl>
        </div>
      </aside>
    </main>
  );
}
