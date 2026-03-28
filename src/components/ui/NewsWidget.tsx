'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp, ExternalLink } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

export type NewsSource = 'M&M' | 'CC' | 'AdAge' | 'Meio' | 'Propmark'
export type NewsCategory = 'Criação' | 'Mídia' | 'Prêmios' | 'Tecnologia'

export interface NewsItem {
  id: string
  source: NewsSource
  headline: string
  aiSummary: string
  category: NewsCategory
  hoursAgo: number
  url: string
}

interface SourceBadgeConfig {
  label: string
  bg: string
  text: string
}

const SOURCE_CONFIG: Record<NewsSource, SourceBadgeConfig> = {
  'M&M': { label: 'M&M', bg: 'bg-blue-600', text: 'text-white' },
  'CC': { label: 'CC', bg: 'bg-emerald-600', text: 'text-white' },
  'AdAge': { label: 'AdAge', bg: 'bg-red-600', text: 'text-white' },
  'Meio': { label: 'Meio', bg: 'bg-purple-600', text: 'text-white' },
  'Propmark': { label: 'PM', bg: 'bg-slate-700', text: 'text-white' },
}

const CATEGORY_CONFIG: Record<NewsCategory, string> = {
  Criação: 'bg-violet-100 text-violet-700',
  Mídia: 'bg-orange-100 text-orange-700',
  Prêmios: 'bg-yellow-100 text-yellow-700',
  Tecnologia: 'bg-cyan-100 text-cyan-700',
}

/* ── Skeleton ─────────────────────────────────────────────────── */
function NewsSkeletonCard() {
  return (
    <div className="animate-pulse space-y-2 px-4 py-3">
      <div className="flex items-center gap-2">
        <div className="h-5 w-8 rounded bg-slate-200" />
        <div className="h-3 w-20 rounded bg-slate-200" />
      </div>
      <div className="h-3.5 w-full rounded bg-slate-200" />
      <div className="h-3.5 w-4/5 rounded bg-slate-200" />
      <div className="h-3 w-3/5 rounded bg-slate-100" />
    </div>
  )
}

/* ── Single card ──────────────────────────────────────────────── */
function NewsCard({ item }: { item: NewsItem }) {
  const src = SOURCE_CONFIG[item.source]
  return (
    <div className="border-b border-slate-100 px-4 py-3 last:border-0 hover:bg-slate-50/70 transition-colors">
      {/* Row 1: source + category + time */}
      <div className="flex items-center gap-2 mb-1.5">
        <span
          className={cn(
            'flex h-5 items-center rounded px-1.5 text-[10px] font-bold tracking-wide',
            src.bg,
            src.text,
          )}
        >
          {src.label}
        </span>
        <span
          className={cn(
            'rounded-full px-2 py-0.5 text-[10px] font-semibold',
            CATEGORY_CONFIG[item.category],
          )}
        >
          {item.category}
        </span>
        <span className="ml-auto text-[11px] text-slate-400">
          Há {item.hoursAgo}h
        </span>
      </div>

      {/* Headline */}
      <p className="line-clamp-2 text-[13px] font-semibold leading-snug text-slate-800">
        {item.headline}
      </p>

      {/* AI summary */}
      <p className="mt-1 line-clamp-1 text-[12px] italic text-slate-500">
        {item.aiSummary}
      </p>

      {/* Read more */}
      <a
        href={item.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-1.5 inline-flex items-center gap-1 text-[12px] font-medium text-indigo-600 hover:text-indigo-800 transition-colors"
      >
        Ler mais
        <ExternalLink className="h-3 w-3" />
      </a>
    </div>
  )
}

/* ── Widget ───────────────────────────────────────────────────── */
export interface NewsWidgetProps {
  items?: NewsItem[]
  loading?: boolean
  newCount?: number
  className?: string
}

const VISIBLE_DEFAULT = 5

export function NewsWidget({
  items = [],
  loading = false,
  newCount = 0,
  className,
}: NewsWidgetProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const visible = expanded ? items : items.slice(0, VISIBLE_DEFAULT)

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden',
        className,
      )}
    >
      {/* Header */}
      <button
        onClick={() => setCollapsed((v) => !v)}
        className="flex w-full items-center gap-2 border-b border-slate-100 px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-[13px]">📰</span>
        <span className="flex-1 text-[13px] font-semibold text-slate-800">
          Mercado Publicitário
        </span>
        {newCount > 0 && (
          <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-[10px] font-bold text-white">
            {newCount} nova{newCount > 1 ? 's' : ''}
          </span>
        )}
        {collapsed ? (
          <ChevronDown className="h-4 w-4 text-slate-400" />
        ) : (
          <ChevronUp className="h-4 w-4 text-slate-400" />
        )}
      </button>

      {/* Body */}
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            {loading ? (
              <>
                <NewsSkeletonCard />
                <NewsSkeletonCard />
                <NewsSkeletonCard />
              </>
            ) : items.length === 0 ? (
              <div className="px-4 py-6 text-center text-[13px] text-slate-400">
                Nenhuma novidade no momento.
              </div>
            ) : (
              <>
                {visible.map((item) => (
                  <NewsCard key={item.id} item={item} />
                ))}

                {items.length > VISIBLE_DEFAULT && (
                  <button
                    onClick={() => setExpanded((v) => !v)}
                    className="flex w-full items-center justify-center gap-1 border-t border-slate-100 py-2.5 text-[12px] font-medium text-indigo-600 hover:bg-indigo-50 transition-colors"
                  >
                    {expanded ? (
                      <>Mostrar menos <ChevronUp className="h-3.5 w-3.5" /></>
                    ) : (
                      <>Ver mais {items.length - VISIBLE_DEFAULT} notícias <ChevronDown className="h-3.5 w-3.5" /></>
                    )}
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
