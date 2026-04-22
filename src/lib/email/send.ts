import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  if (!process.env.RESEND_API_KEY) {
    console.warn("[Email] RESEND_API_KEY not set — skipping email send");
    return;
  }

  try {
    const data = await resend.emails.send({
      from: process.env.EMAIL_FROM ?? "Fraviont <hello@fraviont.com>",
      to,
      subject,
      react,
    });
    return data;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
  }
}
