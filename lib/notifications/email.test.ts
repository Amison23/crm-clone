import { describe, it, expect, vi } from 'vitest';
import { sendNotificationEmail } from './email';

describe('Notification Email Service', () => {
  it('should return error if recipient email is missing', async () => {
    const result = await sendNotificationEmail({
      recipientEmail: '',
      eventType: 'LEAD_REASSIGNED',
      subject: 'Test Subject',
      body: 'Test Body'
    });
    expect(result.success).toBe(false);
    expect(result.error).toBe('Recipient email address is required');
  });

  it('should log and return success with messageId for valid recipient', async () => {
    const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

    const result = await sendNotificationEmail({
      recipientEmail: 'agent@example.com',
      recipientName: 'Agent Smith',
      eventType: 'LEAD_REASSIGNED',
      subject: 'New Lead Assigned',
      body: 'Lead details content',
      metadata: { leadId: 'lead-123' }
    });

    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});
