import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "react-hot-toast"
import { provisionAgent } from "@/app/protected/super-admin/actions"

type Tab = "overview" | "agents" | "customers" | "issues"
type Company = {
  name: string,
  logo: string,
  subscription_plan: string,
  status: string,
}

// ─── Company Admin ─────────────────────────────────────────────────────────────

export function CompanyAdmin({ companyId, initialCompany }: { companyId?: string | null, initialCompany?: any }) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState<Tab>("overview")
  const [company, setCompany] = useState<Company | null>(initialCompany ? {
    name: initialCompany.name,
    logo: initialCompany.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${initialCompany.name}&backgroundColor=6366f1`,
    subscription_plan: initialCompany.pricing_tier || "Pro",
    status: initialCompany.is_active ? "Active" : "Inactive"
  } : null)
  const [agents, setAgents] = useState<any[]>([])
  const [customers, setCustomers] = useState<any[]>([])
  const [issues, setIssues] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)

        // Fetch company details
        if (!initialCompany) {
          const companyQuery = supabase.from('companies').select('*')
          if (companyId) {
            companyQuery.eq('id', companyId)
          }
          const { data: companies, error: companyError } = await companyQuery.limit(1)

          if (companyError) throw companyError

          if (companies?.[0]) {
            const c = companies[0]
            setCompany({
              name: c.name,
              logo: c.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}&backgroundColor=6366f1`,
              subscription_plan: c.pricing_tier || "Pro",
              status: c.is_active ? "Active" : "Inactive"
            })
          } else {
            // If no company found, we still need to stop loading but maybe show an error
            console.error("No company found for ID:", companyId)
          }
        }
        // Fetch agents in this company
        const agentsQuery = supabase.from('employees').select('*').eq('role', 'sales_agent')
        if (companyId) {
          agentsQuery.eq('company_id', companyId)
        }
        const { data: employees, error: agentsError } = await agentsQuery
        if (agentsError) throw agentsError

        // Fetch tickets in this company (needed for counts)
        const ticketsQuery = supabase
          .from('tickets')
          .select('*, companies(name)')
        if (companyId) {
          ticketsQuery.eq('company_id', companyId)
        }
        const { data: ticketsData, error: ticketsError } = await ticketsQuery
        if (ticketsError) throw ticketsError
        const tickets = ticketsData || []

        // Fetch all agents 
        if (employees) {
          setAgents(employees.map(e => {
            const agentTickets = tickets.filter(t => t.assigned_to === e.id)
            return {
              id: e.id,
              name: e.full_name,
              avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.full_name}`,
              role: e.role,
              status: "Online",
              customers: 0,
              open_tickets: agentTickets.filter(t => t.status !== 'resolved').length,
              resolved_this_week: agentTickets.filter(t => t.status === 'resolved').length,
              email: e.email_address
            }
          }))
        }

        // Fetch customers in this company
        const customersQuery = supabase.from('employees').select('*, companies(name, logo)').eq('role', 'customer')
        if (companyId) {
          customersQuery.eq('company_id', companyId)
        }
        const { data: customersData, error: customersError } = await customersQuery
        if (customersError) throw customersError

        if (customersData) {
          setCustomers(customersData.map(c => {
            const clientTickets = tickets.filter(t => t.client_id === c.id)
            return {
              id: c.id,
              name: c.full_name,
              logo: c.companies?.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${c.full_name}&backgroundColor=10b981`,
              agent: "Unassigned",
              status: clientTickets.some(t => t.priority === 'critical' && t.status !== 'resolved') ? "Critical" : "Healthy",
              open_issues: clientTickets.filter(t => t.status !== 'resolved').length,
              plan: "Basic",
              since: c.created_at
            }
          }))
        }

        setIssues(tickets.map(t => ({
          id: t.id,
          title: t.title,
          client: customersData?.find(c => c.id === t.client_id)?.full_name || "Unknown",
          agent: employees?.find(e => e.id === t.assigned_to)?.full_name || "Unassigned",
          priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
          status: t.status === 'open' ? 'Open' : t.status === 'in_progress' ? 'In Progress' : t.status === 'resolved' ? 'Resolved' : t.status,
          created: t.created_at,
          category: t.category
        })))

      } catch (error) {
        console.error("Error fetching company data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [companyId])

  const totalOpenIssues = issues.filter((i) => i.status !== "Resolved").length
  const criticalIssues = issues.filter((i) => i.priority === "Critical").length
  const onlineAgents = agents.filter((a) => a.status === "Online" || a.status === "Busy").length

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "dashboard" },
    { key: "agents", label: "Agents", icon: "support_agent" },
    { key: "customers", label: "Customers", icon: "business" },
    { key: "issues", label: "Issues", icon: "bug_report" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="size-12 border-4 border-indigo-600/20 border-t-indigo-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse text-sm">Initializing your workspace...</p>
        </div>
      </div>
    )
  }

  if (!company) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 text-center max-w-sm">
          <div className="size-16 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-3xl">domain_disabled</span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Company Not Found</h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm mb-6">
            We couldn't find any company data associated with your account.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="w-full py-2.5 bg-indigo-600 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/25 hover:bg-indigo-700 transition-all"
          >
            Retry Connection
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
      {/* Header */}
      <div className="w-full mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-14 rounded-2xl overflow-hidden ring-4 ring-white dark:ring-slate-800 shadow-lg bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center">
              {company.logo ? (
                <img src={company.logo} alt="company logo" className="w-full h-full object-cover" />
              ) : (
                <span className="material-symbols-outlined text-indigo-500 text-3xl font-light">business</span>
              )}
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
                {company?.name}
              </h1>
              <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium text-sm">
                Admin Console
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-black uppercase rounded-lg border border-indigo-100 dark:border-indigo-800/50">
              {company?.subscription_plan}
            </span>
            <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase rounded-lg border border-emerald-100 dark:border-emerald-800/50">
              {company?.status}
            </span>
          </div>
        </div>

        {/* Stat Pills */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
          <StatCard icon="support_agent" label="Total Agents" value={agents.length} color="indigo" />
          <StatCard icon="circle" label="Active Now" value={onlineAgents} color="emerald" />
          <StatCard icon="business" label="Customers" value={customers.length} color="violet" />
          <StatCard icon="warning" label="Open Issues" value={totalOpenIssues} color={criticalIssues > 0 ? "red" : "amber"} />
        </div>
      </div>

      {/* Tab Bar */}
      <div className="w-full">
        <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm w-fit mb-8">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === t.key
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
              {t.key === "issues" && totalOpenIssues > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${activeTab === "issues" ? "bg-white/20" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}>
                  {totalOpenIssues}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "overview" && <OverviewTab issues={issues} agents={agents} customers={customers} />}
        {activeTab === "agents" && <AgentsTab companyId={companyId} agents={agents} issues={issues} customers={customers} onAgentAdded={() => window.location.reload()} />}
        {activeTab === "customers" && <ClientsTab customers={customers} />}
        {activeTab === "issues" && <IssuesTab issues={issues} />}
      </div>
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ issues, agents, customers }: { issues: any[], agents: any[], customers: any[] }) {
  const criticalIssues = issues.filter((i) => i.priority === "Critical" && i.status !== "Resolved")
  const topAgents = [...agents].sort((a, b) => b.resolved_this_week - a.resolved_this_week).slice(0, 3)
  const needsAttentionCustomers = customers.filter((c) => c.status !== "Healthy")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Critical Issues */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <div className="size-8 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-red-500 text-base">priority_high</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Critical Issues</h3>
          </div>
          <span className="text-xs font-semibold text-slate-400">{criticalIssues.length} open</span>
        </div>
        {criticalIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-slate-400">
            <span className="material-symbols-outlined text-4xl mb-2">check_circle</span>
            <p className="text-sm font-semibold">No critical issues — all clear!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {criticalIssues.map((issue) => (
              <IssueRow key={issue.id} issue={issue} compact />
            ))}
          </div>
        )}
      </div>

      {/* Right Column */}
      <div className="flex flex-col gap-6">
        {/* Top Agents */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-indigo-500 text-base">leaderboard</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Top Agents</h3>
          </div>
          <div className="space-y-3">
            {topAgents.map((agent, idx) => (
              <div key={agent.id} className="flex items-center gap-3">
                <span className={`text-xs font-black w-5 text-center ${idx === 0 ? "text-amber-500" : "text-slate-400"}`}>
                  #{idx + 1}
                </span>
                <img src={agent.avatar} alt={agent.name} className="size-8 rounded-full bg-slate-100" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{agent.name}</p>
                  <p className="text-[10px] text-slate-400 font-semibold">{agent.resolved_this_week} resolved this week</p>
                </div>
                <AgentStatusDot status={agent.status} />
              </div>
            ))}
          </div>
        </div>

        {/* Clients Needing Attention */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <div className="size-8 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-amber-500 text-base">notification_important</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white">Needs Attention</h3>
          </div>
          {needsAttentionCustomers.length === 0 ? (
            <p className="text-sm text-slate-400 font-semibold text-center py-4">All clients are healthy ✓</p>
          ) : (
            <div className="space-y-3">
              {needsAttentionCustomers.map((customer) => (
                <div key={customer.id} className="flex items-center gap-3">
                  <img src={customer.logo} alt={customer.name} className="size-8 rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{customer.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{customer.open_issues} open issues</p>
                  </div>
                  <ClientStatusBadge status={customer.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Agents Tab ───────────────────────────────────────────────────────────────

function AgentsTab({ companyId, agents, issues, customers, onAgentAdded }: { companyId?: string | null, agents: any[], issues: any[], customers: any[], onAgentAdded?: () => void }) {
  const [selected, setSelected] = useState<any | null>(null)
  const [isAddingAgent, setIsAddingAgent] = useState(false)
  const [agentName, setAgentName] = useState("")
  const [agentEmail, setAgentEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleAddAgent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyId) return;
    if (!agentName.trim() || !agentEmail.trim()) {
      toast.error("Name and Email are required");
      return;
    }
    setIsSubmitting(true);

    try {
      const result = await provisionAgent(companyId, agentName, agentEmail);
      if (result.success && result.credentials) {
        const creds = result.credentials;
        toast.custom((t) => (
          <div className={`${t.visible ? 'animate-enter' : 'animate-leave'} max-w-md w-full bg-white dark:bg-slate-900 shadow-lg rounded-lg pointer-events-auto flex ring-1 ring-black ring-opacity-5`}>
            <div className="flex-1 w-0 p-4">
              <div className="flex flex-col gap-3 w-full">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400 font-bold text-sm">
                  <span>Agent provisioned successfully</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                  <p className="text-[10px] text-slate-500 mb-2 uppercase font-black tracking-widest">Agent Credentials</p>
                  <div className="space-y-1 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <p>Email: <span className="text-indigo-600 dark:text-indigo-400 select-all">{creds.email}</span></p>
                    <p>Password: <span className="text-indigo-600 dark:text-indigo-400 select-all">{creds.password}</span></p>
                  </div>
                </div>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    navigator.clipboard.writeText(`Login URL: ${window.location.origin}\nEmail: ${creds.email}\nPassword: ${creds.password}`);
                    toast.success("Credentials copied to clipboard!");
                    toast.dismiss(t.id);
                  }}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-indigo-500/20"
                >
                  Copy Credentials
                </button>
              </div>
            </div>
            <div className="flex border-l border-gray-200 dark:border-slate-700">
              <button
                onClick={() => toast.dismiss(t.id)}
                className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        ), { duration: 30000, position: "bottom-right" });

        setIsAddingAgent(false);
        setAgentName("");
        setAgentEmail("");
        onAgentAdded?.();
      } else {
        toast.error(result.error || "Failed to create agent");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <>
      <div className="mb-6 flex justify-end">
        <button
          onClick={() => setIsAddingAgent(true)}
          className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 hover:bg-indigo-500 transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-sm">person_add</span>
          Add Sales Agent
        </button>
      </div>

      {isAddingAgent && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-slate-900 dark:text-white">Add Sales Agent</h2>
              <button onClick={() => setIsAddingAgent(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddAgent} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Agent Name</label>
                <input
                  type="text"
                  required
                  value={agentName}
                  onChange={(e) => setAgentName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="e.g. Jane Doe"
                />
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase text-slate-500 tracking-wider mb-2">Agent Email Address</label>
                <input
                  type="email"
                  required
                  value={agentEmail}
                  onChange={(e) => setAgentEmail(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 text-sm font-bold text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="agent@company.com"
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full mt-4 bg-indigo-600 text-white font-black text-[10px] uppercase tracking-widest py-4 rounded-xl hover:bg-indigo-500 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                )}
                {isSubmitting ? "Provisioning..." : "Provision Agent"}
              </button>
            </form>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {agents.map((agent) => (
          <div
            key={agent.id}
            onClick={() => setSelected(agent)}
            className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="relative">
                <img src={agent.avatar} alt={agent.name} className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800" />
                <AgentStatusDot status={agent.status} className="absolute -bottom-1 -right-1 ring-2 ring-white dark:ring-slate-900" />
              </div>
              <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 rounded-lg border border-slate-200 dark:border-slate-700">
                {agent.role}
              </span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-white truncate mb-1">{agent.name}</h3>
            <p className="text-xs text-slate-400 truncate mb-4">{agent.email}</p>
            <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-100 dark:border-slate-800">
              <AgentStat label="Clients" value={agent.clients} />
              <AgentStat label="Open" value={agent.open_tickets} highlight={agent.open_tickets > 5} />
              <AgentStat label="Done" value={agent.resolved_this_week} positive />
            </div>
          </div>
        ))}
      </div>

      {selected && <AgentDetailModal agent={selected} issues={issues} customers={customers} onClose={() => setSelected(null)} />}
    </>
  )
}

// ─── Clients Tab ──────────────────────────────────────────────────────────────

function ClientsTab({ customers }: { customers: any[] }) {
  const [filter, setFilter] = useState<string>("All")
  const statuses = ["All", "Healthy", "Needs Attention", "Critical"]
  const filtered = filter === "All" ? customers : customers.filter((c) => c.status === filter)

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${filter === s
              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20"
              : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800">
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Client</th>
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Agent</th>
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Plan</th>
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Status</th>
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Open Issues</th>
                <th className="text-left px-6 py-4 text-[11px] font-black uppercase tracking-wider text-slate-400">Member Since</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-800/60">
              {filtered.map((customers) => (
                <tr key={customers.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img src={customers.logo} alt={customers.name} className="size-9 rounded-xl" />
                      <span className="font-bold text-slate-900 dark:text-white">{customers.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500 dark:text-slate-400 font-medium">{customers.agent}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase rounded-md border border-indigo-100 dark:border-indigo-800/50">
                      {customers.plan}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <ClientStatusBadge status={customers.status} />
                  </td>
                  <td className="px-6 py-4">
                    <span className={`font-bold text-sm ${customers.open_issues > 3 ? "text-red-500" : customers.open_issues > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                      {customers.open_issues}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-400 text-xs font-semibold">
                    {new Date(customers.since).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

// ─── Issues Tab ───────────────────────────────────────────────────────────────

function IssuesTab({ issues }: { issues: any[] }) {
  const [filter, setFilter] = useState<string>("All")
  const statuses = ["All", "Open", "In Progress", "Resolved"]
  const filtered = filter === "All" ? issues : issues.filter((i) => i.status === filter)

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${filter === s
              ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20"
              : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
              }`}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map((issue) => (
          <IssueRow key={issue.id} issue={issue} />
        ))}
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-slate-400">
            <span className="material-symbols-outlined text-5xl mb-3">inbox</span>
            <p className="font-semibold">No issues in this category</p>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Agent Detail Modal ───────────────────────────────────────────────────────

function AgentDetailModal({ agent, issues, customers, onClose }: { agent: any; issues: any[]; customers: any[]; onClose: () => void }) {
  const agentCustomers = customers.filter((c) => c.agent === agent.name)
  const agentIssues = issues.filter((i) => i.agent === agent.name && i.status !== "Resolved")

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-6 pb-0 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-all"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={agent.avatar} alt={agent.name} className="size-16 rounded-2xl bg-slate-100" />
              <AgentStatusDot status={agent.status} className="absolute -bottom-1 -right-1 ring-2 ring-white dark:ring-slate-900" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{agent.name}</h2>
              <p className="text-sm text-slate-400 font-medium">{agent.role}</p>
              <p className="text-xs text-slate-400 mt-0.5">{agent.email}</p>
            </div>
          </div>
        </div>

        <div className="mx-6 my-5 border-t border-slate-100 dark:border-slate-800" />

        {/* Stats */}
        <div className="px-6 grid grid-cols-3 gap-3 mb-5">
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-indigo-600">{agent.clients}</p>
            <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Clients</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${agent.open_tickets > 5 ? "text-red-500" : "text-amber-500"}`}>{agent.open_tickets}</p>
            <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Open</p>
          </div>
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 text-center">
            <p className="text-2xl font-black text-emerald-500">{agent.resolved_this_week}</p>
            <p className="text-[10px] font-bold uppercase text-slate-400 mt-1">Resolved</p>
          </div>
        </div>

        {/* Clients */}
        {agentCustomers.length > 0 && (
          <div className="px-6 mb-5">
            <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">Customers</p>
            <div className="space-y-2">
              {agentCustomers.map((c) => (
                <div key={c.id} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <img src={c.logo} alt={c.name} className="size-7 rounded-lg" />
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300 flex-1">{c.name}</span>
                  <ClientStatusBadge status={c.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Active Issues */}
        {agentIssues.length > 0 && (
          <div className="px-6 mb-6">
            <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">Active Issues</p>
            <div className="space-y-2">
              {agentIssues.slice(0, 3).map((issue) => (
                <div key={issue.id} className="flex items-center gap-3 p-2.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <PriorityDot priority={issue.priority} />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex-1 truncate">{issue.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Shared Pieces ────────────────────────────────────────────────────────────

function StatCard({ icon, label, value, color }: { icon: string; label: string; value: number; color: string }) {
  const colors: Record<string, string> = {
    indigo: "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    emerald: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    violet: "bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400",
    amber: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
  }
  const textColors: Record<string, string> = {
    indigo: "text-indigo-600 dark:text-indigo-400",
    emerald: "text-emerald-600 dark:text-emerald-400",
    violet: "text-violet-600 dark:text-violet-400",
    amber: "text-amber-600 dark:text-amber-400",
    red: "text-red-600 dark:text-red-400",
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
      <div className={`size-10 rounded-xl flex items-center justify-center mb-3 ${colors[color]}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
      </div>
      <p className={`text-3xl font-black ${textColors[color]}`}>{value}</p>
      <p className="text-xs font-bold uppercase text-slate-400 mt-1 tracking-wider">{label}</p>
    </div>
  )
}

function AgentStat({ label, value, highlight, positive }: { label: string; value: number; highlight?: boolean; positive?: boolean }) {
  return (
    <div className="text-center">
      <p className={`text-lg font-black ${highlight ? "text-red-500" : positive ? "text-emerald-500" : "text-slate-700 dark:text-slate-200"}`}>
        {value}
      </p>
      <p className="text-[10px] font-bold uppercase text-slate-400">{label}</p>
    </div>
  )
}

function AgentStatusDot({ status, className = "" }: { status: string; className?: string }) {
  const color =
    status === "Online" ? "bg-emerald-500" :
      status === "Busy" ? "bg-amber-500" :
        status === "Away" ? "bg-orange-400" :
          "bg-slate-300 dark:bg-slate-600"

  return <span className={`size-3 rounded-full border-2 border-white dark:border-slate-900 ${color} ${className}`} />
}

function ClientStatusBadge({ status }: { status: string }) {
  const styles =
    status === "Healthy"
      ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50"
      : status === "Critical"
        ? "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/50"
        : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50"

  return (
    <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${styles}`}>
      {status}
    </span>
  )
}

function PriorityDot({ priority }: { priority: string }) {
  const color =
    priority === "Critical" ? "bg-red-500" :
      priority === "High" ? "bg-orange-500" :
        priority === "Medium" ? "bg-amber-500" :
          "bg-slate-300"

  return <span className={`size-2 rounded-full flex-shrink-0 ${color}`} />
}

function IssueRow({ issue, compact }: { issue: any; compact?: boolean }) {
  const priorityStyles: Record<string, string> = {
    Critical: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border-red-100 dark:border-red-800/50",
    High: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-100 dark:border-orange-800/50",
    Medium: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50",
    Low: "bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700",
  }
  const statusStyles: Record<string, string> = {
    Open: "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400",
    "In Progress": "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    Resolved: "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${priorityStyles[issue.priority]}`}>
              {issue.priority}
            </span>
            <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">
              {issue.category}
            </span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{issue.title}</p>
          {!compact && (
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">business</span>
                {issue.client}
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-xs">person</span>
                {issue.agent}
              </span>
              <span>{new Date(issue.created).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          )}
        </div>
        <span className={`flex-shrink-0 px-2.5 py-1 text-[10px] font-black uppercase rounded-xl ${statusStyles[issue.status]}`}>
          {issue.status}
        </span>
      </div>
    </div>
  )
}