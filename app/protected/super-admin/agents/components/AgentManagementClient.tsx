"use client";

import { useState } from "react";
import { createAgent, assignAgentToProduct, unassignAgentFromProduct, createProduct } from "@/app/protected/super-admin/actions";
import { 
  ShieldAlert, 
  Zap, 
  Clock, 
  UserPlus, 
  ArrowRight, 
  CheckCircle, 
  Users, 
  Building2, 
  Mail, 
  ShieldCheck,
  Search,
  MoreVertical,
  ChevronDown,
  Package,
  XCircle,
  PlusCircle,
  Key,
  Copy
} from 'lucide-react';
import { cn } from "@/lib/utils";
import { toast } from "react-hot-toast";
import AddAgentDialog from "@/app/protected/super-admin/agents/components/AddAgentDialog";

interface Agent {
  id: string;
  full_name: string;
  email_address: string;
  role: string;
  company_id: string | null;
  companies: { name: string } | null;
}

interface Product {
  id: string;
  name: string;
  description: string;
  api_key: string | null;
  agent_products: { 
    agent_id: string; 
    employees: { full_name: string } 
  }[];
}

interface FrictionPoint {
  task_id: string;
  title: string;
  assigned_to: string | null;
  priority: string;
  due_date: string;
  metric_type: string;
}

interface Company {
  id: string;
  name: string;
}

export default function AgentManagementClient({ 
  initialAgents, 
  products: initialProducts, 
  frictionData,
  companies
}: { 
  initialAgents: Agent[], 
  products: Product[], 
  frictionData: FrictionPoint[],
  companies: Company[]
}) {
  const [agents, setAgents] = useState(initialAgents);
  const [products, setProducts] = useState(initialProducts);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [isAssigning, setIsAssigning] = useState(false);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const filteredAgents = agents.filter(a => 
    a.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.email_address?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("API Key copied to clipboard");
  };

  const handleToggleAssignment = async (productId: string, agentId: string) => {
    setIsAssigning(true);
    const product = products.find(p => p.id === productId);
    const isAssigned = product?.agent_products.some(ap => ap.agent_id === agentId);

    try {
      if (isAssigned) {
        const result = await unassignAgentFromProduct(agentId, productId);
        if (result.success) {
          setProducts(prev => prev.map(p => 
            p.id === productId 
              ? { ...p, agent_products: p.agent_products.filter(ap => ap.agent_id !== agentId) } 
              : p
          ));
          toast.success("Agent removed from product");
        } else {
          toast.error(result.error || "Failed to unassign agent");
        }
      } else {
        const result = await assignAgentToProduct(agentId, productId);
        if (result.success) {
          const agent = agents.find(a => a.id === agentId);
          setProducts(prev => prev.map(p => 
            p.id === productId 
              ? { ...p, agent_products: [...p.agent_products, { agent_id: agentId, employees: { full_name: agent?.full_name || "Unknown" } }] } 
              : p
          ));
          toast.success("Agent assigned to product");
        } else {
          toast.error(result.error || "Failed to assign agent");
        }
      }
    } catch (err) {
      toast.error("Network error during assignment");
    } finally {
      setIsAssigning(false);
    }
  };

  return (
    <div className="space-y-12 pb-20">
      
      {/* --- STATS OVERVIEW --- */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Active Operators</p>
          <div className="flex items-center gap-3">
            <Users className="text-primary size-6" />
            <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{agents.length}</span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Product Portfolio</p>
          <div className="flex items-center gap-3">
            <Package className="text-amber-500 size-6" />
            <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">
              {products.length} <span className="text-sm text-slate-400 font-medium tracking-normal">units</span>
            </span>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Audit Alerts</p>
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-rose-500 size-6" />
            <span className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white">{frictionData.length}</span>
          </div>
        </div>
      </section>

      {/* --- AGENT DIRECTORY --- */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-slate-900 text-white rounded-xl"><Users size={18} /></div>
            <h2 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Operator Directory</h2>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search agents..." 
                className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-sm outline-none focus:ring-2 focus:ring-primary/20"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <AddAgentDialog companies={companies} onSuccess={(newAgent) => setAgents([newAgent, ...agents])} />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {filteredAgents.map(agent => (
            <div key={agent.id} className="bg-white dark:bg-slate-900 p-6 rounded-[2rem] border border-slate-200 dark:border-slate-800 flex items-center justify-between group hover:border-primary transition-all shadow-sm">
              <div className="flex items-center gap-4">
                <div className="size-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-primary font-black text-lg">
                  {agent.full_name?.[0]}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{agent.full_name}</h4>
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">
                    <Building2 size={12} /> {agent.companies?.name || "Global Command"}
                    <span className="text-slate-200 dark:text-slate-700">•</span>
                    <Mail size={12} /> {agent.email_address}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={cn(
                  "px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                  agent.role === 'superadmin' ? 'bg-purple-50 border-purple-100 text-purple-600' :
                  agent.role === 'admin' ? 'bg-blue-50 border-blue-100 text-blue-600' :
                  'bg-emerald-50 border-emerald-100 text-emerald-600'
                )}>
                  {agent.role.replace(/_/g, ' ')}
                </span>
                {selectedProductId && agent.role !== 'superadmin' && (
                  <button 
                    disabled={isAssigning}
                    onClick={() => handleToggleAssignment(selectedProductId, agent.id)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg",
                      products.find(p => p.id === selectedProductId)?.agent_products.some(ap => ap.agent_id === agent.id)
                        ? "bg-rose-500 text-white shadow-rose-500/20"
                        : "bg-primary text-white shadow-primary/20"
                    )}
                  >
                    {products.find(p => p.id === selectedProductId)?.agent_products.some(ap => ap.agent_id === agent.id) 
                      ? "Unassign" 
                      : "Assign Here"} 
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* --- PRODUCT PORTFOLIO --- */}
      <section className="bg-slate-900 rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden p-1">
        <div className="p-8 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-slate-900 rounded-lg"><Package size={18} /></div>
            <div>
              <h3 className="text-xl font-black uppercase tracking-tighter text-white">Product Portfolio</h3>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em]">Manage Agent Specializations</p>
            </div>
          </div>
            <div className="flex items-center gap-4">
              <button 
                onClick={() => setIsProductModalOpen(true)}
                className="bg-amber-500 px-4 py-2 rounded-xl text-slate-900 text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all flex items-center gap-2 shadow-lg"
              >
                <PlusCircle size={14} /> Add Product
              </button>
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active SaaS Nodes: {products.length}</span>
            </div>
        </div>

        <div className="bg-slate-900 min-h-[200px]">
          {products.length > 0 ? (
            <>
              {/* Mobile Cards (< md) */}
              <div className="block md:hidden divide-y divide-slate-800">
                {products.map((product) => (
                  <div key={product.id} className="p-5 space-y-3">
                    <div>
                      <h4 className="text-base font-black text-white uppercase">{product.name}</h4>
                      <p className="text-xs font-medium text-slate-400 mt-0.5">{product.description}</p>
                    </div>

                    <div className="flex items-center gap-2 group/key cursor-pointer bg-slate-800/80 p-2.5 rounded-xl border border-slate-700" onClick={() => product.api_key && copyToClipboard(product.api_key)}>
                      <Key size={14} className="text-amber-500 shrink-0" />
                      <code className="text-xs font-mono text-slate-300 truncate flex-1">
                        {product.api_key || "NO_KEY_PROVISIONED"}
                      </code>
                      <Copy size={14} className="text-slate-500 shrink-0" />
                    </div>

                    <div>
                      <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5">Assigned Operators</p>
                      <div className="flex flex-wrap gap-1.5">
                        {product.agent_products.length > 0 ? (
                          product.agent_products.map(ap => (
                            <span key={ap.agent_id} className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded text-[10px] font-bold text-slate-300">
                              {ap.employees.full_name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-slate-600">No agents assigned</span>
                        )}
                      </div>
                    </div>

                    <div className="pt-2 flex justify-end">
                      {selectedProductId === product.id ? (
                        <button 
                          onClick={() => setSelectedProductId(null)}
                          className="w-full py-2.5 bg-rose-500 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all"
                        >
                          Finish Selection
                        </button>
                      ) : (
                        <button 
                          onClick={() => setSelectedProductId(product.id)}
                          className="w-full py-2.5 bg-white text-slate-900 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-500 transition-all"
                        >
                          <PlusCircle size={14} /> Assign Operators <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <tbody className="divide-y divide-slate-800">
                    {products.map((product) => (
                      <tr key={product.id} className={cn(
                        "group transition-all",
                        selectedProductId === product.id ? "bg-slate-800/80" : "hover:bg-slate-800/50"
                      )}>
                        <td className="px-8 py-8 min-w-[200px]">
                          <p className="text-lg font-black text-white uppercase tracking-tighter">{product.name}</p>
                          <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">{product.description}</p>
                        </td>
                        <td className="px-8 py-8">
                          <div className="space-y-1.5">
                            <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Integration Key</p>
                            <div className="flex items-center gap-2 group/key cursor-pointer" onClick={() => product.api_key && copyToClipboard(product.api_key)}>
                              <Key size={12} className="text-amber-500" />
                              <code className="text-[10px] font-mono text-slate-400 truncate max-w-[120px]">
                                {product.api_key || "NO_KEY_PROVISIONED"}
                              </code>
                              <Copy size={12} className="text-slate-600 group-hover/key:text-white transition-colors" />
                            </div>
                          </div>
                        </td>
                        <td className="px-8 py-8">
                           <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-2">Assigned Operators</p>
                           <div className="flex flex-wrap gap-2">
                             {product.agent_products.length > 0 ? (
                               product.agent_products.map(ap => (
                                 <span key={ap.agent_id} className="px-2 py-1 bg-slate-800 border border-slate-700 rounded-md text-[9px] font-bold text-slate-300 uppercase">
                                   {ap.employees.full_name}
                                 </span>
                               ))
                             ) : (
                               <span className="text-[9px] font-bold text-slate-600 uppercase">No agents assigned</span>
                             )}
                           </div>
                        </td>
                        <td className="px-8 py-8 text-right">
                          {selectedProductId === product.id ? (
                            <button 
                              onClick={() => setSelectedProductId(null)}
                              className="px-6 py-3 bg-rose-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                            >
                              Finish Selection
                            </button>
                          ) : (
                            <button 
                              onClick={() => setSelectedProductId(product.id)}
                              className="px-6 py-3 bg-white text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 ml-auto hover:bg-amber-500 hover:text-slate-900 transition-all active:scale-95"
                            >
                              <PlusCircle size={14} /> Assign Operators <ArrowRight size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-800">
               <Package size={40} className="mb-4 opacity-10" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">No SaaS Products Registered</p>
            </div>
          )}
        </div>
      </section>

      {/* --- FRICTION & DENSITY AUDIT --- */}
      <section className="bg-white dark:bg-slate-900 rounded-[3rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-rose-50/30 dark:bg-rose-950/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-rose-500 text-white rounded-lg animate-pulse">
              <ShieldAlert size={18} />
            </div>
            <h3 className="text-xl font-black uppercase tracking-tighter text-slate-900 dark:text-white">Operator Friction Audit</h3>
          </div>
        </div>

        <div>
          {frictionData.length > 0 ? (
            <>
              {/* Mobile Cards (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {frictionData.map((task) => (
                  <div key={task.task_id} className="p-4 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase">{task.title}</h4>
                      <span className={cn(
                        "text-[9px] font-black uppercase px-2 py-0.5 rounded border shrink-0",
                        task.priority === 'high' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                      )}>
                        {task.priority}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>Agent: <strong className="text-slate-700 dark:text-slate-300">{task.assigned_to || 'UNASSIGNED'}</strong></span>
                      <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest",
                        task.metric_type === 'FRICTION' ? 'text-rose-500' : 'text-blue-500'
                      )}>
                        {task.metric_type}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Desktop Table (>= md) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] bg-slate-50/50 dark:bg-slate-800/30">
                      <th className="px-8 py-5">Objective</th>
                      <th className="px-8 py-5">Assigned Agent</th>
                      <th className="px-8 py-5 text-center">Priority</th>
                      <th className="px-8 py-5">Deadline</th>
                      <th className="px-8 py-5 text-right">Metric</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {frictionData.map((task) => (
                      <tr key={task.task_id} className="group hover:bg-slate-50/80 transition-all">
                        <td className="px-8 py-6 font-bold text-sm text-slate-900 dark:text-white uppercase tracking-tight">{task.title}</td>
                        <td className="px-8 py-6 text-xs font-bold text-slate-500 uppercase">{task.assigned_to || 'UNASSIGNED'}</td>
                        <td className="px-8 py-6 text-center">
                          <span className={cn(
                            "text-[9px] font-black uppercase px-2 py-1 rounded-md border",
                            task.priority === 'high' ? 'bg-rose-50 border-rose-100 text-rose-600' : 'bg-slate-50 border-slate-100 text-slate-400'
                          )}>
                            {task.priority}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-xs font-mono font-bold text-slate-500 italic">
                          {new Date(task.due_date).toLocaleDateString('en-GB')}
                        </td>
                        <td className="px-8 py-6 text-right">
                          <span className={cn(
                            "text-[10px] font-black uppercase tracking-widest",
                            task.metric_type === 'FRICTION' ? 'text-rose-500' : 'text-blue-500'
                          )}>
                            {task.metric_type}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="py-20 flex flex-col items-center justify-center text-slate-300 dark:text-slate-700">
               <CheckCircle size={40} className="mb-4 opacity-20" />
               <p className="text-[10px] font-black uppercase tracking-[0.3em]">Operational Flow: Optimal</p>
            </div>
          )}
        </div>
      </section>

      {/* --- NEW PRODUCT MODAL --- */}
      <NewProductModal 
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSuccess={(newProduct) => {
          setProducts(prev => [...prev, newProduct]);
          setIsProductModalOpen(false);
        }}
      />
    </div>
  );
}

// NEW PRODUCT MODAL (Using native dialog)
function NewProductModal({
  isOpen,
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (product: Product) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }

    setIsLoading(true);
    try {
      const result = await createProduct({ name: name.trim(), description: description.trim() });
      if (result.success && result.data) {
        toast.success("Product created successfully");
        onSuccess(result.data);
        setName("");
        setDescription("");
        onClose();
      } else {
        toast.error(result.error || "Failed to create product");
      }
    } catch {
      toast.error("Network error while creating product");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-[2.5rem] shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-8 pt-8 pb-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500 text-slate-900 rounded-lg">
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-lg font-black uppercase tracking-tighter text-white">
                New SaaS Product
              </h2>
              <p className="text-[10px] font-bold text-amber-500 uppercase tracking-[0.3em]">
                Register a new node
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-all"
          >
            <XCircle size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Product Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              placeholder="e.g. SwiftDesk, Cloudora..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
              Description
            </label>
            <textarea
              placeholder="Brief description of this product..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-700 rounded-xl text-sm text-white placeholder-slate-600 outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500/50 transition-all resize-none"
            />
          </div>

          <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
            An API key will be auto-provisioned on creation.
          </p>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isLoading || !name.trim()}
            className="px-6 py-3 bg-amber-500 text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-all shadow-lg shadow-amber-500/20 disabled:opacity-40 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <span className="size-3 border-2 border-slate-900/30 border-t-slate-900 rounded-full animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <PlusCircle size={14} /> Register Product <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}