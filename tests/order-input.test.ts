import { describe, expect, it } from "vitest";

import { parcelSchema } from "@/lib/orders/order-input";

describe("parcelSchema", () => {
  const validParcel = {
    lengthCm: 30,
    breadthCm: 20,
    heightCm: 15,
    actualWeightKg: 2,
  };

  it("accepts a parcel within the supported limits", () => {
    expect(parcelSchema.safeParse(validParcel).success).toBe(true);
  });

  it.each(["lengthCm", "breadthCm", "heightCm"] as const)(
    "rejects %s above 200 cm",
    (field) => {
      expect(
        parcelSchema.safeParse({ ...validParcel, [field]: 200.01 }).success,
      ).toBe(false);
    },
  );

  it("rejects actual weight above 100 kg", () => {
    expect(
      parcelSchema.safeParse({ ...validParcel, actualWeightKg: 100.01 }).success,
    ).toBe(false);
  });
});
