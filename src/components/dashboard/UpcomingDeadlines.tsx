'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface DeadlinePiece {
  id: string
  title: string
  deadline: string
  status: string
  project_id: string
  projects: { name: string } | null
}

function getDaysRemaining(deadline: string): number {
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const d = new Date(deadline)
  d.setHours(0, 0, 0, 0)
  return Math.round((d.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
}

function Badge({ days }: { days: number }) {
  if (days <= 0) {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">Hoje</span>
  }
  if (days <= 2) {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-red-50 text-red-600 font-medium">Urgente</span>
  }
  if (days <= 5) {
    return <span className="text-xs px-2 py-0.5 rounded-full bg-amber-50 text-amber-600 font-medium">{days} dias</span>
  }
  return <span className="text-xs px-2 py-0.5 rounded-full bg-slate-50 text-slate-500 font-medium">{days} dias</span>
}

export function UpcomingDeadlines() {
  const [pieces, setPieces] = useState<DeadlinePiece[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]
    supabase
      .from('pieces')
      .select('id, title, deadline, status, project_id, projects(name)')
      .not('deadline', 'is', null)
      .gte('deadline', today)
      .order('deadline', { ascending: true })
      .limit(5)
      .then(({ data }) => {
        setPieces((data ?? []) as unknown as DeadlinePiece[])
        setLoading(false)
      })
  }, [])

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        <span className="text-sm font-medium text-slate-500">Próximas entregas</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : pieces.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">Sem entregas próximas</p>
      ) : (
        <ul className="space-y-2">
          {pieces.map(piece => {
            const days = getDaysRemaining(piece.deadline)
            return (
              <li key={piece.id} className="flex items-center justify-between gap-2 py-1">
                <div className="min-w-0">
                  <p className="text-sm text-slate-800 font-medium truncate">{piece.title}</p>
                  <p className="text-xs text-slate-400 truncate">{piece.projects?.name ?? '—'}</p>
                </div>
                <Badge days={days} />
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
