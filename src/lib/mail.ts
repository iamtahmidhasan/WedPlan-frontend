import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export interface SendMailOptions {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export async function sendMail({ to, subject, text, html }: SendMailOptions) {
  const from =
    process.env.MAIL_FROM ||
    `"WedPlan" <${process.env.SMTP_USER || "noreply@wedplan.app"}>`;

  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(
      "[mail] SMTP credentials (SMTP_USER / SMTP_PASS) not configured. Previewing email in console:"
    );
    console.log(`[mail] To: ${to}`);
    console.log(`[mail] Subject: ${subject}`);
    console.log(`[mail] Text: ${text}`);
    return { messageId: "simulated-dev-id" };
  }

  return transporter.sendMail({
    from,
    to,
    subject,
    text,
    html,
  });
}
