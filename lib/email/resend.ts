/**
 * Resend Email Utility Helper
 * Sends transactional HTML emails directly via Resend REST API using RESEND_API environment key.
 */

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
}

export async function sendResendEmail({ to, subject, html, from }: SendEmailOptions) {
  const apiKey = process.env.RESEND_API || process.env.RESEND_API_KEY;

  if (!apiKey) {
    console.warn("[Resend] Missing RESEND_API key in environment variables");
    return { success: false, error: "Missing Resend API Key" };
  }

  const sender = from || process.env.RESEND_FROM_EMAIL || "CRM Executive <onboarding@resend.dev>";
  const recipients = Array.isArray(to) ? to : [to];

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        from: sender,
        to: recipients,
        subject,
        html,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("[Resend Error]:", data);
      return { success: false, error: data.message || "Failed to send email via Resend" };
    }

    return { success: true, id: data.id };
  } catch (err: any) {
    console.error("[Resend Dispatch Exception]:", err);
    return { success: false, error: err.message || "Network error sending email" };
  }
}
