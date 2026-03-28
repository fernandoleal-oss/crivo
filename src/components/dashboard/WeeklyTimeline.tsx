'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'

interface DeadlinePiece {
  id: string
  title: string
  deadline: string
  status: string
  projects: { name: string } | null
}

const STATUS_COLORS: Record<string, string> = {
  approved: 'bg-green-100 text-green-800 border-green-200',
  revision_requested: 'bg-violet-100 text-violet-800 border-violet-200',
  pending: 'bg-yellow-100 text-yellow-800 border-yellow-200',
}

const STATUS_LABEL: Record<string, string> = {
  approved: 'Aprovada',
  revision_requested: 'Revisão',
  pending: 'Pendente',
}

function getWeekDays(): { date: Date; label: string; iso: string }[] {
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun
  // Start from Monday of current week
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))

  const days = []
  const DAY_LABELS = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom']
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday)
    d.setDate(monday.getDate() + i)
    days.push({
      date: d,
      label: DAY_LABELS[i],
      iso: d.toISOString().split('T')[0],
    })
  }
  return days
}

export function WeeklyTimeline() {
  const [pieces, setPieces] = useState<DeadlinePiece[]>([])
  const [loading, setLoading] = useState(true)
  const weekDays = getWeekDays()
  const todayIso = new Date().toISOString().split('T')[0]

  useEffect(() => {
    const supabase = createClient()
    const start = weekDays[0].iso
    const end = weekDays[6].iso
    supabase
      .from('pieces')
      .select('id, title, deadline, status, projects(name)')
      .not('deadline', 'is', null)
      .gte('deadline', start)
      .lte('deadline', end)
      .order('deadline', { ascending: true })
      .then(({ data }) => {
        setPieces((data ?? []) as unknown as DeadlinePiece[])
        setLoading(false)
      })
  }, [])

  const piecesByDay = weekDays.map(day => ({
    ...day,
    pieces: pieces.filter(p => p.deadline === day.iso),
  }))

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 mb-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-slate-700">Timeline da semana</h2>
        <span className="text-xs text-slate-400">
          {weekDays[0].date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })} –{' '}
          {weekDays[6].date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="h-24 bg-slate-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {piecesByDay.map(({ label, iso, date, pieces: dayPieces }) => {
            const isToday = iso === todayIso
            return (
              <div key={iso} className="flex flex-col gap-1.5">
                {/* Day header */}
                <div className={cn(
                  'text-center rounded-xl py-1.5 mb-0.5',
                  isToday ? 'bg-slate-900 text-white' : 'bg-transparent'
                )}>
                  <p className={cn('text-[10px] font-semibold', isToday ? 'text-slate-300' : 'text-slate-400')}>
                    {label}
                  </p>
                  <p className={cn('text-sm font-bold', isToday ? 'text-white' : 'text-slate-700')}>
                    {date.getDate()}
                  </p>
                </div>

                {/* Piece cards */}
                {dayPieces.length === 0 ? (
                  <div className="h-14 rounded-xl border border-dashed border-slate-200" />
                ) : (
                  dayPieces.map(piece => (
                    <div
                      key={piece.id}
                      className={cn(
                        'rounded-xl border px-2 py-1.5 text-left cursor-default',
                        STATUS_COLORS[piece.status] ?? 'bg-slate-50 text-slate-700 border-slate-200'
                      )}
                    >
                      <p className="text-[10px] font-semibold leading-tight truncate">{piece.title}</p>
                      <p className="text-[9px] mt-0.5 opacity-70 truncate">{piece.projects?.name ?? '—'}</p>
                      <span className="text-[9px] font-semibold mt-1 block opacity-80">
                        {STATUS_LABEL[piece.status] ?? piece.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
