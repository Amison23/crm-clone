import { google, gmail_v1 } from 'googleapis';
import {
  EmailProvider,
  EmailMessage,
  AccountProfile,
  EmailParticipant,
} from '../provider.interface';
import {
  EmailAuthError,
  EmailProviderError,
  EmailRateLimitError,
  EmailTemporaryError,
} from '../errors';

export class GoogleEmailProvider implements EmailProvider {
  private clientId = process.env.GOOGLE_CLIENT_ID || 'mock';
  private clientSecret = process.env.GOOGLE_CLIENT_SECRET || 'mock';

  private getOAuthClient(accessToken?: string) {
    const oauth2Client = new google.auth.OAuth2(
      this.clientId,
      this.clientSecret
    );
    if (accessToken) {
      oauth2Client.setCredentials({ access_token: accessToken });
    }
    return oauth2Client;
  }

  private handleError(error: any): never {
    const status = error.code || error.response?.status;
    const message = error.message || 'Unknown Google API Error';

    if (status === 401 || status === 403) {
      throw new EmailAuthError(message, 'google', error);
    }
    if (status === 429) {
      throw new EmailRateLimitError(message, 'google', undefined, error);
    }
    if (status >= 500) {
      throw new EmailTemporaryError(message, 'google', error);
    }
    throw new EmailProviderError(message, 'google', error);
  }

  private parseEmailParticipant(header: string | null | undefined): EmailParticipant[] {
    if (!header) return [];
    return header.split(',').map((part) => {
      part = part.trim();
      const match = part.match(/(.*)<(.*)>/);
      if (match) {
        return {
          displayName: match[1].trim().replace(/^"|"$/g, '') || null,
          emailAddress: match[2].trim(),
        };
      }
      return { displayName: null, emailAddress: part };
    });
  }

  private mapMessage(msg: gmail_v1.Schema$Message): EmailMessage {
    const headers = msg.payload?.headers || [];
    const getHeader = (name: string) => headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value;

    const from = this.parseEmailParticipant(getHeader('from'))[0] || null;
    const to = this.parseEmailParticipant(getHeader('to'));
    const cc = this.parseEmailParticipant(getHeader('cc'));
    const bcc = this.parseEmailParticipant(getHeader('bcc'));

    const isOutbound = msg.labelIds?.includes('SENT');

    return {
      providerMessageId: msg.id!,
      providerThreadId: msg.threadId || null,
      internetMessageId: getHeader('message-id') || null,
      direction: isOutbound ? 'outbound' : 'inbound',
      subject: getHeader('subject') || null,
      bodyPreview: msg.snippet || null,
      sentAt: msg.internalDate ? new Date(parseInt(msg.internalDate)) : null,
      receivedAt: msg.internalDate ? new Date(parseInt(msg.internalDate)) : null,
      from,
      to,
      cc,
      bcc,
    };
  }

  async exchangeCodeForTokens(code: string, redirectUri: string) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        this.clientId,
        this.clientSecret,
        redirectUri
      );
      const { tokens } = await oauth2Client.getToken(code);
      return {
        accessToken: tokens.access_token!,
        refreshToken: tokens.refresh_token!,
        expiresAt: new Date(tokens.expiry_date!),
        scopes: tokens.scope!,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const oauth2Client = new google.auth.OAuth2(
        this.clientId,
        this.clientSecret
      );
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      const { credentials } = await oauth2Client.refreshAccessToken();
      return {
        accessToken: credentials.access_token!,
        refreshToken: credentials.refresh_token || refreshToken,
        expiresAt: new Date(credentials.expiry_date!),
        scopes: credentials.scope!,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAccountProfile(accessToken: string): Promise<AccountProfile> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuthClient(accessToken) });
      const res = await gmail.users.getProfile({ userId: 'me' });
      return {
        emailAddress: res.data.emailAddress!,
        displayName: null, 
        providerAccountId: res.data.emailAddress!,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMessages(accessToken: string, options?: { cursor?: string; limit?: number; since?: Date }) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuthClient(accessToken) });
      
      let q = '';
      if (options?.since) {
        q = `after:${Math.floor(options.since.getTime() / 1000)}`;
      }

      const res = await gmail.users.messages.list({
        userId: 'me',
        maxResults: options?.limit || 50,
        pageToken: options?.cursor,
        q: q || undefined,
      });

      const messages: EmailMessage[] = [];
      
      if (res.data.messages) {
        for (const m of res.data.messages) {
          try {
            const msg = await this.getMessage(accessToken, m.id!);
            messages.push(msg);
          } catch (e) {
            console.error(`Failed to fetch message ${m.id}`, e);
          }
        }
      }

      return {
        messages,
        nextCursor: res.data.nextPageToken || undefined,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMessage(accessToken: string, messageId: string): Promise<EmailMessage> {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuthClient(accessToken) });
      const res = await gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'metadata',
        metadataHeaders: ['From', 'To', 'Cc', 'Bcc', 'Subject', 'Message-ID'],
      });
      return this.mapMessage(res.data);
    } catch (error) {
      this.handleError(error);
    }
  }

  async subscribeToChanges(accessToken: string, webhookUrl: string, state?: string) {
    try {
      const gmail = google.gmail({ version: 'v1', auth: this.getOAuthClient(accessToken) });
      const res = await gmail.users.watch({
        userId: 'me',
        requestBody: {
          topicName: process.env.GOOGLE_PUBSUB_TOPIC!,
          labelIds: ['INBOX', 'SENT'],
        }
      });
      return {
        subscriptionId: res.data.historyId!,
        expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), 
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}
