import { getEmailTransport, getEmailFromAddress } from "@/lib/notifications/email-transport";

export async function sendVerificationEmail(input: {
  email: string;
  name: string;
  code: string;
}) {
  const transport = getEmailTransport();
  const from = getEmailFromAddress();

  if (!transport) {
    // If not configured, print to logs so dev mode works seamlessly
    console.log(`[EMAIL SEND SIMULATION] To: ${input.email}, Code: ${input.code}`);
    return;
  }

  await transport.sendMail({
    from,
    to: input.email,
    subject: "Verify your Last-Mile Delivery account",
    text: `Hello ${input.name}, your verification code is ${input.code}. It expires in 10 minutes.`,
    html: `<p>Hello ${input.name},</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${input.code}</p><p>This code expires in 10 minutes.</p>`,
  });
}
