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
    // Execution time is limited by the slowest single query.
    const [
      intelReq,
      leadsReq,
      revenueAuditReq,
      throughputReq,
      frictionReq,
      unassignedReq,
      sourceDistReq
    ] = await Promise.all([
      // 1. Core Summary RPC
      supabase.rpc('get_tenant_intelligence_with_trends', { t_id: tenantId }),
      
      // 2. Raw Leads with Employee Join
      supabase.from('leads')
        .select('*, employees!leads_employee_id_fkey(full_name)')
        .eq('company_id', tenantId),
      
      // 3. Section 5.1: Expansive Revenue View
      supabase.from('view_detailed_revenue_audit')
        .select('*')
        .eq('company_id', tenantId),
      
      // 4. Section 5.2: Node Throughput RPC
      supabase.rpc('get_detailed_node_throughput', { t_id: tenantId }),
      
      // 5. Tactical: Critical Friction & Density
      supabase.from('view_operational_audit')
        .select('*')
        .in('metric_type', ['FRICTION', 'DENSITY'])
        .eq('company_id', tenantId),
      
      // 6. Tactical: Unassigned Routing
      supabase.from('view_unassigned_routing_audit')
        .select('*')
        .eq('company_id', tenantId),
      
      // 7. Source Analytics Distribution
      supabase.from('view_lead_source_distribution')
        .select('*')
        .eq('company_id', tenantId)
    ]);

    // Handle potential RPC or View errors gracefully
    const stats = intelReq.data?.stats || {};
    const trends = intelReq.data?.trends || [];

    // --- MAPPED DATA RESPONSE ---
    // Aligned exactly with the IntelligenceData interface
    return NextResponse.json({
      sales: {
        totalLeads: Number(stats.total_leads || 0),
        conversionRate: `${stats.conversion_rate || 0}%`,
        totalRevenue: Number(stats.total_revenue || 0),
      },
      productivity: {
        totalTasks: Number(stats.total_tasks || 0),
        completedTasks: Number(stats.completed_tasks || 0),
        overdueTasks: Number(stats.overdue_tasks || 0),
      },
      trends: trends.map((day: any) => ({
        date: new Date(day.recorded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' }),
        total: day.leads_count,
        closed: day.tasks_completed_count,
        failed: 0,
      })),
      
      // Granular Audit Tables
      rawLeads: leadsReq.data || [],
      revenueAudit: revenueAuditReq.data || [],
      
      // Node Operational Vitals
      throughput: throughputReq.data || {
        productivity_yield: 0,
        critical_friction: 0,
        queue_density: 0,
        system_velocity: 0,
        node_status: 'Optimal'
      },

      // Tactical Data Objects
      tactical: {
        friction: frictionReq.data || [],
        unassigned: unassignedReq.data || []
      },

      // Channel Distribution Analytics
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