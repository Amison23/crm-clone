import { FeatureFlag } from "./features";

export interface NavItem {
  href: string;
  icon: string;
  label: string;
  roles?: string[];
  flag?: FeatureFlag;
  disabled?: boolean;
}

export const navItems: NavItem[] = [
  { href: "/protected", icon: "dashboard", label: "Dashboard", roles: ["sales_agent", "admin", "server_admin", "dev", "superadmin"] },
  { href: "/protected/dev", icon: "code", label: "Dev Workspace", roles: ["dev", "superadmin"] },
  { href: "/protected/server-admin", icon: "dns", label: "Server Node", roles: ["server_admin", "superadmin"] },
  { href: "/protected/sales-agent", icon: "badge", label: "My Workspace", roles: ["sales_agent", "admin", "server_admin", "dev", "superadmin"] },
  { href: "/protected/executive-dashboard", icon: "monitoring", label: "Executive", roles: ["admin", "superadmin"] },
  { href: "/protected/crm-leads-table", icon: "groups", label: "Leads", roles: ["sales_agent", "admin"] },
  { href: "/protected/task-management-board", icon: "assignment_turned_in", label: "Tasks", roles: ["sales_agent", "admin", "server_admin", "dev", "superadmin"] },
  { href: "/protected/omnichannel-chat-inbox", icon: "chat_bubble", label: "Chat", roles: ["sales_agent", "admin", "server_admin", "dev", "superadmin"] },
  { href: "/protected/tickets", icon: "support_agent", label: "Support", roles: ["sales_agent", "admin", "server_admin", "dev"] },
  { href: "/protected/super-admin", icon: "public", label: "Global Command", roles: ["superadmin"] },
  { href: "/protected/settings", icon: "settings", label: "Settings", roles: ["superadmin", "server_admin", "admin", "sales_agent", "dev"] }
];

export const systemItems: NavItem[] = [
  { href: "/protected/visual-bot-builder", icon: "robot_2", label: "Bot Builder", roles: ["sales_agent", "admin", "dev", "superadmin"], flag: "botBuilder" },
  { href: "/protected/visual-ivr-builder", icon: "account_tree", label: "IVR Builder", roles: ["sales_agent", "admin", "dev", "superadmin"], flag: "ivrBuilder", disabled: true },
  { href: "/protected/telephony-and-softphone", icon: "call", label: "Telephony", roles: ["sales_agent", "admin", "dev"], flag: "softphone", disabled: true },
];

export const platformItems: NavItem[] = [
  { href: "/protected/super-admin/overview", icon: "monitoring", label: "Overview" },
  { href: "/protected/super-admin/tenants", icon: "corporate_fare", label: "Tenants" },
  { href: "/protected/super-admin/users", icon: "group", label: "Users" },
  { href: "/protected/super-admin/telephony", icon: "call", label: "Telephony", flag: "telephony" },
  { href: "/protected/super-admin/audit-logs", icon: "history", label: "Audit Logs" },
  { href: "/protected/super-admin/settings", icon: "settings", label: "System Settings" },
];
