import { formatRelativeTime } from '@/lib/utils'
import type { PieceWithVersions, Comment, Approval } from '@/lib/types'

interface TimelineEvent {
  id: string
  label: string
  at: string
}

function buildEvents(piece: PieceWithVersions & { comments?: Comment[] }): TimelineEvent[] {
  const events: TimelineEvent[] = []

  for (const v of piece.piece_versions ?? []) {
    events.push({ id: `version-${v.id}`, label: `v${v.version_number} enviada`, at: v.uploaded_at })
  }
  if (piece.notified_at) {
    events.push({ id: 'notified', label: 'Link enviado ao cliente', at: piece.notified_at })
  }
  if (piece.first_opened_at) {
    events.push({ id: 'opened', label: 'Visualizado pelo cliente', at: piece.first_opened_at })
  }
  for (const c of piece.comments ?? []) {
    events.push({ id: `comment-${c.id}`, label: `Comentário de ${c.author_name}: "${c.content.slice(0, 40)}${c.content.length > 40 ? '…' : ''}"`, at: c.created_at })
  }
  for (const a of piece.approvals ?? []) {
    const label = a.decision === 'approved' ? `Aprovado por ${a.decided_by}` : `Revisão solicitada por ${a.decided_by}`
    events.push({ id: `approval-${a.id}`, label, at: a.decided_at })
  }

  return events.sort((a, b) => new Date(a.at).getTime() - new Date(b.at).getTime())
}

interface ActivityTimelineProps {
  piece: PieceWithVersions & { comments?: Comment[] }
}

export function ActivityTimeline({ piece }: ActivityTimelineProps) {
  const events = buildEvents(piece)
  if (events.length === 0) return null

  return (
    <div className="mt-4">
      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Atividade</p>
      <ol className="relative border-l border-slate-200 space-y-3 ml-2">
        {events.map(ev => (
          <li key={ev.id} className="ml-4">
            <span className="absolute -left-1.5 mt-1.5 w-3 h-3 bg-indigo-200 border-2 border-white rounded-full" />
            <p className="text-sm text-slate-700">{ev.label}</p>
            <p className="text-xs text-slate-500">{formatRelativeTime(ev.at)}</p>
          </li>
        ))}
      </ol>
    </div>
  )
}
