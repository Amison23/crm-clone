import { Client } from '@microsoft/microsoft-graph-client';
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

export class MicrosoftEmailProvider implements EmailProvider {
  private clientId = process.env.MICROSOFT_CLIENT_ID || 'mock';
  private clientSecret = process.env.MICROSOFT_CLIENT_SECRET || 'mock';
  private tenantId = process.env.MICROSOFT_TENANT_ID || 'common';

  private getGraphClient(accessToken: string) {
    return Client.init({
      authProvider: (done) => {
        done(null, accessToken);
      },
    });
  }

  private handleError(error: any): never {
    const status = error.statusCode || error.status;
    const message = error.message || 'Unknown Microsoft API Error';

    if (status === 401 || status === 403) {
      throw new EmailAuthError(message, 'microsoft', error);
    }
    if (status === 429) {
      throw new EmailRateLimitError(message, 'microsoft', undefined, error);
    }
    if (status >= 500) {
      throw new EmailTemporaryError(message, 'microsoft', error);
    }
    throw new EmailProviderError(message, 'microsoft', error);
  }

  private parseParticipants(recipients: any[]): EmailParticipant[] {
    if (!recipients) return [];
    return recipients.map((r) => ({
      emailAddress: r.emailAddress?.address || '',
      displayName: r.emailAddress?.name || null,
    }));
  }

  private mapMessage(msg: any): EmailMessage {
    return {
      providerMessageId: msg.id,
      providerThreadId: msg.conversationId || null,
      internetMessageId: msg.internetMessageId || null,
      direction: msg.sender?.emailAddress?.address === msg.replyTo?.[0]?.emailAddress?.address ? 'outbound' : 'inbound',
      subject: msg.subject || null,
      bodyPreview: msg.bodyPreview || null,
      sentAt: msg.sentDateTime ? new Date(msg.sentDateTime) : null,
      receivedAt: msg.receivedDateTime ? new Date(msg.receivedDateTime) : null,
      from: msg.from ? this.parseParticipants([msg.from])[0] : null,
      to: this.parseParticipants(msg.toRecipients),
      cc: this.parseParticipants(msg.ccRecipients),
      bcc: this.parseParticipants(msg.bccRecipients),
    };
  }

  async exchangeCodeForTokens(code: string, redirectUri: string) {
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        code,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      });
      
      const res = await fetch(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      
      if (!res.ok) throw await res.json();
      const tokens = await res.json();

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        scopes: tokens.scope,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async refreshTokens(refreshToken: string) {
    try {
      const params = new URLSearchParams({
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
        grant_type: 'refresh_token',
      });
      
      const res = await fetch(`https://login.microsoftonline.com/${this.tenantId}/oauth2/v2.0/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });
      
      if (!res.ok) throw await res.json();
      const tokens = await res.json();

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token || refreshToken,
        expiresAt: new Date(Date.now() + tokens.expires_in * 1000),
        scopes: tokens.scope,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getAccountProfile(accessToken: string): Promise<AccountProfile> {
    try {
      const client = this.getGraphClient(accessToken);
      const res = await client.api('/me').select('id,displayName,mail,userPrincipalName').get();
      return {
        emailAddress: res.mail || res.userPrincipalName,
        displayName: res.displayName || null,
        providerAccountId: res.id,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMessages(accessToken: string, options?: { cursor?: string; limit?: number; since?: Date }) {
    try {
      const client = this.getGraphClient(accessToken);
      let request = client.api('/me/messages').top(options?.limit || 50);
      
      if (options?.cursor) {
        request = client.api(options.cursor); 
      } else if (options?.since) {
        request = request.filter(`receivedDateTime ge ${options.since.toISOString()}`);
      }

      const res = await request.get();
      
      return {
        messages: res.value.map((m: any) => this.mapMessage(m)),
        nextCursor: res['@odata.nextLink'] || undefined,
      };
    } catch (error) {
      this.handleError(error);
    }
  }

  async getMessage(accessToken: string, messageId: string): Promise<EmailMessage> {
    try {
      const client = this.getGraphClient(accessToken);
      const res = await client.api(`/me/messages/${messageId}`).get();
      return this.mapMessage(res);
    } catch (error) {
      this.handleError(error);
    }
  }

  async subscribeToChanges(accessToken: string, webhookUrl: string, state?: string) {
    try {
      const client = this.getGraphClient(accessToken);
      const res = await client.api('/subscriptions').post({
        changeType: 'created,updated',
        notificationUrl: webhookUrl,
        resource: 'me/messages',
        expirationDateTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        clientState: state,
      });
      return {
        subscriptionId: res.id,
        expirationDate: new Date(res.expirationDateTime),
      };
    } catch (error) {
      this.handleError(error);
    }
  }
}
