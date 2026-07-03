import { OrderTable } from "@/components/admin/order-table";
import { prisma } from "@/lib/db";

export default async function AdminOrdersPage() {
  const [orders, agents] = await Promise.all([
    prisma.order.findMany({
      include: {
        customer: true,
        assignedAgent: true,
        pickupAddress: { include: { area: { include: { city: true } } } },
        dropAddress: { include: { area: { include: { city: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({ where: { role: "AGENT", isActive: true }, select: { id: true, name: true } }),
  ]);
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">Administration</p><h1>Order oversight</h1><p>Assignment, exceptions, and audited status override.</p></div></div>
      <section className="data-section"><OrderTable admin agents={agents} orders={orders.map((order) => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customer.name,
        route: `${order.pickupAddress.area.city.name} → ${order.dropAddress.area.city.name}`,
        status: order.status,
        assignedAgentName: order.assignedAgent?.name ?? null,
        totalCharge: Number(order.totalCharge),
      }))} /></section>
    </>
  );
}
