import { Resend } from "resend";

export async function sendVerificationEmail(input: {
  email: string;
  name: string;
  code: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL ?? process.env.EMAIL_FROM;
  if (!apiKey || !from) {
    throw new Error("Verification email provider is not configured.");
  }

  const result = await new Resend(apiKey).emails.send({
    from,
    to: input.email,
    subject: "Verify your Last-Mile Delivery account",
    text: `Hello ${input.name}, your verification code is ${input.code}. It expires in 10 minutes.`,
    html: `<p>Hello ${input.name},</p><p>Your verification code is:</p><p style="font-size:28px;font-weight:700;letter-spacing:6px">${input.code}</p><p>This code expires in 10 minutes.</p>`,
  });
  if (result.error) throw new Error(result.error.message);
}
