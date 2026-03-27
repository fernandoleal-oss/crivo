'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { notifySendClient } from '@/lib/n8n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PieceWithVersions } from '@/lib/types'

interface SendToClientModalProps {
  open: boolean
  piece: PieceWithVersions | null
  projectName: string
  onClose: () => void
  onSent: () => void
}

export function SendToClientModal({ open, piece, projectName, onClose, onSent }: SendToClientModalProps) {
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!piece || !clientName.trim() || !clientEmail.trim()) return
    setLoading(true)

    const reviewUrl = `${window.location.origin}/review/${piece.public_token}`
    await notifySendClient({
      pieceName: piece.title,
      projectName,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      reviewUrl,
    })

    const supabase = createClient()
    await supabase.from('pieces').update({ notified_at: new Date().toISOString() }).eq('id', piece.id)

    toast.success(`Email enviado para ${clientName}!`)
    setClientName(''); setClientEmail(''); setLoading(false)
    onClose(); onSent()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Enviar para o cliente</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-500 -mt-2">
          O cliente receberá um email com o link de revisão e você receberá um aviso no WhatsApp.
        </p>
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
            <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Enviando...' : '✉ Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
