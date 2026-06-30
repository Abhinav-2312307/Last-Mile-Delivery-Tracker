export type OrderType = "B2B" | "B2C";
export type PaymentType = "PREPAID" | "COD";
export type RouteType = "INTRA_ZONE" | "INTER_ZONE";

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

export type DeliveryChargeInput = {
  pickupZoneId: string;
  dropZoneId: string;
  lengthCm: number;
  breadthCm: number;
  heightCm: number;
  actualWeightKg: number;
  orderType: OrderType;
  paymentType: PaymentType;
  rateCards: readonly RateCardInput[];
  codSurcharges: readonly CodSurchargeInput[];
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

export function calculateDeliveryCharge(
  input: DeliveryChargeInput,
): DeliveryChargeQuote {
  const routeType: RouteType =
    input.pickupZoneId === input.dropZoneId ? "INTRA_ZONE" : "INTER_ZONE";
  const volumetricWeightKg = roundWeight(
    (input.lengthCm * input.breadthCm * input.heightCm) / 5000,
  );
  const billableWeightKg = Math.max(input.actualWeightKg, volumetricWeightKg);
  const rateCard = input.rateCards.find(
    (candidate) =>
      candidate.orderType === input.orderType &&
      candidate.routeType === routeType,
  );

  if (!rateCard) {
    throw new Error(
      `No active rate card found for ${input.orderType} ${routeType}`,
    );
  }

  const calculatedBaseCharge = billableWeightKg * rateCard.pricePerKg;
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
