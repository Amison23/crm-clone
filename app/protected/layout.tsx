import DashboardLayout from "@/components/common/DashboardLayout";
import type { ReactNode } from "react";


export default function ProtectedLayout({
  children,
}: {
  children: ReactNode;
}) {
  return <DashboardLayout>{children}</DashboardLayout>;
}