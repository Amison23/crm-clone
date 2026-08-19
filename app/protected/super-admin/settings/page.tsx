import { createClient } from "@/lib/supabase/server";
import SystemSettingsForm from "./components/SystemSettingsForm";
import { checkSuperAdmin } from "../actions";
import PageHeader from "@/components/common/PageHeader";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
      <PageHeader
        title="System Settings"
        description="Configure platform-wide behavior and global environment settings."
      />

      <section>
        <SystemSettingsForm initialSettings={settings?.length ? settings : defaultSettings} />
      </section>
    </div>
  );
}
