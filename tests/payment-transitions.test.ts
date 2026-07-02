import { describe, expect, it } from "vitest";

import { resolveRazorpayWebhookTransition } from "@/lib/payments/payment-transitions";

describe("Razorpay webhook payment transitions", () => {
  it("marks a pending payment and order as paid on capture", () => {
    expect(
      resolveRazorpayWebhookTransition({
        currentPaymentStatus: "PENDING",
        currentOrderStatus: "PAYMENT_PENDING",
        event: "payment.captured",
      }),
    ).toMatchObject({
      kind: "paid",
      paymentStatus: "PAID",
      orderStatus: "PAID",
      trackingStatus: "PAID",
      notifyCustomer: true,
    });
  });

  it("does not repeat tracking or notifications for duplicate capture events", () => {
    expect(
      resolveRazorpayWebhookTransition({
        currentPaymentStatus: "PAID",
        currentOrderStatus: "PAID",
        event: "payment.captured",
      }),
    ).toEqual({ kind: "noop", notifyCustomer: false });
  });

  it("marks unpaid payments as failed without failing the delivery order", () => {
    expect(
      resolveRazorpayWebhookTransition({
        currentPaymentStatus: "PENDING",
        currentOrderStatus: "PAYMENT_PENDING",
        event: "payment.failed",
      }),
    ).toMatchObject({
      kind: "failed",
      paymentStatus: "FAILED",
      orderStatus: "PAYMENT_PENDING",
      trackingStatus: "PAYMENT_PENDING",
      notifyCustomer: false,
    });
  });
});
