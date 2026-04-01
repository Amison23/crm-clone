import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

type Tab = "overview" | "clients" | "issues" | "chat" | "report"

// ─── Agent Dashboard ──────────────────────────────────────────────────────────

export function AgentDashboard({ userId, companyId }: { userId?: string; companyId?: string | null }) {
  const supabase = createClient()
  const [tab, setTab] = useState<Tab>("overview")
  const [tickets, setTickets] = useState<any[]>([])
  const [employees, setEmployees] = useState<any[]>([])
  const [companies, setCompanies] = useState<any[]>([])
  const [me, setMe] = useState<any>({ name: "Loading...", avatar: "", role: "", status: "", email: "" })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      
      // Fetch tickets assigned to me or in my company
      const ticketsQuery = supabase
        .from('tickets')
        .select(`
          *,
          companies (name, logo),
          employees!tickets_assigned_to_fkey (full_name)
        `)
      
      if (userId) {
        // For Agent Dashboard, we usually show tickets assigned to them
        // but they might also want to see company tickets. 
        // For now, let's filter by assigned_to to fulfill "only sees what they ought to"
        ticketsQuery.eq('assigned_to', userId)
      } else if (companyId) {
        ticketsQuery.eq('company_id', companyId)
      }

      const { data: ticketsData } = await ticketsQuery.order('created_at', { ascending: false })

      // Fetch employees (Team) in my company
      const employeesQuery = supabase.from('employees').select('*').neq('role', 'client')
      if (companyId) {
        employeesQuery.eq('company_id', companyId)
      }
      const { data: employeesData } = await employeesQuery

      // Fetch companies (Clients) I am associated with
      const companiesQuery = supabase.from('companies').select('*')
      if (companyId) {
        companiesQuery.eq('id', companyId)
      }
      const { data: companiesData } = await companiesQuery

      if (ticketsData) setTickets(ticketsData.map(t => ({
        id: t.id,
        title: t.title,
        client: t.companies?.name || 'Unknown',
        priority: t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
        status: t.status === 'open' ? 'Open' : t.status === 'in_progress' ? 'In Progress' : 'Resolved',
        category: t.category,
        created: t.created_at,
        notes: t.description || ""
      })))
      
      if (employeesData) setEmployees(employeesData.map(e => ({
        id: e.id,
        name: e.full_name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${e.full_name}`,
        role: e.role,
        status: "Online" // Mock status for now
      })))
      
      if (companiesData) setCompanies(companiesData.map(c => ({
        id: c.id,
        name: c.name,
        logo: c.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}&backgroundColor=6366f1`,
        plan: c.pricing_tier || "Free",
        status: "Healthy",
        open_issues: ticketsData?.filter(t => t.company_id === c.id && t.status !== 'resolved').length || 0,
        since: c.created_at
      })))

      // Fetch my profile
      if (userId) {
        const { data: profile } = await supabase
          .from('employees')
          .select('*')
          .eq('id', userId)
          .single()
        
        if (profile) setMe({
          id: profile.id,
          name: profile.full_name,
          avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.full_name}`,
          role: profile.role,
          status: "Online",
          email: profile.email_address
        })
      }

      setLoading(false)
    }

    fetchData()
  }, [])

  const openIssues = tickets.filter((i) => i.status !== "Resolved").length
  const criticalCount = tickets.filter((i) => i.priority === "Critical" && i.status !== "Resolved").length
  const resolvedThisWeek = tickets.filter((i) => i.status === "Resolved").length

  const tabs = [
    { key: "overview" as Tab, label: "Overview", icon: "dashboard" },
    { key: "clients" as Tab, label: "Clients", icon: "business" },
    { key: "issues" as Tab, label: "Issues", icon: "bug_report", badge: openIssues },
    { key: "chat" as Tab, label: "Team Chat", icon: "chat" },
    { key: "report" as Tab, label: "Report", icon: "summarize" },
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="animate-spin size-8 border-4 border-indigo-600 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src={me.avatar} alt={me.name} className="size-14 rounded-2xl bg-slate-100 dark:bg-slate-800" />
              <span className="absolute -bottom-1 -right-1 size-3.5 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-950" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">
                Hey, <span className="text-indigo-600 dark:text-indigo-400">{me.name.split(" ")[0]}</span> 👋
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mt-0.5">{me.role} · Agent Console</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <MiniStat label="My Clients" value={companies.length} color="indigo" />
            <MiniStat label="Open" value={openIssues} color={criticalCount > 0 ? "red" : "amber"} />
            <MiniStat label="Resolved" value={resolvedThisWeek} color="emerald" />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="max-w-7xl mx-auto">
        <div className="flex gap-1 p-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm w-fit mb-8 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                tab === t.key
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/25"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800"
              }`}
            >
              <span className="material-symbols-outlined text-base">{t.icon}</span>
              {t.label}
              {t.badge !== undefined && t.badge > 0 && (
                <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${tab === t.key ? "bg-white/20" : "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"}`}>
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {tab === "overview" && <OverviewTab tickets={tickets} companies={companies} employees={employees} />}
        {tab === "clients" && <ClientsTab tickets={tickets} companies={companies} />}
        {tab === "issues" && <IssuesTab tickets={tickets} />}
        {tab === "chat" && <ChatTab employees={employees} />}
        {tab === "report" && <ReportTab companies={companies} userId={userId} companyId={companyId} />}
      </div>
    </div>
  )
}

// ─── Overview Tab ─────────────────────────────────────────────────────────────

function OverviewTab({ tickets, companies, employees }: { tickets: any[], companies: any[], employees: any[] }) {
  const urgent = tickets.filter((i) => (i.priority === "Critical" || i.priority === "High") && i.status !== "Resolved")
  const needsAttention = companies.filter((c) => c.status !== "Healthy")

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Urgent Issues */}
      <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
        <SectionHeader icon="priority_high" iconColor="red" title="Urgent Issues" count={urgent.length} />
        {urgent.length === 0 ? (
          <EmptyState icon="check_circle" message="No urgent issues — you're all clear!" />
        ) : (
          <div className="space-y-3 mt-5">
            {urgent.map((issue) => <IssueRow key={issue.id} issue={issue} />)}
          </div>
        )}
      </div>

      {/* Right column */}
      <div className="flex flex-col gap-6">
        {/* Clients needing attention */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <SectionHeader icon="notification_important" iconColor="amber" title="Needs Attention" />
          {needsAttention.length === 0 ? (
            <p className="text-sm text-slate-400 font-semibold text-center py-4 mt-2">All clients healthy ✓</p>
          ) : (
            <div className="space-y-3 mt-5">
              {needsAttention.map((c) => (
                <div key={c.id} className="flex items-center gap-3">
                  <img src={c.logo} alt={c.name} className="size-8 rounded-xl" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{c.name}</p>
                    <p className="text-[10px] text-slate-400 font-semibold">{c.open_issues} open issues</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team online */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
          <SectionHeader icon="group" iconColor="indigo" title="Team Status" />
          <div className="space-y-3 mt-5">
            {employees.map((m) => (
              <div key={m.id} className="flex items-center gap-3">
                <div className="relative">
                  <img src={m.avatar} alt={m.name} className="size-8 rounded-full bg-slate-100" />
                  <StatusDot status={m.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{m.name}</p>
                  <p className="text-[10px] text-slate-400">{m.role}</p>
                </div>
                <span className={`text-[10px] font-black uppercase ${m.status === "Online" ? "text-emerald-500" : m.status === "Busy" ? "text-amber-500" : "text-slate-400"}`}>{m.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Clients Tab ──────────────────────────────────────────────────────────────

function ClientsTab({ tickets, companies }: { tickets: any[], companies: any[] }) {
  const [selected, setSelected] = useState<any | null>(null)

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {companies.map((client) => (
          <div
            key={client.id}
            onClick={() => setSelected(client)}
            className="cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-xl"
          >
            <div className="flex items-center gap-4 mb-5">
              <img src={client.logo} alt={client.name} className="size-12 rounded-2xl" />
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-slate-900 dark:text-white truncate">{client.name}</h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md border border-indigo-100 dark:border-indigo-800/50">
                  {client.plan}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <StatusBadge status={client.status} />
              <span className={`text-sm font-black ${client.open_issues > 3 ? "text-red-500" : client.open_issues > 0 ? "text-amber-500" : "text-emerald-500"}`}>
                {client.open_issues} issues
              </span>
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <Modal onClose={() => setSelected(null)}>
          <div className="flex items-center gap-4 mb-6">
            <img src={selected.logo} alt={selected.name} className="size-14 rounded-2xl" />
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white">{selected.name}</h2>
              <div className="flex gap-2 mt-1.5">
                <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 rounded-md border border-indigo-100">{selected.plan}</span>
                <StatusBadge status={selected.status} />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <DetailRow icon="receipt_long" label="Member Since" value={new Date(selected.since).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} />
            <DetailRow icon="bug_report" label="Open Issues" value={String(selected.open_issues)} />
          </div>
          <div className="mt-6">
            <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider mb-3">Related Issues</p>
            <div className="space-y-2">
              {tickets.filter((i) => i.client === selected.name).map((issue) => (
                <div key={issue.id} className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <PriorityDot priority={issue.priority} />
                  <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 flex-1 truncate">{issue.title}</span>
                  <IssueBadge status={issue.status} />
                </div>
              ))}
            </div>
          </div>
        </Modal>
      )}
    </>
  )
}

// ─── Issues Tab ───────────────────────────────────────────────────────────────

function IssuesTab({ tickets }: { tickets: any[] }) {
  const [filter, setFilter] = useState("All")
  const statuses = ["All", "Open", "In Progress", "Resolved"]
  const filtered = filter === "All" ? tickets : tickets.filter((i) => i.status === filter)

  return (
    <div>
      <div className="flex gap-2 mb-6 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all border ${
              filter === s ? "bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/20" : "bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-indigo-300"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.map((issue) => <IssueRow key={issue.id} issue={issue} full />)}
        {filtered.length === 0 && <EmptyState icon="inbox" message="No issues in this category" />}
      </div>
    </div>
  )
}

// ─── Chat Tab ─────────────────────────────────────────────────────────────────

function ChatTab({ employees }: { employees: any[] }) {
  const [activePeer, setActivePeer] = useState(employees[0]?.id)
  const [messages, setMessages] = useState<Record<string, { id: string; from: "me" | "them"; text: string; time: string }[]>>({})
  const [input, setInput] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  const peer = employees.find((t) => t.id === activePeer) || employees[0]
  if (!peer) return <EmptyState icon="group_off" message="No team members online for chat" />
  const thread = messages[activePeer] ?? []

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [thread])

  const send = () => {
    const txt = input.trim()
    if (!txt) return
    const now = new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    setMessages((prev) => ({
      ...prev,
      [activePeer]: [...(prev[activePeer] ?? []), { id: Date.now().toString(), from: "me", text: txt, time: now }],
    }))
    setInput("")
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm flex" style={{ height: 560 }}>
      {/* Sidebar */}
      <div className="w-64 flex-shrink-0 border-r border-slate-100 dark:border-slate-800 flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800">
          <p className="text-[11px] font-black uppercase text-slate-400 tracking-wider">Team</p>
        </div>
        <div className="flex-1 overflow-y-auto">
          {employees.map((member) => {
            const unread = (messages[member.id] ?? []).filter((m) => m.from === "them").length
            return (
              <button
                key={member.id}
                onClick={() => setActivePeer(member.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-all ${
                  activePeer === member.id ? "bg-indigo-50 dark:bg-indigo-900/20" : "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                }`}
              >
                <div className="relative flex-shrink-0">
                  <img src={member.avatar} alt={member.name} className="size-9 rounded-full bg-slate-100" />
                  <StatusDot status={member.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-slate-900" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-bold truncate ${activePeer === member.id ? "text-indigo-600 dark:text-indigo-400" : "text-slate-900 dark:text-white"}`}>{member.name}</p>
                  <p className="text-[10px] text-slate-400 truncate">{member.role}</p>
                </div>
                {unread > 0 && (
                  <span className="size-4 bg-indigo-600 text-white text-[9px] font-black rounded-full flex items-center justify-center">{unread}</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {/* Chat header */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-slate-100 dark:border-slate-800">
          <div className="relative">
            <img src={peer.avatar} alt={peer.name} className="size-9 rounded-full bg-slate-100" />
            <StatusDot status={peer.status} className="absolute -bottom-0.5 -right-0.5 ring-2 ring-white dark:ring-slate-900" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">{peer.name}</p>
            <p className="text-[10px] text-slate-400 font-semibold">{peer.status}</p>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {thread.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-slate-300 dark:text-slate-600">
              <span className="material-symbols-outlined text-4xl mb-2">chat_bubble_outline</span>
              <p className="text-sm font-semibold">No messages yet — say hi!</p>
            </div>
          )}
          {thread.map((msg) => (
            <div key={msg.id} className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] ${msg.from === "me" ? "bg-indigo-600 text-white" : "bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white"} rounded-2xl px-4 py-2.5`}>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                <p className={`text-[10px] mt-1 ${msg.from === "me" ? "text-indigo-200" : "text-slate-400"} text-right`}>{msg.time}</p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder={`Message ${peer.name.split(" ")[0]}…`}
            className="flex-1 px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400"
          />
          <button
            onClick={send}
            className="size-10 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/25"
          >
            <span className="material-symbols-outlined text-base">send</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Report Tab ───────────────────────────────────────────────────────────────

function ReportTab({ companies, userId, companyId: agentCompanyId }: { companies: any[]; userId?: string; companyId?: string | null }) {
  const supabase = createClient()
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ client: "", client_id: "", category: "", priority: "Medium", summary: "", steps: "", impact: "" })

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const val = e.target.value
    if (k === 'client') {
      const c = companies.find(c => c.name === val)
      setForm((p) => ({ ...p, client: val, client_id: c?.id || "" }))
    } else {
      setForm((p) => ({ ...p, [k]: val }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.client_id || !form.summary) return
    
    setLoading(true)
    const { error } = await supabase.from('tickets').insert([
      {
        title: form.summary,
        description: `STEPS TO REPRODUCE:\n${form.steps}\n\nBUSINESS IMPACT:\n${form.impact}`,
        status: 'open',
        priority: form.priority.toLowerCase(),
        category: form.category,
        company_id: form.client_id,
        created_by: userId,
        assigned_to: userId // Self-assign for now as it's an escalation from agent
      }
    ])
    
    if (!error) {
      setSubmitted(true)
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-12 shadow-sm flex flex-col items-center text-center">
        <div className="size-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-2xl flex items-center justify-center mb-4">
          <span className="material-symbols-outlined text-emerald-500 text-3xl">check_circle</span>
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Report Submitted</h2>
        <p className="text-slate-400 font-medium mb-6">Your issue report has been logged and your team lead notified.</p>
        <button
          onClick={() => { setSubmitted(false); setForm({ client: "", client_id: "", category: "", priority: "Medium", summary: "", steps: "", impact: "" }) }}
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
        >
          Submit Another
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-8 shadow-sm max-w-2xl">
      <div className="flex items-center gap-3 mb-8">
        <div className="size-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center">
          <span className="material-symbols-outlined text-indigo-600 dark:text-indigo-400">summarize</span>
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-900 dark:text-white">Issue Report</h2>
          <p className="text-xs text-slate-400 font-medium">Escalate or document a client issue</p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Client">
            <select value={form.client} onChange={set("client")} className={fieldCls} required>
              <option value="">Select client…</option>
              {companies.map((c) => <option key={c.id} value={c.name}>{c.name}</option>)}
            </select>
          </FormField>
          <FormField label="Category">
            <select value={form.category} onChange={set("category")} className={fieldCls} required>
              {["", "Auth", "Billing", "API", "UI", "Storage", "Data", "Other"].map((c) => (
                <option key={c} value={c}>{c || "Select category…"}</option>
              ))}
            </select>
          </FormField>
        </div>

        <FormField label="Priority">
          <div className="flex gap-2">
            {["Low", "Medium", "High", "Critical"].map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setForm((f) => ({ ...f, priority: p }))}
                className={`flex-1 py-2 rounded-xl text-xs font-black uppercase border transition-all ${
                  form.priority === p ? priorityActive[p] : "bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400 hover:border-slate-300"
                }`}
              >
                {p}
              </button>
            ))}
          </div>
        </FormField>

        <FormField label="Summary">
          <input value={form.summary} onChange={set("summary")} placeholder="One-line description of the issue…" className={fieldCls} required />
        </FormField>

        <FormField label="Steps to Reproduce">
          <textarea value={form.steps} onChange={set("steps")} rows={3} placeholder="1. Go to…&#10;2. Click on…&#10;3. Observe…" className={`${fieldCls} resize-none`} />
        </FormField>

        <FormField label="Business Impact">
          <textarea value={form.impact} onChange={set("impact")} rows={2} placeholder="How is the client affected?" className={`${fieldCls} resize-none`} />
        </FormField>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => setForm({ client: "", client_id: "", category: "", priority: "Medium", summary: "", steps: "", impact: "" })}
            className="px-5 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-all text-sm"
          >
            Clear
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25 text-sm flex items-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <span className="material-symbols-outlined text-base animate-spin">sync</span>
            ) : (
              <span className="material-symbols-outlined text-base">send</span>
            )}
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </div>
    </form>
  )
}

// ─── Shared Utilities ─────────────────────────────────────────────────────────

const fieldCls = "w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white placeholder:text-slate-400"

const priorityActive: Record<string, string> = {
  Low: "bg-slate-100 dark:bg-slate-700 border-slate-400 text-slate-700 dark:text-slate-200",
  Medium: "bg-amber-50 dark:bg-amber-900/20 border-amber-400 text-amber-600 dark:text-amber-400",
  High: "bg-orange-50 dark:bg-orange-900/20 border-orange-400 text-orange-600 dark:text-orange-400",
  Critical: "bg-red-50 dark:bg-red-900/20 border-red-500 text-red-600 dark:text-red-400",
}

function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-[11px] font-black uppercase text-slate-400 tracking-wider mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function SectionHeader({ icon, iconColor, title, count }: { icon: string; iconColor: string; title: string; count?: number }) {
  const colors: Record<string, string> = {
    red: "bg-red-100 dark:bg-red-900/30 text-red-500",
    amber: "bg-amber-100 dark:bg-amber-900/30 text-amber-500",
    indigo: "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-500",
    emerald: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500",
  }
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <div className={`size-8 rounded-xl flex items-center justify-center ${colors[iconColor]}`}>
          <span className="material-symbols-outlined text-base">{icon}</span>
        </div>
        <h3 className="font-bold text-slate-900 dark:text-white">{title}</h3>
      </div>
      {count !== undefined && <span className="text-xs font-semibold text-slate-400">{count} open</span>}
    </div>
  )
}

function MiniStat({ label, value, color }: { label: string; value: number; color: string }) {
  const text: Record<string, string> = { indigo: "text-indigo-600", amber: "text-amber-500", red: "text-red-500", emerald: "text-emerald-500" }
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center shadow-sm">
      <p className={`text-2xl font-black ${text[color]}`}>{value}</p>
      <p className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">{label}</p>
    </div>
  )
}

function StatusDot({ status, className = "" }: { status: string; className?: string }) {
  const c = status === "Online" ? "bg-emerald-500" : status === "Busy" ? "bg-amber-500" : status === "Away" ? "bg-orange-400" : "bg-slate-300 dark:bg-slate-600"
  return <span className={`size-3 rounded-full border-2 border-white dark:border-slate-900 ${c} ${className}`} />
}

function StatusBadge({ status }: { status: string }) {
  const s = status === "Healthy" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800/50"
    : status === "Critical" ? "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-800/50"
    : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800/50"
  return <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${s}`}>{status}</span>
}

function IssueBadge({ status }: { status: string }) {
  const s = status === "Resolved" ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600"
    : status === "In Progress" ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600"
    : "bg-red-50 dark:bg-red-900/20 text-red-600"
  return <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-xl ${s}`}>{status}</span>
}

function PriorityDot({ priority }: { priority: string }) {
  const c = priority === "Critical" ? "bg-red-500" : priority === "High" ? "bg-orange-500" : priority === "Medium" ? "bg-amber-500" : "bg-slate-300"
  return <span className={`size-2 rounded-full flex-shrink-0 ${c}`} />
}

function IssueRow({ issue, full }: { issue: any; full?: boolean }) {
  const pStyles: Record<string, string> = {
    Critical: "bg-red-50 dark:bg-red-900/20 text-red-600 border-red-100 dark:border-red-800/50",
    High: "bg-orange-50 dark:bg-orange-900/20 text-orange-600 border-orange-100 dark:border-orange-800/50",
    Medium: "bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800/50",
    Low: "bg-slate-50 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700",
  }
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1.5">
            <span className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${pStyles[issue.priority]}`}>{issue.priority}</span>
            <span className="text-[10px] font-bold uppercase text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700">{issue.category}</span>
          </div>
          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{issue.title}</p>
          {full && (
            <div className="flex items-center gap-3 mt-1.5 text-[11px] text-slate-400 font-semibold">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-xs">business</span>{issue.client}</span>
              <span>{new Date(issue.created).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</span>
            </div>
          )}
        </div>
        <IssueBadge status={issue.status} />
      </div>
    </div>
  )
}

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
        <span className="material-symbols-outlined text-base">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{value}</span>
    </div>
  )
}

function EmptyState({ icon, message }: { icon: string; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-10 text-slate-400">
      <span className="material-symbols-outlined text-4xl mb-2">{icon}</span>
      <p className="text-sm font-semibold">{message}</p>
    </div>
  )
}

function Modal({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div onClick={(e) => e.target === e.currentTarget && onClose()} className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg border border-slate-200 dark:border-slate-800 p-6 relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 transition-all">
          <span className="material-symbols-outlined text-base">close</span>
        </button>
        {children}
      </div>
    </div>
  )
}
