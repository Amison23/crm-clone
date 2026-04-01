import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  // 1. SECURITY: Only allow Super Admins to poll this node
  const { data: { user } } = await supabase.auth.getUser();
  if (!user || user.user_metadata?.role !== 'superadmin') {
    return NextResponse.json({ error: 'Unauthorized Access' }, { status: 401 });
  }

  // 2. FETCH: Get the latest metrics joined with company names
  // We use the view we created earlier for higher performance
  const { data: metrics, error } = await supabase
    .from('view_server_infrastructure_audit')
    .select('*')
    .limit(15);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(metrics);
}