'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { Sector } from '@/lib/types'

const SECTOR_OPTIONS: { value: Sector; label: string }[] = [
  { value: 'atendimento', label: '📋 Atendimento' },
  { value: 'criacao', label: '🎨 Criação' },
  { value: 'rtv', label: '📺 RTV' },
  { value: 'midia', label: '📡 Mídia' },
  { value: 'geral', label: '📁 Geral' },
]

interface NewProjectModalProps { onCreated: () => void; open?: boolean; onOpenChange?: (v: boolean) => void }

export function NewProjectModal({ onCreated, open: externalOpen, onOpenChange }: NewProjectModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = (v: boolean) => { setInternalOpen(v); onOpenChange?.(v) }
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [sector, setSector] = useState<Sector>('atendimento')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !clientName.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('projects').insert({
      name: name.trim(),
      client_name: clientName.trim(),
      sector,
    })
    setLoading(false)
    if (error) { toast.error('Erro ao criar projeto'); return }
    toast.success('Projeto criado!')
    setName(''); setClientName(''); setSector('atendimento'); setOpen(false)
    onCreated()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">+ Novo Projeto</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo Projeto</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500 -mt-1 mb-2">
            Um projeto agrupa todas as peças de uma campanha ou demanda. O cliente receberá links individuais para revisar cada peça.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="name">Nome do projeto</Label>
              <p className="text-xs text-slate-400 mb-1">Identifique a campanha ou demanda. Use algo descritivo para facilitar a busca depois.</p>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Campanha Janeiro 2026" required />
            </div>
            <div>
              <Label htmlFor="client">Cliente</Label>
              <p className="text-xs text-slate-400 mb-1">Nome da empresa ou pessoa que vai aprovar as peças.</p>
              <Input id="client" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: EMS Pharma" required />
            </div>
            <div>
              <Label>Setor responsável</Label>
              <p className="text-xs text-slate-400 mb-1">Selecione a área da agência que cuida desse projeto.</p>
              <div className="flex gap-2 flex-wrap mt-1">
                {SECTOR_OPTIONS.map(s => (
                  <button
                    key={s.value}
                    type="button"
                    onClick={() => setSector(s.value)}
                    className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                      sector === s.value
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Criando...' : 'Criar Projeto'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
