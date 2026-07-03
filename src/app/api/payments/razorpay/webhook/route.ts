import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/db";
import { notifyCustomerOfStatus } from "@/lib/notifications/notification-service";
import { resolveRazorpayWebhookTransition } from "@/lib/payments/payment-transitions";
import { verifyRazorpayWebhookSignature } from "@/lib/payments/razorpay";

type RazorpayPaymentEntity = {
  id?: string;
  order_id?: string;
  status?: string;
  amount?: number;
  currency?: string;
};

type RazorpayWebhookPayload = {
  event?: string;
  payload?: {
    payment?: {
      entity?: RazorpayPaymentEntity;
    };
  };
};

export async function POST(request: Request) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Razorpay webhook secret is not configured." },
      { status: 503 },
    );
  }

  const body = await request.text();
  const signature = request.headers.get("x-razorpay-signature");
  if (
    !signature ||
    !verifyRazorpayWebhookSignature({ body, signature, secret })
  ) {
    return NextResponse.json({ error: "Invalid webhook signature." }, { status: 400 });
  }

  let payload: RazorpayWebhookPayload;
  try {
    payload = JSON.parse(body) as RazorpayWebhookPayload;
  } catch {
    return NextResponse.json({ error: "Invalid webhook payload." }, { status: 400 });
  }

  const providerOrderId = payload.payload?.payment?.entity?.order_id;
  if (!providerOrderId) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const payment = await prisma.payment.findUnique({
    where: { providerOrderId },
    include: { order: true },
  });
  if (!payment) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const transition = resolveRazorpayWebhookTransition({
    currentPaymentStatus: payment.status,
    currentOrderStatus: payment.order.status,
    event: payload.event ?? "",
  });

  if (transition.kind === "noop") {
    return NextResponse.json({ ok: true, duplicate: true });
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: {
        providerPaymentId: payload.payload?.payment?.entity?.id,
        status: transition.paymentStatus,
        rawResponse: JSON.parse(JSON.stringify(payload)),
      },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: {
        paymentStatus: transition.paymentStatus,
        status: transition.orderStatus,
      },
    }),
    prisma.trackingEvent.create({
      data: {
        orderId: payment.orderId,
        status: transition.trackingStatus,
        actorId: payment.order.customerId,
        actorRole: "CUSTOMER",
        note: transition.note,
      },
    }),
  ]);

  if (transition.notifyCustomer) {
    await notifyCustomerOfStatus(payment.orderId);
  }

  revalidatePath(`/customer/orders/${payment.orderId}`);
  revalidatePath("/customer");
  revalidatePath("/manager");
  revalidatePath("/admin");

  return NextResponse.json({ ok: true });
}
