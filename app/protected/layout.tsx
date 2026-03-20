import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full overflow-x-hidden bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64 flex flex-col min-w-0">
        <Navbar />
        {children}
      </main>
    </div>
  );
}
