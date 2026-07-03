"use client";

import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { FormEvent, useState } from "react";
import { ShieldCheck, UserCheck, Key, HelpCircle } from "lucide-react";

const roleMeta: Record<string, { title: string; subtitle: string; bgClass: string; roleCode: string; requiresApproval: boolean }> = {
  customer: {
    title: "Customer Registration",
    subtitle: "Create an account to start booking instant delivery orders.",
    bgClass: "customer-theme",
    roleCode: "CUSTOMER",
    requiresApproval: false,
  },
  agent: {
    title: "Field Agent Application",
    subtitle: "Join the delivery fleet. Requires operational zone assignments.",
    bgClass: "agent-theme",
    roleCode: "AGENT",
    requiresApproval: true,
  },
  manager: {
    title: "Operations Manager Signup",
    subtitle: "Request manager permissions to oversee scheduling and routing queues.",
    bgClass: "manager-theme",
    roleCode: "MANAGER",
    requiresApproval: true,
  },
  admin: {
    title: "Admin Access Request",
    subtitle: "Create a root portal administrator user profile.",
    bgClass: "admin-theme",
    roleCode: "ADMIN",
    requiresApproval: true,
  },
};

export default function DynamicRegisterPage() {
  const params = useParams();
  const router = useRouter();
  const roleParam = (params.role as string)?.toLowerCase() || "customer";

  const meta = roleMeta[roleParam] || roleMeta.customer;
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [registered, setRegistered] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");

    const formData = new FormData(event.currentTarget);
    const data = Object.fromEntries(formData);

    if (!data.agreedToTerms) {
      setError("You must agree to the Terms & Conditions and Privacy Policy.");
      setPending(false);
      return;
    }

    const response = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: meta.roleCode,
        approvalNote: data.approvalNote || "",
        agreedToTerms: true,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.error || "An error occurred during registration.");
      setPending(false);
      return;
    }

    if (meta.requiresApproval) {
      setRegistered(true);
    } else {
      router.push("/login/customer");
    }
  }

  if (registered) {
    return (
      <main className={`auth-page ${meta.bgClass}`}>
        <section className="auth-panel">
          <Link className="brand-link" href="/">
            Last-Mile Delivery Tracker
          </Link>
          <div className="registration-success-card">
            <div className="success-icon"><ShieldCheck size={36} /></div>
            <h2>Application Submitted</h2>
            <p className="muted text-sm mt-2">
              Thank you for registering. Your profile is created and pending approval from the administrator team.
            </p>
            <div className="pending-audit-details">
              <strong>Expected Role:</strong> <span>{meta.title}</span> <br />
              <strong>Account Status:</strong> <span className="status-badge-pending">Pending Approval</span>
            </div>
            <p className="muted text-xs mt-4">
              You will be able to sign in as soon as an administrator verifies and activates your profile credentials.
            </p>
            <Link href="/" className="button button-primary mt-6 flex-center">
              Back to Homepage
            </Link>
          </div>
        </section>
        <aside className="auth-aside">
          <div className="aside-features">
            <p className="eyebrow">Next Steps</p>
            <h2>Verification Queue</h2>
            <p>
              Your request is routed to the root administrative review queue.
            </p>
          </div>
        </aside>
      </main>
    );
  }

  return (
    <main className={`auth-page ${meta.bgClass}`}>
      <section className="auth-panel">
        <Link className="brand-link" href="/">
          Last-Mile Delivery Tracker
        </Link>
        <div>
          <span className="eyebrow">{meta.title}</span>
          <h1>Create your profile</h1>
          <p className="muted">{meta.subtitle}</p>
        </div>

        <form className="form-stack" onSubmit={submit}>
          <label>
            Full name
            <input name="name" required minLength={2} placeholder="John Doe" />
          </label>
          <label>
            Email address
            <input name="email" type="email" required placeholder="name@domain.com" />
          </label>
          <label>
            Phone contact
            <input name="phone" type="tel" required minLength={8} placeholder="+91 98765 43210" />
          </label>
          <label>
            Secure password
            <input name="password" type="password" required minLength={8} placeholder="At least 8 characters" />
          </label>

          {meta.requiresApproval && (
            <label>
              Application note (Optional)
              <textarea
                name="approvalNote"
                rows={3}
                placeholder="Reason for requesting access / employee details..."
                className="input-textarea"
              />
            </label>
          )}

          <label className="checkbox-label">
            <input type="checkbox" name="agreedToTerms" required />
            <span className="text-xs text-muted">
              I agree to the <Link href="/terms" target="_blank" className="link-inline">Terms & Conditions</Link> and <Link href="/privacy" target="_blank" className="link-inline">Privacy Policy</Link>.
            </span>
          </label>

          {error && <p className="form-error">{error}</p>}
          <button className="button button-primary btn-full" disabled={pending}>
            {pending ? "Submitting application..." : "Submit Registration"}
          </button>
        </form>

        <p className="muted text-sm mt-4">
          Already registered?{" "}
          <Link href={`/login/${roleParam}`}>
            Sign in here
          </Link>
        </p>
      </section>

      <aside className="auth-aside">
        <div className="aside-features">
          <p className="eyebrow">Enterprise Grade</p>
          <h2>Secure coordination dashboard.</h2>
          <p>
            Join a system of zone-aligned delivery coordinates, route sheets, automated invoicing, and live messaging.
          </p>
        </div>
      </aside>
    </main>
  );
}
