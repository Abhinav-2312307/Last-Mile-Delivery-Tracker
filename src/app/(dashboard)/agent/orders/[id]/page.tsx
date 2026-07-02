import { notFound } from "next/navigation";

import { StatusActions } from "@/components/agent/status-actions";
import { StatusBadge } from "@/components/order/status-badge";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function AgentOrderPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await requireSession(["AGENT"]);
  const { id } = await params;
  const order = await prisma.order.findFirst({
    where: { id, assignedAgentId: session.user.id },
    include: {
      customer: true,
      pickupAddress: { include: { area: { include: { city: true } } } },
      dropAddress: { include: { area: { include: { city: true } } } },
      trackingEvents: { orderBy: { createdAt: "desc" } },
    },
  });
  if (!order) notFound();
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">Field assignment</p><h1>{order.orderNumber}</h1><p>{order.customer.name} · {order.customer.phone}</p></div><StatusBadge status={order.status} /></div>
      <section className="detail-grid">
        <article className="data-section"><div className="section-title"><h2>Pickup</h2></div><p className="address-block"><strong>{order.pickupAddress.contactName}</strong>{order.pickupAddress.line1}<br />{order.pickupAddress.area.name}, {order.pickupAddress.area.city.name}<br />{order.pickupAddress.contactPhone}</p></article>
        <article className="data-section"><div className="section-title"><h2>Drop</h2></div><p className="address-block"><strong>{order.dropAddress.contactName}</strong>{order.dropAddress.line1}<br />{order.dropAddress.area.name}, {order.dropAddress.area.city.name}<br />{order.dropAddress.contactPhone}</p></article>
      </section>
      <section className="data-section"><div className="section-title"><div><h2>Update delivery</h2><p>Only the next valid operational status is available.</p></div></div><StatusActions orderId={order.id} status={order.status} /></section>
      <section className="data-section"><div className="section-title"><h2>Recent history</h2></div><ol className="timeline">{order.trackingEvents.map((event) => <li key={event.id}><span /><div><strong>{event.status.replaceAll("_", " ")}</strong><p>{event.note}</p><small>{event.createdAt.toLocaleString("en-IN")}</small></div></li>)}</ol></section>
    </>
  );
}
