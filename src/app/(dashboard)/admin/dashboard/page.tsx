import Link from "next/link";
import { StatCard } from "@/components/dashboard/stat-card";
import { StatusBadge } from "@/components/order/status-badge";
import { RevenueChart } from "@/components/dashboard/revenue-chart";
import { prisma } from "@/lib/db";
import { ShieldAlert, Users, Award, ShieldCheck, ArrowRight } from "lucide-react";

export default async function AdminDashboard() {
  const [orders, totalUsers, agents, revenueSum, pendingApprovalsCount] = await Promise.all([
    prisma.order.findMany({
      include: { customer: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.user.count({ where: { isActive: true } }),
    prisma.agentProfile.count({ where: { availability: "AVAILABLE" } }),
    prisma.order.aggregate({ where: { status: "DELIVERED" }, _sum: { totalCharge: true } }),
    prisma.user.count({ where: { isApproved: false } }),
  ]);

  // Aggregate revenue for the last 7 days dynamically
  const last7DaysData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toLocaleDateString("en-IN", { weekday: "short" });
    const start = new Date(d);
    start.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);

    const dayRevenue = await prisma.order.aggregate({
      where: { status: "DELIVERED", createdAt: { gte: start, lte: end } },
      _sum: { totalCharge: true },
    });
    last7DaysData.push({
      label: dateStr,
      value: Number(dayRevenue._sum.totalCharge ?? 0),
    });
  }

  // Aggregate total orders by status
  const ordersGrouped = await prisma.order.groupBy({
    by: ["status"],
    _count: true,
  });

  return (
    <>
      <div className="page-heading">
        <div>
          <p className="eyebrow">Admin portal</p>
          <h1>Platform Operations Room</h1>
          <p>Global revenue tracking, configuration logs, and active fleet statuses.</p>
        </div>
        <div className="flex gap-2">
          {pendingApprovalsCount > 0 && (
            <Link className="button button-success flex items-center gap-1" href="/admin/dashboard/approvals">
              <ShieldCheck size={16} /> approvals ({pendingApprovalsCount})
            </Link>
          )}
          <Link className="button button-primary" href="/admin/dashboard/orders">
            Manage orders
          </Link>
        </div>
      </div>

      {/* Overview Cards */}
      <section className="stats-grid">
        <StatCard label="Active users" value={totalUsers} detail="Across all operational profiles" />
        <StatCard label="Available agents" value={agents} detail="Ready for delivery assignment" />
        <StatCard
          label="Pending dispatch"
          value={orders.filter((o) => ["CONFIRMED", "PAID", "PENDING_REASSIGNMENT"].includes(o.status)).length}
          detail="Awaiting manual or auto assigning"
        />
        <StatCard
          label="Delivered value"
          value={`₹${Number(revenueSum._sum.totalCharge ?? 0).toFixed(0)}`}
          detail="Net operational revenue"
        />
      </section>

      {/* Chart Section & Queue Breakdown */}
      <div className="admin-grid-layout mt-6">
        <RevenueChart data={last7DaysData} title="Weekly Delivery Billing Revenue Trend" />

        <div className="status-breakdown-card">
          <h3>Orders Status Directory</h3>
          <div className="status-bars-list">
            {ordersGrouped.map((group) => (
              <div key={group.status} className="status-row-item">
                <span className="status-lbl-short">{group.status.replaceAll("_", " ")}</span>
                <div className="status-bar-track-mini">
                  <div
                    className="status-bar-fill-mini"
                    style={{ width: `${Math.min((group._count / Math.max(...ordersGrouped.map((g) => g._count), 1)) * 100, 100)}%` }}
                  ></div>
                </div>
                <strong className="status-count-lbl">{group._count}</strong>
              </div>
            ))}
            {ordersGrouped.length === 0 && (
              <p className="muted text-center text-sm py-4">No logged deliveries in the system yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity Table */}
      <section className="data-section mt-6">
        <div className="section-title flex-header">
          <div>
            <h2>Recent Platform Bookings</h2>
            <p>Auditing the latest delivery orders</p>
          </div>
          <Link href="/admin/dashboard/orders" className="link-arrow">
            All orders <ArrowRight size={14} />
          </Link>
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Order Number</th>
                <th>Customer</th>
                <th>Transit route</th>
                <th>Type</th>
                <th>Billable Charge</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <strong>{order.orderNumber}</strong>
                  </td>
                  <td>{order.customer.name}</td>
                  <td>
                    {order.routeType.replace("_", " ")}
                  </td>
                  <td>{order.orderType}</td>
                  <td>₹{Number(order.totalCharge).toFixed(2)}</td>
                  <td>
                    <StatusBadge status={order.status} />
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center muted">
                    No orders recorded on the platform yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </>
  );
}
