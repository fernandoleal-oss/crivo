'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { TrendingUp, Clock } from 'lucide-react'

interface ApprovalRow {
  decision: 'approved' | 'revision_requested'
  decided_at: string
  decided_by: string
  pieces: { title: string; projects: { name: string } | null } | null
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins}min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  return `${Math.floor(hours / 24)}d atrás`
}

function MiniBarChart({ bars }: { bars: { height: number; color: string }[] }) {
  return (
    <div className="flex items-end gap-1 h-14">
      {bars.map((b, i) => (
        <div
          key={i}
          className={`flex-1 rounded-t-md ${b.color} transition-all`}
          style={{ height: `${b.height}%` }}
        />
      ))}
    </div>
  )
}

export function ActivityPanel({ totalPieces, approvedPieces }: { totalPieces: number; approvedPieces: number }) {
  const [activity, setActivity] = useState<ApprovalRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('approvals')
      .select('decision, decided_at, decided_by, pieces(title, projects(name))')
      .order('decided_at', { ascending: false })
      .limit(8)
      .then(({ data }) => {
        setActivity((data ?? []) as unknown as ApprovalRow[])
        setLoading(false)
      })
  }, [])

  const approvalRate = totalPieces > 0 ? Math.round((approvedPieces / totalPieces) * 100) : 0

  // Build last-7-days bar chart data
  const today = new Date()
  const bars = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    const iso = d.toISOString().split('T')[0]
    const count = activity.filter(a => a.decided_at.startsWith(iso)).length
    const colors = ['bg-green-400', 'bg-rose-400', 'bg-orange-400']
    return { height: Math.max(10, count * 30), color: colors[i % 3] }
  })

  const weekLabels = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  const todayIdx = ((today.getDay() + 6) % 7) // 0=Mon

  return (
    <div className="w-72 flex-shrink-0 flex flex-col gap-4">
      {/* Taxa de aprovação — verde-lima */}
      <div className="bg-[#c8e56d] rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-[#3a5a00]">Taxa de aprovação</span>
          <span className="text-xs font-bold text-[#3a5a00] bg-[#b4d44a] px-2 py-0.5 rounded-full">
            +{approvalRate > 50 ? '3' : '1'}%
          </span>
        </div>
        <div className="flex items-end gap-3">
          <span className="text-4xl font-bold text-[#2a4600]">{approvalRate}%</span>
        </div>
        {/* mini wave */}
        <div className="mt-3 flex items-end gap-0.5 h-8">
          {[40, 55, 45, 70, 60, 80, approvalRate].map((h, i) => (
            <div key={i} className="flex-1 rounded-sm bg-[#a8d43a]/60" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>

      {/* Progresso geral — indigo */}
      <div className="bg-indigo-100 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-1">
          <span className="text-sm font-semibold text-indigo-800">Progresso geral</span>
          <span className="text-xs font-bold text-indigo-600 bg-indigo-200 px-2 py-0.5 rounded-full">+7%</span>
        </div>
        <div className="flex items-center gap-4 mt-2">
          {/* Radial progress */}
          <div className="relative w-14 h-14">
            <svg viewBox="0 0 56 56" className="w-14 h-14 -rotate-90">
              <circle cx="28" cy="28" r="22" fill="none" stroke="#c7d2fe" strokeWidth="6" />
              <circle
                cx="28" cy="28" r="22" fill="none" stroke="#4f46e5" strokeWidth="6"
                strokeDasharray={`${(approvalRate / 100) * 138.2} 138.2`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-indigo-800">
              {approvalRate}%
            </span>
          </div>
          <div>
            <p className="text-2xl font-bold text-indigo-900">{approvedPieces}</p>
            <p className="text-xs text-indigo-600">de {totalPieces} peças</p>
          </div>
        </div>
      </div>

      {/* Atividade semanal */}
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 flex-1">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-slate-700">Atividade semanal</span>
          <Clock size={14} className="text-slate-400" />
        </div>

        {/* Mini week calendar */}
        <div className="grid grid-cols-7 gap-1 mb-3">
          {weekLabels.map((d, i) => (
            <div key={d} className="text-center">
              <p className="text-[9px] text-slate-400 mb-1">{d}</p>
              <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center text-[10px] font-semibold ${
                i === todayIdx ? 'bg-slate-900 text-white' : 'text-slate-500'
              }`}>
                {(() => { const d2 = new Date(today); d2.setDate(today.getDate() - todayIdx + i); return d2.getDate() })()}
              </div>
            </div>
          ))}
        </div>

        {/* Bar chart */}
        <MiniBarChart bars={bars} />
        <div className="flex justify-between mt-1">
          {weekLabels.map(d => (
            <span key={d} className="text-[9px] text-slate-400 flex-1 text-center">{d}</span>
          ))}
        </div>

        {/* Recent activity */}
        <div className="mt-4 space-y-2">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Recente</p>
          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map(i => <div key={i} className="h-8 bg-slate-100 rounded-lg animate-pulse" />)}
            </div>
          ) : activity.slice(0, 3).map((a, i) => (
            <div key={i} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 ${
                a.decision === 'approved' ? 'bg-green-100 text-green-700' : 'bg-rose-100 text-rose-700'
              }`}>
                {a.decided_by.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-slate-700 truncate font-medium">{a.pieces?.title ?? '—'}</p>
                <p className="text-[10px] text-slate-400">{relativeTime(a.decided_at)}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
