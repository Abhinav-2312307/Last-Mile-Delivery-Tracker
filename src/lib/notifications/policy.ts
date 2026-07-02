import type { NotificationChannel } from "@prisma/client";

export function buildStatusNotifications(input: {
  orderNumber: string;
  status: string;
  customerName: string;
}): {
  channel: NotificationChannel;
  subject: string | undefined;
  message: string;
}[] {
  const readableStatus = input.status.replaceAll("_", " ").toLowerCase();
  return [
    {
      channel: "EMAIL",
      subject: `${input.orderNumber} is ${readableStatus}`,
      message: `Hi ${input.customerName}, your order ${input.orderNumber} is now ${readableStatus}.`,
    },
    {
      channel: "SMS",
      subject: undefined,
      message: `${input.orderNumber} update: ${readableStatus}.`,
    },
  ];
}
