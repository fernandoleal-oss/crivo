'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import type { PieceWithVersions, Comment } from '@/lib/types'
import { Upload, CheckCircle, RefreshCw, MessageCircle } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TimelineEvent {
  id: string
  label: string
  at: string
  type: 'version' | 'approved' | 'revision' | 'comment'
}

function buildEvents(piece: PieceWithVersions & { comments?: Comment[] }): TimelineEvent[] {
  const events: TimelineEvent[] = []
  for (const v of piece.piece_versions ?? []) {
    events.push({ id: `version-${v.id}`, label: `Versão ${v.version_number} enviada`, at: v.uploaded_at, type: 'version' })
  }
  if (piece.notified_at) {
    events.push({ id: 'notified', label: 'Link enviado ao cliente', at: piece.notified_at, type: 'version' })
  }
  if (piece.first_opened_at) {
    events.push({ id: 'opened', label: 'Visualizado pelo cliente', at: piece.first_opened_at, type: 'version' })
  }
  for (const c of piece.comments ?? []) {
    events.push({ id: `comment-${c.id}`, label: `Comentário de ${c.author_name}`, at: c.created_at, type: 'comment' })
  }
  for (const a of piece.approvals ?? []) {
    const isApproved = a.decision === 'approved'
    events.push({
      id: `approval-${a.id}`,
      label: isApproved ? `Aprovado por ${a.decided_by}` : `Revisão solicitada por ${a.decided_by}`,
      at: a.decided_at,
      type: isApproved ? 'approved' : 'revision',
    })
  }
  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
}

const ICON_MAP = {
  version: { Icon: Upload, cls: 'text-indigo-500' },
  approved: { Icon: CheckCircle, cls: 'text-green-500' },
  revision: { Icon: RefreshCw, cls: 'text-amber-500' },
  comment: { Icon: MessageCircle, cls: 'text-slate-400' },
}

// Props: either pass piece directly or pieceId for standalone fetch
interface ActivityTimelineProps {
  piece?: PieceWithVersions & { comments?: Comment[] }
  pieceId?: string
}

export function ActivityTimeline({ piece: pieceProp, pieceId }: ActivityTimelineProps) {
  const [piece, setPiece] = useState<(PieceWithVersions & { comments?: Comment[] }) | null>(pieceProp ?? null)

  useEffect(() => {
    if (pieceProp) { setPiece(pieceProp); return }
    if (!pieceId) return
    const supabase = createClient()
    async function load() {
      const { data } = await supabase
        .from('pieces')
        .select('*, piece_versions(id, version_number, uploaded_at, file_url, file_type), approvals(id, decision, decided_by, decided_at, feedback), comments(id, author_name, content, created_at)')
        .eq('id', pieceId!)
        .single()
      if (data) setPiece(data as PieceWithVersions & { comments?: Comment[] })
    }
    load()
  }, [pieceProp, pieceId])

  if (!piece) return null
  const events = buildEvents(piece)
  if (events.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Atividade</p>
      <ol className="relative border-l border-slate-200 space-y-3 ml-2">
        {events.map(ev => {
          const { Icon, cls } = ICON_MAP[ev.type]
          return (
            <li key={ev.id} className="ml-4 flex items-start gap-2">
              <span className="absolute -left-3 mt-0.5">
                <Icon size={12} className={cn(cls)} />
              </span>
              <div>
                <p className="text-sm text-slate-700">{ev.label}</p>
                <p className="text-xs text-slate-400">{formatRelativeTime(ev.at)}</p>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
