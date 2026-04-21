import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    const tenantId = user?.user_metadata?.tenant_id;
    
    if (!tenantId) {
      return NextResponse.json({ error: 'Unauthorized Node Access' }, { status: 401 });
    }

    // --- CONSOLIDATED PARALLEL FETCH ---
    const [
      intelReq,
      leadsReq,
      revenueAuditReq,
      throughputReq,
      frictionReq,
      unassignedReq,
      sourceDistReq
    ] = await Promise.all([
      // 1. Core Summary RPC (Aggregates current state)
      supabase.rpc('get_tenant_intelligence_with_trends', { t_id: tenantId }),
      
      // 2. Raw Leads (For Funnel & Agent Report)
      supabase.from('leads')
        .select('*, employees!leads_employee_id_fkey(full_name)')
        .eq('company_id', tenantId),
      
      // 3. Section 5.1: Expansive Revenue View (Settled Deals)
      supabase.from('view_detailed_revenue_audit')
        .select('*')
        .eq('company_id', tenantId),
      
      // 4. Section 5.2: Node Throughput RPC (Operational health)
      supabase.rpc('get_detailed_node_throughput', { t_id: tenantId }),
      
      // 5. Tactical: Friction & Density
      supabase.from('view_operational_audit')
        .select('*')
        .in('metric_type', ['FRICTION', 'DENSITY'])
        .eq('company_id', tenantId),
      
      // 6. Tactical: Unassigned Yield
      supabase.from('view_unassigned_routing_audit')
        .select('*')
        .eq('company_id', tenantId),
      
      // 7. Marketing ROI Distribution
      supabase.from('view_lead_source_distribution')
        .select('*')
        .eq('company_id', tenantId)
    ]);

    // Defensive extraction of RPC data
    const stats = intelReq.data?.stats || {};
    const rawTrends = intelReq.data?.trends || [];

    // --- MAPPED DATA RESPONSE ---
    return NextResponse.json({
      sales: {
        totalLeads: Number(stats.total_leads || 0),
        conversionRate: `${stats.conversion_rate || 0}%`,
        // 🎯 FIX: Using total_revenue from the RPC summary
        totalRevenue: Number(stats.total_revenue || 0),
      },
      productivity: {
        totalTasks: Number(stats.total_tasks || 0),
        completedTasks: Number(stats.completed_tasks || 0),
        overdueTasks: Number(stats.overdue_tasks || 0),
      },
      // 🎯 TRENDS LOGIC: Map the 30-day snapshots into the Recharts format
      trends: rawTrends.map((day: any) => ({
        date: new Date(day.recorded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        total: Number(day.total_leads_count || 0),
        closed: Number(day.closed_leads_count || 0),
        revenue: Number(day.total_revenue_won || 0), // New column from schema
        tasks: Number(day.tasks_completed_count || 0),
        failed: Number(day.failed_leads_count || 0),
      })),
      
      // Granular Tables
      rawLeads: leadsReq.data || [],
      revenueAudit: revenueAuditReq.data || [],
      
      // Node Operational Vitals (Section 5.2)
      throughput: throughputReq.data || {
        productivity_yield: 0,
        critical_friction: 0,
        queue_density: 0,
        system_velocity: 0,
        node_status: 'Optimal'
      },

      // Tactical Objects (Section 5.1/5.2)
      tactical: {
        friction: frictionReq.data || [],
        unassigned: unassignedReq.data || []
      },

      // Source Analytics
      sourceDistribution: (sourceDistReq.data || []).map(s => ({
        source: s.source,
        lead_count: Number(s.lead_count),
        aggregate_value: Number(s.aggregate_value)
      })),

      meta: {
        nodeId: 'af-south-1',
        timestamp: new Date().toISOString(),
        verified: true,
        tenantContext: tenantId.slice(0, 8),
      },
    });

  } catch (err) {
    console.error('CRITICAL: API Node Sync Error:', err);
    return NextResponse.json({ error: 'Internal Data Node Failure' }, { status: 500 });
  }
}