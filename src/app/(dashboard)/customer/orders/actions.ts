"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";
import { orderInputSchema } from "@/lib/orders/order-input";
import { calculateDeliveryCharge } from "@/lib/pricing/rate-engine";

export async function createOrder(formData: FormData) {
  const session = await requireSession(["CUSTOMER"]);
  const parsed = orderInputSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    throw new Error("Please complete all order fields with valid values.");
  }

  const input = parsed.data;
  const [pickupArea, dropArea, rateCards, internationalRateCards, codSurcharges] = await Promise.all([
    prisma.area.findUniqueOrThrow({
      where: { id: input.pickupAreaId },
      include: { city: { include: { country: true, state: true } } },
    }),
    prisma.area.findUniqueOrThrow({
      where: { id: input.dropAreaId },
      include: { city: { include: { country: true, state: true } } },
    }),
    prisma.rateCard.findMany({ where: { isActive: true } }),
    prisma.internationalRateCard.findMany({ where: { isActive: true } }),
    prisma.codSurcharge.findMany({ where: { isActive: true } }),
  ]);
  const locationMatches = (
    area: typeof pickupArea,
    countryCode: string,
    stateCode: string,
    cityName: string,
  ) =>
    area.city.country.isoCode === countryCode &&
    area.city.state?.isoCode === stateCode &&
    area.city.name === cityName;
  if (
    !locationMatches(
      pickupArea,
      input.pickupCountryCode,
      input.pickupStateCode,
      input.pickupCityName,
    ) ||
    !locationMatches(
      dropArea,
      input.dropCountryCode,
      input.dropStateCode,
      input.dropCityName,
    )
  ) {
    throw new Error("The selected service area does not match the address.");
  }
  if (
    input.pickupCountryCode !== input.dropCountryCode &&
    input.paymentType === "COD"
  ) {
    throw new Error("International shipments must be prepaid.");
  }

  const quote = calculateDeliveryCharge({
    pickupZoneId: pickupArea.zoneId,
    dropZoneId: dropArea.zoneId,
    pickupCountryCode: input.pickupCountryCode,
    dropCountryCode: input.dropCountryCode,
    lengthCm: input.lengthCm,
    breadthCm: input.breadthCm,
    heightCm: input.heightCm,
    actualWeightKg: input.actualWeightKg,
    orderType: input.orderType,
    paymentType: input.paymentType,
    rateCards: rateCards.map((rate) => ({
      id: rate.id,
      orderType: rate.orderType,
      routeType: rate.routeType,
      pricePerKg: Number(rate.pricePerKg),
      minimumCharge: Number(rate.minimumCharge),
    })),
    internationalRateCards: internationalRateCards.map((rate) => ({
      id: rate.id,
      originCountryCode: rate.originCountryCode,
      destinationCountryCode: rate.destinationCountryCode,
      orderType: rate.orderType,
      pricePerKg: Number(rate.pricePerKg),
      minimumCharge: Number(rate.minimumCharge),
    })),
    codSurcharges: codSurcharges.map((fee) => ({
      orderType: fee.orderType,
      amount: Number(fee.amount),
    })),
  });

  const order = await prisma.$transaction(async (tx) => {
    const pickupAddress = await tx.address.create({
      data: {
        label: "Pickup",
        line1: input.pickupLine1,
        line2: input.pickupLine2 || null,
        countryCode: input.pickupCountryCode,
        stateCode: input.pickupStateCode,
        cityName: input.pickupCityName,
        postalCode: input.pickupPostalCode,
        contactName: input.pickupContactName,
        contactPhone: input.pickupContactPhone,
        userId: session.user.id,
        areaId: pickupArea.id,
        latitude: pickupArea.latitude,
        longitude: pickupArea.longitude,
      },
    });
    const dropAddress = await tx.address.create({
      data: {
        label: "Drop",
        line1: input.dropLine1,
        line2: input.dropLine2 || null,
        countryCode: input.dropCountryCode,
        stateCode: input.dropStateCode,
        cityName: input.dropCityName,
        postalCode: input.dropPostalCode,
        contactName: input.dropContactName,
        contactPhone: input.dropContactPhone,
        userId: session.user.id,
        areaId: dropArea.id,
        latitude: dropArea.latitude,
        longitude: dropArea.longitude,
      },
    });
    const created = await tx.order.create({
      data: {
        orderNumber: `LM-${Date.now().toString(36).toUpperCase()}`,
        customerId: session.user.id,
        createdById: session.user.id,
        pickupAddressId: pickupAddress.id,
        dropAddressId: dropAddress.id,
        pickupZoneId: pickupArea.zoneId,
        dropZoneId: dropArea.zoneId,
        orderType: input.orderType,
        paymentType: input.paymentType,
        paymentStatus:
          input.paymentType === "COD" ? "NOT_REQUIRED" : "PENDING",
        status: input.paymentType === "COD" ? "CONFIRMED" : "PAYMENT_PENDING",
        lengthCm: input.lengthCm,
        breadthCm: input.breadthCm,
        heightCm: input.heightCm,
        actualWeightKg: input.actualWeightKg,
        volumetricWeightKg: quote.volumetricWeightKg,
        billableWeightKg: quote.billableWeightKg,
        routeType: quote.routeType,
        baseCharge: quote.baseCharge,
        codSurcharge: quote.codSurcharge,
        totalCharge: quote.totalCharge,
        rateCardSnapshot: {
          rateCardId: quote.rateCardId,
          calculatedAt: new Date().toISOString(),
        },
      },
    });
    await tx.trackingEvent.create({
      data: {
        orderId: created.id,
        status: created.status,
        note:
          input.paymentType === "COD"
            ? "Order confirmed and awaiting assignment"
            : "Order created and awaiting payment",
        actorId: session.user.id,
        actorRole: "CUSTOMER",
      },
    });
    return created;
  });

  revalidatePath("/customer");
  redirect(`/customer/orders/${order.id}`);
}

export async function requestReschedule(orderId: string, formData: FormData) {
  const session = await requireSession(["CUSTOMER"]);
  const requestedDate = z.coerce.date().parse(formData.get("requestedDate"));
  const note = z.string().trim().max(500).parse(formData.get("note") ?? "");
  const order = await prisma.order.findFirstOrThrow({
    where: { id: orderId, customerId: session.user.id, status: "FAILED" },
  });

  await prisma.$transaction([
    prisma.rescheduleRequest.create({
      data: {
        orderId,
        requestedById: session.user.id,
        requestedDate,
        note,
      },
    }),
    prisma.order.update({
      where: { id: order.id },
      data: { status: "RESCHEDULE_REQUESTED" },
    }),
    prisma.trackingEvent.create({
      data: {
        orderId,
        status: "RESCHEDULE_REQUESTED",
        note: note || `Requested for ${requestedDate.toLocaleDateString("en-IN")}`,
        actorId: session.user.id,
        actorRole: "CUSTOMER",
      },
    }),
  ]);
  revalidatePath(`/customer/orders/${orderId}`);
}
