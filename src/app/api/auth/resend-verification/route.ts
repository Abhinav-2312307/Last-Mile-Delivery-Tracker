import { NextResponse } from "next/server";
import { z } from "zod";

import {
  generateVerificationCode,
  getVerificationSecret,
  hashVerificationCode,
  VERIFICATION_RESEND_DELAY_MS,
  verificationCodeExpiresAt,
} from "@/lib/auth/email-verification";
import { sendVerificationEmail } from "@/lib/auth/send-verification-email";
import { prisma } from "@/lib/db";

const resendSchema = z.object({
  email: z.string().email().transform((value) => value.toLowerCase()),
});

export async function POST(request: Request) {
  const parsed = resendSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Enter a valid email." }, { status: 400 });
  }

  const user = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    include: {
      verificationCodes: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  if (!user || user.emailVerified) {
    return NextResponse.json({ ok: true });
  }

  const lastCode = user.verificationCodes[0];
  if (
    lastCode &&
    Date.now() - lastCode.createdAt.getTime() < VERIFICATION_RESEND_DELAY_MS
  ) {
    return NextResponse.json(
      { error: "Please wait a minute before requesting another OTP." },
      { status: 429 },
    );
  }

  const code = generateVerificationCode();
  await prisma.emailVerificationCode.create({
    data: {
      userId: user.id,
      codeHash: hashVerificationCode({
        code,
        email: user.email,
        secret: getVerificationSecret(),
      }),
      expiresAt: verificationCodeExpiresAt(),
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
        error:
          error instanceof Error
            ? error.message
            : "Verification email could not be sent.",
      },
      { status: 503 },
    );
  }

  return NextResponse.json({ ok: true });
}
