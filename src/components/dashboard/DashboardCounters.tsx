interface DashboardCountersProps {
  total: number; approved: number; revision: number; pending: number
}

export function DashboardCounters({ total, approved, revision, pending }: DashboardCountersProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Total de peças', value: total, color: 'text-slate-700' },
        { label: 'Aprovadas', value: approved, color: 'text-green-600' },
        { label: 'Em revisão', value: revision, color: 'text-amber-600' },
        { label: 'Pendentes', value: pending, color: 'text-slate-500' },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-xs text-slate-500 mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  )
}
