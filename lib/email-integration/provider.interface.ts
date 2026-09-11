export interface AccountProfile {
  emailAddress: string;
  displayName: string | null;
  providerAccountId: string;
}

export interface EmailParticipant {
  emailAddress: string;
  displayName: string | null;
}

export interface EmailMessage {
  providerMessageId: string;
  providerThreadId: string | null;
  internetMessageId: string | null;
  direction: 'inbound' | 'outbound';
  subject: string | null;
  bodyPreview: string | null;
  sentAt: Date | null;
  receivedAt: Date | null;
  from: EmailParticipant | null;
  to: EmailParticipant[];
  cc: EmailParticipant[];
  bcc: EmailParticipant[];
}

export interface EmailProvider {
  /**
   * Exchanges an authorization code for access and refresh tokens.
   */
  exchangeCodeForTokens(code: string, redirectUri: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date; scopes: string }>;
  
  /**
   * Uses a refresh token to get a new access token.
   */
  refreshTokens(refreshToken: string): Promise<{ accessToken: string; refreshToken: string; expiresAt: Date; scopes: string }>;
  
  /**
   * Fetches the profile of the currently connected account.
   */
  getAccountProfile(accessToken: string): Promise<AccountProfile>;
  
  /**
   * Fetches messages. Can be paginated using a cursor or queried for history.
   */
  getMessages(accessToken: string, options?: { cursor?: string; limit?: number; since?: Date }): Promise<{ messages: EmailMessage[]; nextCursor?: string }>;
  
  /**
   * Fetches a specific message by ID.
   */
  getMessage(accessToken: string, messageId: string): Promise<EmailMessage>;
  
  /**
   * Sets up a webhook subscription for push notifications.
   */
  subscribeToChanges(accessToken: string, webhookUrl: string, state?: string): Promise<{ subscriptionId: string; expirationDate: Date }>;
}
