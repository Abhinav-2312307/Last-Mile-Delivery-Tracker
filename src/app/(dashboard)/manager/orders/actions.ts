"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { rankAgentsForOrder } from "@/lib/assignment/assignment-engine";
import { prisma } from "@/lib/db";
import { notifyCustomerOfStatus } from "@/lib/notifications/notification-service";

async function assign(orderId: string, agentUserId: string, actorId: string, actorRole: "ADMIN" | "MANAGER", note: string) {
  await prisma.$transaction([
    prisma.order.update({
      where: { id: orderId },
      data: { assignedAgentId: agentUserId, status: "ASSIGNED" },
    }),
    prisma.trackingEvent.create({
      data: { orderId, status: "ASSIGNED", actorId, actorRole, note },
    }),
  ]);
  await notifyCustomerOfStatus(orderId);
}

export async function assignAgent(orderId: string, formData: FormData) {
  const session = await requireSession(["MANAGER", "ADMIN"]);
  const actorRole = session.user.role === "ADMIN" ? "ADMIN" : "MANAGER";
  const agentUserId = z.string().min(1).parse(formData.get("agentUserId"));
  await assign(orderId, agentUserId, session.user.id, actorRole, "Agent assigned manually");
  revalidatePath("/manager/orders");
  revalidatePath("/admin/orders");
}

export async function autoAssignAgent(orderId: string) {
  const session = await requireSession(["MANAGER", "ADMIN"]);
  const actorRole = session.user.role === "ADMIN" ? "ADMIN" : "MANAGER";
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { pickupAddress: true },
  });
  const profiles = await prisma.agentProfile.findMany({
    where: { availability: "AVAILABLE" },
    include: {
      user: {
        include: {
          assignedOrders: {
            where: { status: { in: ["ASSIGNED", "PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"] } },
            select: { id: true },
          },
        },
      },
      zones: true,
    },
  });
  const ranked = rankAgentsForOrder({
    pickupLatitude: Number(order.pickupAddress.latitude),
    pickupLongitude: Number(order.pickupAddress.longitude),
    dropZoneId: order.dropZoneId,
    agents: profiles
      .filter((profile) => profile.currentLatitude && profile.currentLongitude)
      .map((profile) => ({
        id: profile.userId,
        availability: profile.availability,
        currentLatitude: Number(profile.currentLatitude),
        currentLongitude: Number(profile.currentLongitude),
        zoneIds: profile.zones.map((zone) => zone.zoneId),
        activeOrderCount: profile.user.assignedOrders.length,
      })),
  });
  if (!ranked[0]) throw new Error("No available agent has a current location.");
  await assign(orderId, ranked[0].id, session.user.id, actorRole, "Nearest available agent auto-assigned");
  revalidatePath("/manager/orders");
  revalidatePath("/admin/orders");
}

export async function adminOverrideStatus(orderId: string, formData: FormData) {
  const session = await requireSession(["ADMIN"]);
  const status = z.enum([
    "CONFIRMED", "PAYMENT_PENDING", "PAID", "ASSIGNED", "PICKED_UP",
    "IN_TRANSIT", "OUT_FOR_DELIVERY", "DELIVERED", "FAILED",
    "RESCHEDULE_REQUESTED", "PENDING_REASSIGNMENT", "CANCELLED",
  ]).parse(formData.get("status"));
  const reason = z.string().trim().min(4).parse(formData.get("reason"));
  await prisma.$transaction([
    prisma.order.update({ where: { id: orderId }, data: { status } }),
    prisma.trackingEvent.create({
      data: { orderId, status, actorId: session.user.id, actorRole: "ADMIN", note: `Admin override: ${reason}` },
    }),
  ]);
  await notifyCustomerOfStatus(orderId);
  revalidatePath("/admin/orders");
}

export async function approveReschedule(orderId: string) {
  const session = await requireSession(["MANAGER", "ADMIN"]);
  await prisma.$transaction([
    prisma.rescheduleRequest.updateMany({
      where: { orderId, status: "REQUESTED" },
      data: { status: "APPROVED" },
    }),
    prisma.order.update({
      where: { id: orderId },
      data: { status: "PENDING_REASSIGNMENT", assignedAgentId: null },
    }),
    prisma.trackingEvent.create({
      data: {
        orderId,
        status: "PENDING_REASSIGNMENT",
        actorId: session.user.id,
        actorRole: session.user.role,
        note: "Reschedule approved; order returned to dispatch queue",
      },
    }),
  ]);
  await notifyCustomerOfStatus(orderId);
  revalidatePath("/manager/orders");
  revalidatePath("/admin/orders");
}
