'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UploadNewVersion } from './UploadNewVersion'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { PieceWithVersions } from '@/lib/types'

interface PieceCardProps { piece: PieceWithVersions; onRefresh: () => void }

export function PieceCard({ piece, onRefresh }: PieceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const latestVersion = piece.piece_versions?.at(-1)
  const approval = piece.approvals?.at(-1)

  function copyLink() {
    const url = `${window.location.origin}/review/${piece.public_token}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiado!')
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-slate-900">{piece.title}</h3>
            <StatusBadge status={piece.status} />
          </div>
          {piece.description && <p className="text-sm text-slate-500 mt-0.5">{piece.description}</p>}
          <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(piece.updated_at)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={copyLink}>Copiar link</Button>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(v => !v)}>{expanded ? '▲' : '▼'}</Button>
        </div>
      </div>
      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Versões</p>
            {(piece.piece_versions ?? []).map(v => (
              <div key={v.id} className="flex items-center gap-2 text-sm text-slate-600">
                <span>v{v.version_number}</span>
                <span className="text-slate-400">·</span>
                <span>{formatRelativeTime(v.uploaded_at)}</span>
                <a href={v.file_url} target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline text-xs">Abrir</a>
              </div>
            ))}
            {latestVersion && <UploadNewVersion pieceId={piece.id} currentVersionNumber={latestVersion.version_number} onUploaded={onRefresh} />}
          </div>
          {approval && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Decisão do cliente</p>
              <div className="text-sm text-slate-700">
                <span className={approval.decision === 'approved' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                  {approval.decision === 'approved' ? '✅ Aprovado' : '↩ Revisão solicitada'}
                </span>
                {' '}por <strong>{approval.decided_by}</strong> — {formatRelativeTime(approval.decided_at)}
                {approval.feedback && <p className="text-slate-500 mt-1 italic">&quot;{approval.feedback}&quot;</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
