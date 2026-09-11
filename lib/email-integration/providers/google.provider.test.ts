import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GoogleEmailProvider } from './google.provider';
import { EmailAuthError, EmailRateLimitError, EmailTemporaryError } from '../errors';

// Mock the googleapis module
vi.mock('googleapis', () => {
  class MockOAuth2 {
    setCredentials = vi.fn();
    getToken = vi.fn().mockRejectedValue({ code: 401, message: 'Invalid Credentials' });
  }

  return {
    google: {
      auth: {
        OAuth2: MockOAuth2,
      },
      gmail: vi.fn().mockReturnValue({
        users: {
          getProfile: vi.fn().mockRejectedValue({ code: 429, message: 'Rate Limit Exceeded' }),
          messages: {
            list: vi.fn().mockRejectedValue({ code: 503, message: 'Service Unavailable' }),
          },
        },
      }),
    },
  };
});

describe('GoogleEmailProvider Error Mapping', () => {
  let provider: GoogleEmailProvider;

  beforeEach(() => {
    process.env.GOOGLE_CLIENT_ID = 'test-client-id';
    process.env.GOOGLE_CLIENT_SECRET = 'test-client-secret';
    provider = new GoogleEmailProvider();
  });

  it('maps 401 to EmailAuthError', async () => {
    await expect(provider.exchangeCodeForTokens('dummy_code', 'http://localhost'))
      .rejects
      .toThrow(EmailAuthError);
  });

  it('maps 429 to EmailRateLimitError', async () => {
    await expect(provider.getAccountProfile('dummy_token'))
      .rejects
      .toThrow(EmailRateLimitError);
  });

  it('maps 50x to EmailTemporaryError', async () => {
    await expect(provider.getMessages('dummy_token'))
      .rejects
      .toThrow(EmailTemporaryError);
  });
});
