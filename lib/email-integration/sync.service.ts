import { SupabaseClient } from '@supabase/supabase-js';
import { getEmailProvider } from './factory';
import { encryptToken, decryptToken } from './encryption';
import { EmailAuthError, EmailRateLimitError } from './errors';
import { EmailMessage } from './provider.interface';

export class EmailSyncService {
  constructor(private supabase: SupabaseClient) {}

  async syncAccount(accountId: string) {
    // 1. Fetch account
    const { data: account, error: accountError } = await this.supabase
      .from('connected_email_accounts')
      .select('*')
      .eq('id', accountId)
      .single();

    if (accountError || !account) {
      throw new Error(`Account not found or error fetching: ${accountError?.message}`);
    }

    try {
      // 2. Set status to syncing
      await this.supabase
        .from('connected_email_accounts')
        .update({ sync_status: 'syncing' })
        .eq('id', accountId);

      const provider = getEmailProvider(account.provider as any);
      let accessToken = decryptToken(account.access_token);
      let refreshToken = decryptToken(account.refresh_token);

      // 3. Check expiration and refresh if needed
      const expiresAt = new Date(account.token_expires_at);
      if (expiresAt.getTime() - Date.now() < 5 * 60 * 1000) {
        // Less than 5 minutes until expiry, refresh now
        const refreshed = await provider.refreshTokens(refreshToken);
        if (refreshed) {
          accessToken = refreshed.accessToken;
          refreshToken = refreshed.refreshToken;
          
          await this.supabase
            .from('connected_email_accounts')
            .update({
              access_token: encryptToken(accessToken),
              refresh_token: encryptToken(refreshToken),
              token_expires_at: refreshed.expiresAt.toISOString(),
              scopes: refreshed.scopes,
            })
            .eq('id', accountId);
        }
      }

      // 4. Fetch messages
      let currentCursor = account.sync_cursor;
      let hasMore = true;
      let pagesFetched = 0;
      const MAX_PAGES = 3; // Limit to 3 pages per sync run to avoid timeouts

      while (hasMore && pagesFetched < MAX_PAGES) {
        const result = await provider.getMessages(accessToken, { cursor: currentCursor });
        
        if (result && result.messages.length > 0) {
          await this.processMessages(account.company_id, accountId, result.messages);
        }

        if (result?.nextCursor) {
          currentCursor = result.nextCursor;
          pagesFetched++;
        } else {
          hasMore = false;
        }
      }

      // 5. Update success
      await this.supabase
        .from('connected_email_accounts')
        .update({
          sync_cursor: currentCursor,
          sync_status: 'active',
          last_successful_sync: new Date().toISOString(),
          last_sync_error: null,
        })
        .eq('id', accountId);

    } catch (error: any) {
      console.error(`Sync error for account ${accountId}:`, error);

      let status = 'error';
      // If the error indicates we are rate limited, we shouldn't necessarily mark the account as broken,
      // just wait for the next cron.
      if (error instanceof EmailRateLimitError) {
        status = 'active'; // keep active so we try again normally, or 'pending'
      } else if (error instanceof EmailAuthError) {
        status = 'disconnected'; // needs re-auth
      }

      await this.supabase
        .from('connected_email_accounts')
        .update({
          sync_status: status,
          last_sync_error: error.message || 'Unknown error',
        })
        .eq('id', accountId);
    }
  }

  private async processMessages(companyId: string, accountId: string, messages: EmailMessage[]) {
    // We do this message by message, but ideally in a batch/upsert
    for (const msg of messages) {
      // Upsert the message
      const { data: insertedMsg, error: msgError } = await this.supabase
        .from('email_messages')
        .upsert({
          company_id: companyId,
          connected_account_id: accountId,
          provider_message_id: msg.providerMessageId,
          provider_thread_id: msg.providerThreadId,
          internet_message_id: msg.internetMessageId,
          direction: msg.direction,
          subject: msg.subject,
          body_preview: msg.bodyPreview,
          sent_at: msg.sentAt?.toISOString(),
          received_at: msg.receivedAt?.toISOString(),
        }, {
          onConflict: 'provider_message_id' // Actually, we didn't add a unique constraint just for provider_message_id. We should rely on standard insert/upsert if we have a unique index. Assuming (connected_account_id, provider_message_id) is unique.
        })
        .select('id')
        .single();

      if (msgError || !insertedMsg) {
        console.error(`Error inserting message ${msg.providerMessageId}:`, msgError);
        continue;
      }

      const emailMessageId = insertedMsg.id;
      const participants = [];

      if (msg.from) {
        participants.push({ ...msg.from, type: 'from' });
      }
      msg.to.forEach(p => participants.push({ ...p, type: 'to' }));
      msg.cc.forEach(p => participants.push({ ...p, type: 'cc' }));
      msg.bcc.forEach(p => participants.push({ ...p, type: 'bcc' }));

      if (participants.length > 0) {
        const participantPayloads = participants.map(p => ({
          company_id: companyId,
          email_message_id: emailMessageId,
          participant_type: p.type,
          email_address: p.emailAddress,
          display_name: p.displayName,
        }));

        await this.supabase
          .from('email_participants')
          .insert(participantPayloads);

        // --- AUTOMATED CRM ASSOCIATION ---
        // Extract all unique participant emails
        const uniqueEmails = Array.from(new Set(participants.map(p => p.emailAddress).filter(Boolean)));
        
        if (uniqueEmails.length > 0) {
          // Find leads with these emails
          const { data: matchedLeads, error: leadsError } = await this.supabase
            .from('leads')
            .select('id')
            .eq('company_id', companyId)
            .in('email', uniqueEmails);
            
          if (!leadsError && matchedLeads && matchedLeads.length > 0) {
            const relationsPayload = matchedLeads.map(lead => ({
              company_id: companyId,
              email_message_id: emailMessageId,
              crm_entity_type: 'lead',
              crm_entity_id: lead.id
            }));
            
            await this.supabase
              .from('email_crm_relations')
              .insert(relationsPayload);
          }
        }
      }
    }
  }
}
