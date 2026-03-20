"use client";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";

export function Navbar() {
  return (
    <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-4 lg:px-6">
      
      {/* Mobile Sidebar Toggle (Placeholder) */}
      <div className="flex items-center gap-4 lg:hidden">
        <button className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white">
          <span className="material-symbols-outlined text-sm">dataset</span>
        </div>
      </div>

      <div className="hidden lg:flex items-center gap-4 flex-1">
        <div className="relative w-full max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
          <input 
            className="w-full rounded-lg border-none bg-slate-100 dark:bg-slate-800 pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary/50 transition-all outline-none text-slate-700 dark:text-slate-200" 
            placeholder="Search across tenants, clients, or tickets..." 
            type="text" 
          />
        </div>
      </div>
      
      <div className="flex items-center gap-2 lg:gap-3">
        <div className="flex items-center gap-1 lg:gap-2 mr-2">
          <ThemeSwitcher />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg relative transition-colors outline-none focus:ring-2 focus:ring-primary/50">
                <span className="material-symbols-outlined">notifications</span>
                <span className="absolute top-2 right-2 size-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuItem>New Ticket from Acme Corp</DropdownMenuItem>
              <DropdownMenuItem>Daily SLA Report ready</DropdownMenuItem>
              <DropdownMenuItem>System Update scheduled</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <button className="p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors">
            <span className="material-symbols-outlined">help</span>
          </button>
        </div>
        
        <div className="h-8 w-[1px] bg-slate-200 dark:bg-slate-800 hidden lg:block"></div>
        
        <div className="flex items-center gap-3 lg:pl-2">
          <button className="bg-primary text-white px-3 lg:px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-1 lg:gap-2 shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all">
            <span className="material-symbols-outlined text-lg">add</span>
            <span className="hidden sm:inline">Quick Action</span>
          </button>
        </div>
      </div>
    </header>
  );
}
