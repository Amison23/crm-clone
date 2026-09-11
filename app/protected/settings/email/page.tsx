import { createClient } from '@/lib/supabase/server';
import { EmailSettings } from '@/components/email-integration/EmailSettings';
import { redirect } from 'next/navigation';

export default async function EmailSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch connected accounts for this employee
  const { data: accounts } = await supabase
    .from('connected_email_accounts')
    .select('id, provider, email_address, sync_status, created_at')
    .eq('employee_id', user.id);

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Email Integrations</h2>
      </div>
      
      <div className="max-w-4xl">
        <EmailSettings accounts={accounts || []} />
      </div>
    </div>
  );
}
