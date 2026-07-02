import { Resend } from "resend";
import twilio from "twilio";

import { prisma } from "@/lib/db";
import { buildStatusNotifications } from "@/lib/notifications/policy";

export async function notifyCustomerOfStatus(orderId: string) {
  const order = await prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { customer: true },
  });
  const messages = buildStatusNotifications({
    orderNumber: order.orderNumber,
    status: order.status,
    customerName: order.customer.name,
  });

  for (const message of messages) {
    const notification = await prisma.notification.create({
      data: {
        orderId,
        recipientUserId: order.customerId,
        channel: message.channel,
        subject: message.subject,
        message: message.message,
        status: "PENDING",
      },
    });

    try {
      if (message.channel === "EMAIL") {
        if (!process.env.RESEND_API_KEY || !process.env.RESEND_FROM_EMAIL) {
          await prisma.notification.update({
            where: { id: notification.id },
            data: { status: "SKIPPED", provider: "Resend", error: "Provider credentials not configured" },
          });
          continue;
        }
        const result = await new Resend(process.env.RESEND_API_KEY).emails.send({
          from: process.env.RESEND_FROM_EMAIL,
          to: order.customer.email,
          subject: message.subject ?? "Delivery update",
          text: message.message,
        });
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: "SENT", provider: "Resend", providerMessageId: result.data?.id, sentAt: new Date() },
        });
        continue;
      }

      if (
        !process.env.TWILIO_ACCOUNT_SID ||
        !process.env.TWILIO_AUTH_TOKEN ||
        !process.env.TWILIO_PHONE_NUMBER ||
        !order.customer.phone
      ) {
        await prisma.notification.update({
          where: { id: notification.id },
          data: { status: "SKIPPED", provider: "Twilio", error: "Provider credentials or recipient phone not configured" },
        });
        continue;
      }
      const result = await twilio(
        process.env.TWILIO_ACCOUNT_SID,
        process.env.TWILIO_AUTH_TOKEN,
      ).messages.create({
        from: process.env.TWILIO_PHONE_NUMBER,
        to: order.customer.phone,
        body: message.message,
      });
      await prisma.notification.update({
        where: { id: notification.id },
        data: { status: "SENT", provider: "Twilio", providerMessageId: result.sid, sentAt: new Date() },
      });
    } catch (error) {
      await prisma.notification.update({
        where: { id: notification.id },
        data: {
          status: "FAILED",
          error: error instanceof Error ? error.message : "Unknown provider error",
        },
      });
    }
  }
}
