import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';

// Parses structured "Key: Value" pairs out of the lead notes text blob
function extractFromNotes(notes: string | null | undefined, field: string): string | null {
  if (!notes) return null;
  if (field === 'Next Action Date') {
    const match = notes.match(/Next Action: .*?\((.*?)\)/);
    return match && match[1] !== 'No date' ? match[1] : null;
  }
  if (field === 'Next Action') {
    const match = notes.match(/Next Action: (.*?)(?: \(|\n|$)/);
    return match ? match[1].trim() : null;
  }
  const match = notes.match(new RegExp(`${field}: (.*?)(?:\\n|$)`));
  return match ? match[1].trim() : null;
}

const LIFECYCLE_STAGES = [
  { key: 'new',        label: 'New Lead' },
  { key: 'contacted',  label: 'Contacted' },
  { key: 'qualified',  label: 'Qualified' },
  { key: 'converted',  label: 'Converted' },
  { key: 'lost',       label: 'Lost' },
] as const;

type Lead = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string | null;
  status: string | null;
  source: string | null;
  product: string | null;
  notes: string | null;
  next_action: string | null;
  next_action_date: string | null;
  potential_value: number | null;
  created_at: string;
  employee_id: string | null;
};

type Activity = {
  id: string;
  lead_id: string;
  action_type: string;
  description: string | null;
  created_at: string;
  created_by: string | null;
};

function statusColor(status: string | null) {
  switch (status) {
    case 'qualified':  return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    case 'contacted':  return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
    case 'lost':       return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    case 'converted':  return 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400';
    default:           return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400';
  }
}

function activityIcon(type: string) {
  const map: Record<string, { icon: string; color: string }> = {
    created:        { icon: 'person_add',         color: 'bg-primary/10 text-primary' },
    status_changed: { icon: 'swap_horiz',          color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
    note_added:     { icon: 'sticky_note_2',       color: 'bg-amber-100 dark:bg-amber-900/40 text-amber-600 dark:text-amber-400' },
    email_sent:     { icon: 'mark_email_read',     color: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
    call:           { icon: 'call',                color: 'bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400' },
  };
  return map[type] ?? { icon: 'history', color: 'bg-slate-100 dark:bg-slate-800 text-slate-500' };
}

function formatRelativeTime(ts: string) {
  const diffMin = Math.floor((Date.now() - new Date(ts).getTime()) / 60000);
  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffMin < 1440) return `${Math.floor(diffMin / 60)}h ago`;
  return new Date(ts).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

export default async function Lead360Profile({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  if (!id) redirect('/protected/crm-leads-table');

  const supabase = await createClient();

  // Auth guard
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  // Fetch the lead
  const { data: lead, error: leadError } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (leadError || !lead) redirect('/protected/crm-leads-table');

  const typedLead = lead as Lead;

  // Fetch activities (best-effort — table may not exist yet)
  const { data: activities } = await supabase
    .from('lead_activities')
    .select('*')
    .eq('lead_id', id)
    .order('created_at', { ascending: false })
    .limit(10);

  const typedActivities = (activities || []) as Activity[];

  // Derive display values
  const displayName = [typedLead.first_name, typedLead.last_name].filter(Boolean).join(' ') || 'Unnamed Contact';
  const displayCompany = typedLead.company_name || 'Unknown Company';
  const displayInitial = (displayCompany[0] || displayName[0] || 'L').toUpperCase();
  const product = typedLead.product || extractFromNotes(typedLead.notes, 'Product') || 'N/A';
  const institution = extractFromNotes(typedLead.notes, 'Institution') || null;
  const need = extractFromNotes(typedLead.notes, 'Need') || null;
  const nextAction = typedLead.next_action || extractFromNotes(typedLead.notes, 'Next Action') || null;
  const nextActionDate = typedLead.next_action_date || extractFromNotes(typedLead.notes, 'Next Action Date') || null;
  const currentStageIndex = LIFECYCLE_STAGES.findIndex(s => s.key === typedLead.status);
  const activeStageIndex = currentStageIndex >= 0 ? currentStageIndex : 0;

  return (
    <div className="w-full h-full flex flex-col">
      {/* ── Back nav ── */}
      <div className="px-6 pt-4">
        <Link
          href="/protected/crm-leads-table"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-primary transition-colors"
        >
          <span className="material-symbols-outlined text-sm">arrow_back</span>
          Back to Leads
        </Link>
      </div>

      {/* ── Profile Header ── */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-6 mt-3 mx-0">
        <div className="w-full flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="size-16 rounded-xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-primary font-bold text-2xl uppercase">
              {displayInitial}
            </div>
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-tight">
                  {displayCompany}
                </h1>
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase ${statusColor(typedLead.status)}`}>
                  {typedLead.status || 'new'}
                </span>
              </div>
              <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">person</span>
                {displayName}
                {product !== 'N/A' && (
                  <>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="material-symbols-outlined text-sm">inventory_2</span>
                    {product}
                  </>
                )}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {typedLead.email && (
              <a
                href={`mailto:${typedLead.email}`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-lg">mail</span>
                Email
              </a>
            )}
            {typedLead.phone && (
              <a
                href={`tel:${typedLead.phone}`}
                className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors"
              >
                <span className="material-symbols-outlined text-lg">call</span>
                Call
              </a>
            )}
            <Link
              href={`/protected/omnichannel-chat-inbox`}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg text-sm font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">chat</span>
              Chat
            </Link>
          </div>
        </div>
      </div>

      {/* ── Content Grid ── */}
      <div className="w-full p-6 grid grid-cols-12 gap-6">

        {/* LEFT COL — Profile Info + Lifecycle */}
        <div className="col-span-12 lg:col-span-3 space-y-6">
          {/* Profile Information */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-sm mb-4">Profile Information</h3>
            <div className="space-y-4">
              {typedLead.email && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Address</p>
                  <p className="text-sm font-medium truncate">{typedLead.email}</p>
                </div>
              )}
              {typedLead.phone && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Phone</p>
                  <p className="text-sm font-medium">{typedLead.phone}</p>
                </div>
              )}
              {typedLead.source && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Lead Source</p>
                  <p className="text-sm font-medium capitalize">{typedLead.source.replace('_', ' ')}</p>
                </div>
              )}
              {institution && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Institution Type</p>
                  <p className="text-sm font-medium capitalize">{institution}</p>
                </div>
              )}
              {typedLead.potential_value && (
                <div>
                  <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Potential Value</p>
                  <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                    KES {Number(typedLead.potential_value).toLocaleString()}
                  </p>
                </div>
              )}
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
                <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Lead Tags</p>
                <div className="flex flex-wrap gap-2">
                  {product !== 'N/A' && (
                    <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase">{product}</span>
                  )}
                  {typedLead.source && (
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded uppercase">
                      {typedLead.source.replace('_', ' ')}
                    </span>
                  )}
                  {need && (
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold rounded uppercase">
                      {need}
                    </span>
                  )}
                </div>
              </div>
              <div className="pt-2 text-[10px] text-slate-400">
                Created {new Date(typedLead.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Lifecycle Stage */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-sm mb-4">Lifecycle Stage</h3>
            <div className="space-y-3">
              {LIFECYCLE_STAGES.map((stage, idx) => {
                const isActive = idx === activeStageIndex;
                const isPast = idx < activeStageIndex;
                return (
                  <div key={stage.key} className="flex items-center gap-3">
                    <div className={`size-2.5 rounded-full flex-shrink-0 ${
                      isActive ? 'bg-primary border-4 border-primary/20 scale-125' :
                      isPast ? 'bg-emerald-400' :
                      'bg-slate-200 dark:bg-slate-700'
                    }`} />
                    <span className={`text-sm ${
                      isActive ? 'font-bold text-primary' :
                      isPast ? 'text-slate-500 line-through' :
                      'text-slate-400 dark:text-slate-500'
                    }`}>
                      {stage.label}
                    </span>
                    {isPast && <span className="material-symbols-outlined text-emerald-400 text-sm ml-auto">check</span>}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* CENTER COL — Activity Timeline + Notes */}
        <div className="col-span-12 lg:col-span-6 space-y-6">

          {/* Unified Activity Timeline */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-bold text-sm">Unified Activity Timeline</h3>
            </div>
            <div className="p-0">
              {typedActivities.length > 0 ? (
                typedActivities.map((activity) => {
                  const { icon, color } = activityIcon(activity.action_type);
                  return (
                    <div key={activity.id} className="flex gap-4 p-5 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors border-b border-slate-50 dark:border-slate-800/50 last:border-b-0">
                      <div className={`size-8 rounded-full ${color} flex items-center justify-center shrink-0`}>
                        <span className="material-symbols-outlined text-base">{icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <p className="text-sm font-medium capitalize">
                            {activity.action_type.replace('_', ' ')}
                          </p>
                          <span className="text-[10px] text-slate-400 shrink-0 ml-2">{formatRelativeTime(activity.created_at)}</span>
                        </div>
                        {activity.description && (
                          <p className="text-xs text-slate-500">{activity.description}</p>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-8 text-center">
                  <span className="material-symbols-outlined text-3xl text-slate-300 block mb-2">history</span>
                  <p className="text-sm text-slate-400">No activity recorded yet.</p>
                  <p className="text-xs text-slate-300 mt-1">Activity will appear here as the lead progresses.</p>
                </div>
              )}
            </div>
            <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-b-xl border-t border-slate-100 dark:border-slate-800">
              <p className="text-center text-xs text-slate-400">
                Showing latest {typedActivities.length} activit{typedActivities.length === 1 ? 'y' : 'ies'}
              </p>
            </div>
          </div>

          {/* Notes */}
          {typedLead.notes && (
            <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
              <h3 className="font-bold text-sm mb-4">Notes &amp; Details</h3>
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono text-xs leading-relaxed">
                {typedLead.notes}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COL — Next Action + Quick Details */}
        <div className="col-span-12 lg:col-span-3 space-y-6">

          {/* Next Action */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-sm mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-amber-500">event_upcoming</span>
              Next Action
            </h3>
            {nextAction ? (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">{nextAction}</p>
                {nextActionDate && (
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800 rounded-lg p-3">
                    <span className="material-symbols-outlined text-amber-500 text-sm">schedule</span>
                    <div>
                      <p className="text-[10px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wide">Due</p>
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                        {new Date(nextActionDate).toLocaleDateString('en-GB', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-slate-400">No next action set.</p>
            )}
          </div>

          {/* Quick Facts */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5">
            <h3 className="font-bold text-sm mb-4">Quick Facts</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Status</span>
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${statusColor(typedLead.status)}`}>
                  {typedLead.status || 'new'}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Product</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">{product}</span>
              </div>
              {typedLead.source && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Source</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300 capitalize">
                    {typedLead.source.replace('_', ' ')}
                  </span>
                </div>
              )}
              {typedLead.potential_value && (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Deal Value</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    KES {Number(typedLead.potential_value).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Lead ID</span>
                <span className="font-mono text-slate-400 text-[10px] truncate max-w-[100px]">{typedLead.id.slice(0, 8)}…</span>
              </div>
            </div>
          </div>

          {/* Edit link */}
          <Link
            href={`/protected/crm-leads-table`}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl text-sm font-bold transition-colors text-slate-700 dark:text-slate-300"
          >
            <span className="material-symbols-outlined text-sm">edit</span>
            Edit Lead
          </Link>
        </div>
      </div>
    </div>
  );
}