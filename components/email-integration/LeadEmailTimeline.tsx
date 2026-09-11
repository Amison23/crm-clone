'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Loader2 } from 'lucide-react';

const supabase = createClient();

type EmailMessage = {
  id: string;
  subject: string;
  body_preview: string;
  sent_at: string;
  direction: string;
  email_participants: Array<{
    display_name: string;
    email_address: string;
    participant_type: string;
  }>;
};

export function LeadEmailTimeline({ leadId }: { leadId: string }) {
  const [emails, setEmails] = useState<EmailMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEmails() {
      // Fetch relations joined with messages and participants
      const { data, error } = await supabase
        .from('email_crm_relations')
        .select(`
          email_messages (
            id, subject, body_preview, sent_at, direction,
            email_participants (display_name, email_address, participant_type)
          )
        `)
        .eq('crm_entity_type', 'lead')
        .eq('crm_entity_id', leadId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching lead emails:', error);
      } else if (data) {
        // Flatten the relations into just the messages
        const messages = data
          .map(row => row.email_messages as unknown as EmailMessage)
          .filter(Boolean)
          .sort((a, b) => new Date(b.sent_at).getTime() - new Date(a.sent_at).getTime());
          
        setEmails(messages);
      }
      setLoading(false);
    }
    
    if (leadId) fetchEmails();
  }, [leadId]);

  if (loading) {
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (emails.length === 0) {
    return (
      <div className="text-center p-6 bg-slate-50 dark:bg-slate-900 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
        <span className="material-symbols-outlined text-3xl text-slate-400 mb-2">inbox</span>
        <p className="text-sm font-medium text-slate-500">No emails associated with this lead.</p>
        <p className="text-xs text-slate-400 mt-1">Emails matching this lead's address will appear here automatically.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {emails.map(email => {
        const from = email.email_participants.find(p => p.participant_type === 'from');
        const to = email.email_participants.filter(p => p.participant_type === 'to');
        
        return (
          <div key={email.id} className="bg-white dark:bg-slate-950 p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-primary/30 transition-colors">
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <div className={`size-6 rounded-full flex items-center justify-center shrink-0 ${email.direction === 'inbound' ? 'bg-indigo-100 text-indigo-700' : 'bg-emerald-100 text-emerald-700'}`}>
                  <span className="material-symbols-outlined text-[14px]">
                    {email.direction === 'inbound' ? 'call_received' : 'call_made'}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">
                    {from?.display_name || from?.email_address}
                  </p>
                  <p className="text-[10px] text-slate-500">
                    to {to.map(t => t.display_name || t.email_address).join(', ')}
                  </p>
                </div>
              </div>
              <span className="text-xs text-slate-400 shrink-0">
                {new Date(email.sent_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">{email.subject || '(No Subject)'}</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {email.body_preview || 'No preview available.'}
            </p>
          </div>
        );
      })}
    </div>
  );
}
