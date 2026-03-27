"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

const ISSUE_CATEGORIES = [
  { value: "billing", label: "Billing & Payments", icon: "payments" },
  { value: "technical", label: "Technical Issue", icon: "build" },
  { value: "account", label: "Account Access", icon: "manage_accounts" },
  { value: "product", label: "Product Question", icon: "help" },
  { value: "feature", label: "Feature Request", icon: "lightbulb" },
  { value: "other", label: "Other", icon: "category" },
];

const PRIORITY_OPTIONS = [
  { value: "low", label: "Low – Not time-sensitive" },
  { value: "medium", label: "Medium – Needs attention soon" },
  { value: "high", label: "High – Urgent matter" },
  { value: "critical", label: "Critical – Blocking my work" },
];

interface NewTicketFormProps {
  companyId: string;
  onSuccess: () => void;
  onCancel: () => void;
  preselectedCategory?: string;
}

export default function NewTicketForm({
  companyId,
  onSuccess,
  onCancel,
  preselectedCategory,
}: NewTicketFormProps) {
  const supabase = createClient();

  const [category, setCategory] = useState(preselectedCategory ?? "");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!subject.trim() || !category) return;

    setLoading(true);
    setError(null);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      setError("You must be logged in to submit a ticket.");
      setLoading(false);
      return;
    }

    const { error: insertError } = await supabase.from("tickets").insert({
      company_id: companyId,
      client_id: user.id,
      category,
      title: subject.trim(),
      description: description.trim() || null,
      priority,
      status: "open",
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      onSuccess();
    }

    setLoading(false);
  }

  const selectedCategoryLabel =
    ISSUE_CATEGORIES.find((c) => c.value === category)?.label ?? "";

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-lg shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
              New Support Ticket
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              We'll get back to you as soon as possible
            </p>
          </div>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Category Picker */}
          <fieldset>
            <legend className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Issue Category <span className="text-red-500">*</span>
            </legend>
            <div className="grid grid-cols-3 gap-2">
              {ISSUE_CATEGORIES.map((cat) => (
                <button
                  key={cat.value}
                  type="button"
                  onClick={() => setCategory(cat.value)}
                  className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-xs font-medium transition-all ${
                    category === cat.value
                      ? "bg-indigo-50 dark:bg-indigo-900/30 border-indigo-400 dark:border-indigo-500 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-400"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-300 hover:bg-indigo-50/50 dark:hover:bg-slate-800"
                  }`}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {cat.icon}
                  </span>
                  {cat.label}
                </button>
              ))}
            </div>
          </fieldset>

          {/* Subject */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Subject <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder={
                selectedCategoryLabel
                  ? `Brief summary of your ${selectedCategoryLabel.toLowerCase()} issue`
                  : "Brief summary of your issue"
              }
              maxLength={120}
              required
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              placeholder="Provide as much detail as possible — screenshots, error messages, steps to reproduce..."
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-slate-900 dark:text-slate-100 placeholder:text-slate-400 resize-none"
            />
          </div>

          {/* Priority */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">
              Priority
            </label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              className="w-full px-4 py-2.5 text-sm bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition-all text-slate-900 dark:text-slate-100"
            >
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <p className="text-xs text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !category || !subject.trim()}
              className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <span className="size-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-base leading-none">
                    send
                  </span>
                  Submit Ticket
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
