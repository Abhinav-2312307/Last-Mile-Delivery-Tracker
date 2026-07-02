import { describe, expect, it } from "vitest";

import {
  hashVerificationCode,
  isVerificationCodeValid,
  verificationCodeExpiresAt,
} from "@/lib/auth/email-verification";

describe("email verification codes", () => {
  const email = "person@example.com";
  const secret = "application-secret";
  const code = "123456";

  it("hashes and verifies a matching code without storing the code itself", () => {
    const codeHash = hashVerificationCode({ code, email, secret });
    expect(codeHash).not.toContain(code);
    expect(
      isVerificationCodeValid({
        code,
        email,
        secret,
        codeHash,
        expiresAt: new Date("2026-07-02T10:10:00Z"),
        now: new Date("2026-07-02T10:05:00Z"),
        attempts: 0,
      }),
    ).toBe(true);
  });

  it("expires codes after ten minutes", () => {
    expect(
      verificationCodeExpiresAt(new Date("2026-07-02T10:00:00Z")),
    ).toEqual(new Date("2026-07-02T10:10:00Z"));
  });

  it("rejects expired, mismatched, and over-attempted codes", () => {
    const codeHash = hashVerificationCode({ code, email, secret });
    const base = {
      email,
      secret,
      codeHash,
      expiresAt: new Date("2026-07-02T10:10:00Z"),
      now: new Date("2026-07-02T10:05:00Z"),
      attempts: 0,
    };
    expect(isVerificationCodeValid({ ...base, code: "000000" })).toBe(false);
    expect(
      isVerificationCodeValid({
        ...base,
        code,
        now: new Date("2026-07-02T10:10:01Z"),
      }),
    ).toBe(false);
    expect(
      isVerificationCodeValid({ ...base, code, attempts: 5 }),
    ).toBe(false);
  });
});
