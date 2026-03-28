'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Comment } from '@/lib/types'

interface PendingPin { x: number; y: number }
interface PinLayerProps {
  pieceId: string; versionId: string; pinComments: Comment[]
  hoveredPinIndex: number | null; onCommentAdded: () => void; disabled?: boolean
}

export function PinLayer({ pieceId, versionId, pinComments, hoveredPinIndex, onCommentAdded, disabled }: PinLayerProps) {
  const [pending, setPending] = useState<PendingPin | null>(null)
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPending({ x, y })
  }

  function handleTouchEnd(e: React.TouchEvent<HTMLDivElement>) {
    if (disabled) return
    e.preventDefault()
    const touch = e.changedTouches[0]
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((touch.clientX - rect.left) / rect.width) * 100
    const y = ((touch.clientY - rect.top) / rect.height) * 100
    setPending({ x, y })
  }

  async function handleSavePin(e: React.FormEvent) {
    e.preventDefault()
    if (!pending || !content.trim() || !authorName.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('comments').insert({
      piece_id: pieceId, version_id: versionId,
      author_name: authorName.trim(), content: content.trim(),
      comment_type: 'pin', pin_x: pending.x, pin_y: pending.y,
    })
    setLoading(false)
    if (error) { toast.error('Erro ao salvar pin'); return }
    toast.success('Pin adicionado!')
    setPending(null); setContent(''); onCommentAdded()
  }

  return (
    <div className="absolute inset-0 cursor-crosshair" onClick={handleClick} onTouchEnd={handleTouchEnd}>
      {pinComments.map((c, i) => (
        <div key={c.id} className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: `${c.pin_x}%`, top: `${c.pin_y}%` }}>
          <div className={`group relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg transition-transform ${hoveredPinIndex === i ? 'scale-125 bg-indigo-500' : 'bg-indigo-600'}`}>
            {i + 1}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
              <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 max-w-48 shadow-xl">
                <p className="font-semibold mb-0.5">{c.author_name}</p>
                {c.content}
              </div>
            </div>
          </div>
        </div>
      ))}
      {pending && (
        <div className="absolute -translate-x-1/2 -translate-y-1/2 z-20" style={{ left: `${pending.x}%`, top: `${pending.y}%` }} onClick={e => e.stopPropagation()}>
          <div className="w-7 h-7 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
            {pinComments.length + 1}
          </div>
          <form onSubmit={handleSavePin} onClick={e => e.stopPropagation()}
            className={`absolute ${pending.x > 60 ? 'right-8' : 'left-8'} ${pending.y > 70 ? 'bottom-0' : 'top-0'} bg-white border border-slate-200 rounded-lg p-3 shadow-xl w-56 space-y-2 z-30`}>
            <Input value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Seu nome" required className="text-sm h-8" />
            <textarea value={content} onChange={e => setContent(e.target.value)} placeholder="Comentário..." required rows={2}
              className="w-full border border-slate-200 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <div className="flex gap-1">
              <Button type="submit" size="sm" disabled={loading} className="flex-1 h-7 text-xs bg-indigo-600 hover:bg-indigo-700">{loading ? '...' : 'Salvar'}</Button>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setPending(null)}>×</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
