"use client";

import { useState } from "react";
import { provisionVirtualNumber, deleteVirtualNumber } from "../../actions";
import { toast } from "react-hot-toast";
import { 
    Table, 
    TableHeader, 
    TableRow, 
    TableHead, 
    TableBody, 
    TableCell 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Hash, Building2, Smartphone, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Company {
    id: string;
    name: string;
}

interface SimPort {
    id: string;
    phone_number: string;
    port_number: number;
}

interface VirtualNumber {
    id: string;
    number: string;
    company?: Company;
    sim_port?: SimPort;
}

export default function VirtualNumberProvisioner({ 
    initialData, 
    companies, 
    simPorts 
}: { 
    initialData: VirtualNumber[], 
    companies: Company[], 
    simPorts: SimPort[] 
}) {
    const [numbers, setNumbers] = useState<VirtualNumber[]>(initialData);
    const [number, setNumber] = useState("");
    const [companyId, setCompanyId] = useState<string | null>(null);
    const [simPortId, setSimPortId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleProvision = async () => {
        if (!number) {
            toast.error("Please enter a phone number");
            return;
        }
        setIsLoading(true);
        try {
            const res = await provisionVirtualNumber(number, companyId, simPortId);
            if (res.success) {
                const newItem = {
                    ...res.data,
                    company: companies.find(c => c.id === companyId),
                    sim_port: simPorts.find(s => s.id === simPortId)
                };
                setNumbers([...numbers, newItem]);
                setNumber("");
                toast.success("Number provisioned successfully");
            } else {
                toast.error(res.error || "Failed to provision number");
            }
        } catch (err) {
            toast.error("Network synchronization failure");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure? This cannot be undone.")) return;
        try {
            const res = await deleteVirtualNumber(id);
            if (res.success) {
                setNumbers(numbers.filter(n => n.id !== id));
                toast.success("Identity segment decommissioned");
            } else {
                toast.error(res.error || "Decommissioning failed");
            }
        } catch (err) {
            toast.error("System connection failure");
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
                <div className="flex items-center gap-2">
                    <div className="bg-emerald-500 p-2 rounded-lg text-white">
                        <Plus className="size-4" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest">Provision VoIP Mapping</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Virtual Number (DID)</label>
                        <Input 
                            placeholder="+254 7XX XXX XXX" 
                            value={number} 
                            onChange={(e) => setNumber(e.target.value)}
                            className="rounded-xl"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Assign Tenant</label>
                        <Select 
                            value={companyId || "shared"} 
                            onValueChange={(val: string) => setCompanyId(val === "shared" ? null : val)}
                        >
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="System Shared" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="shared">System Shared</SelectItem>
                                {companies.map(c => (
                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Physical GSM Proxy (SIM Port)</label>
                        <Select 
                            value={simPortId || "none"} 
                            onValueChange={(val: string) => setSimPortId(val === "none" ? null : val)}
                        >
                            <SelectTrigger className="rounded-xl">
                                <SelectValue placeholder="No Direct Mapping" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="none">VoIP Only (No SIM)</SelectItem>
                                {simPorts.map(s => (
                                    <SelectItem key={s.id} value={s.id}>
                                        {s.phone_number} (P{s.port_number})
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex items-end">
                        <Button 
                            onClick={handleProvision} 
                            disabled={isLoading}
                            className="w-full h-10 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-black uppercase text-[9px] tracking-widest"
                        >
                            Provision Number
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                        <TableRow className="border-b border-slate-100 dark:border-slate-800 h-14">
                            <TableHead className="font-black uppercase text-[10px] tracking-widest px-8">Virtual Asset</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Tenant Allocation</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">GSM Sink Mapping</TableHead>
                            <TableHead className="text-right px-8 font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {numbers.map((vn) => (
                            <TableRow key={vn.id} className="border-b border-slate-50 dark:border-slate-800/50 h-20 hover:bg-slate-50/50 transition-colors">
                                <TableCell className="px-8">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-emerald-50 dark:bg-emerald-900/20 p-2.5 rounded-xl text-emerald-600">
                                            <Hash className="size-4" />
                                        </div>
                                        <div className="font-bold text-slate-900 dark:text-white uppercase text-xs tracking-widest">
                                            {vn.number}
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        {vn.company ? (
                                            <div className="bg-purple-50 text-purple-600 dark:bg-purple-900/20 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5">
                                                <Building2 className="size-3" />
                                                {vn.company.name}
                                            </div>
                                        ) : (
                                            <span className="text-[10px] font-black uppercase text-slate-400 tracking-widest italic">System Pool</span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    {vn.sim_port ? (
                                        <div className="flex items-center gap-2 text-slate-500 font-mono text-[10px]">
                                            <Smartphone className="size-3" />
                                            {vn.sim_port.phone_number}
                                        </div>
                                    ) : (
                                        <span className="text-[9px] font-black uppercase text-slate-300 tracking-tighter">Direct VoIP Sip Pool</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-right px-8">
                                    <Button 
                                        onClick={() => handleDelete(vn.id)}
                                        variant="ghost" 
                                        className="text-rose-500 hover:bg-rose-50 rounded-xl size-9 p-0"
                                    >
                                        <Trash2 className="size-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
