import { ArrowRight, Bike } from "lucide-react";
import Link from "next/link";

import { updateAvailability } from "@/app/(dashboard)/agent/actions";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/order/status-badge";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function AgentDashboard() {
  const session = await requireSession(["AGENT"]);
  const [profile, orders] = await Promise.all([
    prisma.agentProfile.findUniqueOrThrow({ where: { userId: session.user.id } }),
    prisma.order.findMany({
      where: { assignedAgentId: session.user.id, status: { notIn: ["DELIVERED", "CANCELLED"] } },
      include: {
        customer: true,
        pickupAddress: { include: { area: { include: { city: true } } } },
        dropAddress: { include: { area: { include: { city: true } } } },
      },
      orderBy: { updatedAt: "desc" },
    }),
  ]);
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">Agent portal</p><h1>My assignments</h1><p>Pickup, transit, and delivery actions for your route.</p></div>
        <form action={updateAvailability} className="compact-form"><select name="availability" defaultValue={profile.availability}><option>AVAILABLE</option><option>BUSY</option><option>OFFLINE</option></select><button className="button button-secondary">Update</button></form>
      </div>
      <section className="stats-grid">
        <StatCard label="Assigned" value={orders.length} detail="Open workload" />
        <StatCard label="Ready for pickup" value={orders.filter((o) => o.status === "ASSIGNED").length} />
        <StatCard label="On route" value={orders.filter((o) => ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)).length} />
        <StatCard label="Availability" value={profile.availability.replace("_", " ")} />
      </section>
      <section className="data-section"><div className="section-title"><h2>Active deliveries</h2></div>
        {orders.length ? <div className="table-wrap"><table><thead><tr><th>Order</th><th>Route</th><th>Customer</th><th>Status</th><th /></tr></thead><tbody>
          {orders.map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong></td><td>{order.pickupAddress.area.name} → {order.dropAddress.area.name}<small>{order.pickupAddress.area.city.name} to {order.dropAddress.area.city.name}</small></td><td>{order.customer.name}<small>{order.customer.phone}</small></td><td><StatusBadge status={order.status} /></td><td><Link className="icon-button" href={`/agent/orders/${order.id}`} title="Open assignment"><ArrowRight size={17} /></Link></td></tr>)}
        </tbody></table></div> : <div className="empty-state"><Bike size={28} /><h3>No open assignments</h3><p>New work will appear here after dispatch.</p></div>}
      </section>
    </>
  );
}
