"use client";

import { useState } from "react";
import { 
  Settings, 
  Shield, 
  Bell, 
  Globe, 
  Save, 
  Loader2,
  Info,
  Check,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { updateSystemSetting } from "../../actions";
import { toast } from "react-hot-toast";

interface Setting {
  key: string;
  value: any;
  category: string;
  description: string | null;
}

export default function SystemSettingsForm({ initialSettings }: { initialSettings: any[] }) {
  const [settings, setSettings] = useState<Setting[]>(initialSettings);
  const [activeTab, setActiveTab] = useState("general");
  const [isSaving, setIsSaving] = useState<string | null>(null);

  const categories = [
    { id: "general", label: "General", icon: Globe },
    { id: "security", label: "Security", icon: Shield },
    { id: "notifications", label: "Notifications", icon: Bell },
  ];

  const handleUpdate = async (key: string, newValue: any) => {
    // Basic validation
    if (key.includes("email") && typeof newValue === "string" && !newValue.includes("@")) {
        toast.error("Invalid email address format", { id: "set-err" });
        return;
    }

    setIsSaving(key);
    try {
        const result = await updateSystemSetting(key, newValue);
        if (result.success) {
            setSettings(prev => prev.map(s => s.key === key ? { ...s, value: newValue } : s));
        } else {
            toast.error(result.error || "Failed to update setting");
        }
    } catch (err) {
        toast.error("System connection failure");
    } finally {
        setIsSaving(null);
    }
  };

  const filteredSettings = settings.filter(s => s.category === activeTab);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-slate-100/50 dark:shadow-none transition-all">
      
      {/* Tabs */}
      <div className="px-8 py-2 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 flex gap-4 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveTab(cat.id)}
            className={cn(
              "px-6 py-4 text-[10px] font-black uppercase tracking-widest transition-all border-b-2 flex items-center gap-2 whitespace-nowrap",
              activeTab === cat.id 
                ? "border-orange-500 text-orange-600 dark:text-orange-400" 
                : "border-transparent text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            )}
          >
            <cat.icon className="size-3.5" />
            {cat.label}
          </button>
        ))}
      </div>

      {/* Form Content */}
      <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {filteredSettings.length > 0 ? (
          <div className="grid grid-cols-1 gap-8">
            {filteredSettings.map((setting) => (
              <div key={setting.key} className="p-6 rounded-3xl border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30 hover:border-orange-100 dark:hover:border-orange-900/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 group">
                <div className="space-y-1 flex-1">
                  <h4 className="font-black text-sm text-slate-900 dark:text-white uppercase tracking-tight">{setting.key.replace(/_/g, " ")}</h4>
                  <p className="text-[10px] text-slate-400 font-medium italic leading-relaxed">{setting.description || "Global system variable."}</p>
                </div>
                
                <div className="flex items-center gap-4">
                  <SettingInput 
                    value={setting.value} 
                    onChange={(val) => handleUpdate(setting.key, val)}
                    isLoading={isSaving === setting.key}
                  />
                  <div className={cn(
                    "p-2 rounded-xl transition-all opacity-0 group-hover:opacity-100",
                    isSaving === setting.key ? "opacity-100" : ""
                  )}>
                    {isSaving === setting.key ? (
                        <Loader2 className="size-4 animate-spin text-orange-500" />
                    ) : (
                        <Save className="size-4 text-slate-300" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="py-20 text-center space-y-4">
            <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-full inline-block">
                <Settings className="size-8 text-slate-300 dark:text-slate-600" />
            </div>
            <p className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No settings configured for this category.</p>
          </div>
        )}
      </div>

      {/* Info Footer */}
      <div className="px-8 py-6 bg-slate-50/50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex items-center gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded-lg text-blue-500">
              <Info className="size-4" />
          </div>
          <p className="text-[9px] font-medium text-slate-400 leading-normal italic">
              Changes to system settings take effect immediately across all client-side rendering pools and server actions. Use with caution.
          </p>
      </div>
    </div>
  );
}

function SettingInput({ value, onChange, isLoading }: { value: any, onChange: (val: any) => void, isLoading: boolean }) {
  const [localValue, setLocalValue] = useState(value);

  if (typeof value === "boolean") {
    return (
        <button
            disabled={isLoading}
            onClick={() => onChange(!value)}
            className={cn(
                "w-14 h-8 rounded-full relative transition-all duration-300 border-2",
                value 
                    ? "bg-orange-500 border-orange-400 shadow-lg shadow-orange-500/20" 
                    : "bg-slate-200 dark:bg-slate-800 border-slate-100 dark:border-slate-700"
            )}
        >
            <div className={cn(
                "absolute top-1/2 -translate-y-1/2 size-5 bg-white rounded-full transition-all duration-300 shadow-sm",
                value ? "left-[calc(100%-1.6rem)]" : "left-1"
            )} />
        </button>
    );
  }

  return (
    <div className="relative">
        <input 
            disabled={isLoading}
            type={typeof value === "number" ? "number" : "text"}
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={(e) => {
                const val = typeof value === "number" ? parseFloat(e.target.value) : e.target.value;
                if (val !== value) onChange(val);
            }}
            className="px-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold outline-none focus:ring-1 focus:ring-orange-500/20 focus:border-orange-500 text-slate-900 dark:text-white min-w-[240px]"
        />
    </div>
  );
}
