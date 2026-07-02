import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/db";
import {
  generateVerificationCode,
  getVerificationSecret,
  hashVerificationCode,
  verificationCodeExpiresAt,
} from "@/lib/auth/email-verification";
import { sendVerificationEmail } from "@/lib/auth/send-verification-email";

const registrationSchema = z.object({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().transform((value) => value.toLowerCase()),
  phone: z.string().trim().min(8).max(20),
  password: z.string().min(8).max(72),
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

  const code = generateVerificationCode();
  const secret = getVerificationSecret();
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      passwordHash: await bcrypt.hash(parsed.data.password, 10),
      role: "CUSTOMER",
      emailVerified: null,
      verificationCodes: {
        create: {
          codeHash: hashVerificationCode({
            code,
            email: parsed.data.email,
            secret,
          }),
          expiresAt: verificationCodeExpiresAt(),
        },
      },
    },
  });

  try {
    await sendVerificationEmail({
      email: user.email,
      name: user.name,
      code,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: true,
        email: parsed.data.email,
        emailSent: false,
        warning:
          error instanceof Error
            ? error.message
            : "Account created, but verification email could not be sent.",
      },
      { status: 201 },
    );
  }

  return NextResponse.json(
    { ok: true, email: parsed.data.email, emailSent: true },
    { status: 201 },
  );
}
