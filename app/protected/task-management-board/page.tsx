export default function TaskManagementBoard() {
  return (
    <>
      
<div className="flex h-screen overflow-hidden">
{/*  Sidebar  */}

{/*  Main Content  */}
<div className="w-full flex-1 relative flex flex-col">
{/*  Top Header  */}

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
</div></div></>
  );
}