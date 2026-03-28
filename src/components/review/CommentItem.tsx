'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatRelativeTime } from '@/lib/utils'
import type { Comment } from '@/lib/types'

interface CommentItemProps { comment: Comment; pinIndex?: number; onPinHover?: (idx: number | null) => void; onResolved?: () => void }

export function CommentItem({ comment, pinIndex, onPinHover, onResolved }: CommentItemProps) {
  const [resolving, setResolving] = useState(false)

  async function toggleResolved() {
    setResolving(true)
    const supabase = createClient()
    await supabase.from('comments').update({ resolved: !comment.resolved }).eq('id', comment.id)
    setResolving(false)
    onResolved?.()
  }

  return (
    <div className={`rounded-lg p-3 text-sm ${comment.resolved ? 'bg-green-50 opacity-70' : 'bg-slate-50'}`}
      onMouseEnter={() => pinIndex !== undefined && onPinHover?.(pinIndex)}
      onMouseLeave={() => onPinHover?.(null)}>
      {comment.comment_type === 'pin' && pinIndex !== undefined && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">{pinIndex + 1}</span>
          <span className="text-xs text-indigo-600 font-medium">Comentário de posição</span>
        </div>
      )}
      <p className="text-slate-700">{comment.content}</p>
      <div className="flex items-center justify-between mt-1.5">
        <div className="flex items-center gap-1 text-xs text-slate-500">
          <span className="font-medium text-slate-500">{comment.author_name}</span>
          <span>·</span>
          <span>{formatRelativeTime(comment.created_at)}</span>
        </div>
        <button
          onClick={toggleResolved}
          disabled={resolving}
          className={`text-xs px-2 py-0.5 rounded-full transition-colors ${
            comment.resolved
              ? 'bg-green-100 text-green-700 hover:bg-green-200'
              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
          }`}
        >
          {comment.resolved ? 'Resolvido' : 'Resolver'}
        </button>
      </div>
    </div>
  )
}
