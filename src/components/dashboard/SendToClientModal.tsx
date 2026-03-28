'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { notifySendClient } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PieceWithVersions } from '@/lib/types'

interface SendToClientModalProps {
  open: boolean
  piece: PieceWithVersions | null
  projectName: string
  briefingScore?: number
  onClose: () => void
  onSent: () => void
}

export function SendToClientModal({ open, piece, projectName, briefingScore = 100, onClose, onSent }: SendToClientModalProps) {
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [confirmedIncomplete, setConfirmedIncomplete] = useState(false)
  const [loading, setLoading] = useState(false)

  const briefingIncompleto = briefingScore < 80
  const canSend = !briefingIncompleto || confirmedIncomplete

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!piece || !clientName.trim() || !clientEmail.trim() || !canSend) return
    setLoading(true)
    const reviewUrl = `${window.location.origin}/review/${piece.public_token}`
    try {
      await notifySendClient({ pieceName: piece.title, projectName, clientName: clientName.trim(), clientEmail: clientEmail.trim(), reviewUrl })
    } catch (err) {
      console.error('[SendToClientModal] notifySendClient failed:', err)
    }
    const supabase = createClient()
    await supabase.from('pieces').update({ notified_at: new Date().toISOString() }).eq('id', piece.id)
    toast.success(`Email enviado para ${clientName}!`)
    setClientName(''); setClientEmail(''); setConfirmedIncomplete(false); setLoading(false)
    onClose(); onSent()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Enviar para o cliente</DialogTitle></DialogHeader>
        {briefingIncompleto && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 -mt-1 mb-2">
            <p className="text-sm text-amber-800 font-medium flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-4 w-4" />
              Briefing incompleto ({briefingScore}%)
            </p>
            <p className="text-xs text-amber-700 mb-2">
              O briefing deste projeto ainda tem informações faltando. Enviar agora pode gerar revisões desnecessárias.
            </p>
            <label className="flex items-center gap-2 text-sm text-amber-800 cursor-pointer">
              <input type="checkbox" checked={confirmedIncomplete} onChange={e => setConfirmedIncomplete(e.target.checked)} className="rounded" />
              Entendo e quero enviar assim mesmo
            </label>
          </div>
        )}
        {!briefingIncompleto && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 -mt-1 mb-2">
            <p className="text-sm text-blue-700">
              <strong>O que acontece:</strong> O cliente receberá um email com o link de revisão. Ele poderá visualizar, comentar e aprovar — sem precisar criar conta.
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="cname">Nome do cliente</Label>
            <Input id="cname" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: João Silva" required />
          </div>
          <div>
            <Label htmlFor="cemail">Email do cliente</Label>
            <Input id="cemail" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="joao@empresa.com" required />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={loading || !canSend} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Enviando...' : '✉ Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
