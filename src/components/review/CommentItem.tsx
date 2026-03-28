import { formatRelativeTime } from '@/lib/utils'
import type { Comment } from '@/lib/types'

interface CommentItemProps { comment: Comment; pinIndex?: number; onPinHover?: (idx: number | null) => void }

export function CommentItem({ comment, pinIndex, onPinHover }: CommentItemProps) {
  return (
    <div className="bg-slate-50 rounded-lg p-3 text-sm"
      onMouseEnter={() => pinIndex !== undefined && onPinHover?.(pinIndex)}
      onMouseLeave={() => onPinHover?.(null)}>
      {comment.comment_type === 'pin' && pinIndex !== undefined && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{pinIndex + 1}</span>
          <span className="text-xs text-indigo-600 font-medium">Comentário de posição</span>
        </div>
      )}
      <p className="text-slate-700">{comment.content}</p>
      <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-500">
        <span className="font-medium text-slate-500">{comment.author_name}</span>
        <span>·</span>
        <span>{formatRelativeTime(comment.created_at)}</span>
      </div>
    </div>
  )
}
