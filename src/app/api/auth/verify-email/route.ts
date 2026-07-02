import { NextResponse } from "next/server";
import { z } from "zod";

import {
  getVerificationSecret,
  isVerificationCodeValid,
} from "@/lib/auth/email-verification";
import { prisma } from "@/lib/db";

const verifySchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
  code: z.string().regex(/^\d{6}$/),
});

export async function POST(request: Request) {
  const parsed = verifySchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Enter your email and the 6-digit OTP." },
      { status: 400 },
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: {
      verificationCodes: {
        where: { usedAt: null },
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
  }
  if (user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  const challenge = user.verificationCodes[0];
  if (!challenge) {
    return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
  }

  const valid = isVerificationCodeValid({
    code: parsed.data.code,
    email: parsed.data.email,
    secret: getVerificationSecret(),
    codeHash: challenge.codeHash,
    expiresAt: challenge.expiresAt,
    attempts: challenge.attempts,
  });

  if (!valid) {
    await prisma.emailVerificationCode.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } },
    });
    return NextResponse.json({ error: "Invalid or expired OTP." }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.emailVerificationCode.update({
      where: { id: challenge.id },
      data: { usedAt: new Date() },
    }),
    prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: new Date() },
    }),
  ]);

  return NextResponse.json({ ok: true });
}
