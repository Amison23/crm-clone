"use client";

import { useState } from "react";
import { updateSIMPort } from "../../actions";
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
import { Smartphone, Building2, Save, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import EmptyState from "@/components/common/EmptyState";

export default function SIMPortTable({ 
    initialData, 
    companies 
}: { 
    initialData: any[], 
    companies: any[] 
}) {
    const [ports, setPorts] = useState(initialData);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editPhone, setEditPhone] = useState("");
    const [editCompanyId, setEditCompanyId] = useState<string | null>(null);

    const handleSave = async (id: string) => {
        try {
            const res = await updateSIMPort(id, editPhone, editCompanyId);
            if (res.success) {
                setPorts(ports.map(p => p.id === id ? { 
                    ...p, 
                    phone_number: editPhone, 
                    company_id: editCompanyId,
                    company: companies.find(c => c.id === editCompanyId)
                } : p));
                setEditingId(null);
                toast.success("SIM Port configuration saved");
            } else {
                toast.error(res.error || "Failed to update SIM port");
            }
        } catch (err) {
            toast.error("System connection failure");
        }
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-sm">
            <Table>
                <TableHeader className="bg-slate-50/50 dark:bg-slate-800/50">
                    <TableRow className="border-b border-slate-100 dark:border-slate-800 h-14">
                        <TableHead className="font-black uppercase text-[10px] tracking-widest px-8">Gateway / Port</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Phone Number</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Allocated Tenant</TableHead>
                        <TableHead className="font-black uppercase text-[10px] tracking-widest">Status</TableHead>
                        <TableHead className="text-right px-8 font-black uppercase text-[10px] tracking-widest">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {ports.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={5}>
                                <EmptyState
                                    icon={Smartphone}
                                    title="No SIM ports allocated yet"
                                    description="Provision a gateway first, then SIM ports will be assigned and appear here."
                                />
                            </TableCell>
                        </TableRow>
                    ) : (
                        ports.map((port) => (
                        <TableRow key={port.id} className="border-b border-slate-50 dark:border-slate-800/50 h-20 hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                            <TableCell className="px-8 flex flex-col justify-center">
                                <p className="font-bold text-slate-900 dark:text-white text-xs uppercase">{port.gateway?.name || 'Unknown Gateway'}</p>
                                <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">Port #{port.port_number}</p>
                            </TableCell>
                            <TableCell>
                                {editingId === port.id ? (
                                    <Input 
                                        value={editPhone} 
                                        onChange={(e) => setEditPhone(e.target.value)}
                                        className="h-10 rounded-xl max-w-[180px]"
                                    />
                                ) : (
                                    <div className="flex items-center gap-2 text-slate-900 dark:text-white font-mono text-xs">
                                        <div className="bg-slate-100 dark:bg-slate-800 p-2 rounded-lg">
                                            <Smartphone className="size-3" />
                                        </div>
                                        {port.phone_number || "---"}
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                {editingId === port.id ? (
                                    <Select 
                                        value={editCompanyId || "unassigned"} 
                                        onValueChange={(val) => setEditCompanyId(val === "unassigned" ? null : val)}
                                    >
                                        <SelectTrigger className="h-10 rounded-xl max-w-[200px]">
                                            <SelectValue placeholder="System Shared" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="unassigned">System Shared</SelectItem>
                                            {companies.map(c => (
                                                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <div className={cn(
                                            "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-tighter flex items-center gap-1.5",
                                            port.company ? "bg-purple-50 text-purple-600 dark:bg-purple-900/20" : "bg-slate-100 text-slate-400 dark:bg-slate-800"
                                        )}>
                                            <Building2 className="size-3" />
                                            {port.company?.name || "System Shared"}
                                        </div>
                                    </div>
                                )}
                            </TableCell>
                            <TableCell>
                                <span className={cn(
                                    "text-[9px] font-black uppercase px-3 py-1 rounded-md tracking-widest",
                                    port.status === "active" ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20" : "bg-rose-50 text-rose-600 dark:bg-rose-900/20"
                                )}>
                                    {port.status}
                                </span>
                            </TableCell>
                            <TableCell className="text-right px-8 space-x-2">
                                {editingId === port.id ? (
                                    <Button onClick={() => handleSave(port.id)} variant="ghost" className="rounded-xl size-10 p-0 text-emerald-500 hover:bg-emerald-50">
                                        <Save className="size-4" />
                                    </Button>
                                ) : (
                                    <Button 
                                        onClick={() => {
                                            setEditingId(port.id);
                                            setEditPhone(port.phone_number || "");
                                            setEditCompanyId(port.company_id);
                                        }} 
                                        variant="ghost" 
                                        className="rounded-xl font-black uppercase text-[9px] tracking-widest hover:text-orange-500"
                                    >
                                        Configure
                                    </Button>
                                )}
                            </TableCell>
                        </TableRow>
                    )))}
                </TableBody>
            </Table>
        </div>
    );
}
