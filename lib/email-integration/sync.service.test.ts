import { describe, it, expect, vi, beforeEach } from 'vitest';
import { EmailSyncService } from './sync.service';
import { EmailAuthError } from './errors';

const mockProvider = {
  refreshTokens: vi.fn(),
  getMessages: vi.fn(),
};

vi.mock('./factory', () => ({
  getEmailProvider: vi.fn(() => mockProvider)
}));

vi.mock('./encryption', () => ({
  encryptToken: vi.fn((v) => `enc_${v}`),
  decryptToken: vi.fn((v) => v.replace('enc_', '')),
}));

describe('EmailSyncService', () => {
  let mockSupabase: any;
  let service: EmailSyncService;

  beforeEach(() => {
    mockSupabase = {
      from: vi.fn().mockReturnThis(),
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockImplementation(function (this: any) {
        // Return this so single() or await works depending on the chain
        return this;
      }),
      single: vi.fn().mockResolvedValue({
        data: {
          id: 'acc_1',
          company_id: 'comp_1',
          provider: 'google',
          access_token: 'enc_access_token',
          refresh_token: 'enc_refresh_token',
          token_expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
          sync_cursor: null,
        },
        error: null
      }),
      update: vi.fn().mockReturnThis(),
      upsert: vi.fn().mockReturnThis(),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      // To satisfy await on .eq()
      then: vi.fn((resolve) => resolve({ data: null, error: null })),
    };

    service = new EmailSyncService(mockSupabase);
    vi.clearAllMocks();
  });

  it('marks account as disconnected on EmailAuthError', async () => {
    mockProvider.getMessages.mockRejectedValueOnce(new EmailAuthError('Revoked', 'google'));

    await service.syncAccount('acc_1');

    // It should have called update to set status to 'disconnected'
    const updateCalls = mockSupabase.update.mock.calls;
    const finalUpdate = updateCalls[updateCalls.length - 1][0];
    
    expect(finalUpdate).toMatchObject({
      sync_status: 'disconnected',
      last_sync_error: 'Revoked'
    });
  });

  it('syncs messages and updates cursor on success', async () => {
    mockProvider.getMessages.mockResolvedValueOnce({
      messages: [
        {
          providerMessageId: 'msg_1',
          direction: 'inbound',
          from: { emailAddress: 'test@example.com', displayName: 'Test', type: 'from' },
          to: [],
          cc: [],
          bcc: []
        }
      ],
      nextCursor: 'cursor_2'
    });

    // We don't need mockResolvedValueOnce for single() on the first call, 
    // because beforeEach sets it up for the account. We can just append a mock implementation
    mockSupabase.single.mockImplementationOnce(() => Promise.resolve({
      data: {
        id: 'acc_1',
        company_id: 'comp_1',
        provider: 'google',
        access_token: 'enc_access_token',
        refresh_token: 'enc_refresh_token',
        token_expires_at: new Date(Date.now() + 1000 * 60 * 60).toISOString(),
        sync_cursor: null,
      },
      error: null
    })).mockImplementationOnce(() => Promise.resolve({
      data: { id: 'email_msg_id' },
      error: null
    }));

    await service.syncAccount('acc_1');

    const updateCalls = mockSupabase.update.mock.calls;
    const finalUpdate = updateCalls[updateCalls.length - 1][0];
    
    expect(finalUpdate).toMatchObject({
      sync_cursor: 'cursor_2',
      sync_status: 'active'
    });
  });
});
