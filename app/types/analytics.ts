export interface LeadConversionData {
    total_leads: number;
    wins: number;
    losses: number;
    conversion_rate_percentage: number;
    total_revenue: number;
  }
  
  export interface AgentPerformance {
    // 1. Identification (The missing piece)
    agent_name: string;
    tenant_id: string;      // Adding this resolves the ts(2322) error
  
    // 2. Core Metrics
    total_leads: number;
    closed_deals: number;
    win_rate: number;
    trend: number;
  
    // 3. Precision & Velocity (Ensuring these are also known)
    avg_days: number;       // Lead Velocity
    precision_rate: number; // Operational Accuracy
  }