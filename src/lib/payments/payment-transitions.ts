import type { OrderStatus, PaymentStatus } from "@prisma/client";

export type RazorpayWebhookEvent = "payment.captured" | "payment.failed";

export type PaymentTransition =
  | {
      kind: "paid";
      paymentStatus: PaymentStatus;
      orderStatus: OrderStatus;
      trackingStatus: OrderStatus;
      note: string;
      notifyCustomer: true;
    }
  | {
      kind: "failed";
      paymentStatus: PaymentStatus;
      orderStatus: OrderStatus;
      trackingStatus: OrderStatus;
      note: string;
      notifyCustomer: false;
    }
  | {
      kind: "noop";
      notifyCustomer: false;
    };

export function resolveRazorpayWebhookTransition({
  currentPaymentStatus,
  currentOrderStatus,
  event,
}: {
  currentPaymentStatus: PaymentStatus;
  currentOrderStatus: OrderStatus;
  event: string;
}): PaymentTransition {
  if (event === "payment.captured") {
    if (currentPaymentStatus === "PAID" && currentOrderStatus === "PAID") {
      return { kind: "noop", notifyCustomer: false };
    }

    return {
      kind: "paid",
      paymentStatus: "PAID",
      orderStatus: "PAID",
      trackingStatus: "PAID",
      note: "Razorpay payment captured",
      notifyCustomer: true,
    };
  }

  if (event === "payment.failed") {
    if (currentPaymentStatus === "PAID" || currentPaymentStatus === "FAILED") {
      return { kind: "noop", notifyCustomer: false };
    }

    return {
      kind: "failed",
      paymentStatus: "FAILED",
      orderStatus: currentOrderStatus,
      trackingStatus: "PAYMENT_PENDING",
      note: "Razorpay payment failed",
      notifyCustomer: false,
    };
  }

  return { kind: "noop", notifyCustomer: false };
}
