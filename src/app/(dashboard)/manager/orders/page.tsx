import { OrderTable } from "@/components/admin/order-table";
import { prisma } from "@/lib/db";

export default async function ManagerOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const [orders, agents] = await Promise.all([
    prisma.order.findMany({
      where: status ? { status: status as never } : undefined,
      include: {
        customer: true,
        assignedAgent: true,
        pickupAddress: { include: { area: { include: { city: true } } } },
        dropAddress: { include: { area: { include: { city: true } } } },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.user.findMany({
      where: { role: "AGENT", isActive: true },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">Dispatch desk</p><h1>Orders</h1><p>Assign agents and resolve reschedule requests.</p></div></div>
      <section className="data-section">
        <form className="filter-bar"><label>Status<select name="status" defaultValue={status ?? ""}><option value="">All statuses</option>{["CONFIRMED", "PAID", "ASSIGNED", "IN_TRANSIT", "OUT_FOR_DELIVERY", "FAILED", "RESCHEDULE_REQUESTED", "PENDING_REASSIGNMENT", "DELIVERED"].map((value) => <option key={value}>{value}</option>)}</select></label><button className="button button-secondary">Filter</button></form>
        <OrderTable agents={agents} orders={orders.map((order) => ({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
          route: `${order.pickupAddress.area.city.name} → ${order.dropAddress.area.city.name}`,
          status: order.status,
          assignedAgentName: order.assignedAgent?.name ?? null,
          totalCharge: Number(order.totalCharge),
        }))} />
      </section>
    </>
  );
}
