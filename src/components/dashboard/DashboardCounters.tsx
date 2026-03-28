import { CheckCircle2, RefreshCw, Clock, TrendingUp } from 'lucide-react'

interface DashboardCountersProps {
  total: number; approved: number; revision: number; pending: number
}

export function DashboardCounters({ total, approved, revision, pending }: DashboardCountersProps) {
  const approvalRate = total > 0 ? Math.round((approved / total) * 100) : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total — amarelo pastel */}
      <div className="bg-yellow-100 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 bg-yellow-200 rounded-xl flex items-center justify-center">
            <TrendingUp size={15} className="text-yellow-700" />
          </div>
          <span className="text-[11px] font-semibold text-yellow-700 bg-yellow-200 rounded-full px-2 py-0.5">
            {approvalRate}%
          </span>
        </div>
        <div>
          <div className="text-3xl font-bold text-slate-900">{total}</div>
          <div className="text-xs text-yellow-700 font-medium mt-0.5">Total de peças</div>
        </div>
      </div>

      {/* Aprovadas — verde pastel */}
      <div className="bg-green-100 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 bg-green-200 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={15} className="text-green-700" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-slate-900">{approved}</div>
          <div className="text-xs text-green-700 font-medium mt-0.5">Aprovadas</div>
        </div>
      </div>

      {/* Em revisão — roxo pastel */}
      <div className="bg-violet-100 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 bg-violet-200 rounded-xl flex items-center justify-center">
            <RefreshCw size={15} className="text-violet-700" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-slate-900">{revision}</div>
          <div className="text-xs text-violet-700 font-medium mt-0.5">Em revisão</div>
        </div>
      </div>

      {/* Pendentes — azul pastel */}
      <div className="bg-sky-100 rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="w-8 h-8 bg-sky-200 rounded-xl flex items-center justify-center">
            <Clock size={15} className="text-sky-700" />
          </div>
        </div>
        <div>
          <div className="text-3xl font-bold text-slate-900">{pending}</div>
          <div className="text-xs text-sky-700 font-medium mt-0.5">Aguardando cliente</div>
        </div>
      </div>
    </div>
  )
}
