import { CheckCircle2, RefreshCw, Clock } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { PieceStatus } from '@/lib/types'
import { getStatusLabel } from '@/lib/utils'

interface StatusBadgeProps { status: PieceStatus }

const statusStyles: Record<PieceStatus, string> = {
  pending: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
  approved: 'bg-green-100 text-green-700 hover:bg-green-100',
  revision_requested: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
}

const statusIcons: Record<PieceStatus, React.ReactNode> = {
  approved: <CheckCircle2 size={12} />,
  revision_requested: <RefreshCw size={12} />,
  pending: <Clock size={12} />,
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={`${statusStyles[status]} flex items-center gap-1`}>
      {statusIcons[status]}
      {getStatusLabel(status)}
    </Badge>
  )
}
