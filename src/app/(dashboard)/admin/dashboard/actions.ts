"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export async function createZone(formData: FormData) {
  await requireSession(["ADMIN"]);
  const input = z.object({
    name: z.string().trim().min(2),
    code: z.string().trim().min(2).transform((v) => v.toUpperCase()),
    cityId: z.string().min(1),
  }).parse(Object.fromEntries(formData));
  await prisma.zone.create({ data: input });
  revalidatePath("/admin/dashboard/zones");
}

export async function createArea(formData: FormData) {
  await requireSession(["ADMIN"]);
  const input = z.object({
    name: z.string().trim().min(2),
    pincode: z.string().trim().optional(),
    cityId: z.string().min(1),
    zoneId: z.string().min(1),
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
  }).parse(Object.fromEntries(formData));
  await prisma.area.create({ data: input });
  revalidatePath("/admin/dashboard/zones");
}

export async function createRateCard(formData: FormData) {
  await requireSession(["ADMIN"]);
  const input = z.object({
    name: z.string().trim().min(2),
    orderType: z.enum(["B2B", "B2C"]),
    routeType: z.enum(["INTRA_ZONE", "INTER_ZONE"]),
    pricePerKg: z.coerce.number().positive(),
    minimumCharge: z.coerce.number().positive(),
  }).parse(Object.fromEntries(formData));
  await prisma.rateCard.create({ data: input });
  revalidatePath("/admin/dashboard/rates");
}

export async function updateCodSurcharge(formData: FormData) {
  await requireSession(["ADMIN"]);
  const input = z.object({
    orderType: z.enum(["B2B", "B2C"]),
    amount: z.coerce.number().nonnegative(),
  }).parse(Object.fromEntries(formData));
  await prisma.codSurcharge.upsert({
    where: { orderType: input.orderType },
    update: { amount: input.amount, isActive: true },
    create: input,
  });
  revalidatePath("/admin/dashboard/rates");
}

export async function createStaffUser(formData: FormData) {
  await requireSession(["ADMIN"]);
  const input = z.object({
    name: z.string().trim().min(2),
    email: z.string().email().transform((v) => v.toLowerCase()),
    phone: z.string().trim().min(8),
    role: z.enum(["CUSTOMER", "AGENT", "MANAGER", "ADMIN"]),
    password: z.string().min(8),
  }).parse(Object.fromEntries(formData));
  const { password, ...userInput } = input;
  const user = await prisma.user.create({
    data: { ...userInput, passwordHash: await bcrypt.hash(password, 10), isApproved: true },
  });
  if (user.role === "AGENT") {
    await prisma.agentProfile.create({
      data: { userId: user.id, employeeCode: `AG-${Date.now().toString().slice(-6)}` },
    });
  }
  revalidatePath("/admin/dashboard/users");
}

export async function toggleUser(userId: string, nextActive: boolean) {
  const session = await requireSession(["ADMIN"]);
  if (session.user.id === userId && !nextActive) throw new Error("You cannot deactivate your own account.");
  await prisma.user.update({ where: { id: userId }, data: { isActive: nextActive } });
  revalidatePath("/admin/dashboard/users");
}

export async function approveUser(userId: string) {
  await requireSession(["ADMIN"]);
  await prisma.user.update({
    where: { id: userId },
    data: { isApproved: true },
  });
  revalidatePath("/admin/dashboard/approvals");
  revalidatePath("/admin/dashboard/users");
}

export async function rejectUser(userId: string) {
  await requireSession(["ADMIN"]);
  // Delete the unapproved user record
  await prisma.user.delete({
    where: { id: userId },
  });
  revalidatePath("/admin/dashboard/approvals");
}
