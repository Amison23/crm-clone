import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EmailSyncService } from '@/lib/email-integration/sync.service';

// Allow execution for up to 60 seconds if hosted on Vercel Pro, or max allowed by platform
export const maxDuration = 60; 

export async function GET(req: NextRequest) {
  // 1. Verify cron secret to prevent unauthorized execution
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 2. Initialize Supabase Admin Client to bypass RLS for background jobs
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const syncService = new EmailSyncService(supabaseAdmin);

    // 3. Fetch accounts that need syncing
    // E.g., status is active or pending, and haven't failed recently
    const { data: accounts, error } = await supabaseAdmin
      .from('connected_email_accounts')
      .select('id')
      .in('sync_status', ['active', 'pending', 'syncing']);

    if (error) {
      console.error('Failed to fetch accounts for sync:', error);
      return NextResponse.json({ error: 'Failed to fetch accounts' }, { status: 500 });
    }

    if (!accounts || accounts.length === 0) {
      return NextResponse.json({ success: true, message: 'No accounts to sync' });
    }

    // 4. Process concurrently (with a limit in production, but Promise.all for now)
    // Note: For large scale, you'd want a queue (like Inngest, Quirrel, or pg_boss)
    const results = await Promise.allSettled(
      accounts.map(acc => syncService.syncAccount(acc.id))
    );

    const successful = results.filter(r => r.status === 'fulfilled').length;
    const failed = results.filter(r => r.status === 'rejected').length;

    return NextResponse.json({
      success: true,
      processed: accounts.length,
      successful,
      failed,
    });
  } catch (err: any) {
    console.error('Cron sync error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
