import nodemailer from "nodemailer";

export function getEmailTransport() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || "465");
  const secure = process.env.SMTP_SECURE !== "false" && (port === 465 || process.env.SMTP_SECURE === "true");
  const user = process.env.SMTP_USER || process.env.GMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.GMAIL_APP_PASSWORD;

  if (!user || !pass) {
    // Return null if credentials are not configured, so the service can log/skip gracefully
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export function getEmailFromAddress() {
  return process.env.SMTP_FROM || process.env.SMTP_USER || process.env.GMAIL_USER || "no-reply@lastmile.test";
}
