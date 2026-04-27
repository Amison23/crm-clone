import { createClient } from "@/lib/supabase/server";
import GatewayTable from "./components/GatewayTable";
import SIMPortTable from "./components/SIMPortTable";
import VirtualNumberProvisioner from "./components/VirtualNumberProvisioner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Smartphone, Hash, Radio, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

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
    <div className="w-full space-y-10 pb-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white uppercase leading-none italic">
            Telephony <span className="text-orange-600">Core</span>
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium italic border-l-2 border-orange-500 ml-1 pl-4">
            Infrastructure mapping, SIM port allocation, and multi-tenant virtual number provisioning.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none">
            <Radio className="size-4 text-orange-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing with Node API</span>
        </div>
      </header>

      <Tabs defaultValue="gateways" className="w-full">
        <TabsList className="bg-slate-100 dark:bg-slate-900 p-1.5 rounded-[1.5rem] mb-10 overflow-x-auto justify-start border border-slate-200/50 dark:border-slate-800/50">
          <TabsTrigger value="gateways" className="rounded-xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-orange-600 transition-all font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2.5">
            <Server className="size-3.5" />
            Gateways
          </TabsTrigger>
          <TabsTrigger value="sim-ports" className="rounded-xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-orange-600 transition-all font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2.5">
            <Smartphone className="size-3.5" />
            SIM Ports
          </TabsTrigger>
          <TabsTrigger value="virtual-numbers" className="rounded-xl px-8 py-3 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:shadow-lg data-[state=active]:text-orange-600 transition-all font-black text-[10px] uppercase tracking-[0.15em] flex items-center gap-2.5">
            <Hash className="size-3.5" />
            Virtual Numbers
          </TabsTrigger>
        </TabsList>

        <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-100 dark:border-slate-800 shadow-2xl shadow-slate-200/50 dark:shadow-none overflow-hidden p-2">
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
