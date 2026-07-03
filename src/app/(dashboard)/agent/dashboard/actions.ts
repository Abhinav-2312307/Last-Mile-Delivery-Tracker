"use server";

import type { OrderStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { notifyCustomerOfStatus } from "@/lib/notifications/notification-service";
import { assertStatusTransition } from "@/lib/tracking/status-lifecycle";

export async function updateAvailability(formData: FormData) {
  const session = await requireSession(["AGENT"]);
  const availability = z.enum(["AVAILABLE", "BUSY", "OFFLINE"]).parse(formData.get("availability"));
  await prisma.agentProfile.update({
    where: { userId: session.user.id },
    data: { availability },
  });
  revalidatePath("/agent");
}

export async function updateOrderStatus(orderId: string, nextStatus: OrderStatus) {
  const session = await requireSession(["AGENT"]);
  const order = await prisma.order.findFirstOrThrow({
    where: { id: orderId, assignedAgentId: session.user.id },
  });
  const result = assertStatusTransition({
    from: order.status,
    to: nextStatus,
    actorRole: "AGENT",
  });
  if (!result.ok) throw new Error(result.reason);

  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status: nextStatus } }),
    prisma.trackingEvent.create({
      data: {
        orderId,
        status: nextStatus,
        actorId: session.user.id,
        actorRole: "AGENT",
        note: nextStatus === "FAILED" ? "Delivery attempt failed; customer may request reschedule" : "Status updated by delivery agent",
      },
    }),
  ]);
  await notifyCustomerOfStatus(orderId);
  revalidatePath("/agent");
  revalidatePath(`/agent/orders/${orderId}`);
}
