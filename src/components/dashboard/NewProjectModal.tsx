'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface NewProjectModalProps { onCreated: () => void }

export function NewProjectModal({ onCreated }: NewProjectModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !clientName.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('projects').insert({ name: name.trim(), client_name: clientName.trim() })
    setLoading(false)
    if (error) { toast.error('Erro ao criar projeto'); return }
    toast.success('Projeto criado!')
    setName(''); setClientName(''); setOpen(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700">+ Novo Projeto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Novo Projeto</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="name">Nome do projeto / campanha</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Campanha Verão 2026" required />
          </div>
          <div>
            <Label htmlFor="client">Nome do cliente</Label>
            <Input id="client" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: Marca X" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {loading ? 'Criando...' : 'Criar Projeto'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
