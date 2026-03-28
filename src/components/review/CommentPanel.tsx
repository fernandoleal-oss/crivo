'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { CommentItem } from './CommentItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Comment } from '@/lib/types'

interface CommentPanelProps {
  pieceId: string
  versionId: string
  comments: Comment[]
  onCommentAdded: () => void
  onPinHover?: (idx: number | null) => void
  isInternal?: boolean // se true, mostra toggle e comentários internos
}

export function CommentPanel({ pieceId, versionId, comments, onCommentAdded, onPinHover, isInternal = false }: CommentPanelProps) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [internal, setInternal] = useState(false)
  const [loading, setLoading] = useState(false)

  const visibleComments = isInternal ? comments : comments.filter(c => !c.is_internal)
  const generalComments = visibleComments.filter(c => c.comment_type === 'general')
  const pinComments = visibleComments.filter(c => c.comment_type === 'pin')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !authorName.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('comments').insert({
      piece_id: pieceId,
      version_id: versionId,
      author_name: authorName.trim(),
      content: content.trim(),
      comment_type: 'general',
      is_internal: isInternal && internal,
    })
    setLoading(false)
    if (error) { toast.error('Erro ao enviar comentário'); return }
    setContent('')
    toast.success('Comentário enviado!')
    onCommentAdded()
  }

  return (
    <div className="flex flex-col gap-4">
      {pinComments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Pins na imagem</p>
          <div className="space-y-2">
            {pinComments.map((c, i) => (
              <div key={c.id} className="relative">
                {c.is_internal && <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] px-1 rounded">Interno</span>}
                <CommentItem comment={c} pinIndex={i} onPinHover={onPinHover} />
              </div>
            ))}
          </div>
        </div>
      )}
      {generalComments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Comentários gerais</p>
          <div className="space-y-2">
            {generalComments.map(c => (
              <div key={c.id} className="relative">
                {c.is_internal && <span className="absolute -top-1 -right-1 bg-blue-500 text-white text-[10px] px-1 rounded">Interno</span>}
                <CommentItem comment={c} />
              </div>
            ))}
          </div>
        </div>
      )}
      {visibleComments.length === 0 && <p className="text-sm text-slate-500 text-center py-4">Nenhum comentário ainda.</p>}
      <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deixar comentário</p>
        <div>
          <Label htmlFor="author" className="text-xs">Seu nome</Label>
          <Input id="author" value={authorName} onChange={e => setAuthorName(e.target.value)} placeholder="Ex: Maria Silva" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="comment" className="text-xs">Comentário</Label>
          <Textarea id="comment" value={content} onChange={e => setContent(e.target.value)} placeholder="Escreva seu comentário..." rows={3} required className="mt-1" />
        </div>
        {isInternal && (
          <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
            <input type="checkbox" checked={internal} onChange={e => setInternal(e.target.checked)} className="rounded" />
            Comentário interno (não visível ao cliente)
          </label>
        )}
        <Button type="submit" disabled={loading} size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
          {loading ? 'Enviando...' : 'Enviar comentário'}
        </Button>
      </form>
    </div>
  )
}
