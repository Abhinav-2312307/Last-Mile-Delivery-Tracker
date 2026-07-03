import { OrderForm } from "@/components/order/order-form";
import { prisma } from "@/lib/db";

export default async function NewOrderPage() {
  const [areas, rateCards, internationalRateCards, codSurcharges] = await Promise.all([
    prisma.area.findMany({
      include: { city: { include: { country: true, state: true } }, zone: true },
      orderBy: [{ city: { name: "asc" } }, { name: "asc" }],
    }),
    prisma.rateCard.findMany({ where: { isActive: true } }),
    prisma.internationalRateCard.findMany({ where: { isActive: true } }),
    prisma.codSurcharge.findMany({ where: { isActive: true } }),
  ]);

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">Customer portal</p><h1>Book a delivery</h1><p>Charges are recalculated securely when you confirm.</p></div>
      </div>
      <OrderForm
        areas={areas.map((area) => ({
          id: area.id,
          name: area.name,
          pincode: area.pincode,
          zoneId: area.zoneId,
          zoneName: area.zone.name,
          cityName: area.city.name,
          stateCode: area.city.state?.isoCode ?? "",
          countryName: area.city.country.name,
          countryCode: area.city.country.isoCode,
          latitude: Number(area.latitude),
          longitude: Number(area.longitude),
        }))}
        internationalRateCards={internationalRateCards.map((rate) => ({
          id: rate.id,
          originCountryCode: rate.originCountryCode,
          destinationCountryCode: rate.destinationCountryCode,
          orderType: rate.orderType,
          pricePerKg: Number(rate.pricePerKg),
          minimumCharge: Number(rate.minimumCharge),
        }))}
        rateCards={rateCards.map((rate) => ({
          id: rate.id,
          orderType: rate.orderType,
          routeType: rate.routeType,
          pricePerKg: Number(rate.pricePerKg),
          minimumCharge: Number(rate.minimumCharge),
        }))}
        codSurcharges={codSurcharges.map((fee) => ({
          orderType: fee.orderType,
          amount: Number(fee.amount),
        }))}
      />
    </>
  );
}
