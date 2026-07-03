import type { OrderStatus } from "@prisma/client";

import { updateOrderStatus } from "@/app/(dashboard)/agent/dashboard/actions";

const nextStatuses: Partial<Record<OrderStatus, OrderStatus[]>> = {
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
};

export function StatusActions({ orderId, status }: { orderId: string; status: OrderStatus }) {
  const options = nextStatuses[status] ?? [];
  if (!options.length) return <p className="muted">No field action is available for this status.</p>;
  return <div className="button-row">{options.map((next) => (
    <form action={updateOrderStatus.bind(null, orderId, next)} key={next}>
      <button className={`button ${next === "FAILED" ? "button-danger" : "button-primary"}`}>{next.replaceAll("_", " ")}</button>
    </form>
  ))}</div>;
}
