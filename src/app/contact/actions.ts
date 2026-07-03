"use server";

import { z } from "zod";
import { getEmailTransport, getEmailFromAddress } from "@/lib/notifications/email-transport";

const contactSchema = z.object({
  name: z.string().trim().min(1),
  email: z.string().trim().email(),
  subject: z.string().trim().min(1),
  message: z.string().trim().min(1),
});

export async function sendContactMessage(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name"),
      email: formData.get("email"),
      subject: formData.get("subject"),
      message: formData.get("message"),
    };

    const validated = contactSchema.parse(rawData);

    const transport = getEmailTransport();
    const fromAddress = getEmailFromAddress();

    const emailSubject = `[Contact Form] ${validated.subject}`;
    const emailBody = `New Contact Form Submission:

Name: ${validated.name}
Email: ${validated.email}
Subject: ${validated.subject}

Message:
${validated.message}
`;

    if (!transport) {
      console.log(`[CONTACT EMAIL SIMULATION] To: abhinavrishi32@gmail.com, Subject: ${emailSubject}\nBody:\n${emailBody}`);
      return { success: true, simulated: true };
    }

    await transport.sendMail({
      from: fromAddress,
      to: "abhinavrishi32@gmail.com",
      replyTo: validated.email,
      subject: emailSubject,
      text: emailBody,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Failed to send contact email:", error);
    return { success: false, error: error.message || "Unknown error" };
  }
}
