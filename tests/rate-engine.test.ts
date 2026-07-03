import { describe, expect, it } from "vitest";
import { calculateDeliveryCharge } from "@/lib/pricing/rate-engine";

const rateCards = [
  {
    id: "rate-b2c-intra",
    orderType: "B2C",
    routeType: "INTRA_ZONE",
    pricePerKg: 42,
    minimumCharge: 80,
  },
  {
    id: "rate-b2c-inter",
    orderType: "B2C",
    routeType: "INTER_ZONE",
    pricePerKg: 68,
    minimumCharge: 120,
  },
  {
    id: "rate-b2b-inter",
    orderType: "B2B",
    routeType: "INTER_ZONE",
    pricePerKg: 55,
    minimumCharge: 150,
  },
] as const;

const codSurcharges = [
  { orderType: "B2C", amount: 35 },
  { orderType: "B2B", amount: 65 },
] as const;

describe("calculateDeliveryCharge", () => {
  it("uses volumetric weight when it is higher than actual weight", () => {
    const quote = calculateDeliveryCharge({
      pickupZoneId: "north",
      dropZoneId: "south",
      lengthCm: 50,
      breadthCm: 40,
      heightCm: 30,
      actualWeightKg: 5,
      orderType: "B2B",
      paymentType: "PREPAID",
      rateCards,
      codSurcharges,
    });

    expect(quote.routeType).toBe("INTER_ZONE");
    expect(quote.volumetricWeightKg).toBe(12);
    expect(quote.billableWeightKg).toBe(12);
    expect(quote.baseCharge).toBe(660);
    expect(quote.codSurcharge).toBe(0);
    expect(quote.totalCharge).toBe(660);
  });

  it("adds COD surcharge and applies minimum charge for lightweight B2C intra-zone orders", () => {
    const quote = calculateDeliveryCharge({
      pickupZoneId: "central",
      dropZoneId: "central",
      lengthCm: 10,
      breadthCm: 10,
      heightCm: 10,
      actualWeightKg: 0.4,
      orderType: "B2C",
      paymentType: "COD",
      rateCards,
      codSurcharges,
    });

    expect(quote.routeType).toBe("INTRA_ZONE");
    expect(quote.billableWeightKg).toBe(0.4);
    expect(quote.baseCharge).toBe(80);
    expect(quote.codSurcharge).toBe(35);
    expect(quote.totalCharge).toBe(115);
  });

  it("throws a clear error when no active rate card matches", () => {
    expect(() =>
      calculateDeliveryCharge({
        pickupZoneId: "north",
        dropZoneId: "south",
        lengthCm: 20,
        breadthCm: 20,
        heightCm: 20,
        actualWeightKg: 1,
        orderType: "B2C",
        paymentType: "PREPAID",
        rateCards: [],
        codSurcharges,
      }),
    ).toThrow("No active rate card found for B2C INTER_ZONE");
  });

  it("uses a country-pair rate for an international route", () => {
    const quote = calculateDeliveryCharge({
      pickupCountryCode: "IN",
      dropCountryCode: "US",
      pickupZoneId: "delhi",
      dropZoneId: "new-york",
      lengthCm: 50,
      breadthCm: 40,
      heightCm: 30,
      actualWeightKg: 5,
      orderType: "B2C",
      paymentType: "PREPAID",
      rateCards,
      internationalRateCards: [
        {
          id: "in-us-b2c",
          originCountryCode: "IN",
          destinationCountryCode: "US",
          orderType: "B2C",
          pricePerKg: 900,
          minimumCharge: 2500,
        },
      ],
      codSurcharges,
    });

    expect(quote.routeType).toBe("INTERNATIONAL");
    expect(quote.rateCardId).toBe("in-us-b2c");
    expect(quote.billableWeightKg).toBe(12);
    expect(quote.baseCharge).toBe(10800);
    expect(quote.codSurcharge).toBe(0);
  });

  it("calculates pricing with distance surcharge for custom intra-zone route", () => {
    const quote = calculateDeliveryCharge({
      pickupZoneId: "custom",
      dropZoneId: "custom",
      pickupCountryCode: "IN",
      dropCountryCode: "IN",
      pickupCityName: "Mumbai",
      dropCityName: "Mumbai",
      pickupLatitude: 19.076,
      pickupLongitude: 72.8777,
      dropLatitude: 19.1363,
      dropLongitude: 72.8277,
      lengthCm: 10,
      breadthCm: 10,
      heightCm: 10,
      actualWeightKg: 1,
      orderType: "B2C",
      paymentType: "PREPAID",
      rateCards,
      codSurcharges,
      isCustomRoute: true,
    });

    expect(quote.routeType).toBe("INTRA_ZONE");
    // distance between Mumbai coords is approx 8.5 km.
    // At ₹5 per km (INTRA_ZONE), surcharge is approx 8.5 * 5 = ₹42.5.
    // pricePerKg = 42, minimumCharge = 80.
    // base charge = max(80, 1 * 42 + 42.5) = 84.5
    expect(Math.round(quote.baseCharge)).toBe(85);
  });

  it("calculates pricing with distance surcharge for custom inter-zone route", () => {
    const quote = calculateDeliveryCharge({
      pickupZoneId: "custom",
      dropZoneId: "custom",
      pickupCountryCode: "IN",
      dropCountryCode: "IN",
      pickupCityName: "Delhi",
      dropCityName: "Mumbai",
      pickupLatitude: 28.6139,
      pickupLongitude: 77.209,
      dropLatitude: 19.076,
      dropLongitude: 72.8777,
      lengthCm: 10,
      breadthCm: 10,
      heightCm: 10,
      actualWeightKg: 1,
      orderType: "B2C",
      paymentType: "PREPAID",
      rateCards,
      codSurcharges,
      isCustomRoute: true,
    });

    expect(quote.routeType).toBe("INTER_ZONE");
    // distance Delhi-Mumbai is approx 1148.1 km.
    // At ₹8 per km (INTER_ZONE), surcharge is approx 1148.1 * 8 = 9184.8.
    // pricePerKg = 68, minimumCharge = 120.
    // base charge = max(120, 68 + 9184.8) = 9252.8.
    expect(Math.round(quote.baseCharge)).toBe(9253);
  });
});
