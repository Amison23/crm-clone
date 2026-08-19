"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Upload, CheckCircle2, XCircle } from "lucide-react";
import { AddLeadForm } from "./add-lead-form";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import Papa from "papaparse";
import { bulkUploadLeads } from "@/app/actions/leads";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { createClient } from "@/lib/supabase/client";
import { Input } from "../ui/input";
const supabase = createClient();

export type Lead = {
  user: any;
  assigned_to: string | undefined;
  id: string;
  company_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone: string;
  email: string | null;
  status: string | null;
  institution_type?: string | null;
  need_identified?: string | null;
  product?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
  notes?: string | null;
  source?: string | null;
  employee_id?: string | null;
  created_at: string | null;
};

function extractFromNotes(notes: string | null | undefined, field: string): string | null {
  if (!notes) return null;
  if (field === "Next Action Date") {
    const match = notes.match(/Next Action: .*?\((.*?)\)/);
    return match && match[1] !== 'No date' ? match[1] : null;
  }
  if (field === "Next Action") {
    const match = notes.match(/Next Action: (.*?)(?: \(|\n|$)/);
    return match ? match[1].trim() : null;
  }
  const match = notes.match(new RegExp(`${field}: (.*?)(?:\\n|$)`));
  return match ? match[1].trim() : null;
}

function parseCSVRow(row: string): string[] {
  const values: string[] = []
  let current = ""
  let insideQuotes = false
  
  for (const char of row) {
    if(char === '"') {
      insideQuotes = !insideQuotes
    }else if(char === ',' && !insideQuotes){
      values.push(current)
      current = ""
    }else{
      current += char
    }
  }

  values.push(current)

  return values

}

// Client-side CSV validation
function validateLeadRow(row: any) {
  const errors = [];
  if (!row.client_name && !row.company_name) errors.push("Missing Client Name");
  if (!row.contact_name) errors.push("Missing Contact Name");
  if (!row.client_phone && !row.phone && !row.contact_phone) errors.push("Missing Phone Number");
  
  const validStatuses = ["new", "contacted", "qualified", "lost"];
  if (row.status && !validStatuses.includes(row.status.toLowerCase())) {
    errors.push(`Invalid status. Must be one of: ${validStatuses.join(", ")}`);
  }
  
  if (row.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email)) {
    errors.push("Invalid email format");
  }

  return errors;
}

export function LeadsClientWrapper({ initialLeads, salesAgents, initialTasks = [] }: { initialLeads: Lead[], salesAgents: any[], initialTasks?: any[] }) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [tasks, setTasks] = useState<any[]>(initialTasks);
  const [uploadModal, setUploadModal] = useState(false);
  const [csvPreview, setCsvPreview] = useState<{ row: any, errors: string[] }[] | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [role, setRole] = useState<string | null>(null);

  // Filter States
  const [statusFilter, setStatusFilter] = useState("All");
  const [agentFilter, setAgentFilter] = useState("All");
  const [sourceFilter, setSourceFilter] = useState("All");

  const filteredLeads = leads.filter((lead) => {
    const matchStatus = statusFilter === "All" || lead.status === statusFilter;
    const matchAgent = agentFilter === "All" || (lead.employee_id && lead.employee_id === agentFilter) || (!lead.employee_id && agentFilter === "Unassigned");
    const matchSource = sourceFilter === "All" || (lead.source && lead.source === sourceFilter) || (!lead.source && sourceFilter === "Unknown");
    
    return matchStatus && matchAgent && matchSource;
  });
  
  useEffect(() => {
    setLeads(initialLeads);
    setTasks(initialTasks);
    
    // Fetch user to determine role
    supabase.auth.getUser().then(({ data: { user } }) => {
      setRole(user?.user_metadata?.role || 'sales_agent');
    });
  }, [initialLeads, initialTasks]);

  const handleUpload = async (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function(results) {
        if (results.errors.length > 0) {
          showToast("error", "Failed to parse CSV. Please check formatting.");
          return;
        }

        const previewData = results.data.map((row: any) => ({
          row,
          errors: validateLeadRow(row)
        }));
        
        setCsvPreview(previewData);
      },
      error: function(error) {
        showToast("error", error.message);
      }
    });
  };

  const confirmBulkUpload = async () => {
    if (!csvPreview) return;
    
    const validRows = csvPreview.filter(p => p.errors.length === 0).map(p => p.row);
    if (validRows.length === 0) {
      showToast("error", "No valid rows to upload.");
      return;
    }

    try {
      setIsUploading(true);
      const res = await bulkUploadLeads(validRows);
      
      if (res.success) {
        showToast("success", `${res.count} leads added successfully! ${csvPreview.length - validRows.length} skipped.`);
        setUploadModal(false);
        setCsvPreview(null);
        router.refresh();
      } else {
        showToast("error", res.error || "Failed to upload leads");
      }
    } catch (error) {
      showToast("error", "Failed to upload leads");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  const showToast = (type: "success" | "error", text: string) => {
    if (type === "success") toast.success(text);
    else toast.error(text);
  };

  return (
    <>
      <div className="flex h-screen overflow-hidden">
        {/* Main Content */}
        <div className="w-full flex-1 relative flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 sm:p-8 space-y-6 relative">
            
            {/* Assigned Tasks Quick View */}
            {tasks && tasks.length > 0 && (
              <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="size-9 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
                      <span className="material-symbols-outlined text-lg">assignment</span>
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-white text-sm">My Assigned Tasks ({tasks.length})</h3>
                      <p className="text-[11px] text-slate-400 font-medium">Tasks assigned directly to your workflow</p>
                    </div>
                  </div>
                  <a href="/protected/task-management-board" className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1">
                    Full Task Board <span className="material-symbols-outlined text-sm">arrow_forward</span>
                  </a>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {tasks.slice(0, 6).map((t: any) => (
                    <div key={t.id} className="p-3.5 bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl space-y-2 hover:border-indigo-500/40 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                          t.priority === "high" || t.priority === "critical" ? "bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400" :
                          t.priority === "medium" ? "bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400" :
                          "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                        }`}>
                          {t.priority}
                        </span>
                        <span className={`text-[10px] font-bold uppercase ${t.status === "completed" ? "text-emerald-500" : "text-indigo-500"}`}>
                          {t.status.replace("_", " ")}
                        </span>
                      </div>
                      <p className="font-bold text-xs text-slate-900 dark:text-white line-clamp-1">{t.title}</p>
                      {t.due_date && (
                        <p className="text-[10px] text-slate-400 flex items-center gap-1 font-medium">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          Due: {new Date(t.due_date).toLocaleDateString("en-GB")}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1 w-full sm:w-auto -mx-1 px-1">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Status: All Leads" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Leads</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="contacted">Contacted</SelectItem>
                    <SelectItem value="qualified">Qualified</SelectItem>
                    <SelectItem value="lost">Lost</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger className="w-[160px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Agent: All Agents" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Agents</SelectItem>
                    {/* Unique agents could be mapped here dynamically, for now we mock a few or use 'Unassigned' */}
                    <SelectItem value="Unassigned">Unassigned</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger className="w-[160px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                    <SelectValue placeholder="Source: All Sources" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="All">All Sources</SelectItem>
                    <SelectItem value="CSV Upload">CSV Upload</SelectItem>
                    <SelectItem value="Website Form">Website Form</SelectItem>
                    <SelectItem value="Manual Entry">Manual Entry</SelectItem>
                    <SelectItem value="Unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>

                <button 
                  onClick={() => {
                    setStatusFilter("All");
                    setAgentFilter("All");
                    setSourceFilter("All");
                  }}
                  className="text-primary text-xs font-semibold hover:underline px-2 shrink-0"
                >
                  Clear filters
                </button>
              </div>

              <div className="flex gap-2 items-center justify-between flex-column">
                <div className="text-xs text-slate-500">
                  <p className="font-bold text-slate-900 dark:text-slate-100">
                    Showing
                    <span className="font-bold text-orange-400 dark:text-orange-600">
                      {" "}
                      {filteredLeads.length}{" "}
                    </span>
                    leads
                  </p>
                </div>

                <div className="ml-2">
                  <Button
                    onClick={() => setUploadModal(true)}
                    className="w-full sm:w-auto"
                    >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload CSV
                  </Button>
                </div>
              </div>
            </div>

            {/* Table Card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Client/Company
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Product
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Next Action
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Created At
                      </th>
                      <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                        Actions
                      </th>
                      {role === "admin" && (
                        <th className="p-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                          Assigned to
                        </th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    {filteredLeads.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-slate-500"
                      >
                        No leads found. Add your first lead!
                      </td>
                    </tr>
                  ) : (
                    filteredLeads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors group cursor-pointer"
                        onClick={() => setSelectedLead(lead)}
                      >
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-primary font-bold text-xs uppercase">
                              {lead.company_name?.[0] || ""}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {lead.company_name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {lead.email || lead.phone}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 capitalize">
                            {lead.status || "new"}
                          </span>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400 capitalize">
                          {lead.product || extractFromNotes(lead.notes, "Product") || "N/A"}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">{lead.next_action || extractFromNotes(lead.notes, "Next Action") || "None"}</span>
                            {(lead.next_action_date || extractFromNotes(lead.notes, "Next Action Date")) && (
                              <span className="text-[10px] text-slate-500">
                                {new Date((lead.next_action_date || extractFromNotes(lead.notes, "Next Action Date"))!).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-4 text-sm text-slate-600 dark:text-slate-400">
                          {lead.created_at
                            ? new Date(lead.created_at).toLocaleDateString(
                                "en-GB",
                              )
                            : "Unknown"}
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1">
                            <button
                              className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                              title="View Details"
                              onClick={() => setSelectedLead(lead)}
                            >
                              <span className="material-symbols-outlined text-lg">
                                visibility
                              </span>
                            </button>
                            <button
                              className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                              title="Call Lead"
                              onClick={() => showToast('success', 'Coming soon!!')}
                            >
                              <span className="material-symbols-outlined text-lg">
                                call
                              </span>
                            </button>
                            <button
                              className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                              title="Edit"
                              onClick={() => setEditingLead(lead)}
                            >
                              <span className="material-symbols-outlined text-lg">
                                edit
                              </span>
                            </button>
                          </div>
                        </td>
                        {role === "admin" && (
                          <td className="p-4">
                            <div className="flex items-center gap-1">
                              <Select value={lead.assigned_to}>
                                <SelectTrigger className="w-[160px] bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                  <SelectValue placeholder="Assigned to" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Unassigned">Unassigned</SelectItem>
                                  {salesAgents.map((agent) => (
                                    <SelectItem key={agent.id} value={agent.id}>
                                      {agent.full_name}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button size="icon" variant="ghost" 
                                  // onClick={() => assignSalesAgents(lead.id, lead.assigned_to)}
                                  disabled={true}
                              >
                                <CheckCircle2 />
                              </Button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

              {/* Pagination Placeholder */}
              {initialLeads.length > 0 && (
                <div className="p-4 flex items-center justify-between border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50">
                  <div className="text-xs text-slate-500">Page 1 of 1</div>
                  <div className="flex items-center gap-1">
                    <button
                      disabled
                      className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">
                        chevron_left
                      </span>
                    </button>
                    <button className="size-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-bold">
                      1
                    </button>
                    <button
                      disabled
                      className="size-8 flex items-center justify-center rounded-lg border border-slate-200 dark:border-slate-800 text-slate-400 opacity-50"
                    >
                      <span className="material-symbols-outlined text-sm">
                        chevron_right
                      </span>
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
            <div 
              className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto"
              onClick={() => setIsOpen(false)}
            >
              <div 
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative mx-auto mt-16 mb-8"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    Add New Lead
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Enter the details of the new lead below.
                  </p>
                </div>
                <AddLeadForm
                  initialData={undefined}
                  onSuccess={() => setIsOpen(false)}
                  onMessage={showToast}
                />
              </div>
            </div>
          )}

          {uploadModal && (
            <div 
              className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto"
              onClick={() => setUploadModal(false)}
            >
              <div 
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative mx-auto mt-16 mb-8"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="mb-6 flex justify-between items-start pr-12">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                      Upload Leads
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Bulk import your contacts via CSV file.
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {!csvPreview && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        asChild
                      >
                        <a href="/templates/leads-template.csv" download>
                          <span className="material-symbols-outlined text-sm mr-1">download</span>
                          Template
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => setUploadModal(false)}
                  className="absolute top-6 right-6 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>

                {!csvPreview ? (
                  <div
                    className="mt-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group relative overflow-hidden"
                    onClick={() => document.getElementById("csv-upload")?.click()}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      const file = e.dataTransfer.files?.[0];
                      if (file && (file.type === "text/csv" || file.name.endsWith(".csv"))) {
                        handleUpload(file);
                      } else if (file) {
                        showToast("error", "Please upload a CSV file");
                      }
                    }}
                  >
                    <input
                      id="csv-upload"
                      type="file"
                      accept=".csv"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleUpload(file);
                      }}
                    />
                    <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <Upload className="h-8 w-8 text-primary" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                        Click to upload or drag and drop
                      </p>
                      <p className="text-xs text-slate-500 mt-1">CSV files only</p>
                    </div>
                  </div>
                ) : (
                  <div className="mt-4">
                    <div className="max-h-[300px] overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                            <th className="p-2 font-bold text-slate-500">Status</th>
                            <th className="p-2 font-bold text-slate-500">Client Name</th>
                            <th className="p-2 font-bold text-slate-500">Contact</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                          {csvPreview.map((item, idx) => (
                            <tr key={idx} className={item.errors.length > 0 ? "bg-red-50/50 dark:bg-red-900/10" : ""}>
                              <td className="p-2">
                                {item.errors.length > 0 ? (
                                  <div className="flex items-center text-red-500 gap-1" title={item.errors.join(", ")}>
                                    <XCircle className="w-4 h-4" />
                                    <span>Error</span>
                                  </div>
                                ) : (
                                  <div className="flex items-center text-emerald-500 gap-1">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Valid</span>
                                  </div>
                                )}
                              </td>
                              <td className="p-2 font-medium">{item.row.client_name || item.row.company_name}</td>
                              <td className="p-2">{item.row.contact_name}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="mt-2 text-xs text-slate-500 flex justify-between">
                      <span>{csvPreview.filter(p => p.errors.length === 0).length} valid rows</span>
                      <span className="text-red-500">{csvPreview.filter(p => p.errors.length > 0).length} errors</span>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    onClick={() => {
                      setUploadModal(false);
                      setCsvPreview(null);
                    }}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  {!csvPreview ? (
                    <Button
                      onClick={() => document.getElementById("csv-upload")?.click()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      Select File
                    </Button>
                  ) : (
                    <Button
                      onClick={confirmBulkUpload}
                      disabled={isUploading || csvPreview.filter(p => p.errors.length === 0).length === 0}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                      Confirm & Import
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Lead Details Modal */}
          {selectedLead && (
            <div 
              className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto"
              onClick={() => setSelectedLead(null)}
            >
              <div 
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-2xl p-6 relative mx-auto mt-16 mb-8"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedLead(null)}
                  className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50 flex items-center gap-3">
                    <div className="size-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-primary font-bold text-lg uppercase">
                      {selectedLead.company_name?.[0] || ""}
                    </div>
                    {selectedLead.company_name}
                  </h2>
                  <p className="text-sm text-slate-500 mt-1 ml-13">
                    Created on {selectedLead.created_at ? new Date(selectedLead.created_at).toLocaleDateString('en-GB') : "Unknown"}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Contact Details</h4>
                      <p className="text-sm font-medium">{selectedLead.first_name} {selectedLead.last_name}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedLead.email || "No email"}</p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">{selectedLead.phone}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</h4>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 capitalize">
                        {selectedLead.status || "new"}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target Product</h4>
                      <p className="text-sm font-medium capitalize">{selectedLead.product || extractFromNotes(selectedLead.notes, "Product") || "N/A"}</p>
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Next Action</h4>
                      <p className="text-sm font-medium">{selectedLead.next_action || extractFromNotes(selectedLead.notes, "Next Action") || "None"}</p>
                      {(selectedLead.next_action_date || extractFromNotes(selectedLead.notes, "Next Action Date")) && (
                        <p className="text-xs text-slate-500">
                          Due: {new Date((selectedLead.next_action_date || extractFromNotes(selectedLead.notes, "Next Action Date"))!).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 dark:border-slate-800 pt-6">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Notes & Details</h4>
                  <div className="bg-slate-50 dark:bg-slate-900/50 rounded-lg p-4 text-sm text-slate-700 dark:text-slate-300 whitespace-pre-wrap font-mono">
                    {selectedLead.notes || "No additional notes available."}
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button variant="outline" onClick={() => setSelectedLead(null)}>
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Edit Lead Modal */}
          {editingLead && (
            <div 
              className="fixed inset-0 z-50 bg-black/60 flex items-start justify-center p-4 overflow-y-auto"
              onClick={() => setEditingLead(null)}
            >
              <div 
                className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl w-full max-w-lg p-6 relative mx-auto mt-16 mb-8"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setEditingLead(null)}
                  className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
                <div className="mb-6">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                    Edit Lead
                  </h2>
                  <p className="text-sm text-slate-500 mt-1">
                    Update the details for {editingLead.company_name}.
                  </p>
                </div>
                <AddLeadForm
                  initialData={{
                    id: editingLead.id,
                    client_name: editingLead.company_name || "",
                    contact_name: `${editingLead.first_name || ""} ${editingLead.last_name || ""}`.trim(),
                    client_phone: editingLead.phone || "",
                    email: editingLead.email || "",
                    status: editingLead.status || "new",
                    product: editingLead.product || extractFromNotes(editingLead.notes, "Product") || "",
                    institution_type: extractFromNotes(editingLead.notes, "Institution") || "",
                    need_identified: extractFromNotes(editingLead.notes, "Need") || "",
                    next_action: editingLead.next_action || extractFromNotes(editingLead.notes, "Next Action") || "",
                    next_action_date: editingLead.next_action_date || extractFromNotes(editingLead.notes, "Next Action Date") || "",
                    notes: editingLead.notes || "",
                  }}
                  onSuccess={() => setEditingLead(null)}
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
