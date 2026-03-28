'use client'

import { useState } from 'react'
import {
  Star,
  Globe,
  Mail,
  Phone,
  CheckCircle,
  BadgeCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { cn } from '@/lib/utils'

export interface Supplier {
  id: string
  name: string
  specialty: string
  categories: string[]
  rating: number
  verified: boolean
  crivoParter: boolean
  website?: string
  email?: string
  phone?: string
  logoUrl?: string
  avatarColor?: string
}

const AVATAR_COLORS = [
  'bg-indigo-500',
  'bg-violet-500',
  'bg-orange-500',
  'bg-emerald-500',
  'bg-rose-500',
  'bg-cyan-500',
]

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`Avaliação: ${value} de 5`}>
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.floor(value)
        const half = !filled && i < value
        return (
          <Star
            key={i}
            className={cn(
              'h-3.5 w-3.5',
              filled ? 'fill-amber-400 text-amber-400' : 'fill-slate-200 text-slate-200',
              half && 'fill-amber-200 text-amber-200',
            )}
          />
        )
      })}
      <span className="ml-1 text-[12px] font-semibold text-slate-600">
        {value.toFixed(1)}
      </span>
    </div>
  )
}

interface SupplierCardProps {
  supplier: Supplier
  className?: string
}

export function SupplierCard({ supplier, className }: SupplierCardProps) {
  const [expanded, setExpanded] = useState(false)

  const initial = supplier.name.charAt(0).toUpperCase()
  const avatarBg =
    supplier.avatarColor ??
    AVATAR_COLORS[supplier.name.charCodeAt(0) % AVATAR_COLORS.length]

  const hasContact = supplier.website || supplier.email || supplier.phone

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow duration-200 hover:shadow-md',
        className,
      )}
    >
      {/* Main card content */}
      <div className="p-4">
        <div className="flex items-start gap-3">
          {/* Logo / Initial */}
          {supplier.logoUrl ? (
            <img
              src={supplier.logoUrl}
              alt={supplier.name}
              className="h-12 w-12 rounded-full object-cover ring-2 ring-slate-100"
            />
          ) : (
            <div
              className={cn(
                'flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full text-lg font-black text-white',
                avatarBg,
              )}
            >
              {initial}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <h3 className="text-[14px] font-bold text-slate-900 leading-tight">
                {supplier.name}
              </h3>
              {supplier.verified && (
                <span className="flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <CheckCircle className="h-2.5 w-2.5" />
                  Verificado
                </span>
              )}
              {supplier.crivoParter && (
                <span className="flex items-center gap-0.5 rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                  <BadgeCheck className="h-2.5 w-2.5" />
                  Parceiro Crivo
                </span>
              )}
            </div>
            <p className="mt-0.5 text-[12px] text-slate-500">{supplier.specialty}</p>
            <div className="mt-1.5">
              <StarRating value={supplier.rating} />
            </div>
          </div>
        </div>

        {/* Category tags */}
        <div className="mt-3 flex flex-wrap gap-1.5">
          {supplier.categories.map((cat) => (
            <span
              key={cat}
              className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-600"
            >
              {cat}
            </span>
          ))}
        </div>

        {/* Quick contact icons */}
        {hasContact && !expanded && (
          <div className="mt-3 flex items-center gap-2">
            {supplier.website && (
              <a
                href={supplier.website}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                aria-label="Site"
              >
                <Globe className="h-3.5 w-3.5" />
              </a>
            )}
            {supplier.email && (
              <a
                href={`mailto:${supplier.email}`}
                className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                aria-label="E-mail"
              >
                <Mail className="h-3.5 w-3.5" />
              </a>
            )}
            {supplier.phone && (
              <a
                href={`tel:${supplier.phone}`}
                className="flex items-center justify-center rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-50 hover:text-indigo-600 transition-colors"
                aria-label="Telefone"
              >
                <Phone className="h-3.5 w-3.5" />
              </a>
            )}
          </div>
        )}
      </div>

      {/* Expand contact detail */}
      <div className="border-t border-slate-100">
        <button
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full items-center justify-between px-4 py-2.5 text-[12px] font-semibold text-indigo-600 hover:bg-indigo-50 transition-colors"
        >
          {expanded ? 'Ocultar detalhes' : 'Ver detalhes'}
          {expanded ? (
            <ChevronUp className="h-3.5 w-3.5" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5" />
          )}
        </button>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              <div className="space-y-2 px-4 pb-4">
                {supplier.website && (
                  <ContactRow
                    icon={Globe}
                    label="Site"
                    value={supplier.website}
                    href={supplier.website}
                    external
                  />
                )}
                {supplier.email && (
                  <ContactRow
                    icon={Mail}
                    label="E-mail"
                    value={supplier.email}
                    href={`mailto:${supplier.email}`}
                  />
                )}
                {supplier.phone && (
                  <ContactRow
                    icon={Phone}
                    label="Telefone"
                    value={supplier.phone}
                    href={`tel:${supplier.phone}`}
                  />
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

function ContactRow({
  icon: Icon,
  label,
  value,
  href,
  external,
}: {
  icon: React.ElementType
  label: string
  value: string
  href: string
  external?: boolean
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-3.5 w-3.5 text-slate-500" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
          {label}
        </p>
        <a
          href={href}
          target={external ? '_blank' : undefined}
          rel={external ? 'noopener noreferrer' : undefined}
          className="block truncate text-[12px] font-medium text-indigo-600 hover:underline"
        >
          {value}
        </a>
      </div>
    </div>
  )
}
