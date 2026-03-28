interface DashboardCountersProps {
  total: number; approved: number; revision: number; pending: number
}

export function DashboardCounters({ total, approved, revision, pending }: DashboardCountersProps) {
  const items = [
    { label: 'Total de peças', subtitle: 'Todas as peças', value: total, color: 'text-slate-700', bg: 'bg-slate-50', icon: '📊' },
    { label: 'Aprovadas', subtitle: 'Cliente aprovou', value: approved, color: 'text-green-600', bg: 'bg-green-50', icon: '✅' },
    { label: 'Em revisão', subtitle: 'Ajustes solicitados', value: revision, color: 'text-amber-600', bg: 'bg-amber-50', icon: '↩' },
    { label: 'Pendentes', subtitle: 'Aguardando cliente', value: pending, color: 'text-slate-500', bg: 'bg-slate-50', icon: '⏳' },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {items.map(({ label, subtitle, value, color, bg, icon }) => (
        <div key={label} className={`${bg} border border-slate-200 rounded-lg p-3`}>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">{icon}</span>
            <span className="text-xs text-slate-500">{label}</span>
          </div>
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">{subtitle}</div>
        </div>
      ))}
    </div>
  )
}
