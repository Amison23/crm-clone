'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

interface ConnectedAccount {
  id: string;
  provider: string;
  email_address: string;
  sync_status: string;
  created_at: string;
}

export function EmailSettings({ accounts }: { accounts: ConnectedAccount[] }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);

  const error = searchParams.get('error');
  const success = searchParams.get('success');

  const handleDisconnect = async (provider: string, accountId: string) => {
    if (!confirm('Are you sure you want to disconnect this email account? This will stop email syncing.')) return;
    
    setLoading(provider);
    try {
      const res = await fetch(`/api/email-integrations/${provider}/disconnect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: accountId })
      });
      if (!res.ok) throw new Error(await res.text());
      router.refresh();
    } catch (err: any) {
      alert('Failed to disconnect: ' + err.message);
    } finally {
      setLoading(null);
    }
  };

  const googleAccount = accounts.find(a => a.provider === 'google');
  const microsoftAccount = accounts.find(a => a.provider === 'microsoft');

  return (
    <div className="space-y-6">
      {error && (
        <div className="p-4 mb-4 text-sm text-red-800 rounded-lg bg-red-50 dark:bg-gray-800 dark:text-red-400">
          Error connecting account: {error}
        </div>
      )}
      {success && (
        <div className="p-4 mb-4 text-sm text-green-800 rounded-lg bg-green-50 dark:bg-gray-800 dark:text-green-400">
          Account connected successfully!
        </div>
      )}

      {/* Google Integration */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Google Workspace / Gmail</h5>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          Connect your Google account to sync emails, track conversations, and manage threads directly from the CRM.
        </p>
        
        {googleAccount ? (
          <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{googleAccount.email_address}</p>
                <p className="text-sm text-gray-500">Status: {googleAccount.sync_status}</p>
              </div>
              <button 
                onClick={() => handleDisconnect('google', googleAccount.id)}
                disabled={loading === 'google'}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
              >
                {loading === 'google' ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        ) : (
          <a href="/api/email-integrations/google/connect" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
            Connect Google
          </a>
        )}
      </div>

      {/* Microsoft Integration */}
      <div className="p-6 bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700">
        <h5 className="mb-2 text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Microsoft 365 / Outlook</h5>
        <p className="mb-3 font-normal text-gray-700 dark:text-gray-400">
          Connect your Microsoft account to sync emails and calendar events with your CRM contacts.
        </p>
        
        {microsoftAccount ? (
          <div className="mt-4 p-4 border rounded bg-gray-50 dark:bg-gray-700">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-semibold">{microsoftAccount.email_address}</p>
                <p className="text-sm text-gray-500">Status: {microsoftAccount.sync_status}</p>
              </div>
              <button 
                onClick={() => handleDisconnect('microsoft', microsoftAccount.id)}
                disabled={loading === 'microsoft'}
                className="px-4 py-2 text-sm font-medium text-red-600 bg-red-100 rounded-lg hover:bg-red-200"
              >
                {loading === 'microsoft' ? 'Disconnecting...' : 'Disconnect'}
              </button>
            </div>
          </div>
        ) : (
          <a href="/api/email-integrations/microsoft/connect" className="inline-flex items-center px-3 py-2 text-sm font-medium text-center text-white bg-blue-700 rounded-lg hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300">
            Connect Microsoft
          </a>
        )}
      </div>

    </div>
  );
}
