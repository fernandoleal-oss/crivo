import type { PieceVersion } from '@/lib/types'

interface VersionNavProps {
  versions: PieceVersion[]
  currentVersionId: string
  onSelect: (version: PieceVersion) => void
  onCompare?: () => void
}

export function VersionNav({ versions, currentVersionId, onSelect, onCompare }: VersionNavProps) {
  if (versions.length <= 1) return null
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500">Versão:</span>
      {versions.map(v => (
        <button key={v.id} onClick={() => onSelect(v)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${v.id === currentVersionId ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
          v{v.version_number}
        </button>
      ))}
      {versions.length >= 2 && onCompare && (
        <button onClick={onCompare} className="px-2 py-1 rounded text-xs font-medium bg-slate-700 text-white hover:bg-slate-800 transition-colors">Comparar</button>
      )}
    </div>
  )
}
