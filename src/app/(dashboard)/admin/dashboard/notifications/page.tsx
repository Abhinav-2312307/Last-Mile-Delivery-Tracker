import { StatusBadge } from "@/components/order/status-badge";
import { prisma } from "@/lib/db";

export default async function NotificationsPage() {
  const notifications = await prisma.notification.findMany({
    include: { order: true, recipientUser: true },
    orderBy: { createdAt: "desc" },
    take: 200,
  });
  return (
    <>
      <div className="page-heading"><div><p className="eyebrow">Audit log</p><h1>Notifications</h1><p>Email and SMS delivery attempts from status changes.</p></div></div>
      <section className="data-section"><div className="table-wrap"><table><thead><tr><th>Created</th><th>Order</th><th>Recipient</th><th>Channel</th><th>Result</th><th>Message</th></tr></thead><tbody>{notifications.map((item) => <tr key={item.id}><td>{item.createdAt.toLocaleString("en-IN")}</td><td>{item.order?.orderNumber ?? "System"}</td><td>{item.recipientUser?.name ?? "Unknown"}<small>{item.recipientUser?.email}</small></td><td>{item.channel}<small>{item.provider ?? "Not dispatched"}</small></td><td><StatusBadge status={item.status} />{item.error && <small>{item.error}</small>}</td><td className="message-cell">{item.message}</td></tr>)}</tbody></table></div></section>
    </>
  );
}
