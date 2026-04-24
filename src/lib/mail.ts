import nodemailer from "nodemailer";

export function isMailConfigured(): boolean {
  if (process.env.SMTP_URL?.trim()) return true;
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  return Boolean(host && user && pass);
}

function getTransporter() {
  if (process.env.SMTP_URL?.trim()) {
    return nodemailer.createTransport(process.env.SMTP_URL);
  }
  const host = process.env.SMTP_HOST!.trim();
  const port = Number(process.env.SMTP_PORT ?? "587");
  const secure = process.env.SMTP_SECURE === "true" || port === 465;
  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user: process.env.SMTP_USER!.trim(),
      pass: process.env.SMTP_PASS!.trim(),
    },
  });
}

export function getDefaultFromAddress(): string {
  const explicit = process.env.EMAIL_FROM?.trim();
  if (explicit) return explicit;
  const user = process.env.SMTP_USER?.trim();
  if (user?.includes("@")) return `"Say Hi Trip" <${user}>`;
  return `"Say Hi Trip" <noreply@localhost>`;
}

export async function sendTransactionalEmail(opts: {
  to: string;
  subject: string;
  text: string;
  html: string;
}): Promise<void> {
  if (!isMailConfigured()) {
    throw new Error("Mail is not configured");
  }
  const transporter = getTransporter();
  await transporter.sendMail({
    from: getDefaultFromAddress(),
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html,
  });
}
