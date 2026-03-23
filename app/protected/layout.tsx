import Dashboard from "@/components/common/Dashboard";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <Dashboard>
        {children}
      </Dashboard>
    </div>

  )
}
