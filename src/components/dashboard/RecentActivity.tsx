'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface ActivityRow {
  id: string
  decision: 'approved' | 'revision_requested'
  decided_by: string
  decided_at: string
  pieces: {
    title: string
    projects: { name: string } | null
  } | null
}

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'agora'
  if (mins < 60) return `${mins} min atrás`
  const hours = Math.floor(mins / 60)
  if (hours < 24) return `${hours}h atrás`
  const days = Math.floor(hours / 24)
  return `${days} dia${days !== 1 ? 's' : ''} atrás`
}

function Avatar({ name }: { name: string }) {
  return (
    <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-semibold flex-shrink-0">
      {name.charAt(0).toUpperCase()}
    </div>
  )
}

export function RecentActivity() {
  const [rows, setRows] = useState<ActivityRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('approvals')
      .select('id, decision, decided_by, decided_at, pieces(title, projects(name))')
      .order('decided_at', { ascending: false })
      .limit(5)
      .then(({ data }) => {
        setRows((data ?? []) as unknown as ActivityRow[])
        setLoading(false)
      })
  }, [])

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-sm font-medium text-slate-500">Atividade recente</span>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-10 bg-slate-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : rows.length === 0 ? (
        <p className="text-sm text-slate-400 text-center py-4">Nenhuma atividade ainda</p>
      ) : (
        <ul className="space-y-3">
          {rows.map(row => {
            const isApproved = row.decision === 'approved'
            return (
              <li key={row.id} className="flex items-start gap-2">
                <Avatar name={row.decided_by} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-slate-800 leading-tight">
                    <span className="font-medium">{row.decided_by}</span>{' '}
                    <span className={isApproved ? 'text-green-600' : 'text-amber-600'}>
                      {isApproved ? 'aprovou' : 'pediu revisão'}
                    </span>
                  </p>
                  <p className="text-xs text-slate-400 truncate">{row.pieces?.title ?? '—'}</p>
                  <p className="text-xs text-slate-300">{relativeTime(row.decided_at)}</p>
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
