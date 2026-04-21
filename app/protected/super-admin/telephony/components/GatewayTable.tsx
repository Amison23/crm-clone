"use client";

import { useState } from "react";
import { createGateway } from "../../actions";
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
import { Plus, Server, Activity, Globe } from "lucide-react";
import { cn } from "@/lib/utils";

export default function GatewayTable({ initialData }: { initialData: any[] }) {
    const [gateways, setGateways] = useState(initialData);
    const [newName, setNewName] = useState("");
    const [newIp, setNewIp] = useState("");
    const [isCreating, setIsCreating] = useState(false);

    const handleCreate = async () => {
        if (!newName || !newIp) {
            toast.error("All identifiers are required");
            return;
        }
        setIsCreating(true);
        try {
            const res = await createGateway(newName, newIp);
            if (res.success) {
                setGateways([...gateways, res.data]);
                setNewName("");
                setNewIp("");
                toast.success(`Gateway "${newName}" provisioned successfully`);
            } else {
                toast.error(res.error || "Failed to provision gateway");
            }
        } catch (err) {
            toast.error("System connection failure");
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-800 shadow-xl shadow-slate-200/40 dark:shadow-none space-y-6">
                <div className="flex items-center gap-2 mb-2">
                    <div className="bg-orange-500 p-2 rounded-lg">
                        <Plus className="size-4 text-white" />
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Provision New Gateway</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Gateway Identifier</label>
                        <Input
                            placeholder="e.g. Nairobi Edge Hub 01"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            className="rounded-2xl border-slate-100 dark:border-slate-800 h-12 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Public IP / Endpoint</label>
                        <Input
                            placeholder="e.g. 192.168.1.50"
                            value={newIp}
                            onChange={(e) => setNewIp(e.target.value)}
                            className="rounded-2xl border-slate-100 dark:border-slate-800 h-12 focus:ring-orange-500/20 focus:border-orange-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <Button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="h-12 w-full rounded-2xl bg-slate-900 hover:bg-black dark:bg-orange-600 dark:hover:bg-orange-700 text-white font-black uppercase tracking-widest text-[10px] transition-all"
                        >
                            {isCreating ? "Provisioning..." : "Initialize Node"}
                        </Button>
                    </div>
                </div>
            </div>

            <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                        <TableRow className="border-b border-slate-100 dark:border-slate-800 h-14">
                            <TableHead className="font-black uppercase text-[10px] tracking-widest px-8">Node Name</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Network Endpoint</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                            <TableHead className="font-black uppercase text-[10px] tracking-widest">Uptime</TableHead>
                            <TableHead className="text-right px-8 font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {gateways.map((gw) => (
                            <TableRow key={gw.id} className="border-b border-slate-50 dark:border-slate-800/50 h-20 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                                <TableCell className="px-8 font-bold text-slate-900 dark:text-white">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-2.5 rounded-xl">
                                            <Server className="size-4" />
                                        </div>
                                        {gw.name}
                                    </div>
                                </TableCell>
                                <TableCell className="font-mono text-xs text-slate-500 tracking-tighter">{gw.ip_address}</TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className={cn(
                                            "size-1.5 rounded-full",
                                            gw.status === "online" ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500"
                                        )} />
                                        <span className={cn(
                                            "text-[10px] font-black uppercase tracking-widest",
                                            gw.status === "online" ? "text-emerald-600" : "text-rose-600"
                                        )}>
                                            {gw.status}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                                    <Activity className="size-3" />
                                    {Math.floor((new Date().getTime() - new Date(gw.created_at).getTime()) / (1000 * 60 * 60))}h {Math.floor(((new Date().getTime() - new Date(gw.created_at).getTime()) / (1000 * 60)) % 60)}m
                                </TableCell>
                                <TableCell className="text-right px-8">
                                    <Button variant="ghost" className="rounded-xl font-black uppercase text-[9px] tracking-widest hover:text-orange-500">
                                        Monitor
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
