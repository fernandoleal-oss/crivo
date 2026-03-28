'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UploadNewVersion } from './UploadNewVersion'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { PieceWithVersions } from '@/lib/types'

interface PieceCardProps {
  piece: PieceWithVersions
  onRefresh: () => void
  onSendToClient: (piece: PieceWithVersions) => void
}

export function PieceCard({ piece, onRefresh, onSendToClient }: PieceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const latestVersion = piece.piece_versions?.at(-1)
  const approval = piece.approvals?.at(-1)
  const isImage = latestVersion?.file_type.startsWith('image/')
  const isPdf = latestVersion?.file_type === 'application/pdf'

  function copyLink() {
    const url = `${window.location.origin}/review/${piece.public_token}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiado!')
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      {/* Thumbnail */}
      {latestVersion && (
        <div className="relative h-32 bg-slate-100">
          {isImage ? (
            <Image
              src={latestVersion.file_url}
              alt={piece.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 400px"
            />
          ) : isPdf ? (
            <div className="flex items-center justify-center h-full gap-2 text-slate-500">
              <span className="text-3xl">📄</span>
              <span className="text-sm">PDF</span>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-300 text-2xl">📎</div>
          )}
          <div className="absolute top-2 right-2">
            <StatusBadge status={piece.status} />
          </div>
        </div>
      )}

      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-slate-900">{piece.title}</h3>
          {piece.description && <p className="text-sm text-slate-500 mt-0.5">{piece.description}</p>}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <p className="text-xs text-slate-500">{formatRelativeTime(piece.updated_at)}</p>
            {piece.notified_at && (
              <span className="text-xs text-indigo-500">✉ Enviado {formatRelativeTime(piece.notified_at)}</span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setExpanded(v => !v)}>{expanded ? '▲' : '▼'}</Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={copyLink} title="Copia o link de revisão da peça para a área de transferência">📋 Copiar link</Button>
            <Button
              size="sm"
              onClick={() => onSendToClient(piece)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
              title="Envia um email para o cliente com o link de revisão"
            >
              {piece.notified_at ? '📨 Reenviar para cliente' : '📨 Enviar para cliente'}
            </Button>
          </div>
          <p className="text-xs text-slate-500 mt-1">O cliente acessa o link, revisa a peça e aprova direto pelo navegador.</p>
          <div className="mt-3">
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Versões ({(piece.piece_versions ?? []).length})</p>
            {(piece.piece_versions ?? []).map(v => (
              <div key={v.id} className="flex items-center gap-2 text-sm text-slate-600">
                <span>v{v.version_number}</span>
                <span className="text-slate-500">·</span>
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
