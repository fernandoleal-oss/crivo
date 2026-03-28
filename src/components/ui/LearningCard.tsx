'use client'

import {
  BookOpen,
  ExternalLink,
  Palette,
  BarChart2,
  Video,
  Clock,
  ChevronRight,
} from 'lucide-react'
import { cn } from '@/lib/utils'

export type LearningCardType = 'internal' | 'external'
export type LearningLevel = 'Iniciante' | 'Intermediário' | 'Avançado'
export type LearningRole = 'CEO' | 'Criação' | 'Mídia'
export type LearningSector = 'criacao' | 'midia' | 'rtv'

interface LevelConfig {
  bg: string
  text: string
}

const LEVEL_CONFIG: Record<LearningLevel, LevelConfig> = {
  Iniciante: { bg: 'bg-emerald-100', text: 'text-emerald-700' },
  Intermediário: { bg: 'bg-amber-100', text: 'text-amber-700' },
  Avançado: { bg: 'bg-red-100', text: 'text-red-700' },
}

const ROLE_CONFIG: Record<LearningRole, { bg: string; text: string }> = {
  CEO: { bg: 'bg-indigo-100', text: 'text-indigo-700' },
  Criação: { bg: 'bg-violet-100', text: 'text-violet-700' },
  Mídia: { bg: 'bg-orange-100', text: 'text-orange-700' },
}

const SECTOR_ICON: Record<LearningSector, React.ElementType> = {
  criacao: Palette,
  midia: BarChart2,
  rtv: Video,
}

export interface LearningCardProps {
  type: LearningCardType
  sector: LearningSector
  title: string
  description: string
  level: LearningLevel
  duration: string
  targetRole: LearningRole
  source?: string
  href: string
  className?: string
}

export function LearningCard({
  type,
  sector,
  title,
  description,
  level,
  duration,
  targetRole,
  source,
  href,
  className,
}: LearningCardProps) {
  const SectorIcon = SECTOR_ICON[sector]
  const levelCfg = LEVEL_CONFIG[level]
  const roleCfg = ROLE_CONFIG[targetRole]

  const isInternal = type === 'internal'

  return (
    <div
      className={cn(
        'group flex flex-col overflow-hidden rounded-xl border transition-shadow duration-200 hover:shadow-md',
        isInternal
          ? 'bg-indigo-50 border-indigo-200'
          : 'bg-slate-50 border-slate-200',
        className,
      )}
    >
      {/* Header strip */}
      <div
        className={cn(
          'flex items-center gap-2 px-4 py-2.5',
          isInternal ? 'bg-indigo-100/60' : 'bg-slate-100/60',
        )}
      >
        {/* Type badge */}
        {isInternal ? (
          <span className="flex items-center gap-1 rounded-full bg-indigo-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            <BookOpen className="h-2.5 w-2.5" />
            Guia Crivo
          </span>
        ) : (
          <span className="flex items-center gap-1 rounded-full bg-slate-700 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
            <ExternalLink className="h-2.5 w-2.5" />
            {source ?? 'Externo'}
          </span>
        )}

        {/* Sector icon */}
        <SectorIcon
          className={cn(
            'ml-auto h-4 w-4',
            isInternal ? 'text-indigo-400' : 'text-slate-400',
          )}
        />
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="text-[14px] font-bold leading-snug text-slate-900">
          {title}
        </h3>
        <p className="line-clamp-2 text-[12px] leading-relaxed text-slate-600">
          {description}
        </p>

        {/* Tags row */}
        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-2">
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
              levelCfg.bg,
              levelCfg.text,
            )}
          >
            {level}
          </span>
          <span
            className={cn(
              'rounded-full px-2 py-0.5 text-[10px] font-semibold',
              roleCfg.bg,
              roleCfg.text,
            )}
          >
            {targetRole}
          </span>
          <span className="ml-auto flex items-center gap-1 text-[11px] text-slate-500">
            <Clock className="h-3 w-3" />
            {duration}
          </span>
        </div>
      </div>

      {/* CTA */}
      <div className={cn('border-t px-4 py-3', isInternal ? 'border-indigo-200' : 'border-slate-200')}>
        <a
          href={href}
          target={isInternal ? '_self' : '_blank'}
          rel="noopener noreferrer"
          className={cn(
            'flex w-full items-center justify-center gap-1.5 rounded-lg py-2 text-[13px] font-semibold transition-colors',
            isInternal
              ? 'bg-indigo-600 text-white hover:bg-indigo-700'
              : 'bg-slate-800 text-white hover:bg-slate-900',
          )}
        >
          {isInternal ? 'Começar' : 'Abrir'}
          <ChevronRight className="h-3.5 w-3.5" />
        </a>
      </div>
    </div>
  )
}
