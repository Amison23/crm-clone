import { redirect } from "next/navigation";

export default function SuperAdminPage() {
  redirect("/protected/super-admin/overview");
}