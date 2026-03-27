import type { PieceVersion } from '@/lib/types'
import { isPdf } from '@/lib/utils'

interface VersionCompareProps { versions: PieceVersion[]; onClose: () => void }

export function VersionCompare({ versions, onClose }: VersionCompareProps) {
  const sorted = [...versions].sort((a, b) => a.version_number - b.version_number)
  const left = sorted.at(-2)!
  const right = sorted.at(-1)!
  return (
    <div className="fixed inset-0 bg-slate-900/90 z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <h2 className="font-semibold">Comparação de versões</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">×</button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {[left, right].map(v => (
          <div key={v.id} className="flex-1 flex flex-col overflow-auto bg-slate-800">
            <div className="text-center text-white text-sm py-2 border-b border-slate-700">Versão {v.version_number}</div>
            <div className="flex-1 flex items-center justify-center p-4">
              {isPdf(v.file_type) ? (
                <a href={v.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">Abrir PDF v{v.version_number}</a>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.file_url} alt={`Versão ${v.version_number}`} className="max-w-full max-h-full object-contain" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
