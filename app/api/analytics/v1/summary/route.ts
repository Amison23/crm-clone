import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  const supabase = await createClient();

  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // 🎯 NEW LOGIC: Just query the view! 
    // RLS handles the filtering automatically because we used 'security_invoker'
    const { data, error } = await supabase
      .from('analytics_summary_view')
      .select('*')
      .single();

    if (error) throw error;

    // Map the view columns to your frontend interface
    return NextResponse.json({
      sales: {
        totalLeads: data.total_leads,
        conversionRate: `${data.conversion_rate_percentage}%`,
        totalRevenue: data.total_revenue,
      },
      productivity: {
        totalTasks: data.total_tasks,
        completedTasks: data.completed_tasks,
        overdueTasks: data.overdue_tasks,
      },
      engagement: {
        lastActive: data.last_active,
        systemStatus: 'Operational',
      },
      meta: {
        nodeId: data.company_id,
        timestamp: new Date().toISOString(),
        verified: true
      }
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Intelligence Engine Offline' }, { status: 500 });
  }
}