import { describe, expect, it } from "vitest";

import { buildStatusNotifications } from "@/lib/notifications/policy";

describe("status notification policy", () => {
  it("creates email and SMS messages for a status update", () => {
    expect(
      buildStatusNotifications({
        orderNumber: "LM-100",
        status: "OUT_FOR_DELIVERY",
        customerName: "Riya",
      }),
    ).toEqual([
      {
        channel: "EMAIL",
        subject: "LM-100 is out for delivery",
        message: "Hi Riya, your order LM-100 is now out for delivery.",
      },
      {
        channel: "SMS",
        subject: undefined,
        message: "LM-100 update: out for delivery.",
      },
    ]);
  });
});
