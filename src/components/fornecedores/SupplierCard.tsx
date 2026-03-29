'use client'
import { useState } from 'react'
import { ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'

const AVATAR_COLORS = ['bg-indigo-600','bg-violet-600','bg-emerald-600','bg-amber-600','bg-rose-600','bg-cyan-700']

function avatarColor(name: string) {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

export interface Supplier {
  id?: string
  name: string
  specialty: string
  categories: string[]
  rating: number
  verified: boolean
  crivo_partner: boolean
  website?: string | null
  email?: string | null
  phone?: string | null
}

export function SupplierCard({ s }: { s: Supplier }) {
  const [expanded, setExpanded] = useState(false)
  const hasContact = s.website || s.email || s.phone
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex flex-col gap-3">
      <div className="flex items-start gap-3">
        <div className={cn('w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0', avatarColor(s.name))}>
          {s.name[0].toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <p className="font-semibold text-slate-800 text-sm">{s.name}</p>
            {s.verified && <ShieldCheck size={13} className="text-blue-500 flex-shrink-0" />}
            {s.crivo_partner && (
              <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700">Parceiro Crivo</span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{s.specialty}</p>
        </div>
        <div className="flex items-center gap-0.5 flex-shrink-0">
          {'★★★★★'.split('').map((_, i) => (
            <span key={i} className={cn('text-xs', i < Math.round(s.rating) ? 'text-amber-400' : 'text-slate-200')}>★</span>
          ))}
          <span className="text-[10px] text-slate-400 ml-1">{s.rating.toFixed(1)}</span>
        </div>
      </div>

      {s.categories.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {s.categories.map(cat => (
            <span key={cat} className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{cat}</span>
          ))}
        </div>
      )}

      {hasContact && (
        <div>
          <button
            onClick={() => setExpanded(v => !v)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600 transition-colors"
          >
            {expanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            Contato
          </button>
          {expanded && (
            <div className="mt-2 space-y-1 text-xs text-slate-600">
              {s.website && <p>🌐 <a href={s.website} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">{s.website}</a></p>}
              {s.email && <p>✉️ <a href={`mailto:${s.email}`} className="text-indigo-600 hover:underline">{s.email}</a></p>}
              {s.phone && <p>📞 {s.phone}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
