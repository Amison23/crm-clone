'use client';

export default function GlobalSaaSStats({ data }: { data: any }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <div className="p-6 bg-blue-600 text-white rounded-xl shadow-lg">
        <p className="text-blue-100 text-xs uppercase font-bold">Total Platform MRR</p>
        <p className="text-3xl font-bold">${data.total_mrr.toLocaleString()}</p>
      </div>
      <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
        <p className="text-gray-500 text-xs uppercase font-bold">Total Tenants</p>
        <p className="text-3xl font-bold text-gray-900">{data.tenant_count}</p>
      </div>
      {/* Additional platform stats here */}
    </div>
  );
}