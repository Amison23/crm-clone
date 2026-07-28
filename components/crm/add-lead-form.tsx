"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLeadAction, updateLeadAction } from "@/lib/api/leads";
import { Loader2 } from "lucide-react";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "../ui/textarea";

export function AddLeadForm({ 
  initialData,
  onSuccess,
  onMessage 
}: { 
  initialData?: any,
  onSuccess?: () => void,
  onMessage?: (type: "success" | "error", msg: string) => void
}) {
  const [isPending, setIsPending] = useState(false);
  const isSubmitting = useRef(false);

  async function onSubmit(formData: FormData) {
    if (isSubmitting.current) return;
    isSubmitting.current = true;
    setIsPending(true);
    try {
      const result = initialData 
        ? await updateLeadAction(initialData.id, formData)
        : await createLeadAction(formData);
      if (result.error) {
        onMessage?.("error", result.error);
      } else {
        onMessage?.("success", initialData ? "Lead updated successfully!" : "Lead added successfully!");
        onSuccess?.();
      }
    } catch (error: any) {
      onMessage?.("error", error.message || "An error occurred");
    } finally {
      setIsPending(false);
      isSubmitting.current = false;
    }
  }

  return (
    <form action={onSubmit} className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="client_name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Client/Company Name *</Label>
          <Input id="client_name" name="client_name" defaultValue={initialData?.client_name} required placeholder="e.g. Acme Corp" className="h-10" autoComplete="organization" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="contact_name" className="text-xs font-bold uppercase tracking-wider text-slate-500">Contact Name *</Label>
          <Input id="contact_name" name="contact_name" defaultValue={initialData?.contact_name} required placeholder="e.g. Jane Doe" className="h-10" autoComplete="name" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="client_phone" className="text-xs font-bold uppercase tracking-wider text-slate-500">Client Phone *</Label>
          <Input id="client_phone" name="client_phone" defaultValue={initialData?.client_phone} type="tel" required placeholder="+254 700 000 000" className="h-10" autoComplete="tel" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-wider text-slate-500">Email Address</Label>
          <Input id="email" name="email" defaultValue={initialData?.email} type="email" placeholder="jane.doe@example.com" className="h-10" autoComplete="email" />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="status" className="text-xs font-bold uppercase tracking-wider text-slate-500">Lead Status</Label>
          <Select name="status" defaultValue={initialData?.status || "new"}>
            <SelectTrigger id="status" className="h-10">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="new">New Lead</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="contacted">Contacted</SelectItem>
              <SelectItem value="qualified">Qualified</SelectItem>
              <SelectItem value="lost">Lost</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="institution_type" className="text-xs font-bold uppercase tracking-wider text-slate-500">Institution Type</Label>
          <Select name="institution_type" defaultValue={initialData?.institution_type}>
            <SelectTrigger id="institution_type" className="h-10">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="corporate">Corporate</SelectItem>
              <SelectItem value="sme">SME</SelectItem>
              <SelectItem value="ngo">NGO</SelectItem>
              <SelectItem value="government">Government</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="product" className="text-xs font-bold uppercase tracking-wider text-slate-500">Target Product *</Label>
        <Select name="product" defaultValue={initialData?.product} required>
          <SelectTrigger id="product" className="h-10">
            <SelectValue placeholder="Select a product" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="LMS">LMS (Learning Management)</SelectItem>
            <SelectItem value="Bookease">Bookease</SelectItem>
            <SelectItem value="Merchant Pro">Merchant Pro</SelectItem>
            <SelectItem value="CRM Cloud">CRM Cloud</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label htmlFor="next_action" className="text-xs font-bold uppercase tracking-wider text-slate-500">Next Action</Label>
          <Input id="next_action" name="next_action" defaultValue={initialData?.next_action} placeholder="e.g. Schedule Demo" className="h-10" autoComplete="off" />
        </div>

        <div className="space-y-2">
          <Label htmlFor="next_action_date" className="text-xs font-bold uppercase tracking-wider text-slate-500">Next Action Date</Label>
          <Input id="next_action_date" name="next_action_date" defaultValue={initialData?.next_action_date} type="date" className="h-10" autoComplete="off" />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <div className="space-y-2">
          <Label htmlFor="need_identified" className="text-xs font-bold uppercase tracking-wider text-slate-500">Need Identified *</Label>
          <Textarea 
            id="need_identified" 
            name="need_identified" 
            defaultValue={initialData?.need_identified}
            required 
            placeholder="What problem are we solving for them?" 
            className="min-h-[100px] resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-slate-500">Internal Notes</Label>
          <Textarea 
            id="notes" 
            name="notes" 
            defaultValue={initialData?.notes}
            placeholder="Add any additional context or background information..." 
            className="min-h-[100px] resize-none"
          />
        </div>
      </div>

      <div className="pt-6 flex flex-col sm:flex-row justify-end gap-3 border-t mt-8">
        {!initialData && <Button type="reset" variant="outline" className="h-11 px-8">Clear Form</Button>}
        <Button disabled={isPending} className="h-11 px-8 shadow-lg shadow-primary/20">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          {initialData ? "Update Lead Record" : "Save Lead Record"}
        </Button>
      </div>
    </form>
  );
}
