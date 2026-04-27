import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import SystemSettingsForm from "./components/SystemSettingsForm";
import { checkSuperAdmin } from "../actions";

export default async function SettingsPage() {
  const supabase = await createClient();
  await checkSuperAdmin(supabase);

  // Fetch all system settings
  const { data: settings, error } = await supabase
    .from("system_settings")
    .select("*")
    .order("category", { ascending: true });

  if (error) {
    console.error("Error fetching system settings:", error);
  }

  // Pre-seed default settings if empty
  const defaultSettings = [
    { key: "platform_name", value: "Momentum CRM", category: "general", description: "The public name of the platform." },
    { key: "maintenance_mode", value: false, category: "security", description: "Disable access for non-admin users." },
    { key: "allow_public_signup", value: true, category: "security", description: "Permit new users to register." },
    { key: "support_email", value: "support@momentum.voip", category: "general", description: "Email address for platform support." }
  ];

  return (
    <div className="w-full space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
            System <span className="text-orange-600">Configuration</span>
        </h1>
        <p className="text-slate-500 dark:text-slate-400 font-medium truncate">
            Configure global environment variables and platform-wide behavior.
        </p>
      </div>

      <section>
        <SystemSettingsForm initialSettings={settings?.length ? settings : defaultSettings} />
      </section>
    </div>
  );
}
