'use client';

import { useState, useMemo } from 'react';
import { 
  Search, 
  Target, 
  Ticket as TicketIcon, 
  ChevronDown, 
  Clock, 
  CheckCircle2, 
  Inbox 
} from 'lucide-react';

const ITEMS_PER_PAGE = 5;

// --- 1. INTERFACES ---
interface Task {
  id: string;
  name: string;
  assigned_to: string;
  deadline: string;
  start: string;
  met: number;
  objectives: number;
  team: string[];
}

interface Ticket {
  name: string;
  assigned_to: string;
  initiation: string;
  resolution: string;
  inbound: number;
  outbound: number;
}

interface OperationsProps {
  tasks: Task[];
  tickets: Ticket[];
  viewMode: 'agent' | 'admin';
}

// --- 2. MAIN COMPONENT ---
export default function OperationsDeepDive({ tasks = [], tickets = [], viewMode }: OperationsProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  // Search States
  const [taskQuery, setTaskQuery] = useState('');
  const [ticketQuery, setTicketQuery] = useState('');

  // Pagination States
  const [taskPage, setTaskPage] = useState(1);
  const [ticketPage, setTicketPage] = useState(1);

  // --- FILTERED DATA LOGIC ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.name.toLowerCase().includes(taskQuery.toLowerCase()));
  }, [tasks, taskQuery]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => t.name.toLowerCase().includes(ticketQuery.toLowerCase()));
  }, [tickets, ticketQuery]);

  // --- PAGINATION CALCULATION ---
  const totalTaskPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));
  const paginatedTasks = filteredTasks.slice((taskPage - 1) * ITEMS_PER_PAGE, taskPage * ITEMS_PER_PAGE);

  const totalTicketPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE));
  const paginatedTickets = filteredTickets.slice((ticketPage - 1) * ITEMS_PER_PAGE, ticketPage * ITEMS_PER_PAGE);

  const handleTaskSearch = (val: string) => { setTaskQuery(val); setTaskPage(1); };
  const handleTicketSearch = (val: string) => { setTicketQuery(val); setTicketPage(1); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* =========================================
          LEFT COLUMN: TASK ANALYTICS
          ========================================= */}
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          {/* HEADER & SEARCH */}
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <Target className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Task Precision</h4>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{filteredTasks.length} Found</p>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-primary transition-colors" />
              <input 
                type="text"
                placeholder="Search tasks..."
                value={taskQuery}
                onChange={(e) => handleTaskSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-primary/20 transition-all w-full xl:w-48 shadow-inner"
              />
            </div>
          </div>
          
          {/* TASK LIST */}
          <div className="space-y-3 min-h-[380px]">
            {paginatedTasks.length > 0 ? paginatedTasks.map((task) => {
              const isCompleted = task.met >= task.objectives;
              
              return (
                <div 
                  key={task.id} 
                  className={`border rounded-2xl transition-all cursor-pointer overflow-hidden ${
                    expandedTask === task.id 
                      ? 'border-primary/30 bg-primary/5 dark:bg-primary/10 shadow-sm' 
                      : 'border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                  onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
                >
                  <div className="p-5 flex justify-between items-center">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className={`font-black text-sm uppercase tracking-tight ${isCompleted ? 'text-slate-500 line-through' : 'text-slate-900 dark:text-slate-100'}`}>
                          {task.name}
                        </p>
                        <span className={`text-[8px] px-2 py-0.5 rounded-md font-black uppercase tracking-widest ${
                          viewMode === 'agent' 
                            ? 'bg-primary/10 text-primary' 
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}>
                          {viewMode === 'agent' ? 'Personal' : task.assigned_to}
                        </span>
                      </div>
                      <div className="flex items-center gap-1 text-[9px] text-slate-400 font-mono uppercase tracking-tighter">
                        <Clock className="w-3 h-3" /> Deadline: {task.deadline}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                      ) : (
                        <span className="text-xs font-black text-primary bg-primary/10 px-2 py-1 rounded-lg">
                          {task.met}/{task.objectives}
                        </span>
                      )}
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${expandedTask === task.id ? 'rotate-180 text-primary' : ''}`} />
                    </div>
                  </div>
                  
                  {/* EXPANDED VIEW */}
                  {expandedTask === task.id && (
                    <div className="px-5 pb-5 animate-in slide-in-from-top-2">
                      <div className="flex justify-between items-center bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm">
                        <div>
                          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Assigned Agent(s)</p>
                          <div className="flex -space-x-2">
                            {task.team.map((m, i) => (
                              <div key={i} className="h-6 w-6 rounded-full bg-primary border-2 border-white dark:border-slate-900 flex items-center justify-center text-[8px] font-bold text-white shadow-sm" title={m}>
                                {m.charAt(0).toUpperCase()}
                              </div>
                            ))}
                          </div>
                        </div>
                        <div className="text-right">
                           <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-1">Initiated</p>
                           <p className="text-[10px] font-mono text-slate-700 dark:text-slate-300 uppercase">{task.start}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            }) : (
              // ZERO-STATE FALLBACK
              <div className="h-full flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl min-h-[300px] bg-slate-50/50 dark:bg-slate-800/20">
                <Target className="w-8 h-8 text-slate-300 animate-pulse" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Objectives Found</p>
              </div>
            )}
          </div>
        </div>

        {/* TASK PAGINATION */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {taskPage} of {totalTaskPages}</p>
          <div className="flex gap-2">
            <button 
              disabled={taskPage === 1}
              onClick={() => setTaskPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-[10px] font-black uppercase"
            >
              Prev
            </button>
            <button 
              disabled={taskPage === totalTaskPages}
              onClick={() => setTaskPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-[10px] font-black uppercase"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* =========================================
          RIGHT COLUMN: TICKET ANALYTICS
          ========================================= */}
      <div className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-all hover:shadow-md">
        <div>
          {/* HEADER & SEARCH */}
          <div className="flex flex-col xl:flex-row xl:justify-between xl:items-center gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                <TicketIcon className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h4 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tighter leading-none mb-1">Resolution Density</h4>
                <div className="flex items-center gap-2">
                  <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{filteredTickets.length} Entries</p>
                </div>
              </div>
            </div>
            
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 group-focus-within:text-emerald-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search tickets..."
                value={ticketQuery}
                onChange={(e) => handleTicketSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 outline-none focus:ring-2 ring-emerald-500/20 transition-all w-full xl:w-48 shadow-inner"
              />
            </div>
          </div>

          {/* TICKET TABLE */}
          <div className="overflow-x-auto min-h-[380px]">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[9px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] border-b border-slate-100 dark:border-slate-800">
                  <th className="pb-4">Incident Log</th>
                  <th className="pb-4 text-center">Telemetry (In/Out)</th>
                  <th className="pb-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                {paginatedTickets.length > 0 ? paginatedTickets.map((ticket, i) => {
                  
                  // Semantic coloring based on resolution status
                  const isResolved = ticket.resolution.toLowerCase() === 'resolved';
                  const isPending = ticket.resolution.toLowerCase() === 'pending';

                  return (
                    <tr key={i} className="group hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 pr-4">
                        <p className="font-black text-sm uppercase tracking-tight text-slate-800 dark:text-slate-200">{ticket.name}</p>
                        <p className="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase mt-0.5">
                          {ticket.initiation} <span className="opacity-50 mx-1">•</span> {viewMode === 'agent' ? 'Personal' : ticket.assigned_to}
                        </p>
                      </td>
                      <td className="py-4 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-900/50">↑ {ticket.outbound}</span>
                          <span className="text-[9px] font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-1 rounded-md border border-blue-100 dark:border-blue-900/50">↓ {ticket.inbound}</span>
                        </div>
                      </td>
                      <td className="py-4 pl-4 text-right">
                        <p className={`text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-lg inline-block border ${
                          isResolved 
                            ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 border-emerald-100 dark:border-emerald-800/50' 
                            : isPending
                            ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800/50'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                        }`}>
                          {ticket.resolution}
                        </p>
                      </td>
                    </tr>
                  );
                }) : (
                  // ZERO-STATE FALLBACK
                  <tr>
                    <td colSpan={3} className="py-10">
                      <div className="flex flex-col items-center justify-center space-y-4 border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-3xl min-h-[250px] bg-slate-50/50 dark:bg-slate-800/20">
                        <Inbox className="w-8 h-8 text-slate-300 animate-bounce" />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Incident Telemetry Found</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TICKET PAGINATION */}
        <div className="flex justify-between items-center mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Page {ticketPage} of {totalTicketPages}</p>
          <div className="flex gap-2">
            <button 
              disabled={ticketPage === 1}
              onClick={() => setTicketPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-[10px] font-black uppercase"
            >
              Prev
            </button>
            <button 
              disabled={ticketPage === totalTicketPages}
              onClick={() => setTicketPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-[10px] font-black uppercase"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      
    </div>
  );
}