export default function TaskManagementBoard() {
  return (
    <>
      
<div className="flex h-screen overflow-hidden">
{/*  Sidebar  */}
<aside className="w-64 flex-shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col">
<div className="p-6 flex items-center gap-3">
<div className="bg-primary p-1.5 rounded-lg text-white">
<span className="material-symbols-outlined text-2xl">grid_view</span>
</div>
<h1 className="text-xl font-bold tracking-tight">TaskFlow</h1>
</div>
<nav className="flex-1 px-4 space-y-1">
<div className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
<span className="material-symbols-outlined">dashboard</span>
<span className="text-sm font-medium">Dashboard</span>
</div>
<div className="flex items-center gap-3 px-3 py-2 bg-primary/10 text-primary rounded-lg cursor-pointer">
<span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>check_box</span>
<span className="text-sm font-medium">Tasks</span>
</div>
<div className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
<span className="material-symbols-outlined">folder</span>
<span className="text-sm font-medium">Projects</span>
</div>
<div className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
<span className="material-symbols-outlined">group</span>
<span className="text-sm font-medium">Team</span>
</div>
</nav>
<div className="p-4 mt-auto border-t border-slate-200 dark:border-slate-800">
<div className="flex items-center gap-3 px-3 py-2 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg cursor-pointer">
<span className="material-symbols-outlined">settings</span>
<span className="text-sm font-medium">Settings</span>
</div>
<div className="mt-4 flex items-center gap-3 px-3 py-2">
<img alt="User Profile" className="w-8 h-8 rounded-full border border-slate-200 dark:border-slate-700" data-alt="Profile avatar of the current project manager user" src="https://ui-avatars.com/api/?name=User&background=random" />
<div className="flex flex-col overflow-hidden">
<p className="text-sm font-semibold truncate">Alex Rivera</p>
<p className="text-xs text-slate-500 truncate">Project Lead</p>
</div>
</div>
</div>
</aside>
{/*  Main Content  */}
<main className="flex-1 flex flex-col min-w-0 bg-background-light dark:bg-background-dark overflow-hidden">
{/*  Top Header  */}
<header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-8 shrink-0">
<div className="flex items-center gap-6">
<h2 className="text-lg font-bold">Engineering Board</h2>
<div className="relative w-64 group">
<span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">search</span>
<input className="w-full bg-slate-100 dark:bg-slate-800 border-none rounded-lg pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary" placeholder="Search tasks..." type="text" />
</div>
</div>
<div className="flex items-center gap-3">
<div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
<button className="px-3 py-1 bg-white dark:bg-slate-700 shadow-sm rounded-md text-slate-900 dark:text-white">
<span className="material-symbols-outlined text-lg align-middle">view_kanban</span>
</button>
<button className="px-3 py-1 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
<span className="material-symbols-outlined text-lg align-middle">view_list</span>
</button>
</div>
<button className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
<span className="material-symbols-outlined text-sm">add</span>
                    Add Task
                </button>
</div>
</header>
{/*  Board Section  */}
<div className="flex-1 overflow-x-auto p-8 scrollbar-hide">
<div className="flex gap-6 h-full min-w-max">
{/*  Column: To Do  */}
<div className="w-80 flex flex-col gap-4">
<div className="flex items-center justify-between px-1">
<div className="flex items-center gap-2">
<h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">To Do</h3>
<span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-bold">3</span>
</div>
<button className="text-slate-400 hover:text-slate-600 transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</div>
<div className="flex flex-col gap-3">
{/*  Task Card  */}
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-3">
<span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">High</span>
<span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm">link</span>
</div>
<h4 className="text-sm font-semibold mb-4 line-clamp-2">Update API documentation for v2.4 release</h4>
<div className="flex items-center justify-between mt-auto">
<div className="flex items-center gap-1.5 text-slate-500 text-xs">
<span className="material-symbols-outlined text-sm">calendar_today</span>
<span>Oct 25</span>
</div>
<div className="flex -space-x-2">
<img alt="Assignee" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900" data-alt="Team member avatar circle profile photo" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
</div>
</div>
{/*  Task Card  */}
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 hover:border-primary transition-all cursor-pointer group">
<div className="flex justify-between items-start mb-3">
<span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">Medium</span>
<span className="material-symbols-outlined text-slate-300 group-hover:text-primary text-sm">confirmation_number</span>
</div>
<h4 className="text-sm font-semibold mb-4 line-clamp-2">Fix sidebar responsive layout on tablet devices</h4>
<div className="flex items-center justify-between mt-auto">
<div className="flex items-center gap-1.5 text-slate-500 text-xs">
<span className="material-symbols-outlined text-sm">calendar_today</span>
<span>Oct 27</span>
</div>
<div className="flex -space-x-2">
<img alt="Assignee" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900" data-alt="Team member avatar circle profile photo" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
</div>
</div>
</div>
</div>
{/*  Column: In Progress  */}
<div className="w-80 flex flex-col gap-4">
<div className="flex items-center justify-between px-1">
<div className="flex items-center gap-2">
<h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">In Progress</h3>
<span className="bg-primary/20 text-primary px-2 py-0.5 rounded-full text-xs font-bold">2</span>
</div>
<button className="text-slate-400 hover:text-slate-600 transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</div>
<div className="flex flex-col gap-3">
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 border-l-4 border-l-primary">
<div className="flex justify-between items-start mb-3">
<span className="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">High</span>
<span className="material-symbols-outlined text-slate-300 text-sm">confirmation_number</span>
</div>
<h4 className="text-sm font-semibold mb-4 line-clamp-2">Refactor authentication middleware</h4>
<div className="flex items-center justify-between mt-auto">
<div className="flex items-center gap-1.5 text-slate-500 text-xs">
<span className="material-symbols-outlined text-sm">calendar_today</span>
<span>Oct 24</span>
</div>
<div className="flex -space-x-2">
<img alt="Assignee" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900" data-alt="Team member avatar circle profile photo" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
</div>
</div>
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
<div className="flex justify-between items-start mb-3">
<span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Low</span>
<span className="material-symbols-outlined text-slate-300 text-sm">link</span>
</div>
<h4 className="text-sm font-semibold mb-4 line-clamp-2">New client onboarding flow mockups</h4>
<div className="flex items-center justify-between mt-auto">
<div className="flex items-center gap-1.5 text-slate-500 text-xs">
<span className="material-symbols-outlined text-sm">calendar_today</span>
<span>Oct 30</span>
</div>
<div className="flex -space-x-2">
<img alt="Assignee" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900" data-alt="Team member avatar circle profile photo" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
</div>
</div>
</div>
</div>
{/*  Column: Review  */}
<div className="w-80 flex flex-col gap-4">
<div className="flex items-center justify-between px-1">
<div className="flex items-center gap-2">
<h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Review</h3>
<span className="bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full text-xs font-bold">1</span>
</div>
<button className="text-slate-400 hover:text-slate-600 transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</div>
<div className="flex flex-col gap-3">
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
<div className="flex justify-between items-start mb-3">
<span className="bg-primary/10 text-primary text-[10px] font-bold px-2 py-0.5 rounded uppercase">Medium</span>
<span className="material-symbols-outlined text-slate-300 text-sm">link</span>
</div>
<h4 className="text-sm font-semibold mb-4 line-clamp-2">Integration tests for payment gateway</h4>
<div className="flex items-center justify-between mt-auto">
<div className="flex items-center gap-1.5 text-slate-500 text-xs">
<span className="material-symbols-outlined text-sm">calendar_today</span>
<span>Oct 22</span>
</div>
<div className="flex -space-x-2">
<img alt="Assignee" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900" data-alt="Team member avatar circle profile photo" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
</div>
</div>
</div>
</div>
{/*  Column: Completed  */}
<div className="w-80 flex flex-col gap-4">
<div className="flex items-center justify-between px-1">
<div className="flex items-center gap-2">
<h3 className="font-bold text-sm uppercase tracking-wider text-slate-500">Completed</h3>
<span className="bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 px-2 py-0.5 rounded-full text-xs font-bold">4</span>
</div>
<button className="text-slate-400 hover:text-slate-600 transition-colors">
<span className="material-symbols-outlined">more_horiz</span>
</button>
</div>
<div className="flex flex-col gap-3 opacity-75">
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
<div className="flex justify-between items-start mb-3">
<span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Medium</span>
<span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
</div>
<h4 className="text-sm font-semibold mb-4 line-clamp-2 line-through text-slate-500">Dashboard analytics bugfix</h4>
<div className="flex items-center justify-between mt-auto">
<div className="flex items-center gap-1.5 text-slate-400 text-xs">
<span className="material-symbols-outlined text-sm">calendar_today</span>
<span>Oct 18</span>
</div>
<div className="flex -space-x-2">
<img alt="Assignee" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900" data-alt="Team member avatar circle profile photo" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
</div>
</div>
<div className="bg-white dark:bg-slate-900 p-4 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800">
<div className="flex justify-between items-start mb-3">
<span className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-500 text-[10px] font-bold px-2 py-0.5 rounded uppercase">Low</span>
<span className="material-symbols-outlined text-green-500 text-sm">check_circle</span>
</div>
<h4 className="text-sm font-semibold mb-4 line-clamp-2 line-through text-slate-500">Update company brand assets</h4>
<div className="flex items-center justify-between mt-auto">
<div className="flex items-center gap-1.5 text-slate-400 text-xs">
<span className="material-symbols-outlined text-sm">calendar_today</span>
<span>Oct 15</span>
</div>
<div className="flex -space-x-2">
<img alt="Assignee" className="w-6 h-6 rounded-full ring-2 ring-white dark:ring-slate-900" data-alt="Team member avatar circle profile photo" src="https://ui-avatars.com/api/?name=User&background=random" />
</div>
</div>
</div>
</div>
</div>
{/*  Add New Column  */}
<div className="w-80 flex flex-col gap-4">
<button className="flex items-center justify-center gap-2 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl h-24 text-slate-400 hover:border-primary hover:text-primary transition-all">
<span className="material-symbols-outlined">add</span>
<span className="text-sm font-semibold">New Column</span>
</button>
</div>
</div>
</div>
</main>
</div>

    </>
  );
}