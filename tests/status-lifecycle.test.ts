import { describe, expect, it } from "vitest";
import { assertStatusTransition } from "@/lib/tracking/status-lifecycle";

describe("assertStatusTransition", () => {
  it("allows an agent to move an assigned order through the normal delivery path", () => {
    expect(
      assertStatusTransition({
        from: "ASSIGNED",
        to: "PICKED_UP",
        actorRole: "AGENT",
      }),
    ).toEqual({ ok: true });
  });

  it("rejects a customer attempting to mark an order delivered", () => {
    expect(
      assertStatusTransition({
        from: "OUT_FOR_DELIVERY",
        to: "DELIVERED",
        actorRole: "CUSTOMER",
      }),
    ).toEqual({
      ok: false,
      reason: "CUSTOMER cannot change order status to DELIVERED",
    });
  });

  it("allows admin override with a reason even when transition is unusual", () => {
    expect(
      assertStatusTransition({
        from: "DELIVERED",
        to: "FAILED",
        actorRole: "ADMIN",
        overrideReason: "Correction requested during audit",
      }),
    ).toEqual({ ok: true });
  });

  it("rejects admin override when reason is missing", () => {
    expect(
      assertStatusTransition({
        from: "DELIVERED",
        to: "FAILED",
        actorRole: "ADMIN",
      }),
    ).toEqual({
      ok: false,
      reason: "Admin override requires a reason",
    });
  });
});
