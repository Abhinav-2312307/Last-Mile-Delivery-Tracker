"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

export function VerifyEmailForm({ initialEmail }: { initialEmail: string }) {
  const router = useRouter();
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [resending, setResending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });
    const result = await response.json();
    setPending(false);

    if (!response.ok) {
      setError(result.error ?? "OTP verification failed.");
      return;
    }

    router.push("/login?verified=1");
  }

  async function resend() {
    setResending(true);
    setError("");
    setMessage("");
    const response = await fetch("/api/auth/resend-verification", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const result = await response.json();
    setResending(false);

    if (!response.ok) {
      setError(result.error ?? "Could not resend OTP.");
      return;
    }
    setMessage("A fresh OTP has been sent if this email needs verification.");
  }

  return (
    <form className="form-stack" onSubmit={submit}>
      <label>
        Email
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          required
          type="email"
          value={email}
        />
      </label>
      <label>
        6-digit OTP
        <input
          autoComplete="one-time-code"
          inputMode="numeric"
          maxLength={6}
          minLength={6}
          onChange={(event) => setCode(event.target.value.replace(/\D/g, ""))}
          pattern="\d{6}"
          placeholder="123456"
          required
          value={code}
        />
      </label>
      {error && <p className="form-error">{error}</p>}
      {message && <p className="form-success">{message}</p>}
      <button className="button button-primary" disabled={pending}>
        {pending ? "Verifying..." : "Verify email"}
      </button>
      <button
        className="button button-secondary"
        disabled={resending || !email}
        onClick={resend}
        type="button"
      >
        {resending ? "Sending..." : "Resend OTP"}
      </button>
    </form>
  );
}
