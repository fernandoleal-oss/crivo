'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import Image from 'next/image'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UploadNewVersion } from './UploadNewVersion'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { FileText, Paperclip, ClipboardCopy, Send, CheckCircle, RotateCcw, ChevronUp, ChevronDown, Mail } from 'lucide-react'
import type { PieceWithVersions } from '@/lib/types'

interface PieceCardProps {
  piece: PieceWithVersions
  onRefresh: () => void
  onSendToClient: (piece: PieceWithVersions) => void
}

function getDeadlineBadge(deadline: string | null) {
  if (!deadline) return null
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const dl = new Date(deadline)
  dl.setHours(0, 0, 0, 0)
  const diff = Math.round((dl.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  if (diff < 0) return { label: `Atrasado ${Math.abs(diff)}d`, cls: 'text-red-700 bg-red-50 border-red-200' }
  if (diff === 0) return { label: 'Vence hoje', cls: 'text-green-700 bg-green-50 border-green-200' }
  return { label: `${diff}d restantes`, cls: 'text-blue-700 bg-blue-50 border-blue-200' }
}

function DeadlineBadge({ deadline, status }: { deadline: string | null; status: string }) {
  if (status === 'approved') return null
  const badge = getDeadlineBadge(deadline)
  if (!badge) return null
  return <span className={`text-xs border px-1.5 py-0.5 rounded-full ${badge.cls}`}>{badge.label}</span>
}

export function PieceCard({ piece, onRefresh, onSendToClient }: PieceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const latestVersion = [...(piece.piece_versions ?? [])].sort((a, b) => a.version_number - b.version_number).at(-1)
  const approval = [...(piece.approvals ?? [])].sort((a, b) => new Date(a.decided_at).getTime() - new Date(b.decided_at).getTime()).at(-1)
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
        <div className="relative h-44 bg-slate-100">
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
              <FileText className="w-8 h-8 text-slate-400" />
              <span className="text-sm">PDF</span>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-slate-300"><Paperclip className="w-8 h-8" /></div>
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
              <span className="text-xs text-indigo-500 flex items-center gap-0.5"><Mail className="w-3 h-3" /> Enviado {formatRelativeTime(piece.notified_at)}</span>
            )}
            {piece.notified_at && piece.first_opened_at && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-green-100 text-green-700">Visualizado</span>
            )}
            {piece.notified_at && !piece.first_opened_at && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">Não aberto</span>
            )}
            <DeadlineBadge deadline={piece.deadline} status={piece.status} />
          </div>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="sm" onClick={() => setExpanded(v => !v)}>{expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}</Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
          <div className="flex gap-2 flex-wrap">
            <Button variant="outline" size="sm" onClick={copyLink} title="Copia o link de revisão da peça para a área de transferência" className="flex items-center gap-1.5"><ClipboardCopy className="w-3.5 h-3.5" /> Copiar link</Button>
            <Button
              size="sm"
              onClick={() => onSendToClient(piece)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white flex items-center gap-1.5"
              title="Envia um email para o cliente com o link de revisão"
            >
              <Send className="w-3.5 h-3.5" />{piece.notified_at ? 'Reenviar para cliente' : 'Enviar para cliente'}
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
                  {approval.decision === 'approved' ? <span className="flex items-center gap-1"><CheckCircle className="w-3.5 h-3.5" /> Aprovado</span> : <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Revisão solicitada</span>}
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
