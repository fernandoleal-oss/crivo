import type { Sector } from '@/lib/types'

const SECTORS: { value: Sector | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'Todos', icon: '🗂' },
  { value: 'atendimento', label: 'Atendimento', icon: '📋' },
  { value: 'criacao', label: 'Criação', icon: '🎨' },
  { value: 'rtv', label: 'RTV', icon: '📺' },
  { value: 'midia', label: 'Mídia', icon: '📡' },
  { value: 'geral', label: 'Geral', icon: '📁' },
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
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            value === s.value
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {s.icon} {s.label}
        </button>
      ))}
    </div>
  )
}

export { SECTORS }
