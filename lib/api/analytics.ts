'use server';

import { createClient } from '@/lib/supabase/server';

/**
 * INTELLIGENCE ENGINE v3.0
 * Fetches and transforms database RPC data into standard CRM Node Vitals.
 */
export async function fetchDashboardVitals(tenantId: string) {
  const supabase = await createClient();

  // 1. Invoke Postgres Intelligence Function
  const { data, error } = await supabase.rpc('get_tenant_intelligence_with_trends', {
    t_id: tenantId
  });

  if (error) {
    console.error('CRITICAL: Trend Engine Failure:', error);
    return getZeroState(tenantId);
  }

  // 2. Destructure for mapping (assumes RPC returns { stats: {}, trends: [] })
  const stats = data?.stats || {};
  const trends = data?.trends || [];

  // 3. The Transformation Layer: Ensuring Interface Integrity
  return {
    sales: {
      totalLeads: Number(stats.total_leads || 0),
      // Format conversion rate as a string percentage for the Summary Cards
      conversionRate: `${stats.conversion_rate || 0}%`,
      totalRevenue: Number(stats.total_revenue || 0),
    },
    productivity: {
      totalTasks: Number(stats.total_tasks || 0),
      completedTasks: Number(stats.completed_tasks || 0),
      overdueTasks: Number(stats.overdue_tasks || 0),
    },
    // Map trends array specifically for the Recharts monotone area chart
    trends: trends.map((day: any) => ({
      date: new Date(day.recorded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
      total: Number(day.leads_count || 0),
      closed: Number(day.tasks_completed_count || 0),
      failed: 0 // Logic placeholder for drop-off metrics
    })),
    engagement: {
      lastActive: new Date().toISOString(),
      systemStatus: 'Optimal',
    },
    meta: {
      nodeId: 'af-south-1',
      timestamp: new Date().toISOString(),
      verified: true,
      tenantContext: tenantId.slice(0, 8),
    },
  };
}

/**
 * Resilient Zero-State fallback to prevent UI flickering/crashes
 */
function getZeroState(tenantId: string) {
  return {
    sales: { totalLeads: 0, conversionRate: '0%', totalRevenue: 0 },
    productivity: { totalTasks: 0, completedTasks: 0, overdueTasks: 0 },
    trends: [],
    engagement: { lastActive: null, systemStatus: 'Degraded' },
    meta: { nodeId: 'af-south-1', timestamp: new Date().toISOString(), verified: false }
  };
}