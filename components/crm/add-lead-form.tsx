"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createLeadAction } from "@/app/actions/leads";
import { Loader2 } from "lucide-react";

export function AddLeadForm({ 
  onSuccess,
  onMessage 
}: { 
  onSuccess?: () => void,
  onMessage?: (type: "success" | "error", msg: string) => void
}) {
  const [isPending, setIsPending] = useState(false);

  async function onSubmit(formData: FormData) {
    setIsPending(true);
    try {
      const result = await createLeadAction(formData);
      if (result.error) {
        onMessage?.("error", result.error);
      } else {
        onMessage?.("success", "Lead added successfully!");
        onSuccess?.();
      }
    } catch (error: any) {
      onMessage?.("error", error.message || "An error occurred");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <form action={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">First Name *</Label>
          <Input id="first_name" name="first_name" required placeholder="John" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="last_name">Last Name</Label>
          <Input id="last_name" name="last_name" placeholder="Doe" />
        </div>
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="company_name">Company</Label>
        <Input id="company_name" name="company_name" placeholder="Acme Inc." />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" placeholder="john@example.com" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone *</Label>
          <Input id="phone" name="phone" required placeholder="+1 234 567 890" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="source">Source</Label>
          <Input id="source" name="source" placeholder="Website, Referral, etc." />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Initial Status</Label>
          <Input id="status" name="status" defaultValue="new" />
        </div>
      </div>

      <div className="pt-4 flex justify-end gap-2 border-t mt-6">
        <Button disabled={isPending} className="w-full sm:w-auto">
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Save Lead
        </Button>
      </div>
    </form>
  );
}
