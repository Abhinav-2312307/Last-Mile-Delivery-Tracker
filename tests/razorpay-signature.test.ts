import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";

import {
  verifyRazorpaySignature,
  verifyRazorpayWebhookSignature,
} from "@/lib/payments/razorpay";

describe("Razorpay signature verification", () => {
  it("accepts the HMAC generated from order and payment ids", () => {
    const secret = "test_secret";
    const signature = createHmac("sha256", secret)
      .update("order_123|pay_456")
      .digest("hex");

    expect(
      verifyRazorpaySignature({
        providerOrderId: "order_123",
        providerPaymentId: "pay_456",
        signature,
        secret,
      }),
    ).toBe(true);
  });

  it("rejects a mismatched signature", () => {
    expect(
      verifyRazorpaySignature({
        providerOrderId: "order_123",
        providerPaymentId: "pay_456",
        signature: "bad",
        secret: "test_secret",
      }),
    ).toBe(false);
  });

  it("accepts a webhook HMAC generated from the raw body", () => {
    const secret = "webhook_secret";
    const body = JSON.stringify({ event: "payment.captured" });
    const signature = createHmac("sha256", secret).update(body).digest("hex");

    expect(
      verifyRazorpayWebhookSignature({
        body,
        signature,
        secret,
      }),
    ).toBe(true);
  });
});
