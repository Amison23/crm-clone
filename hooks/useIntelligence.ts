'use client';
import useSWR from 'swr';

/**
 * INTELLIGENCE ENGINE v3.0 INTERFACE
 * Unified schema for Financial, Operational, and Infrastructure Telemetry.
 */
export interface IntelligenceData {
  // 1. Core Summary Vitals
  sales: { 
    totalLeads: number; 
    conversionRate: string; 
    totalRevenue: number; 
  };
  productivity: { 
    totalTasks: number; 
    completedTasks: number; 
    overdueTasks: number; 
  };
  
  // 2. Performance Trends (monotone area charts)
  trends: Array<{ 
    date: string; 
    total: number; 
    closed: number; 
    failed: number 
  }>;

  // 3. Section 5.1: Expansive Revenue Audit
  // Source: view_expansive_revenue_audit
  revenueAudit: Array<{
    transaction_id: string;
    internal_node: string;
    client_org: string;
    product_name: string;
    product_category: string;
    closing_agent: string;
    settled_value: number;
    timestamp: string;
    lead_source: string;
  }>;

  // 4. Section 5.2: Node Throughput Vitals
  // Source: get_detailed_node_throughput(uuid)
  throughput: {
    productivity_yield: number;
    critical_friction: number;
    queue_density: number;
    system_velocity: number;
    node_status: 'Optimal' | 'Degraded' | 'Halted';
  };

  // 5. Source Distribution (Channel Analytics)
  // Source: view_lead_source_distribution
  sourceDistribution: Array<{
    source: string;
    lead_count: number;
    aggregate_value: number;
  }>;

  // 6. RAW CRM DATA (For Lead Tables/Funnel)
  rawLeads: Array<{
    id: string;
    status: string;
    potential_value: number;
    employee_id: string | null;
    employees?: { full_name: string } | null;
    first_name?: string;
    last_name?: string;
    company_name?: string;
    source: string;
    created_at: string;
    updated_at: string;
  }>;

  // 7. System Meta
  meta: { 
    nodeId: string; 
    timestamp: string; 
    verified: boolean; 
    tenantContext?: string; 
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
      refreshInterval: 30000, // Re-sync every 30s for the "Live Pulse"
      revalidateOnFocus: true, // Auto-sync when Admin returns to the tab
      dedupingInterval: 5000,  // Prevents duplicate requests
      errorRetryCount: 3,      // Graceful fallback for flaky connections
    }
  );

  return {
    intelligence: data,
    isLoading,
    isError: error,
    refresh: mutate, // Trigger for the "Manual Sync" UI buttons
  };
}