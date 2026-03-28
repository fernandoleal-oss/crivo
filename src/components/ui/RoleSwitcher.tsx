'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  CheckCircle,
  Briefcase,
  Palette,
  Radio,
  X,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

export type AppRole = 'ceo' | 'criacao' | 'midia'

interface RoleConfig {
  id: AppRole
  label: string
  description: string
  icon: React.ElementType
  color: string
  bg: string
  ring: string
  text: string
  badgeBg: string
  badgeText: string
}

const ROLES: RoleConfig[] = [
  {
    id: 'ceo',
    label: 'CEO / Atendimento',
    description: 'Visão geral, aprovações e relacionamento',
    icon: Briefcase,
    color: 'indigo',
    bg: 'bg-indigo-50',
    ring: 'ring-indigo-300',
    text: 'text-indigo-700',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-700',
  },
  {
    id: 'criacao',
    label: 'Criação',
    description: 'Peças, briefings e revisões criativas',
    icon: Palette,
    color: 'violet',
    bg: 'bg-violet-50',
    ring: 'ring-violet-300',
    text: 'text-violet-700',
    badgeBg: 'bg-violet-100',
    badgeText: 'text-violet-700',
  },
  {
    id: 'midia',
    label: 'Mídia / RTV',
    description: 'Veiculação, produções e claquetes',
    icon: Radio,
    color: 'orange',
    bg: 'bg-orange-50',
    ring: 'ring-orange-300',
    text: 'text-orange-700',
    badgeBg: 'bg-orange-100',
    badgeText: 'text-orange-700',
  },
]

interface RoleSwitcherProps {
  originalRole: AppRole
  currentRole: AppRole
  userName: string
  userInitial: string
  onRoleChange: (role: AppRole) => void
}

export function RoleSwitcher({
  originalRole,
  currentRole,
  userName,
  userInitial,
  onRoleChange,
}: RoleSwitcherProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const active = ROLES.find((r) => r.id === currentRole)!

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const Icon = active.icon

  return (
    <div className="relative" ref={ref}>
      {/* Pill trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-medium',
          'ring-1 transition-all duration-150',
          'hover:shadow-sm focus:outline-none focus-visible:ring-2',
          active.bg,
          active.ring,
          active.text,
        )}
      >
        {/* Avatar */}
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold uppercase',
            active.badgeBg,
            active.text,
          )}
        >
          {userInitial}
        </span>

        <span className="hidden sm:inline">{userName}</span>

        <span
          className={cn(
            'hidden rounded-full px-2 py-0.5 text-xs font-semibold sm:inline',
            active.badgeBg,
            active.text,
          )}
        >
          {active.label.split(' ')[0]}
        </span>

        <Icon className="h-3.5 w-3.5 opacity-70" />

        <ChevronDown
          className={cn(
            'h-3.5 w-3.5 transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-72 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60"
          >
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Visualizar como
              </p>
            </div>

            <ul className="py-1.5">
              {ROLES.map((role) => {
                const RIcon = role.icon
                const isActive = role.id === currentRole
                return (
                  <li key={role.id}>
                    <button
                      onClick={() => {
                        onRoleChange(role.id)
                        setOpen(false)
                      }}
                      className={cn(
                        'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors duration-100',
                        isActive ? role.bg : 'hover:bg-slate-50',
                      )}
                    >
                      <span
                        className={cn(
                          'flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg',
                          role.badgeBg,
                        )}
                      >
                        <RIcon className={cn('h-4 w-4', role.text)} />
                      </span>

                      <div className="flex-1 min-w-0">
                        <p
                          className={cn(
                            'text-sm font-semibold',
                            isActive ? role.text : 'text-slate-800',
                          )}
                        >
                          {role.label}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {role.description}
                        </p>
                      </div>

                      {isActive && (
                        <CheckCircle
                          className={cn('h-4 w-4 flex-shrink-0', role.text)}
                        />
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ── View-as Banner ──────────────────────────────────────────────── */

interface ViewAsBannerProps {
  viewingAs: AppRole
  originalRole: AppRole
  onReset: () => void
}

export function ViewAsBanner({ viewingAs, onReset }: ViewAsBannerProps) {
  const role = ROLES.find((r) => r.id === viewingAs)!
  const Icon = role.icon

  return (
    <motion.div
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={{ y: -40, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="fixed inset-x-0 top-0 z-[100] flex items-center justify-between bg-amber-400 px-4 py-2 text-amber-900 shadow-md"
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4" />
        <span>
          Visualizando como{' '}
          <strong>{role.label}</strong> — algumas ações estão desativadas
        </span>
      </div>
      <button
        onClick={onReset}
        className="flex items-center gap-1.5 rounded-full bg-amber-500/40 px-3 py-1 text-xs font-semibold hover:bg-amber-500/60 transition-colors"
      >
        <X className="h-3 w-3" />
        Voltar ao meu role
      </button>
    </motion.div>
  )
}
