import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"

// ─── Super Admin ──────────────────────────────────────────────────────────────

export function SuperAdmin({ user: authUser }: { user: { id: string; role: string; company_id: string | null } | null }) {
  const supabase = createClient()
  const [user, setUser] = useState<{name: string} | null>(null)
  const [newCompanyModal, setNewCompanyModal] = useState(false)
  const [companies, setCompanies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchUser() {
      if (!authUser) return
      const { data } = await supabase.from('employees').select('full_name').eq('id', authUser.id).single()
      if (data) setUser({ name: data.full_name })
    }
    fetchUser()
  }, [authUser])

  useEffect(() => {
    async function fetchCompanies() {
      setLoading(true)
      const { data, error } = await supabase
        .from('companies')
        .select('*')
      
      if (data) {
        setCompanies(data.map(c => ({
          id: c.id,
          name: c.name,
          logo: c.logo || `https://api.dicebear.com/7.x/initials/svg?seed=${c.name}&backgroundColor=6366f1`,
          subscription_plan: c.pricing_tier || "Free",
          status: c.is_active ? "Active" : "Inactive",
          agent_incharge: "Alex Director", // These should ideally come from a join
          internal_agent: "Sarah Johnson",
          last_billing: c.updated_at
        })))
      }
      setLoading(false)
    }
    fetchCompanies()
  }, [])

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-6 md:p-10">
      {/* Header */}
      <div className="w-full mb-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">
              Welcome back,{" "}
              <span className="text-indigo-600 dark:text-indigo-400">{user?.name}</span>
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
              SaaS Overview & Tenant Management
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white dark:bg-slate-900 p-2 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm">
            <div className="size-10 bg-indigo-100 dark:bg-indigo-900/30 rounded-xl flex items-center justify-center text-indigo-600 dark:text-indigo-400">
              <span className="material-symbols-outlined">admin_panel_settings</span>
            </div>
            <div className="pr-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-none">
                Super Admin
              </h3>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider font-bold">
                Cloud Console
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Companies</h2>
            <span className="px-2 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold rounded-full">
              {companies.length}
            </span>
          </div>
          <button
            onClick={() => setNewCompanyModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            New Company
          </button>
        </div>

        {/* Companies Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {companies.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      </div>

      {newCompanyModal && <NewCompanyModal onClose={() => setNewCompanyModal(false)} />}
    </div>
  )
}

// ─── Company Card ─────────────────────────────────────────────────────────────

export function CompanyCard({ company }: { company: any }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <div
        onClick={() => setOpen(true)}
        className="group cursor-pointer bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden hover:border-indigo-400 dark:hover:border-indigo-500 transition-all duration-300 shadow-sm hover:shadow-xl"
      >
        <div className="p-6">
          {/* Logo + Name */}
          <div className="flex items-center gap-4 mb-6">
            <div className="size-14 rounded-2xl overflow-hidden ring-4 ring-slate-50 dark:ring-slate-800 shadow-inner">
              <img src={company.logo} alt="company logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white truncate uppercase tracking-tight">
                {company.name}
              </h2>
              <div className="flex items-center gap-2 mt-1">
                <StatusBadge type="plan" value={company.subscription_plan} />
                <StatusBadge type="status" value={company.status} />
              </div>
            </div>
          </div>

          {/* Meta */}
          <div className="space-y-3 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                Agent Incharge
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {company.agent_incharge}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase">
                Internal Agent
              </span>
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {company.internal_agent}
              </span>
            </div>
          </div>

          {/* Hint */}
          <div className="pt-4 flex items-center gap-1.5 text-indigo-500 dark:text-indigo-400 text-xs font-bold">
            <span className="material-symbols-outlined text-sm">open_in_full</span>
            Click to view details
          </div>
        </div>
      </div>

      {open && <CompanyDetailModal company={company} onClose={() => setOpen(false)} />}
    </>
  )
}

// ─── Company Detail Modal ─────────────────────────────────────────────────────

function CompanyDetailModal({ company, onClose }: { company: any; onClose: () => void }) {
  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      onClick={handleBackdrop}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-200 dark:border-slate-800 animate-in fade-in slide-in-from-bottom-4 duration-300">

        {/* Header */}
        <div className="relative p-6 pb-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 size-8 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-all"
          >
            <span className="material-symbols-outlined text-base">close</span>
          </button>

          <div className="flex items-center gap-4">
            <div className="size-16 rounded-2xl overflow-hidden ring-4 ring-slate-100 dark:ring-slate-800 shadow-inner flex-shrink-0">
              <img src={company.logo} alt="company logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                {company.name}
              </h2>
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <StatusBadge type="plan" value={company.subscription_plan} />
                <StatusBadge type="status" value={company.status} />
              </div>
            </div>
          </div>
        </div>

        <div className="mx-6 my-5 border-t border-slate-100 dark:border-slate-800" />

        {/* Detail Rows */}
        <div className="px-6 space-y-4">
          <DetailRow icon="badge" label="Agent Incharge" value={company.agent_incharge} />
          <DetailRow icon="person" label="Internal Agent" value={company.internal_agent} />
          {company.last_billing && (
            <DetailRow
              icon="receipt_long"
              label="Last Billing"
              value={new Date(company.last_billing).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 pt-5 flex items-center gap-3">
          <button className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25">
            <span className="material-symbols-outlined text-sm">open_in_new</span>
            Open Dashboard
          </button>
          <button className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 text-sm font-bold rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-sm">
            <span className="material-symbols-outlined text-sm">edit</span>
          </button>
          <button className="px-4 py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-500 transition-all border border-slate-200 dark:border-slate-700 hover:border-red-200 dark:hover:border-red-800/50 shadow-sm rounded-xl">
            <span className="material-symbols-outlined text-sm">delete</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── New Company Modal ────────────────────────────────────────────────────────

export function NewCompanyModal({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">New Company</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-400"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <form>
          <div>
            <label htmlFor="company-name">Company Name</label>
            <input
              type="text"
              id="company-name"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="company-logo">Company Logo</label>
            <input
              type="file"
              id="company-logo"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="company-subscription-plan">Subscription Plan</label>
            <select
              id="company-subscription-plan"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
              <option value="enterprise">Enterprise</option>
            </select>
          </div>
          <div>
            <label htmlFor="company-status">Status</label>
            <select
              id="company-status"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label htmlFor="company-agent-incharge">Agent Incharge</label>
            <input
              type="text"
              id="company-agent-incharge"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="company-internal-agent">Internal Agent</label>
            <input
              type="text"
              id="company-internal-agent"
              className="w-full px-4 py-2 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition-all border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-indigo-500/25"
            >
              Create
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Shared Sub-components ────────────────────────────────────────────────────

function DetailRow({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex items-center gap-2.5 text-slate-500 dark:text-slate-400">
        <span className="material-symbols-outlined text-base">{icon}</span>
        <span className="text-[11px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 text-right">
        {value}
      </span>
    </div>
  )
}

function StatusBadge({ type, value }: { type: "plan" | "status"; value: string }) {
  if (type === "plan") {
    return (
      <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase rounded-md border border-indigo-100 dark:border-indigo-800/50">
        {value}
      </span>
    )
  }

  const isActive = value === "Active"
  return (
    <span
      className={`px-2 py-0.5 text-[10px] font-black uppercase rounded-md border ${
        isActive
          ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-800/50"
          : "bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-800/50"
      }`}
    >
      {value}
    </span>
  )
}