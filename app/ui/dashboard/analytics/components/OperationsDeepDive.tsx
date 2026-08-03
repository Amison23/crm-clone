'use client';

import { useState, useMemo } from 'react';
import { 
  Search, 
  Target, 
  Ticket as TicketIcon, 
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  Inbox,
  ArrowUpRight,
  User
} from 'lucide-react';

const ITEMS_PER_PAGE = 5;

// --- 1. INTERFACES ---
export interface Task {
  id: string;
  name: string;
  assigned_to: string;
  deadline: string;
  met: number;
  objectives: number;
  team: string[];
}

export interface Ticket {
  name: string;
  assigned_to: string;
  initiation: string;
  resolution: string;
}

interface OperationsProps {
  tasks: Task[];
  tickets: Ticket[];
  viewMode: 'agent' | 'admin';
}

export default function OperationsDeepDive({ tasks = [], tickets = [], viewMode }: OperationsProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  // Search & Pagination States
  const [taskQuery, setTaskQuery] = useState('');
  const [ticketQuery, setTicketQuery] = useState('');
  const [taskPage, setTaskPage] = useState(1);
  const [ticketPage, setTicketPage] = useState(1);

  // --- FILTERED DATA LOGIC ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.name.toLowerCase().includes(taskQuery.toLowerCase()));
  }, [tasks, taskQuery]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => t.name.toLowerCase().includes(ticketQuery.toLowerCase()));
  }, [tickets, ticketQuery]);

  // --- PAGINATION SPLICING ---
  const paginatedTasks = filteredTasks.slice((taskPage - 1) * ITEMS_PER_PAGE, taskPage * ITEMS_PER_PAGE);
  const totalTaskPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));

  const paginatedTickets = filteredTickets.slice((ticketPage - 1) * ITEMS_PER_PAGE, ticketPage * ITEMS_PER_PAGE);
  const totalTicketPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 w-full">
      
      {/* =========================================
          LEFT COLUMN: TASK PRECISION (CRM/OPS)
          ========================================= */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all duration-500 hover:border-primary/20">
        <div>
          {/* HEADER & SEARCH */}
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 text-primary rounded-2xl shadow-inner">
                <Target size={20} />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Task Precision</h4>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{filteredTasks.length} Live Objectives</p>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search Objectives..."
                value={taskQuery}
                onChange={(e) => { setTaskQuery(e.target.value); setTaskPage(1); }}
                className="pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-primary/20 transition-all w-full xl:w-52"
              />
            </div>
          </div>
          
          {/* TASK LIST */}
          <div className="space-y-3 min-h-[400px]">
            {paginatedTasks.length > 0 ? paginatedTasks.map((task) => {
              const isCompleted = task.met >= task.objectives;
              const isExpanded = expandedTask === task.id;
              
              return (
                <div 
                  key={task.id} 
                  className={`border rounded-[1.5rem] transition-all cursor-pointer overflow-hidden ${
                    isExpanded 
                      ? 'border-primary/30 bg-primary/[0.02] dark:bg-primary/[0.05] shadow-sm' 
                      : 'border-slate-50 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700'
                  }`}
                  onClick={() => setExpandedTask(isExpanded ? null : task.id)}
                >
                  <div className="p-5 flex justify-between items-center">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="flex items-center gap-2 mb-1.5">
                        <p className={`font-black text-sm uppercase tracking-tight truncate ${isCompleted ? 'text-slate-400 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                          {task.name}
                        </p>
                        <span className={`flex-shrink-0 text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${
                          viewMode === 'agent' ? 'bg-primary/10 text-primary' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                        }`}>
                          {viewMode === 'agent' ? 'Personal' : task.assigned_to}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                        <Clock size={12} className={isCompleted ? 'text-emerald-500' : 'text-slate-300'} /> 
                        Deadline: <span className="font-mono">{task.deadline}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <span className="text-[10px] font-black text-primary bg-primary/5 px-2.5 py-1 rounded-lg border border-primary/10">
                          {task.met}/{task.objectives}
                        </span>
                      )}
                      <ChevronDown size={16} className={`text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-primary' : ''}`} />
                    </div>
                  </div>
                  
                  {isExpanded && (
                    <div className="px-5 pb-5 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="flex justify-between items-end bg-white dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-inner">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2.5">Assigned Force</p>
                          <div className="flex -space-x-2">
                            {task.team.map((m, i) => (
                              <div key={i} className="h-7 w-7 rounded-full bg-slate-900 dark:bg-white border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-black text-white dark:text-slate-900 shadow-md" title={m}>
                                {m.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          </div>
                        </div>
                        <button className="text-[9px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5 hover:gap-2 transition-all">
                          Update Progress <ArrowUpRight size={12} />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : (
              <EmptyState icon={<Target className="w-8 h-8 text-slate-200 animate-pulse" />} label="No Objectives Found" />
            )}
          </div>
        </div>

        {/* TASK PAGINATION */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Page {taskPage} / {totalTaskPages}</p>
          <div className="flex gap-2">
            <PaginationButton label="Prev" disabled={taskPage === 1} onClick={() => setTaskPage(p => p - 1)} />
            <PaginationButton label="Next" disabled={taskPage === totalTaskPages} onClick={() => setTaskPage(p => p + 1)} />
          </div>
        </div>
      </div>

      {/* =========================================
          RIGHT COLUMN: RESOLUTION DENSITY (SUPPORT)
          ========================================= */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all duration-500 hover:border-emerald-500/20">
        <div>
          {/* HEADER & SEARCH */}
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-10">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-500 rounded-2xl shadow-inner">
                <TicketIcon size={20} />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Resolution Density</h4>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">{filteredTickets.length} Incident Entries</p>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                placeholder="Filter Incidents..."
                value={ticketQuery}
                onChange={(e) => { setTicketQuery(e.target.value); setTicketPage(1); }}
                className="pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-emerald-500/20 transition-all w-full xl:w-52"
              />
            </div>
          </div>

          {/* TICKET TABLE */}
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-5">Incident Log</th>
                  <th className="pb-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {paginatedTickets.length > 0 ? paginatedTickets.map((ticket, i) => {
                  const isResolved = ticket.resolution.toLowerCase() === 'resolved';
                  const isPending = ticket.resolution.toLowerCase() === 'pending';

                  return (
                    <tr key={i} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="py-5 pr-4">
                        <p className="font-black text-sm uppercase tracking-tight text-slate-800 dark:text-slate-200 mb-0.5">{ticket.name}</p>
                        <div className="flex items-center gap-2 text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                          <span className="font-mono">{ticket.initiation}</span>
                          <span className="opacity-30">•</span> 
                          <span className="flex items-center gap-1"><User size={10} /> {viewMode === 'agent' ? 'Me' : ticket.assigned_to}</span>
                        </div>
                      </td>
                      <td className="py-5 pl-4 text-right">
                        <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg inline-block border ${
                          isResolved 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border-emerald-100 dark:border-emerald-900/50' 
                            : isPending
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border-amber-100 dark:border-amber-900/50'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}>
                          {ticket.resolution}
                        </span>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr>
                    <td colSpan={2} className="py-20">
                      <EmptyState icon={<Inbox className="w-8 h-8 text-slate-200 animate-bounce" />} label="Zero Incident Packets Found" />
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TICKET PAGINATION */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Node Page {ticketPage} / {totalTicketPages}</p>
          <div className="flex gap-2">
            <PaginationButton label="Prev" disabled={ticketPage === 1} onClick={() => setTicketPage(p => p - 1)} />
            <PaginationButton label="Next" disabled={ticketPage === totalTicketPages} onClick={() => setTicketPage(p => p + 1)} />
          </div>
        </div>
      </div>
      
    </div>
  );
}

// --- SUB-COMPONENTS FOR CLEANER CODE ---

function PaginationButton({ label, disabled, onClick }: { label: string, disabled: boolean, onClick: () => void }) {
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-900 hover:text-white dark:hover:bg-white dark:hover:text-slate-900 transition-all duration-300 text-[10px] font-black uppercase tracking-widest active:scale-95 shadow-sm"
    >
      {label}
    </button>
  );
}

function TelemetryBadge({ value, direction, color }: { value: number, direction: 'up' | 'down', color: 'emerald' | 'blue' }) {
  const colors = {
    emerald: 'text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/50',
    blue: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 border-blue-100 dark:border-blue-900/50'
  };
  return (
    <span className={`text-[9px] font-black ${colors[color]} px-2 py-1 rounded-md border font-mono`}>
      {direction === 'up' ? '↑' : '↓'} {value}
    </span>
  );
}

function EmptyState({ icon, label }: { icon: React.ReactNode, label: string }) {
  return (
    <div className="h-full flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-50 dark:border-slate-800/50 rounded-[2.5rem] min-h-[300px] bg-slate-50/20 dark:bg-slate-800/10">
      <div className="p-4 bg-white dark:bg-slate-900 rounded-full shadow-sm">
        {icon}
      </div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.4em] italic">{label}</p>
    </div>
  );
}