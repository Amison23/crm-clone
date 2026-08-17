'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

type FAQ = {
  id: string
  question: string
  answer: string
  keywords: string[]
  category: string | null
  department: string | null
  triggers_routing: boolean
  is_active: boolean
  usage_count: number
  company_id: string
}

const emptyFAQ = {
  question: '',
  answer: '',
  keywords: '',
  category: '',
  department: 'general' as const,
  triggers_routing: false,
}

export default function VisualBotBuilder() {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyFAQ)
  const [saving, setSaving] = useState(false)
  const [tenantId, setTenantId] = useState<string | null>(null)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUserId(user.id)
        let tid = user.user_metadata?.company_id || user.user_metadata?.tenant_id
        if (!tid) {
          const { data: emp } = await supabase
            .from('employees')
            .select('company_id')
            .eq('id', user.id)
            .single()
          tid = emp?.company_id
        }
        setTenantId(tid || 'c2b4fc9e-b23e-450a-9f33-0edca935d1ac')
      }
      await loadFAQs()
      setLoading(false)
    }
    init()
  }, [])

  const loadFAQs = async () => {
    const { data } = await supabase
      .from('faq_entries')
      .select('*')
      .order('priority', { ascending: false })
    setFaqs(data || [])
  }

  const handleSave = async () => {
    if (!form.question.trim() || !form.answer.trim() || !form.keywords.trim()) return
    setSaving(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = {
        question: form.question.trim(),
        answer: form.answer.trim(),
        keywords: form.keywords.split(',').map((k) => k.trim()).filter(Boolean),
        category: form.category.trim() || null,
        department: form.department,
        triggers_routing: form.triggers_routing,
        company_id: tenantId,
        created_by: user?.id || userId,
        is_active: true,
      }

      if (editingId) {
        await supabase.from('faq_entries').update(payload).eq('id', editingId)
      } else {
        await supabase.from('faq_entries').insert(payload)
      }

      setForm(emptyFAQ)
      setIsAdding(false)
      setEditingId(null)
      await loadFAQs()
    } catch (e) {
      console.error(e)
    } finally {
      setSaving(false)
    }
  }

  const handleEdit = (faq: FAQ) => {
    setForm({
      question: faq.question,
      answer: faq.answer,
      keywords: faq.keywords.join(', '),
      category: faq.category || '',
      department: (faq.department as any) || 'general',
      triggers_routing: faq.triggers_routing,
    })
    setEditingId(faq.id)
    setIsAdding(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this FAQ entry?')) return
    await supabase.from('faq_entries').delete().eq('id', id)
    await loadFAQs()
  }

  const toggleActive = async (id: string, current: boolean) => {
    await supabase.from('faq_entries').update({ is_active: !current }).eq('id', id)
    await loadFAQs()
  }

  const cancelForm = () => {
    setForm(emptyFAQ)
    setIsAdding(false)
    setEditingId(null)
  }

  const categoryColors: Record<string, string> = {
    pricing: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    features: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    support: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    general: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  }

  return (
    <div className="flex h-full w-full flex-col overflow-hidden">
      {/* Top Bar */}
      <div className="border-b border-slate-200 dark:border-slate-800 px-6 py-4 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
        <div>
          <h1 className="text-lg font-bold">Bot FAQ Builder</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage chatbot responses and routing rules</p>
        </div>
        <button
          onClick={() => { setIsAdding(true); setEditingId(null); setForm(emptyFAQ) }}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <span className="material-symbols-outlined text-[18px]">add</span>
          Add FAQ Entry
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Main FAQ List */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-4 mb-6">
            {[
              { label: 'Total FAQs', value: faqs.length, icon: 'chat_bubble', color: 'text-primary' },
              { label: 'Active', value: faqs.filter(f => f.is_active).length, icon: 'check_circle', color: 'text-green-500' },
              { label: 'Routes to Agent', value: faqs.filter(f => f.triggers_routing).length, icon: 'transfer_within_a_station', color: 'text-amber-500' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 flex items-center gap-4">
                <span className={`material-symbols-outlined text-3xl ${stat.color}`}>{stat.icon}</span>
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-slate-400">{stat.label}</p>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ Cards */}
          {loading && <div className="text-center text-slate-400 py-12">Loading FAQs...</div>}
          {!loading && faqs.length === 0 && (
            <div className="text-center text-slate-400 py-16">
              <span className="material-symbols-outlined text-5xl mb-3 block">quiz</span>
              <p className="font-medium">No FAQ entries yet</p>
              <p className="text-sm mt-1">Add your first entry to start configuring the chatbot</p>
            </div>
          )}

          <div className="space-y-3">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className={`bg-white dark:bg-slate-900 rounded-xl border transition-all ${
                  faq.is_active
                    ? 'border-slate-200 dark:border-slate-800'
                    : 'border-dashed border-slate-200 dark:border-slate-700 opacity-60'
                }`}
              >
                <div className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <p className="font-semibold text-sm truncate">{faq.question}</p>
                        {faq.category && (
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${categoryColors[faq.category] || categoryColors.general}`}>
                            {faq.category}
                          </span>
                        )}
                        {faq.triggers_routing && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-1">
                            <span className="material-symbols-outlined text-[12px]">transfer_within_a_station</span>
                            Routes to agent
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{faq.answer}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <div className="flex flex-wrap gap-1">
                          {faq.keywords.slice(0, 4).map((kw) => (
                            <span key={kw} className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 text-[10px] rounded font-medium">
                              {kw}
                            </span>
                          ))}
                          {faq.keywords.length > 4 && (
                            <span className="text-[10px] text-slate-400">+{faq.keywords.length - 4} more</span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 ml-auto">Used {faq.usage_count}×</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => toggleActive(faq.id, faq.is_active)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase transition-colors ${
                          faq.is_active
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 hover:bg-green-200'
                            : 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400 hover:bg-red-200'
                        }`}
                      >
                        {faq.is_active ? 'Active' : 'Inactive'}
                      </button>
                      <button onClick={() => handleEdit(faq)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[18px] text-slate-400">edit</span>
                      </button>
                      <button onClick={() => handleDelete(faq.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <span className="material-symbols-outlined text-[18px] text-slate-400 hover:text-red-500">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Form */}
        {isAdding && (
          <aside className="w-96 border-l border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col shrink-0 overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-sm font-bold">{editingId ? 'Edit FAQ Entry' : 'New FAQ Entry'}</h3>
                <button onClick={cancelForm} className="text-slate-400 hover:text-slate-600">
                  <span className="material-symbols-outlined text-xl">close</span>
                </button>
              </div>
              <p className="text-xs text-slate-400">Configure the bot's response to matching messages</p>
            </div>

            <div className="p-6 space-y-5 flex-1">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Question</label>
                <input
                  type="text"
                  placeholder="e.g. What is your pricing?"
                  value={form.question}
                  onChange={(e) => setForm({ ...form, question: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Bot Answer</label>
                <textarea
                  placeholder="Type what the bot should reply..."
                  value={form.answer}
                  onChange={(e) => setForm({ ...form, answer: e.target.value })}
                  rows={4}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">
                  Trigger Keywords <span className="normal-case font-normal">(comma-separated)</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. price, pricing, cost, how much"
                  value={form.keywords}
                  onChange={(e) => setForm({ ...form, keywords: e.target.value })}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                />
                <p className="text-[10px] text-slate-400 mt-1">Bot matches if any keyword appears in the customer's message</p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Category</label>
                  <input
                    type="text"
                    placeholder="e.g. pricing"
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Department</label>
                  <select
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value as any })}
                    className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="general">General</option>
                    <option value="sales">Sales</option>
                    <option value="support">Support</option>
                  </select>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.triggers_routing}
                    onChange={(e) => setForm({ ...form, triggers_routing: e.target.checked })}
                    className="mt-0.5 accent-primary"
                  />
                  <div>
                    <p className="text-sm font-semibold text-amber-800 dark:text-amber-400">Route to human agent after reply</p>
                    <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                      After sending this FAQ answer, the bot will queue the chat for an agent
                    </p>
                  </div>
                </label>
              </div>
            </div>

            <div className="p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
              <button
                onClick={handleSave}
                disabled={saving || !form.question.trim() || !form.answer.trim() || !form.keywords.trim()}
                className="w-full py-2.5 bg-primary text-white rounded-lg text-sm font-bold hover:bg-primary/90 disabled:opacity-40 transition-colors"
              >
                {saving ? 'Saving...' : editingId ? 'Update Entry' : 'Save Entry'}
              </button>
            </div>
          </aside>
        )}
      </div>
    </div>
  )
}
