'use client'

import { useState } from 'react'
import {
  Sparkles,
  AlertTriangle,
  Wand2,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

export type AISuggestionVariant = 'info' | 'warning' | 'action'

interface VariantConfig {
  bg: string
  border: string
  iconBg: string
  iconColor: string
  titleColor: string
  buttonBg: string
  buttonHover: string
  buttonText: string
  Icon: React.ElementType
  defaultLabel: string
}

const VARIANTS: Record<AISuggestionVariant, VariantConfig> = {
  info: {
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    titleColor: 'text-blue-900',
    buttonBg: 'bg-blue-600',
    buttonHover: 'hover:bg-blue-700',
    buttonText: 'text-white',
    Icon: Sparkles,
    defaultLabel: 'Aplicar sugestão',
  },
  warning: {
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    titleColor: 'text-amber-900',
    buttonBg: 'bg-amber-500',
    buttonHover: 'hover:bg-amber-600',
    buttonText: 'text-white',
    Icon: AlertTriangle,
    defaultLabel: 'Revisar agora',
  },
  action: {
    bg: 'bg-indigo-50',
    border: 'border-indigo-200',
    iconBg: 'bg-indigo-100',
    iconColor: 'text-indigo-600',
    titleColor: 'text-indigo-900',
    buttonBg: 'bg-indigo-600',
    buttonHover: 'hover:bg-indigo-700',
    buttonText: 'text-white',
    Icon: Wand2,
    defaultLabel: 'Executar ação',
  },
}

export interface AISuggestionCardProps {
  variant: AISuggestionVariant
  title: string
  body: string
  actionLabel?: string
  onAction?: () => void
  onDismiss?: () => void
  className?: string
}

export function AISuggestionCard({
  variant,
  title,
  body,
  actionLabel,
  onAction,
  onDismiss,
  className,
}: AISuggestionCardProps) {
  const [visible, setVisible] = useState(true)
  const cfg = VARIANTS[variant]
  const { Icon } = cfg

  function handleDismiss() {
    setVisible(false)
    onDismiss?.()
  }

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.96 }}
          transition={{ duration: 0.18 }}
          className={cn(
            'relative rounded-xl border p-4',
            cfg.bg,
            cfg.border,
            className,
          )}
        >
          {/* Close */}
          <button
            onClick={handleDismiss}
            aria-label="Fechar sugestão"
            className="absolute right-3 top-3 rounded-full p-1 text-slate-400 transition-colors hover:bg-black/5 hover:text-slate-600"
          >
            <X className="h-3.5 w-3.5" />
          </button>

          {/* Header */}
          <div className="flex items-start gap-3 pr-6">
            {/* Icon stack */}
            <div className="relative flex-shrink-0">
              <span
                className={cn(
                  'flex h-9 w-9 items-center justify-center rounded-lg',
                  cfg.iconBg,
                )}
              >
                <Icon className={cn('h-4.5 w-4.5', cfg.iconColor)} style={{ width: 18, height: 18 }} />
              </span>
              {/* Sparkles badge — only show when Icon is NOT Sparkles */}
              {variant !== 'info' && (
                <span className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-slate-200">
                  <Sparkles className="h-2.5 w-2.5 text-slate-400" />
                </span>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <p
                className={cn(
                  'text-[14px] font-semibold leading-snug',
                  cfg.titleColor,
                )}
              >
                {title}
              </p>
            </div>
          </div>

          {/* Body */}
          <p className="mt-2.5 pl-12 text-[13px] leading-relaxed text-slate-600">
            {body}
          </p>

          {/* Actions */}
          <div className="mt-4 flex items-center gap-2 pl-12">
            {onAction && (
              <button
                onClick={onAction}
                className={cn(
                  'rounded-lg px-3.5 py-1.5 text-[13px] font-semibold transition-colors duration-150',
                  cfg.buttonBg,
                  cfg.buttonHover,
                  cfg.buttonText,
                )}
              >
                {actionLabel ?? cfg.defaultLabel}
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="rounded-lg px-3.5 py-1.5 text-[13px] font-medium text-slate-500 transition-colors hover:bg-black/5 hover:text-slate-700"
            >
              Ignorar
            </button>
          </div>

          {/* Disclaimer */}
          <p className="mt-3 pl-12 text-[11px] text-slate-400">
            ✦ Gerado por IA · Revisão humana recomendada
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
