'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { notifyDecision } from '@/lib/n8n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ApprovalDecision } from '@/lib/types'

interface ApprovalModalProps {
  open: boolean; decision: ApprovalDecision; pieceId: string; versionId: string
  pieceName: string; projectName: string; pieceToken: string
  onClose: () => void; onDecided: () => void
}

export function ApprovalModal({ open, decision, pieceId, versionId, pieceName, projectName, pieceToken, onClose, onDecided }: ApprovalModalProps) {
  const [feedback, setFeedback] = useState('')
  const [decidedBy, setDecidedBy] = useState('')
  const [loading, setLoading] = useState(false)
  const isApproval = decision === 'approved'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!decidedBy.trim()) return
    if (!isApproval && !feedback.trim()) { toast.error('Descreva o que precisa ser revisado.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('approvals').insert({
      piece_id: pieceId, version_id: versionId, decision,
      feedback: feedback.trim() || null, decided_by: decidedBy.trim(),
    })
    if (error) { toast.error('Erro ao registrar decisão'); setLoading(false); return }
    await supabase.from('pieces').update({ status: decision }).eq('id', pieceId)
    await notifyDecision({ pieceName, projectName, clientName: decidedBy.trim(), decision, feedback: feedback.trim() || undefined, decidedBy: decidedBy.trim(), pieceToken })
    toast.success(isApproval ? 'Aprovação registrada!' : 'Revisão solicitada!')
    setFeedback(''); setDecidedBy(''); setLoading(false)
    onClose(); onDecided()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>{isApproval ? '✅ Aprovar peça' : '↩ Pedir revisão'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="who">Seu nome</Label>
            <Input id="who" value={decidedBy} onChange={e => setDecidedBy(e.target.value)} placeholder="Ex: João Silva" required />
          </div>
          <div>
            <Label htmlFor="fb">{isApproval ? 'Feedback (opcional)' : 'O que precisa ser revisado? *'}</Label>
            <Textarea id="fb" value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder={isApproval ? 'Ficou ótimo!' : 'Descreva o que precisa mudar...'} rows={3} required={!isApproval} />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={loading} className={`flex-1 ${isApproval ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
              {loading ? 'Enviando...' : isApproval ? 'Confirmar aprovação' : 'Solicitar revisão'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
