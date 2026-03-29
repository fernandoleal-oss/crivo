'use client'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface AIScoreBadgeProps {
  score: number | null
  issues: string[] | null
}

export function AIScoreBadge({ score, issues }: AIScoreBadgeProps) {
  const [open, setOpen] = useState(false)
  if (score === null || score === undefined) return null

  const color =
    score >= 80
      ? 'bg-green-100 text-green-700'
      : score >= 50
      ? 'bg-amber-100 text-amber-700'
      : 'bg-red-100 text-red-700'

  return (
    <div className="relative inline-flex" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span className={cn('inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-[10px] font-bold cursor-default', color)}>
        {score}
        <span className="text-[8px] opacity-70 ml-0.5">IA</span>
      </span>
      {open && issues && issues.length > 0 && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 w-48 bg-slate-900 text-white text-xs rounded-lg p-2.5 z-50 shadow-lg">
          <p className="font-semibold mb-1 text-[10px] uppercase tracking-wide text-slate-400">Problemas IA</p>
          <ul className="space-y-0.5">
            {issues.map((issue, i) => (
              <li key={i} className="flex items-start gap-1"><span className="text-amber-400 mt-0.5">·</span>{issue}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
