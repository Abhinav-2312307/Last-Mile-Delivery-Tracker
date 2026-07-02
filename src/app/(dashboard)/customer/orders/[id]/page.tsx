import { notFound } from "next/navigation";

import { requestReschedule } from "@/app/(dashboard)/customer/orders/actions";
import { StatusBadge } from "@/components/order/status-badge";
import { RazorpayButton } from "@/components/order/razorpay-button";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function CustomerOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requireSession(["CUSTOMER"]);
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, customerId: session.user.id },
    include: {
      pickupAddress: { include: { area: { include: { city: true, zone: true } } } },
      dropAddress: { include: { area: { include: { city: true, zone: true } } } },
      assignedAgent: true,
      trackingEvents: { orderBy: { createdAt: "desc" } },
      payments: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">Order detail</p><h1>{order.orderNumber}</h1><p>Created {order.createdAt.toLocaleString("en-IN")}</p></div>
        <StatusBadge status={order.status} />
      </div>
      <section className="detail-grid">
        <article className="data-section">
          <div className="section-title"><h2>Shipment</h2></div>
          <dl className="detail-list">
            <div><dt>Pickup</dt><dd>{[order.pickupAddress.line1, order.pickupAddress.line2, order.pickupAddress.area.name, order.pickupAddress.cityName || order.pickupAddress.area.city.name, order.pickupAddress.stateCode, order.pickupAddress.countryCode, order.pickupAddress.postalCode].filter(Boolean).join(", ")}</dd></div>
            <div><dt>Drop</dt><dd>{[order.dropAddress.line1, order.dropAddress.line2, order.dropAddress.area.name, order.dropAddress.cityName || order.dropAddress.area.city.name, order.dropAddress.stateCode, order.dropAddress.countryCode, order.dropAddress.postalCode].filter(Boolean).join(", ")}</dd></div>
            <div><dt>Route</dt><dd>{order.pickupAddress.area.zone.name} → {order.dropAddress.area.zone.name}</dd></div>
            <div><dt>Agent</dt><dd>{order.assignedAgent?.name ?? "Awaiting assignment"}</dd></div>
            <div><dt>Billable weight</dt><dd>{Number(order.billableWeightKg)} kg</dd></div>
            <div><dt>Service</dt><dd>{order.orderType} · {order.paymentType}</dd></div>
          </dl>
        </article>
        <article className="data-section charge-summary">
          <div className="section-title"><h2>Charges</h2></div>
          <dl>
            <div><dt>Base charge</dt><dd>₹{Number(order.baseCharge).toFixed(2)}</dd></div>
            <div><dt>COD surcharge</dt><dd>₹{Number(order.codSurcharge).toFixed(2)}</dd></div>
            <div className="total"><dt>Total</dt><dd>₹{Number(order.totalCharge).toFixed(2)}</dd></div>
            <div><dt>Payment</dt><dd><StatusBadge status={order.paymentStatus} /></dd></div>
          </dl>
        </article>
      </section>
      {order.paymentType === "PREPAID" && order.paymentStatus === "PENDING" && (
        <section className="data-section payment-prompt">
          <div><h2>Payment required</h2><p>Complete the test payment to release this order to dispatch.</p></div>
          <RazorpayButton orderId={order.id} />
        </section>
      )}
      {order.status === "FAILED" && (
        <section className="data-section">
          <div className="section-title"><div><h2>Request redelivery</h2><p>Choose a preferred date for another attempt.</p></div></div>
          <form action={requestReschedule.bind(null, order.id)} className="inline-form">
            <label>Preferred date<input name="requestedDate" type="date" required min={new Date().toISOString().slice(0, 10)} /></label>
            <label>Note<input name="note" placeholder="Access instructions or preferred time" /></label>
            <button className="button button-primary">Request reschedule</button>
          </form>
        </section>
      )}
      <section className="data-section">
        <div className="section-title"><div><h2>Tracking timeline</h2><p>Every status change is retained</p></div></div>
        <ol className="timeline">{order.trackingEvents.map((event) => (
          <li key={event.id}><span /><div><div className="timeline-title"><strong>{event.status.replaceAll("_", " ")}</strong><time>{event.createdAt.toLocaleString("en-IN")}</time></div><p>{event.note ?? "Status updated"}</p><small>Updated by {event.actorRole.toLowerCase()}</small></div></li>
        ))}</ol>
      </section>
    </>
  );
}
