"use client";

import { useState } from "react";

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open(): void };
  }
}

function loadRazorpay() {
  return new Promise<boolean>((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayButton({ orderId }: { orderId: string }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);

  async function pay() {
    setPending(true);
    setError("");
    if (!(await loadRazorpay())) {
      setError("Razorpay checkout could not be loaded.");
      setPending(false);
      return;
    }
    const response = await fetch("/api/payments/razorpay/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });
    const data = await response.json();
    if (!response.ok) {
      setError(data.error);
      setPending(false);
      return;
    }
    const checkout = new window.Razorpay!({
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "Last-Mile Delivery Tracker",
      description: data.orderNumber,
      order_id: data.providerOrderId,
      prefill: { name: data.customerName, email: data.customerEmail },
      handler: async (result: Record<string, string>) => {
        const verification = await fetch("/api/payments/razorpay/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, ...result }),
        });
        if (verification.ok) window.location.reload();
        else {
          const payload = await verification.json();
          setError(payload.error);
          setPending(false);
        }
      },
      modal: { ondismiss: () => setPending(false) },
      theme: { color: "#0f766e" },
    });
    checkout.open();
  }

  return (
    <div>
      <button className="button button-primary" disabled={pending} onClick={pay}>
        {pending ? "Opening checkout..." : "Pay securely with Razorpay"}
      </button>
      {error && <p className="form-error">{error}</p>}
    </div>
  );
}
