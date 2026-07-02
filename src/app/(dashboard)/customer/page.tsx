import { ArrowRight, PackagePlus } from "lucide-react";
import Link from "next/link";

import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/order/status-badge";
import { requireSession } from "@/lib/auth/session";
import { prisma } from "@/lib/db";

export default async function CustomerDashboard() {
  const session = await requireSession(["CUSTOMER"]);
  const orders = await prisma.order.findMany({
    where: { customerId: session.user.id },
    include: {
      pickupAddress: { include: { area: { include: { city: true } } } },
      dropAddress: { include: { area: { include: { city: true } } } },
    },
    orderBy: { createdAt: "desc" },
  });
  const delivered = orders.filter((order) => order.status === "DELIVERED").length;
  const active = orders.filter((order) => !["DELIVERED", "CANCELLED"].includes(order.status)).length;

  return (
    <>
      <div className="page-heading">
        <div><p className="eyebrow">Customer portal</p><h1>Delivery overview</h1><p>Book shipments and follow each operational update.</p></div>
        <Link className="button button-primary" href="/customer/orders/new"><PackagePlus size={17} />New delivery</Link>
      </div>
      <section className="stats-grid">
        <StatCard label="Total orders" value={orders.length} detail="All bookings" />
        <StatCard label="Active" value={active} detail="Currently in progress" />
        <StatCard label="Delivered" value={delivered} detail="Completed successfully" />
        <StatCard label="Exceptions" value={orders.filter((order) => order.status === "FAILED").length} detail="Needs attention" />
      </section>
      <section className="data-section">
        <div className="section-title"><div><h2>Recent orders</h2><p>Your latest bookings and current status</p></div></div>
        {orders.length ? (
          <div className="table-wrap"><table><thead><tr><th>Order</th><th>Route</th><th>Charge</th><th>Status</th><th aria-label="Open" /></tr></thead>
          <tbody>{orders.map((order) => <tr key={order.id}>
            <td><strong>{order.orderNumber}</strong><small>{order.createdAt.toLocaleDateString("en-IN")}</small></td>
            <td>{order.pickupAddress.area.city.name} → {order.dropAddress.area.city.name}<small>{order.pickupAddress.area.name} to {order.dropAddress.area.name}</small></td>
            <td>₹{Number(order.totalCharge).toFixed(2)}<small>{order.paymentType}</small></td>
            <td><StatusBadge status={order.status} /></td>
            <td><Link className="icon-button" href={`/customer/orders/${order.id}`} title="Open order"><ArrowRight size={17} /></Link></td>
          </tr>)}</tbody></table></div>
        ) : <div className="empty-state"><PackagePlus size={28} /><h3>No orders yet</h3><p>Your first booking will appear here.</p><Link className="button button-primary" href="/customer/orders/new">Book delivery</Link></div>}
      </section>
    </>
  );
}
