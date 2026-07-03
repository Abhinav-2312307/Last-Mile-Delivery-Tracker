import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  getRazorpayClient,
  getRazorpayCredentials,
} from "@/lib/payments/razorpay";

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { orderId } = z.object({ orderId: z.string() }).parse(await request.json());

  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      customerId: session.user.id,
      paymentType: "PREPAID",
      paymentStatus: "PENDING",
    },
    include: {
      payments: {
        where: { provider: "RAZORPAY", status: "PENDING" },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });
  if (!order) return NextResponse.json({ error: "Order is not payable." }, { status: 404 });
  const pendingPayment = order.payments[0];
  if (pendingPayment?.providerOrderId) {
    const { keyId } = getRazorpayCredentials();
    return NextResponse.json({
      keyId,
      providerOrderId: pendingPayment.providerOrderId,
      amount: Math.round(Number(pendingPayment.amount) * 100),
      currency: pendingPayment.currency,
      orderNumber: order.orderNumber,
      customerName: session.user.name,
      customerEmail: session.user.email,
    });
  }

  try {
    const { keyId } = getRazorpayCredentials();
    const providerOrder = await getRazorpayClient().orders.create({
      amount: Math.round(Number(order.totalCharge) * 100),
      currency: "INR",
      receipt: order.orderNumber,
    });
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "RAZORPAY",
        providerOrderId: providerOrder.id,
        amount: order.totalCharge,
        status: "PENDING",
        rawResponse: JSON.parse(JSON.stringify(providerOrder)),
      },
    });
    return NextResponse.json({
      keyId,
      providerOrderId: providerOrder.id,
      amount: providerOrder.amount,
      currency: providerOrder.currency,
      orderNumber: order.orderNumber,
      customerName: session.user.name,
      customerEmail: session.user.email,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Payment initialization failed." },
      { status: 503 },
    );
  }
}
