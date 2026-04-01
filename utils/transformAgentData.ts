export interface RawLeadData {
  id: string;
  status: string;
  potential_value: number;
  employee_id: string | null; // ✅ CHANGED: Explicitly allow null to match DB
  employees?: { full_name: string }[] | { full_name: string } | null;
  first_name?: string;
  last_name?: string;
  company_name?: string;
created_at?: string; 
  updated_at?: string;
}
export interface AgentPerformance {
  agent_name: string;
  total_leads: number;
  closed_deals: number;
  win_rate: number;
}

export function transformAgentData(data: RawLeadData[]): AgentPerformance[] {
  if (!data || data.length === 0) return [];

  const groupedData = data.reduce((acc, item) => {
    let name: string | null = null;

    // 1. Extract Name from Join
    if (Array.isArray(item.employees) && item.employees.length > 0) {
      name = item.employees[0].full_name;
    } else if (item.employees && !Array.isArray(item.employees)) {
      name = item.employees.full_name;
    }

    // 2. FALLBACK: Use short ID if name is missing but ID exists
    // This works because 'null' is falsy in JS
    if (!name && item.employee_id) {
      name = `Agent: ${item.employee_id.substring(0, 8)}...`;
    }

    // 3. If it's truly unassigned (null), skip it for the Leaderboard
    if (!name) return acc;

    if (!acc[name]) {
      acc[name] = {
        agent_name: name,
        total_leads: 0,
        closed_deals: 0,
        win_rate: 0
      };
    }

    acc[name].total_leads++;

    if (item.status === 'won' || item.status === 'closed_won') {
      acc[name].closed_deals++;
    }

    return acc;
  }, {} as Record<string, AgentPerformance>);

  return Object.values(groupedData)
    .map(agent => ({
      ...agent,
      win_rate: agent.total_leads > 0 
        ? Math.round((agent.closed_deals / agent.total_leads) * 100) 
        : 0
    }))
    .sort((a, b) => b.win_rate - a.win_rate);
}

export interface FunnelData {
  stage: string;
  count: number;
}

export const transformPipelineData = (leads: any[]) => {
  const stages = ['new', 'contacted', 'qualified', 'won', 'lost'];

  return stages.map(stage => {
    // Filter leads belonging to this specific stage
    const stageLeads = leads.filter(l => l.status?.toLowerCase() === stage);
    
    // Sum the potential_value for this stage (The Yield)
    const totalYield = stageLeads.reduce((sum, l) => {
      return sum + (Number(l.potential_value) || 0);
    }, 0);

    return {
      stage: stage,
      count: stageLeads.length,
      value: totalYield // 🎯 This is the 'Yield' mapped to the component
    };
  });
};