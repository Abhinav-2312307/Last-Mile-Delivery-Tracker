export type OrderType = "B2B" | "B2C";
export type PaymentType = "PREPAID" | "COD";
export type RouteType = "INTRA_ZONE" | "INTER_ZONE" | "INTERNATIONAL";

export type RateCardInput = {
  id: string;
  orderType: OrderType;
  routeType: RouteType;
  pricePerKg: number;
  minimumCharge: number;
};

export type CodSurchargeInput = {
  orderType: OrderType;
  amount: number;
};

export type InternationalRateCardInput = {
  id: string;
  originCountryCode: string;
  destinationCountryCode: string;
  orderType: OrderType;
  pricePerKg: number;
  minimumCharge: number;
};

export type DeliveryChargeInput = {
  pickupZoneId: string;
  dropZoneId: string;
  pickupCountryCode?: string;
  dropCountryCode?: string;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  actualWeightKg: number;
  orderType: OrderType;
  paymentType: PaymentType;
  rateCards: readonly RateCardInput[];
  internationalRateCards?: readonly InternationalRateCardInput[];
  codSurcharges: readonly CodSurchargeInput[];
  pickupLatitude?: number;
  pickupLongitude?: number;
  dropLatitude?: number;
  dropLongitude?: number;
  pickupCityName?: string;
  dropCityName?: string;
  isCustomRoute?: boolean;
};

export type DeliveryChargeQuote = {
  routeType: RouteType;
  rateCardId: string;
  volumetricWeightKg: number;
  billableWeightKg: number;
  baseCharge: number;
  codSurcharge: number;
  totalCharge: number;
};

const roundMoney = (value: number) => Math.round(value * 100) / 100;

const roundWeight = (value: number) => Math.round(value * 1000) / 1000;

function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export function calculateDeliveryCharge(
  input: DeliveryChargeInput,
): DeliveryChargeQuote {
  const isInternational =
    Boolean(input.pickupCountryCode) &&
    Boolean(input.dropCountryCode) &&
    input.pickupCountryCode !== input.dropCountryCode;

  const isCustom =
    Boolean(input.isCustomRoute) ||
    input.pickupZoneId === "custom" ||
    input.dropZoneId === "custom";

  const isIntraZone =
    !isInternational &&
    ((!isCustom && input.pickupZoneId === input.dropZoneId) ||
      (isCustom &&
        input.pickupCityName !== undefined &&
        input.dropCityName !== undefined &&
        input.pickupCityName.toLowerCase() === input.dropCityName.toLowerCase()));

  const routeType: RouteType = isInternational
    ? "INTERNATIONAL"
    : isIntraZone
      ? "INTRA_ZONE"
      : "INTER_ZONE";

  const volumetricWeightKg = roundWeight(
    (input.lengthCm * input.breadthCm * input.heightCm) / 5000,
  );
  const billableWeightKg = Math.max(input.actualWeightKg, volumetricWeightKg);
  const rateCard =
    routeType === "INTERNATIONAL"
      ? input.internationalRateCards?.find(
          (candidate) =>
            candidate.orderType === input.orderType &&
            candidate.originCountryCode === input.pickupCountryCode &&
            candidate.destinationCountryCode === input.dropCountryCode,
        )
      : input.rateCards.find(
          (candidate) =>
            candidate.orderType === input.orderType &&
            candidate.routeType === routeType,
        );

  if (!rateCard) {
    throw new Error(
      `No active rate card found for ${input.orderType} ${routeType}`,
    );
  }

  let distance = 0;
  if (isCustom) {
    if (
      input.pickupLatitude !== undefined &&
      input.pickupLongitude !== undefined &&
      input.dropLatitude !== undefined &&
      input.dropLongitude !== undefined
    ) {
      distance = calculateDistance(
        input.pickupLatitude,
        input.pickupLongitude,
        input.dropLatitude,
        input.dropLongitude,
      );
    }
    if (distance <= 0) {
      distance = isInternational ? 5000 : 50;
    }
    if (distance < 5) {
      distance = 5;
    }
  }

  const distanceSurcharge = isCustom
    ? distance * (routeType === "INTERNATIONAL" ? 15 : routeType === "INTER_ZONE" ? 8 : 5)
    : 0;

  const calculatedBaseCharge = billableWeightKg * rateCard.pricePerKg + distanceSurcharge;
  const baseCharge = roundMoney(
    Math.max(rateCard.minimumCharge, calculatedBaseCharge),
  );
  const codSurcharge =
    input.paymentType === "COD"
      ? (input.codSurcharges.find(
          (surcharge) => surcharge.orderType === input.orderType,
        )?.amount ?? 0)
      : 0;

  return {
    routeType,
    rateCardId: rateCard.id,
    volumetricWeightKg,
    billableWeightKg,
    baseCharge,
    codSurcharge,
    totalCharge: roundMoney(baseCharge + codSurcharge),
  };
}
