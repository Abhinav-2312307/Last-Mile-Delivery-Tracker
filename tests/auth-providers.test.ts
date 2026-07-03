import { afterEach, describe, expect, it } from "vitest";

import { mapGoogleProfile } from "@/lib/auth/google-profile";
import { getRazorpayCredentials } from "@/lib/payments/razorpay";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
});

describe("Google authentication", () => {
  it("marks a Google account verified only when Google verified the email", () => {
    const verified = mapGoogleProfile({
      sub: "google-user",
      name: "Google User",
      email: "person@example.com",
      picture: "https://example.com/avatar.png",
      email_verified: true,
    });
    const unverified = mapGoogleProfile({
      sub: "other-user",
      name: "Other User",
      email: "other@example.com",
      email_verified: false,
    });

    expect(verified.emailVerified).toBeInstanceOf(Date);
    expect(verified.role).toBe("CUSTOMER");
    expect(unverified.emailVerified).toBeNull();
  });
});

describe("Razorpay configuration", () => {
  it("accepts the lowercase credential names already present in the environment", () => {
    delete process.env.RAZORPAY_KEY_ID;
    delete process.env.RAZORPAY_KEY_SECRET;
    process.env.razorpay_key_id = "rzp_test_existing";
    process.env.razorpay_key_secret = "existing-secret";

    expect(getRazorpayCredentials()).toEqual({
      keyId: "rzp_test_existing",
      keySecret: "existing-secret",
    });
  });
});
