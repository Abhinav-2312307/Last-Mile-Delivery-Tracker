import { OrderStatus } from "@prisma/client";

import {
  adminOverrideStatus,
  approveReschedule,
  assignAgent,
  autoAssignAgent,
} from "@/app/(dashboard)/manager/dashboard/orders/actions";
import { StatusBadge } from "@/components/order/status-badge";

type OrderRow = {
  id: string;
  orderNumber: string;
  customerName: string;
  route: string;
  status: OrderStatus;
  assignedAgentName: string | null;
  totalCharge: number;
};

export function OrderTable({
  orders,
  agents,
  admin = false,
}: {
  orders: OrderRow[];
  agents: { id: string; name: string }[];
  admin?: boolean;
}) {
  return (
    <div className="table-wrap">
      <table>
        <thead><tr><th>Order</th><th>Customer / route</th><th>Status</th><th>Agent</th><th>Charge</th><th>Actions</th></tr></thead>
        <tbody>{orders.map((order) => (
          <tr key={order.id}>
            <td><strong>{order.orderNumber}</strong></td>
            <td>{order.customerName}<small>{order.route}</small></td>
            <td><StatusBadge status={order.status} /></td>
            <td>{order.assignedAgentName ?? "Unassigned"}</td>
            <td>₹{order.totalCharge.toFixed(2)}</td>
            <td className="action-cell">
              {["CONFIRMED", "PAID", "PENDING_REASSIGNMENT"].includes(order.status) && (
                <>
                  <form action={assignAgent.bind(null, order.id)} className="compact-form">
                    <select aria-label="Agent" name="agentUserId" required defaultValue=""><option value="" disabled>Choose agent</option>{agents.map((agent) => <option key={agent.id} value={agent.id}>{agent.name}</option>)}</select>
                    <button className="button button-small">Assign</button>
                  </form>
                  <form action={autoAssignAgent.bind(null, order.id)}><button className="button button-small button-secondary">Auto</button></form>
                </>
              )}
              {order.status === "RESCHEDULE_REQUESTED" && <form action={approveReschedule.bind(null, order.id)}><button className="button button-small">Approve</button></form>}
              {admin && (
                <details className="override-menu"><summary>Override</summary><form action={adminOverrideStatus.bind(null, order.id)}>
                  <select name="status" defaultValue={order.status}>{Object.values(OrderStatus).filter((value) => value !== "DRAFT").map((value) => <option value={value} key={value}>{value.replaceAll("_", " ")}</option>)}</select>
                  <input name="reason" required minLength={4} placeholder="Required reason" />
                  <button className="button button-small button-danger">Apply</button>
                </form></details>
              )}
            </td>
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}
