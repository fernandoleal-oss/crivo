import { Badge } from '@/components/ui/badge'
import type { PieceStatus } from '@/lib/types'
import { getStatusLabel } from '@/lib/utils'

interface StatusBadgeProps { status: PieceStatus }

const statusStyles: Record<PieceStatus, string> = {
  pending: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
  approved: 'bg-green-100 text-green-700 hover:bg-green-100',
  revision_requested: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge className={statusStyles[status]}>{getStatusLabel(status)}</Badge>
}
