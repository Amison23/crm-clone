export function SubscribedPackages({ client, company }: { client: boolean; company: any }) {
  // software is an array of strings, e.g. ["CRM", "LMS"]
  // If not present in company object, we'll use a placeholder or empty array
  const software = company.subscribed_packages || ["LMS", "CRM"]

  return (
    <div className="flex flex-wrap gap-1.5 mb-4">
      {software.map((s: string) => (
        <span
          key={s}
          className="px-2 py-0.5 bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-[10px] font-bold rounded-full border border-slate-100 dark:border-slate-800 transition-colors hover:border-indigo-200 dark:hover:border-indigo-700/50"
        >
          {s}
        </span>
      ))}
    </div>
  )
}