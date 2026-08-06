import { createClient } from "@/lib/supabase/server";
import GatewayTable from "./components/GatewayTable";
import SIMPortTable from "./components/SIMPortTable";
import VirtualNumberProvisioner from "./components/VirtualNumberProvisioner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Smartphone, Hash } from "lucide-react";
import PageHeader from "@/components/common/PageHeader";

export default async function TelephonyPage() {
  const supabase = await createClient();

  // Initial data fetch
  const [
    { data: gateways },
    { data: simPorts },
    { data: virtualNumbers },
    { data: companies }
  ] = await Promise.all([
    supabase.from("gateways").select("*").order("created_at"),
    supabase.from("sim_ports").select("*, gateway:gateways(name), company:companies(name)").order("port_number"),
    supabase.from("virtual_numbers").select("*, company:companies(name), sim_port:sim_ports(phone_number)"),
    supabase.from("companies").select("id, name").is("deleted_at", null)
  ]);

  return (
    <div className="w-full space-y-8 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <PageHeader
        title="Telephony"
        description="Infrastructure mapping, SIM port allocation, and multi-tenant virtual number provisioning."
        badge={{ label: "Node API", verified: true }}
      />

      <Tabs defaultValue="gateways" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1 rounded-xl mb-8 overflow-x-auto justify-start border border-slate-200/50 dark:border-slate-800/50">
          <TabsTrigger
            value="gateways"
            className="rounded-lg px-5 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all font-medium text-sm flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <Server className="size-4" />
            Gateways
          </TabsTrigger>
          <TabsTrigger
            value="sim-ports"
            className="rounded-lg px-5 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all font-medium text-sm flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <Smartphone className="size-4" />
            SIM Ports
          </TabsTrigger>
          <TabsTrigger
            value="virtual-numbers"
            className="rounded-lg px-5 py-2 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-sm data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 transition-all font-medium text-sm flex items-center gap-2 focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:outline-none"
          >
            <Hash className="size-4" />
            Virtual Numbers
          </TabsTrigger>
        </TabsList>

        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
            <TabsContent value="gateways" className="mt-0 focus-visible:ring-0">
                <GatewayTable initialData={gateways || []} />
            </TabsContent>

            <TabsContent value="sim-ports" className="mt-0 focus-visible:ring-0">
                <SIMPortTable initialData={simPorts || []} companies={companies || []} />
            </TabsContent>

            <TabsContent value="virtual-numbers" className="mt-0 focus-visible:ring-0">
                <VirtualNumberProvisioner 
                    initialData={virtualNumbers || []} 
                    companies={companies || []} 
                    simPorts={simPorts || []} 
                />
            </TabsContent>
        </section>
      </Tabs>
    </div>
  );
}
