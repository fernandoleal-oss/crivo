'use client'

import { useState } from 'react'
import { Sparkles } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

interface ScoreConfig {
  label: string
  color: string
  trackColor: string
  bgColor: string
  textColor: string
  badgeBg: string
  badgeText: string
}

function getScoreConfig(score: number): ScoreConfig {
  if (score >= 80) {
    return {
      label: 'Pronto para aprovação',
      color: '#10B981',
      trackColor: 'stroke-emerald-500',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      badgeBg: 'bg-emerald-100',
      badgeText: 'text-emerald-700',
    }
  }
  if (score >= 50) {
    return {
      label: 'Revisar antes de enviar',
      color: '#F59E0B',
      trackColor: 'stroke-amber-400',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      badgeBg: 'bg-amber-100',
      badgeText: 'text-amber-700',
    }
  }
  return {
    label: 'Atenção necessária',
    color: '#EF4444',
    trackColor: 'stroke-red-500',
    bgColor: 'bg-red-50',
    textColor: 'text-red-700',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
  }
}

interface AIReviewScoreBadgeProps {
  score: number
  issues?: string[]
  size?: 'sm' | 'md'
  className?: string
}

const RADIUS = 18
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export function AIReviewScoreBadge({
  score,
  issues = [],
  size = 'md',
  className,
}: AIReviewScoreBadgeProps) {
  const [showTooltip, setShowTooltip] = useState(false)
  const cfg = getScoreConfig(score)

  const clampedScore = Math.max(0, Math.min(100, score))
  const dashOffset = CIRCUMFERENCE - (clampedScore / 100) * CIRCUMFERENCE

  const svgSize = size === 'sm' ? 44 : 52
  const cx = svgSize / 2
  const cy = svgSize / 2

  return (
    <div
      className={cn('relative inline-flex flex-col items-center', className)}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      {/* Radial score circle */}
      <div className="relative">
        <svg
          width={svgSize}
          height={svgSize}
          className="-rotate-90"
          aria-label={`Score de prontidão: ${score}`}
        >
          {/* Track */}
          <circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            strokeWidth={size === 'sm' ? 3 : 3.5}
            className="stroke-slate-200"
          />
          {/* Progress */}
          <motion.circle
            cx={cx}
            cy={cy}
            r={RADIUS}
            fill="none"
            strokeWidth={size === 'sm' ? 3 : 3.5}
            strokeLinecap="round"
            stroke={cfg.color}
            strokeDasharray={CIRCUMFERENCE}
            initial={{ strokeDashoffset: CIRCUMFERENCE }}
            animate={{ strokeDashoffset: dashOffset }}
            transition={{ duration: 0.8, ease: 'easeOut', delay: 0.1 }}
          />
        </svg>

        {/* Center score number */}
        <div className="absolute inset-0 flex flex-col items-center justify-center rotate-0">
          <span
            className={cn(
              'font-bold leading-none tabular-nums',
              size === 'sm' ? 'text-[11px]' : 'text-[13px]',
              cfg.textColor,
            )}
          >
            {clampedScore}
          </span>
        </div>

        {/* Sparkles AI badge */}
        <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow ring-1 ring-slate-200">
          <Sparkles className="h-2.5 w-2.5 text-indigo-400" />
        </span>
      </div>

      {/* Label */}
      <span
        className={cn(
          'mt-1.5 rounded-full px-2 py-0.5 text-center font-medium leading-tight',
          size === 'sm' ? 'text-[10px]' : 'text-[11px]',
          cfg.badgeBg,
          cfg.badgeText,
        )}
      >
        {cfg.label}
      </span>

      {/* Tooltip */}
      <AnimatePresence>
        {showTooltip && issues.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 4, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.12 }}
            className="absolute bottom-full left-1/2 z-50 mb-2 w-56 -translate-x-1/2 rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/60"
          >
            {/* Pointer */}
            <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-slate-200 bg-white" />

            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
              Issues detectados
            </p>
            <ul className="space-y-1.5">
              {issues.map((issue, i) => (
                <li
                  key={i}
                  className="flex items-start gap-1.5 text-[12px] text-slate-600"
                >
                  <span className={cn('mt-0.5 h-1.5 w-1.5 flex-shrink-0 rounded-full', cfg.bgColor, 'ring-1', cfg.textColor.replace('text-', 'ring-'))} />
                  {issue}
                </li>
              ))}
            </ul>
            <p className="mt-2.5 text-[10px] text-slate-400">
              ✦ Análise gerada por IA
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
