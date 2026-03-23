"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { AddLeadForm } from "./add-lead-form";
import toast from "react-hot-toast";

export type Lead = {
  id: string;
  first_name: string | null;
  last_name: string | null;
  company_name: string | null;
  email: string | null;
  phone: string;
  status: string | null;
  source: string | null;
  created_at: string | null;
};

export function LeadsClientWrapper({ initialLeads }: { initialLeads: Lead[] }) {
  const [isOpen, setIsOpen] = useState(false);

  const showToast = (type: "success" | "error", text: string) => {
    if (type === "success") toast.success(text);
    else toast.error(text);
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Main Content */}
        <div className="w-full flex-1 relative flex flex-col">
          {/* Content Area */}
          <div className="flex-1 overflow-auto p-8 space-y-6 relative">

            {/* Filters */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2 cursor-pointer hover:border-primary/50">
                  <span className="text-xs font-medium text-slate-500">Status:</span>
                  <span className="text-xs font-bold">All Leads</span>
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </div>
                <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2 cursor-pointer hover:border-primary/50">
                  <span className="text-xs font-medium text-slate-500">Agent:</span>
                  <span className="text-xs font-bold">All Agents</span>
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </div>
                <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2 cursor-pointer hover:border-primary/50">
                  <span className="text-xs font-medium text-slate-500">Source:</span>
                  <span className="text-xs font-bold">All Sources</span>
                  <span className="material-symbols-outlined text-sm">expand_more</span>
                </div>
                <button className="text-primary text-xs font-semibold hover:underline px-2">Clear filters</button>
              </div>
              <div className="text-xs text-slate-500">
                Showing <span className="font-bold text-slate-900 dark:text-slate-100">{initialLeads.length}</span> leads
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 w-12 text-center">
                      <input className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" type="checkbox" />
                    </th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Lead Name</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Status</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Source</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Assigned Agent</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Created At</th>
                    <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {initialLeads.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-500">
                        No leads found. Add your first lead!
                      </td>
                    </tr>
                  ) : (
                    initialLeads.map((lead) => (
                      <tr key={lead.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors">
                        <td className="p-4 text-center">
                          <input className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900" type="checkbox" />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-primary font-bold text-xs uppercase">
                              {lead.first_name?.[0] || ""}{lead.last_name?.[0] || ""}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">{lead.first_name} {lead.last_name}</p>
                              <p className="text-[11px] text-slate-500">{lead.email || lead.phone}</p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 capitalize">
                            {lead.status || "new"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 capitalize">{lead.source || "N/A"}</td>
                        <td className="p-4">
                          <div className="flex items-center gap-2">
                            <div className="size-6 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-[10px] text-slate-500">
                              --
                            </div>
                            <span className="text-sm text-slate-500">Unassigned</span>
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {lead.created_at ? new Date(lead.created_at).toLocaleDateString() : "Unknown"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="View Details">
                              <span className="material-symbols-outlined text-lg">visibility</span>
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Call Lead">
                              <span className="material-symbols-outlined text-lg">call</span>
                            </button>
                            <button className="p-1.5 text-slate-400 hover:text-primary transition-colors" title="Edit">
                              <span className="material-symbols-outlined text-lg">edit</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>

              {/* Pagination Placeholder */}
              {initialLeads.length > 0 && (
                <div className="p-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-xs text-slate-500">Page 1 of 1</div>
                  <div className="flex items-center gap-1">
                    <button disabled className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 opacity-50">
                      <span className="material-symbols-outlined text-sm">chevron_left</span>
                    </button>
                    <button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">1</button>
                    <button disabled className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 opacity-50">
                      <span className="material-symbols-outlined text-sm">chevron_right</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Floating Action Button */}
          <Button 
            onClick={() => setIsOpen(true)}
            className="fixed bottom-8 right-8 h-14 w-14 rounded-full shadow-xl z-40"
          >
            <Plus className="h-6 w-6" />
          </Button>

          {/* Simple Modal Dialog */}
          {isOpen && (
            <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto">
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative mx-auto my-8">
                <button 
                  onClick={() => setIsOpen(false)} 
                  className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">Add New Lead</h2>
                  <p className="text-sm text-slate-500 mt-1">Enter the details of the new lead below.</p>
                </div>
                <AddLeadForm 
                  onSuccess={() => setIsOpen(false)} 
                  onMessage={showToast}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
