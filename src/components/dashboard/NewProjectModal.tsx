'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BriefingTab } from './BriefingTab'
import type { Sector, BriefingData } from '@/lib/types'

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
  const [step, setStep] = useState<'dados' | 'briefing'>('dados')
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [sector, setSector] = useState<Sector>('atendimento')
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(false)

  function handleClose() {
    setOpen(false); setStep('dados')
    setName(''); setClientName(''); setSector('atendimento'); setBriefingData(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 'dados') { setStep('briefing'); return }
    if (!name.trim() || !clientName.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('projects').insert({
      name: name.trim(), client_name: clientName.trim(), sector,
      briefing_data: briefingData ?? null,
      briefing_score: briefingData?.confianca_analise ?? 0,
    })
    setLoading(false)
    if (error) { toast.error('Erro ao criar projeto'); return }
    toast.success('Projeto criado!')
    handleClose(); onCreated()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">+ Novo Projeto</Button>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Projeto</DialogTitle></DialogHeader>
          <div className="flex gap-1 -mt-1 mb-2">
            {(['dados', 'briefing'] as const).map(s => (
              <button key={s} type="button" onClick={() => setStep(s)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${step === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}>
                {s === 'dados' ? '1. Dados' : '2. Briefing'}
              </button>
            ))}
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'dados' && (
              <>
                <div>
                  <Label htmlFor="name">Nome do projeto</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Campanha Janeiro 2026" required />
                </div>
                <div>
                  <Label htmlFor="client">Cliente</Label>
                  <Input id="client" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: EMS Pharma" required />
                </div>
                <div>
                  <Label>Setor responsável</Label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {SECTOR_OPTIONS.map(s => (
                      <button key={s.value} type="button" onClick={() => setSector(s.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${sector === s.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={!name.trim() || !clientName.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Próximo: Briefing →
                </Button>
              </>
            )}
            {step === 'briefing' && (
              <>
                <BriefingTab value={briefingData} onChange={setBriefingData} />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep('dados')} className="flex-1">← Voltar</Button>
                  <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    {loading ? 'Criando...' : briefingData ? 'Criar Projeto' : 'Criar sem briefing'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
