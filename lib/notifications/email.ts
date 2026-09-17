/**
 * Reusable Notification Service for sending emails on key system events.
 * Accepts generic event parameters so it can be reused across Agent, Admin, Server Admin, and Dev roles.
 */

export interface EmailNotificationPayload {
  recipientEmail: string;
  recipientName?: string;
  eventType: 'LEAD_REASSIGNED' | 'TASK_ASSIGNED' | 'TICKET_UPDATED' | 'SYSTEM_ALERT' | string;
  subject: string;
  body: string;
  metadata?: Record<string, unknown>;
}

export async function sendNotificationEmail(payload: EmailNotificationPayload): Promise<{ success: boolean; messageId?: string; error?: string }> {
  const { recipientEmail, eventType, subject, body, metadata } = payload;

  if (!recipientEmail) {
    return { success: false, error: "Recipient email address is required" };
  }

  // Log notification attempt (Auditable System Trace)
  console.log(`[EMAIL NOTIFICATION SERVICE] Sending ${eventType} to ${recipientEmail}:`, {
    subject,
    body,
    metadata,
    timestamp: new Date().toISOString(),
  });

  try {
    const { sendResendEmail } = await import('@/lib/email/resend');
    
    const htmlBody = `
      <div style="font-family: sans-serif; padding: 20px; color: #333;">
        <h2>${subject}</h2>
        <p>${body}</p>
        <hr style="border: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #888;">
          This is an automated notification from Cloudora CRM.
          <br />Event Type: ${eventType}
        </p>
      </div>
    `;

    const result = await sendResendEmail({
      to: recipientEmail,
      subject: subject,
      html: htmlBody,
    });

    if (!result.success) {
      console.error(`[EMAIL NOTIFICATION SERVICE] Provider error (${eventType}):`, result.error);
      return { success: false, error: result.error };
    }

    return { success: true, messageId: result.id };
  } catch (err: any) {
    console.error(`[EMAIL NOTIFICATION SERVICE] Error sending email (${eventType}):`, err);
    return { success: false, error: err.message || "Failed to dispatch email notification" };
  }
}
