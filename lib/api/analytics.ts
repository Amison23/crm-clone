'use server';

import { createClient } from '@/lib/supabase/server';

export async function fetchDashboardVitals(tenantId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase.rpc('get_tenant_intelligence_with_trends', {
    t_id: tenantId
  });

  if (error) {
    console.error('Trend Engine Failure:', error);
    return null;
  }

  return data; // Returns the { stats, trends } object directly
}