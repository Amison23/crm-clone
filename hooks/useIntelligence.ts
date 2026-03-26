'use client';
import useSWR from 'swr';

/**
 * DB-SOURCE: This interface mirrors the payload from /api/analytics/v1/summary
 * Standardized for Standalone CRM Architecture.
 */
export interface IntelligenceData {
  sales: {
    /* DB-SOURCE: analytics_conversion_rates.total_leads */
    totalLeads: number;
    /* DB-SOURCE: Calculated: (Wins / Total Leads) * 100 */
    conversionRate: string;
    /* DB-SOURCE: organizations.total_revenue or invoices table */
    totalRevenue: number;
  };
  productivity: {
    /* DB-SOURCE: COUNT(*) FROM tasks WHERE org_id = current_node */
    totalTasks: number;
    /* DB-SOURCE: COUNT(*) FROM tasks WHERE status = 'Completed' */
    completedTasks: number;
    /* DB-SOURCE: COUNT(*) FROM tasks WHERE deadline < NOW() AND status != 'Completed' */
    overdueTasks: number;
  };
  engagement: {
    /* DB-SOURCE: MAX(messages.created_at) OR latest_interaction_log */
    lastActive: string | null;
    /* DB-SOURCE: System health check / API heartbeat */
    systemStatus: string;
  };
  meta: {
    /* DB-SOURCE: auth.users.user_metadata.org_id */
    nodeId: string;
    /* DB-SOURCE: Server-side timestamp (ISO) */
    timestamp: string;
    verified: boolean;
  };
}

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error('CRM Node Sync Failed: af-south-1 connection lost');
  return res.json();
});

export function useIntelligence() {
  const { data, error, isLoading, mutate } = useSWR<IntelligenceData>(
    '/api/analytics/v1/summary',
    fetcher,
    {
      refreshInterval: 30000, // Re-sync every 30s for the "Live" dashboard feel
      revalidateOnFocus: true, // Auto-sync when Admin returns to the tab
      dedupingInterval: 5000,  // Prevents duplicate requests from multiple dashboard cards
      errorRetryCount: 3,      // Graceful fallback for flaky connections
    }
  );

  return {
    intelligence: data,
    isLoading,
    isError: error,
    refresh: mutate, // Manual trigger for 'Sync Node' buttons
  };
}