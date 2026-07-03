import Link from "next/link";

import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/order/status-badge";
import { prisma } from "@/lib/db";

export default async function ManagerDashboard() {
  const [orders, activeAgents] = await Promise.all([
    prisma.order.findMany({
      include: { customer: true },
      orderBy: { updatedAt: "desc" },
      take: 8,
    }),
    prisma.agentProfile.count({ where: { availability: { not: "OFFLINE" } } }),
  ]);
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">Manager portal</p><h1>Operations overview</h1><p>Dispatch workload and delivery exceptions.</p></div><Link className="button button-primary" href="/manager/orders">Open dispatch queue</Link></div>
      <section className="stats-grid">
        <StatCard label="Queue" value={orders.filter((o) => ["CONFIRMED", "PAID", "PENDING_REASSIGNMENT"].includes(o.status)).length} detail="Awaiting assignment" />
        <StatCard label="In transit" value={orders.filter((o) => ["PICKED_UP", "IN_TRANSIT", "OUT_FOR_DELIVERY"].includes(o.status)).length} detail="Active deliveries" />
        <StatCard label="Failed" value={orders.filter((o) => o.status === "FAILED").length} detail="Requires follow-up" />
        <StatCard label="Active agents" value={activeAgents} detail="Available or busy" />
      </section>
      <section className="data-section"><div className="section-title"><h2>Latest activity</h2></div>
        <div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Updated</th></tr></thead><tbody>
          {orders.map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong></td><td>{order.customer.name}</td><td><StatusBadge status={order.status} /></td><td>{order.updatedAt.toLocaleString("en-IN")}</td></tr>)}
        </tbody></table></div>
      </section>
    </>
  );
}
