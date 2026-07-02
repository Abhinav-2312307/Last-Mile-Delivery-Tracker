import { createHmac, randomInt, timingSafeEqual } from "node:crypto";

export const VERIFICATION_CODE_TTL_MS = 10 * 60 * 1000;
export const VERIFICATION_CODE_MAX_ATTEMPTS = 5;
export const VERIFICATION_RESEND_DELAY_MS = 60 * 1000;

export function generateVerificationCode() {
  return randomInt(0, 1_000_000).toString().padStart(6, "0");
}

export function verificationCodeExpiresAt(now = new Date()) {
  return new Date(now.getTime() + VERIFICATION_CODE_TTL_MS);
}

export function hashVerificationCode(input: {
  code: string;
  email: string;
  secret: string;
}) {
  return createHmac("sha256", input.secret)
    .update(`${input.email.toLowerCase()}:${input.code}`)
    .digest("hex");
}

export function isVerificationCodeValid(input: {
  code: string;
  email: string;
  secret: string;
  codeHash: string;
  expiresAt: Date;
  now?: Date;
  attempts: number;
}) {
  const now = input.now ?? new Date();
  if (
    input.expiresAt <= now ||
    input.attempts >= VERIFICATION_CODE_MAX_ATTEMPTS
  ) {
    return false;
  }
  const expected = Buffer.from(
    hashVerificationCode({
      code: input.code,
      email: input.email,
      secret: input.secret,
    }),
    "utf8",
  );
  const received = Buffer.from(input.codeHash, "utf8");
  return (
    expected.length === received.length &&
    timingSafeEqual(expected, received)
  );
}

export function getVerificationSecret() {
  const secret =
    process.env.EMAIL_VERIFICATION_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("Email verification secret is not configured.");
  return secret;
}
