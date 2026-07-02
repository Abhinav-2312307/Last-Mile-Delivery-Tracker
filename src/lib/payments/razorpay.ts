import { createHmac, timingSafeEqual } from "node:crypto";
import Razorpay from "razorpay";

export function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay test credentials are not configured.");
  }
  return new Razorpay({ key_id: keyId, key_secret: keySecret });
}

export function verifyRazorpaySignature(input: {
  providerOrderId: string;
  providerPaymentId: string;
  signature: string;
  secret: string;
}) {
  const expected = createHmac("sha256", input.secret)
    .update(`${input.providerOrderId}|${input.providerPaymentId}`)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(input.signature);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}

export function verifyRazorpayWebhookSignature(input: {
  body: string;
  signature: string;
  secret: string;
}) {
  const expected = createHmac("sha256", input.secret)
    .update(input.body)
    .digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const receivedBuffer = Buffer.from(input.signature);
  return (
    expectedBuffer.length === receivedBuffer.length &&
    timingSafeEqual(expectedBuffer, receivedBuffer)
  );
}
