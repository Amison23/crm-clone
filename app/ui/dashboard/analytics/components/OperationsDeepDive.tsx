'use client';

import { useState, useMemo } from 'react';

const ITEMS_PER_PAGE = 5;

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

export default function OperationsDeepDive({ tasks, tickets, viewMode }: OperationsProps) {
  const [expandedTask, setExpandedTask] = useState<string | null>(null);
  
  // Search States
  const [taskQuery, setTaskQuery] = useState('');
  const [ticketQuery, setTicketQuery] = useState('');

  // Pagination States
  const [taskPage, setTaskPage] = useState(1);
  const [ticketPage, setTicketPage] = useState(1);

  // --- 1. FILTERED DATA LOGIC ---
  const filteredTasks = useMemo(() => {
    return tasks.filter(t => t.name.toLowerCase().includes(taskQuery.toLowerCase()));
  }, [tasks, taskQuery]);

  const filteredTickets = useMemo(() => {
    return tickets.filter(t => t.name.toLowerCase().includes(ticketQuery.toLowerCase()));
  }, [tickets, ticketQuery]);

  // --- 2. PAGINATION CALCULATION ---
  const totalTaskPages = Math.max(1, Math.ceil(filteredTasks.length / ITEMS_PER_PAGE));
  const paginatedTasks = filteredTasks.slice(
    (taskPage - 1) * ITEMS_PER_PAGE,
    taskPage * ITEMS_PER_PAGE
  );

  const totalTicketPages = Math.max(1, Math.ceil(filteredTickets.length / ITEMS_PER_PAGE));
  const paginatedTickets = filteredTickets.slice(
    (ticketPage - 1) * ITEMS_PER_PAGE,
    ticketPage * ITEMS_PER_PAGE
  );

  // Helper to handle search change & reset page
  const handleTaskSearch = (val: string) => {
    setTaskQuery(val);
    setTaskPage(1); // Jump back to start
  };

  const handleTicketSearch = (val: string) => {
    setTicketQuery(val);
    setTicketPage(1); // Jump back to start
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      
      {/* --- TASK ANALYTICS --- */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Task Objective Precision</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filteredTasks.length} Found</p>
            </div>
            {/* SEARCH INPUT */}
            <input 
                type="text"
                placeholder="Search tasks..."
                value={taskQuery}
                onChange={(e) => handleTaskSearch(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 outline-none focus:ring-2 ring-blue-500/20 transition-all w-32 md:w-48"
            />
          </div>
          
          <div className="space-y-3 min-h-[400px]">
            {paginatedTasks.length > 0 ? paginatedTasks.map((task) => (
              <div 
                key={task.id} 
                className={`border rounded-2xl transition-all cursor-pointer ${
                  expandedTask === task.id 
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50/20 dark:bg-blue-900/10' 
                    : 'border-gray-100 dark:border-slate-800 hover:border-gray-200 dark:hover:border-slate-700'
                }`}
                onClick={() => setExpandedTask(expandedTask === task.id ? null : task.id)}
              >
                <div className="p-4 flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-sm text-gray-800 dark:text-slate-200">{task.name}</p>
                      <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold ${
                        viewMode === 'agent' 
                          ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400'
                      }`}>
                        {viewMode === 'agent' ? 'You' : task.assigned_to}
                      </span>
                    </div>
                    <p className="text-[10px] text-gray-400 dark:text-slate-500 font-mono">Deadline: {task.deadline}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-blue-600 dark:text-blue-400">{task.met}/{task.objectives}</span>
                    <div className={`transition-transform text-gray-400 ${expandedTask === task.id ? 'rotate-180' : ''}`}>▾</div>
                  </div>
                </div>
                
                {expandedTask === task.id && (
                  <div className="px-4 pb-4 pt-2 border-t border-blue-100/50 dark:border-blue-900/30 animate-in slide-in-from-top-1">
                    <div className="flex justify-between items-center bg-white dark:bg-slate-800 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30 shadow-sm">
                      <div className="flex -space-x-2">
                         {task.team.map((m, i) => (
                           <div key={i} className="h-6 w-6 rounded-full bg-blue-600 border-2 border-white dark:border-slate-800 flex items-center justify-center text-[8px] font-bold text-white shadow-sm" title={m}>
                             {m[0]}
                           </div>
                         ))}
                      </div>
                      <p className="text-[10px] text-gray-500 dark:text-slate-400">Started: <span className="font-bold">{task.start}</span></p>
                    </div>
                  </div>
                )}
              </div>
            )) : (
                <div className="flex flex-col items-center justify-center h-[300px] text-gray-300 dark:text-slate-700 italic text-sm">
                    No tasks match your search
                </div>
            )}
          </div>
        </div>

        {/* TASK PAGINATION CONTROLS */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 dark:border-slate-800">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page {taskPage} of {totalTaskPages}</p>
          <div className="flex gap-2">
            <button 
              disabled={taskPage === 1}
              onClick={() => setTaskPage(p => p - 1)}
              className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-xs font-bold text-gray-500">←</span>
            </button>
            <button 
              disabled={taskPage === totalTaskPages}
              onClick={() => setTaskPage(p => p + 1)}
              className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-xs font-bold text-gray-500">→</span>
            </button>
          </div>
        </div>
      </div>

      {/* --- TICKET ANALYTICS --- */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-gray-100 dark:border-slate-800 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center mb-6">
            <div>
                <h4 className="font-black text-gray-900 dark:text-white uppercase tracking-tighter">Resolution Density</h4>
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{filteredTickets.length} Entries</p>
            </div>
            {/* SEARCH INPUT */}
            <input 
                type="text"
                placeholder="Search tickets..."
                value={ticketQuery}
                onChange={(e) => handleTicketSearch(e.target.value)}
                className="px-4 py-2 bg-gray-50 dark:bg-slate-800 border border-gray-100 dark:border-slate-800 rounded-xl text-xs font-bold text-gray-700 dark:text-slate-200 outline-none focus:ring-2 ring-emerald-500/20 transition-all w-32 md:w-48"
            />
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-black text-gray-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-50 dark:border-slate-800">
                  <th className="pb-4">Incident Log</th>
                  <th className="pb-4 text-center">In/Out</th>
                  <th className="pb-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-slate-800">
                {paginatedTickets.length > 0 ? paginatedTickets.map((ticket, i) => (
                  <tr key={i} className="group hover:bg-gray-50/50 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="py-4">
                      <p className="font-bold text-sm text-gray-800 dark:text-slate-200">{ticket.name}</p>
                      <p className="text-[9px] font-bold text-gray-400 dark:text-slate-500 uppercase">
                        {ticket.initiation} • {viewMode === 'agent' ? 'Personal' : ticket.assigned_to}
                      </p>
                    </td>
                    <td className="py-4">
                      <div className="flex items-center justify-center gap-3">
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded">↑ {ticket.outbound}</span>
                        <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/30 px-2 py-0.5 rounded">↓ {ticket.inbound}</span>
                      </div>
                    </td>
                    <td className="py-4 text-right">
                      <p className={`text-[10px] font-black px-3 py-1 rounded-xl inline-block border ${
                        ticket.resolution === 'Pending' 
                          ? 'bg-amber-50 dark:bg-amber-900/20 text-amber-600 border-amber-100 dark:border-amber-800/50' 
                          : 'bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400 border-gray-200 dark:border-slate-700'
                      }`}>
                        {ticket.resolution}
                      </p>
                    </td>
                  </tr>
                )) : (
                    <tr>
                        <td colSpan={3} className="py-20 text-center text-gray-300 dark:text-slate-700 italic text-sm">
                            No tickets match your search
                        </td>
                    </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* TICKET PAGINATION CONTROLS */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-50 dark:border-slate-800">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Page {ticketPage} of {totalTicketPages}</p>
          <div className="flex gap-2">
            <button 
              disabled={ticketPage === 1}
              onClick={() => setTicketPage(p => p - 1)}
              className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-xs font-bold text-gray-500">←</span>
            </button>
            <button 
              disabled={ticketPage === totalTicketPages}
              onClick={() => setTicketPage(p => p + 1)}
              className="p-2 rounded-xl border border-gray-100 dark:border-slate-800 disabled:opacity-30 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <span className="text-xs font-bold text-gray-500">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}