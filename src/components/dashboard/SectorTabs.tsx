import { Layers, Users, Palette, Tv, Megaphone } from 'lucide-react'
import type { Sector } from '@/lib/types'
import type { LucideIcon } from 'lucide-react'

const SECTORS: { value: Sector | 'all'; label: string; Icon: LucideIcon }[] = [
  { value: 'all', label: 'Todos', Icon: Layers },
  { value: 'atendimento', label: 'Atendimento', Icon: Users },
  { value: 'criacao', label: 'Criação', Icon: Palette },
  { value: 'rtv', label: 'RTV', Icon: Tv },
  { value: 'midia', label: 'Mídia', Icon: Megaphone },
  { value: 'geral', label: 'Geral', Icon: Layers },
]

interface SectorTabsProps {
  value: Sector | 'all'
  onChange: (sector: Sector | 'all') => void
}

export function SectorTabs({ value, onChange }: SectorTabsProps) {
  return (
    <div className="flex gap-2 flex-wrap mb-4">
      {SECTORS.map(s => (
        <button
          key={s.value}
          onClick={() => onChange(s.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            value === s.value
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <s.Icon size={14} />
          {s.label}
        </button>
      ))}
    </div>
  )
}

export { SECTORS }
