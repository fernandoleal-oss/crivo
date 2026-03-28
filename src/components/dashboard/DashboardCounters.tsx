import { CheckCircle2, RefreshCw, Clock, TrendingUp } from 'lucide-react'

interface DashboardCountersProps {
  total: number; approved: number; revision: number; pending: number
}

export function DashboardCounters({ total, approved, revision, pending }: DashboardCountersProps) {
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
      {/* Hero card escuro */}
      <div className="lg:col-span-1 bg-slate-900 rounded-2xl p-6 text-white flex flex-col justify-between min-h-[140px]">
        <div className="flex items-center justify-between mb-4">
          <span className="text-slate-400 text-sm font-medium">Total de peças</span>
          <TrendingUp size={16} className="text-slate-500" />
        </div>
        <div>
          <div className="text-5xl font-bold tracking-tight">{total}</div>
          <div className="text-slate-400 text-sm mt-1">
            {approvalRate}% taxa de aprovação
          </div>
        </div>
      </div>

      {/* Cards claros */}
      <div className="lg:col-span-2 grid grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-green-50 rounded-lg flex items-center justify-center">
              <CheckCircle2 size={14} className="text-green-600" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Aprovadas</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{approved}</div>
          <div className="text-[11px] text-slate-400 mt-1">Cliente aprovou</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-amber-50 rounded-lg flex items-center justify-center">
              <RefreshCw size={14} className="text-amber-600" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Em revisão</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{revision}</div>
          <div className="text-[11px] text-slate-400 mt-1">Ajustes pedidos</div>
        </div>

        <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 bg-stone-50 rounded-lg flex items-center justify-center">
              <Clock size={14} className="text-slate-500" />
            </div>
            <span className="text-xs text-slate-500 font-medium">Pendentes</span>
          </div>
          <div className="text-3xl font-bold text-slate-900">{pending}</div>
          <div className="text-[11px] text-slate-400 mt-1">Aguardando cliente</div>
        </div>
      </div>
    </div>
  )
}
