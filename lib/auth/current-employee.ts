import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

export type CurrentEmployee = {
  userId: string;
  email: string | null;
  role: string;
  companyId: string | null;
  fullName: string | null;
};

export const getCurrentEmployee = cache(async (): Promise<CurrentEmployee | null> => {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: emp, error } = await supabase
    .from("employees")
    .select("id, role, company_id, full_name, email_address")
    .eq("id", user.id)
    .maybeSingle();
  if (error || !emp) return null;
  return {
    userId: user.id,
    email: emp.email_address ?? null,
    role: emp.role,
    companyId: emp.company_id ?? null,
    fullName: emp.full_name ?? null,
  };
});
