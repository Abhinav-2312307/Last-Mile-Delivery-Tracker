import { getServerSession } from "next-auth";
import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { notifyCustomerOfStatus } from "@/lib/notifications/notification-service";
import {
  getRazorpayCredentials,
  verifyRazorpaySignature,
} from "@/lib/payments/razorpay";

const bodySchema = z.object({
  orderId: z.string(),
  razorpay_order_id: z.string(),
  razorpay_payment_id: z.string(),
  razorpay_signature: z.string(),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const body = bodySchema.parse(await request.json());
  const payment = await prisma.payment.findFirst({
    where: {
      orderId: body.orderId,
      providerOrderId: body.razorpay_order_id,
      order: { customerId: session.user.id },
    },
  });
  if (!payment) {
    return NextResponse.json({ error: "Payment record not found." }, { status: 404 });
  }
  const { keySecret } = getRazorpayCredentials();
  const valid = verifyRazorpaySignature({
    providerOrderId: body.razorpay_order_id,
    providerPaymentId: body.razorpay_payment_id,
    signature: body.razorpay_signature,
    secret: keySecret,
  });
  if (!valid) return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });

  if (payment.status === "PAID") {
    return NextResponse.json({ ok: true });
  }

  await prisma.$transaction([
    prisma.payment.update({
      where: { id: payment.id },
      data: { providerPaymentId: body.razorpay_payment_id, status: "PAID" },
    }),
    prisma.order.update({
      where: { id: body.orderId },
      data: { paymentStatus: "PAID", status: "PAID" },
    }),
    prisma.trackingEvent.create({
      data: {
        orderId: body.orderId,
        status: "PAID",
        actorId: session.user.id,
        actorRole: "CUSTOMER",
        note: "Razorpay test payment verified",
      },
    }),
  ]);
  await notifyCustomerOfStatus(body.orderId);
  revalidatePath(`/customer/orders/${body.orderId}`);
  revalidatePath("/customer");
  return NextResponse.json({ ok: true });
}
