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
    // In production, integrate with provider (e.g. Resend, SendGrid, or Supabase Auth Mailer)
    // Simulated successful dispatch with message reference ID
    const messageId = `msg_${Math.random().toString(36).substring(2, 12)}_${Date.now()}`;
    return { success: true, messageId };
  } catch (err: any) {
    console.error(`[EMAIL NOTIFICATION SERVICE] Error sending email (${eventType}):`, err);
    return { success: false, error: err.message || "Failed to dispatch email notification" };
  }
}
