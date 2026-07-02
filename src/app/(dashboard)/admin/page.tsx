import Link from "next/link";

import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/order/status-badge";
import { prisma } from "@/lib/db";

export default async function AdminDashboard() {
  const [orders, users, agents, revenue] = await Promise.all([
    prisma.order.findMany({ include: { customer: true }, orderBy: { createdAt: "desc" }, take: 8 }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.agentProfile.count({ where: { availability: "AVAILABLE" } }),
    prisma.order.aggregate({ where: { status: "DELIVERED" }, _sum: { totalCharge: true } }),
  ]);
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">Admin portal</p><h1>Control room</h1><p>Commercial settings, operations, and platform audit.</p></div><Link className="button button-primary" href="/admin/orders">Manage orders</Link></div>
      <section className="stats-grid">
        <StatCard label="Active users" value={users} detail="Across all roles" />
        <StatCard label="Available agents" value={agents} detail="Ready for dispatch" />
        <StatCard label="Pending assignment" value={orders.filter((o) => ["CONFIRMED", "PAID", "PENDING_REASSIGNMENT"].includes(o.status)).length} />
        <StatCard label="Delivered value" value={`₹${Number(revenue._sum.totalCharge ?? 0).toFixed(0)}`} detail="Recorded delivery charges" />
      </section>
      <section className="data-section"><div className="section-title"><h2>Recent platform orders</h2></div><div className="table-wrap"><table><thead><tr><th>Order</th><th>Customer</th><th>Status</th><th>Charge</th></tr></thead><tbody>{orders.map((order) => <tr key={order.id}><td><strong>{order.orderNumber}</strong></td><td>{order.customer.name}</td><td><StatusBadge status={order.status} /></td><td>₹{Number(order.totalCharge).toFixed(2)}</td></tr>)}</tbody></table></div></section>
    </>
  );
}
