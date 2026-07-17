"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Upload } from "lucide-react";
import { AddLeadForm } from "./add-lead-form";
import toast from "react-hot-toast";

import { createClient } from "@/lib/supabase/client";
import { Input } from "../ui/input";
const supabase = createClient();

export type Lead = {
  id: string;
  client_name: string | null;
  contact_name: string | null;
  client_phone: string;
  email: string | null;
  status: string | null;
  institution_type?: string | null;
  need_identified?: string | null;
  product?: string | null;
  next_action?: string | null;
  next_action_date?: string | null;
  notes?: string | null;
  created_at: string | null;
};

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

async function uploadLeadFileAction(formData: FormData) {
  const supabase = createClient();
  // gets the user in session
  const { data: { user } } = await supabase.auth.getUser();
  if(!user) throw new Error("Not authenticated");

  // get the company id of this user in session
  const { data: employee, error: employeeError } = await supabase
    .from("employees")
    .select("company_id")
    .eq("id", user.id) // Using 'id' to match the schema in lib/api/leads.ts
    .single();

  if (employeeError || !employee?.company_id) {
    throw new Error("Could not resolve company context. Please ensure your employee profile is set up.");
  }

  const company_id = employee.company_id;

  const file = formData.get("file") as File;
  if (!file) {
    throw new Error("No file provided");
  }

  return new Promise<Lead[]>((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsText(file);

    reader.onload = async () => {
      try {
        const csvText = reader.result as string;
        const lines = csvText.split(/\r?\n/).filter(line => line.trim() !== "");
        if (lines.length < 2) {
          throw new Error("CSV file is empty or missing headers");
        }

        const headers = parseCSVRow(lines[0]).map(h => h.trim().toLowerCase());
        const dataRows = lines.slice(1);

        const leadsToInsert = dataRows.map(row => {
          const values = parseCSVRow(row);
          const lead: any = {};
          
          headers.forEach((header, index) => {
            // Map common CSV headers to our database fields
            const value = values[index] || "";
            switch (header) {
              case "client":
              case "company":
              case "client_name":
                lead.client_name = value;
                break;
              case "contact_person":
              case "contact_name":
              case "name":
              case "full_name":
                lead.contact_name = value;
                break;
              case "email":
                lead.email = value;
                break;
              case "phone":
              case "client_phone":
              case "contact_phone":
                lead.client_phone = value;
                break;
              case "status":
                lead.status = value;
                break;
              case "institution_type":
                lead.institution_type = value;
                break;
              case "product":
                lead.product = value;
                break;
              case "need_identified":
                lead.need_identified = value;
                break;
              case "next_action":
                lead.next_action = value;
                break;
              case "next_action_date":
                lead.next_action_date = value;
                break;
              case "notes":
                lead.notes = value;
                break;
              // Add more mappings if needed
            }
          });
          
          // Ensure every lead is associated with the current company
          lead.company_id = company_id;
          // Also associate with the current user if needed
          lead.employee_id = user.id; 
          
          return lead;
        });

        const { data, error } = await supabase
          .from("leads")
          .insert(leadsToInsert)
          .select("*");

        if (error) throw error;
        console.log("Upload successful, data:", data);
        resolve(data);
        return data
      } catch (err) {
        console.error("Upload processing error:", err);
        reject(err);
      }
    };

    reader.onerror = () => reject(new Error("File reading failed"));
  });
}

export function LeadsClientWrapper({ initialLeads }: { initialLeads: Lead[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [uploadModal, setUploadModal] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const handleUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);
      const newLeads = await uploadLeadFileAction(formData);
      // In a real app, you might want to refresh the leads list here
      setLeads((prevLeads) => [...prevLeads, ...newLeads]);


      showToast("success", "Leads uploaded successfully");
      setUploadModal(false);
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
            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1 w-full sm:w-auto -mx-1 px-1">
                <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2 cursor-pointer hover:border-primary/50 shrink-0">
                  <span className="text-xs font-medium text-slate-500">
                    Status:
                  </span>
                  <span className="text-xs font-bold">All Leads</span>
                  <span className="material-symbols-outlined text-sm">
                    expand_more
                  </span>
                </div>
                <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2 cursor-pointer hover:border-primary/50">
                  <span className="text-xs font-medium text-slate-500">
                    Agent:
                  </span>
                  <span className="text-xs font-bold">All Agents</span>
                  <span className="material-symbols-outlined text-sm">
                    expand_more
                  </span>
                </div>
                <div className="flex items-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 gap-2 cursor-pointer hover:border-primary/50">
                  <span className="text-xs font-medium text-slate-500">
                    Source:
                  </span>
                  <span className="text-xs font-bold">All Sources</span>
                  <span className="material-symbols-outlined text-sm">
                    expand_more
                  </span>
                </div>
                <button className="text-primary text-xs font-semibold hover:underline px-2">
                  Clear filters
                </button>
              </div>
              <div className="text-xs text-slate-500">
                <p className="font-bold text-slate-900 dark:text-slate-100">
                  Showing
                  <span className="font-bold text-orange-400 dark:text-orange-600">
                    {" "}
                    {leads.length}{" "}
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

            {/* Table Card */}
            <div className="bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl shadow-sm overflow-hidden flex flex-col">
              <div className="overflow-x-auto w-full">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 w-12 text-center">
                      <input
                        className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                        type="checkbox"
                        onClick={(e) => {console.log(e.currentTarget.checked,"all leads selected")}}
                      />
                    </th>
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
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                  {leads.length === 0 ? (
                    <tr>
                      <td
                        colSpan={7}
                        className="p-8 text-center text-slate-500"
                      >
                        No leads found. Add your first lead!
                      </td>
                    </tr>
                  ) : (
                    leads.map((lead) => (
                      <tr
                        key={lead.id}
                        className="hover:bg-slate-50 dark:hover:bg-slate-900/40 transition-colors"
                      >
                        <td className="p-4 text-center">
                          <input
                            className="rounded text-primary focus:ring-primary border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900"
                            type="checkbox"
                          />
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-3">
                            <div className="size-8 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-primary font-bold text-xs uppercase">
                              {lead.client_name?.[0] || ""}
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {lead.client_name}
                              </p>
                              <p className="text-[11px] text-slate-500">
                                {lead.email || lead.client_phone}
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
                          {lead.product || "N/A"}
                        </td>
                        <td className="p-4">
                          <div className="flex flex-col gap-0.5">
                            <span className="text-sm font-medium">{lead.next_action || "None"}</span>
                            {lead.next_action_date && (
                              <span className="text-[10px] text-slate-500">{new Date(lead.next_action_date).toLocaleDateString()}</span>
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
                            >
                              <span className="material-symbols-outlined text-lg">
                                visibility
                              </span>
                            </button>
                            <button
                              className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                              title="Call Lead"
                            >
                              <span className="material-symbols-outlined text-lg">
                                call
                              </span>
                            </button>
                            <button
                              className="p-1.5 text-slate-400 hover:text-primary transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-lg">
                                edit
                              </span>
                            </button>
                          </div>
                        </td>
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
                <button
                  onClick={() => setUploadModal(false)}
                  className="absolute top-4 right-4 h-8 w-8 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-lg">
                    close
                  </span>
                </button>
                <div className="mb-6 flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-slate-50">
                      Upload Leads
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">
                      Bulk import your contacts via CSV file.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs h-8"
                    onClick={() => {
                      // Create a dummy CSV for download
                      const csvContent =
                        "data:text/csv;charset=utf-8,Client,Contact_Person,Contact_Phone,Email,Institution_Type,Need_Identified,Product,Status,Next_Action,Next_Action_Date,Notes\nAcme Inc,John Doe,+1234567890,john@example.com,Corporate,CRM Upgrade,CRM Cloud,new,Follow up,2024-06-01,Wants a demo";
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", "leads_template.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                  >
                    <span className="material-symbols-outlined text-sm mr-1">
                      download
                    </span>
                    Template
                  </Button>
                </div>
                <div
                  className="mt-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-10 flex flex-col items-center justify-center gap-4 hover:border-primary/50 hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-all cursor-pointer group relative overflow-hidden"
                  onClick={() =>
                    !isUploading &&
                    document.getElementById("csv-upload")?.click()
                  }
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (isUploading) return;
                    const file = e.dataTransfer.files?.[0];
                    if (
                      file &&
                      (file.type === "text/csv" || file.name.endsWith(".csv"))
                    ) {
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
                    disabled={isUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleUpload(file);
                    }}
                  />

                  <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    {isUploading ? (
                      <Loader2 className="h-8 w-8 text-primary animate-spin" />
                    ) : (
                      <Upload className="h-8 w-8 text-primary" />
                    )}
                  </div>

                  <div className="text-center">
                    <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                      {isUploading
                        ? "Uploading leads..."
                        : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      CSV files only (max. 10MB)
                    </p>
                  </div>

                  {isUploading && (
                    <div className="absolute inset-0 bg-white/60 dark:bg-slate-950/60 flex items-center justify-center backdrop-blur-[2px]">
                      <div className="flex flex-col items-center gap-3">
                        <div className="flex gap-1">
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                          <span className="w-2 h-2 bg-primary rounded-full animate-bounce"></span>
                        </div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">
                          Processing File
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    variant="ghost"
                    onClick={() => setUploadModal(false)}
                    disabled={isUploading}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() =>
                      document.getElementById("csv-upload")?.click()
                    }
                    disabled={isUploading}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Select File
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
