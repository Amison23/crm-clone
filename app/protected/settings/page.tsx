import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

export default async function SettingsOverviewPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Fetch employee data
  const { data: employee } = await supabase
    .from('employees')
    .select('full_name, email_address, role, company_id')
    .eq('id', user.id)
    .single();

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Profile Card */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800">
          <div className="flex items-center gap-4 mb-4">
            <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xl uppercase">
              {employee?.full_name?.[0] || user.email?.[0] || '?'}
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                {employee?.full_name || 'My Profile'}
              </h3>
              <p className="text-sm text-slate-500">{employee?.email_address || user.email}</p>
            </div>
          </div>
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Role</span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 capitalize">
                {employee?.role || 'Unknown'}
              </span>
            </div>
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">Company ID</span>
              <span className="text-sm font-mono text-slate-700 dark:text-slate-300">
                {employee?.company_id || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Email Integrations Link */}
        <Link 
          href="/protected/settings/email" 
          className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary/50 transition-colors dark:bg-slate-900 dark:border-slate-800 group"
        >
          <div className="size-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">mark_email_read</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Email Integrations</h3>
          <p className="text-sm text-slate-500">
            Connect your Google Workspace or Microsoft 365 account to sync emails automatically with leads.
          </p>
        </Link>

        {/* Security Settings Link */}
        <Link 
          href="/protected/settings/security" 
          className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-primary/50 transition-colors dark:bg-slate-900 dark:border-slate-800 group"
        >
          <div className="size-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <span className="material-symbols-outlined">security</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Security Settings</h3>
          <p className="text-sm text-slate-500">
            Manage your Multi-Factor Authentication (MFA) and other security preferences.
          </p>
        </Link>
        
        {/* Workspace Preferences (Placeholder) */}
        <div className="p-6 bg-white border border-slate-200 rounded-xl shadow-sm dark:bg-slate-900 dark:border-slate-800 opacity-60">
          <div className="size-10 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined">tune</span>
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Workspace Preferences</h3>
          <p className="text-sm text-slate-500 mb-3">
            Configure default views, notifications, and application layout.
          </p>
          <span className="text-xs font-bold text-slate-400 uppercase">Coming Soon</span>
        </div>
      </div>
    </div>
  );
}
