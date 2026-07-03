import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(8).max(20),
  password: z.string().min(8).max(72),
  role: z.enum(["CUSTOMER", "AGENT", "MANAGER", "ADMIN"]).default("CUSTOMER"),
  approvalNote: z.string().trim().max(500).optional(),
  agreedToTerms: z.preprocess((v) => v === "true" || v === true, z.boolean()).optional(),
});

export async function POST(request: Request) {
  const parsed = registrationSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter a valid name, email, phone, and 8+ character password." },
      { status: 400 },
    );
  }

  const existing = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });
  if (existing) {
    return NextResponse.json(
      { error: "An account with this email already exists." },
      { status: 409 },
    );
  }

  const isStaff = parsed.data.role !== "CUSTOMER";
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: parsed.data.role,
      isApproved: !isStaff, // Customers are auto-approved; staff need admin approval
      approvalNote: parsed.data.approvalNote || null,
      emailVerified: new Date(),
    },
  });

  // Create agent profile for AGENT role registrations
  if (user.role === "AGENT") {
    await prisma.agentProfile.create({
      data: {
        userId: user.id,
        employeeCode: `AG-${Date.now().toString().slice(-6)}`,
      },
    });
  }

  if (isStaff) {
    return NextResponse.json(
      {
        ok: true,
        email: parsed.data.email,
        pendingApproval: true,
        message: "Your registration is pending admin approval. You will be able to sign in once approved.",
      },
      { status: 201 },
    );
  }

  return NextResponse.json(
    { ok: true, email: parsed.data.email },
    { status: 201 },
  );
}
