export type ActorRole = "ADMIN" | "MANAGER" | "AGENT" | "CUSTOMER";

export type OrderStatus =
  | "DRAFT"
  | "CONFIRMED"
  | "PAYMENT_PENDING"
  | "PAID"
  | "ASSIGNED"
  | "PICKED_UP"
  | "IN_TRANSIT"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "FAILED"
  | "RESCHEDULE_REQUESTED"
  | "PENDING_REASSIGNMENT"
  | "CANCELLED";

export type StatusTransitionInput = {
  from: OrderStatus;
  to: OrderStatus;
  actorRole: ActorRole;
  overrideReason?: string;
};

export type StatusTransitionResult =
  | { ok: true }
  | { ok: false; reason: string };

const agentTransitions: Partial<Record<OrderStatus, readonly OrderStatus[]>> = {
  ASSIGNED: ["PICKED_UP"],
  PICKED_UP: ["IN_TRANSIT"],
  IN_TRANSIT: ["OUT_FOR_DELIVERY"],
  OUT_FOR_DELIVERY: ["DELIVERED", "FAILED"],
};

const managerTransitions: Partial<Record<OrderStatus, readonly OrderStatus[]>> =
  {
    CONFIRMED: ["ASSIGNED"],
    PAID: ["ASSIGNED"],
    FAILED: ["PENDING_REASSIGNMENT"],
    RESCHEDULE_REQUESTED: ["PENDING_REASSIGNMENT"],
    PENDING_REASSIGNMENT: ["ASSIGNED"],
  };

const customerTransitions: Partial<Record<OrderStatus, readonly OrderStatus[]>> =
  {
    FAILED: ["RESCHEDULE_REQUESTED"],
    DRAFT: ["CONFIRMED", "CANCELLED"],
  };

function getAllowedTransitions(role: ActorRole) {
  if (role === "AGENT") {
    return agentTransitions;
  }
  if (role === "MANAGER") {
    return managerTransitions;
  }
  if (role === "CUSTOMER") {
    return customerTransitions;
  }
  return {};
}

export function assertStatusTransition(
  input: StatusTransitionInput,
): StatusTransitionResult {
  if (input.actorRole === "ADMIN") {
    if (input.from !== input.to && !input.overrideReason?.trim()) {
      return { ok: false, reason: "Admin override requires a reason" };
    }

    return { ok: true };
  }

  const allowed = getAllowedTransitions(input.actorRole)[input.from] ?? [];

  if (allowed.includes(input.to)) {
    return { ok: true };
  }

  return {
    ok: false,
    reason: `${input.actorRole} cannot change order status to ${input.to}`,
  };
}
