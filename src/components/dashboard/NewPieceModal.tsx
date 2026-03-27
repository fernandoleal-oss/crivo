'use client'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { generateToken, isValidFileType, isValidFileSize, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'

interface NewPieceModalProps { projectId: string; onCreated: () => void }

export function NewPieceModal({ projectId, onCreated }: NewPieceModalProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!isValidFileType(f.type)) { toast.error('Tipo inválido. Use JPG, PNG ou PDF.'); return }
    if (!isValidFileSize(f.size)) { toast.error('Arquivo muito grande. Máximo 10MB.'); return }
    setFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !file) { toast.error('Preencha o título e selecione um arquivo.'); return }
    setLoading(true)
    const supabase = createClient()
    const token = generateToken()
    const { data: piece, error: pieceErr } = await supabase
      .from('pieces')
      .insert({ project_id: projectId, title: title.trim(), description: description.trim() || null, public_token: token })
      .select().single()
    if (pieceErr || !piece) { toast.error('Erro ao criar peça'); setLoading(false); return }
    const path = `${piece.id}/1/${file.name}`
    const { error: uploadErr } = await supabase.storage.from('pieces').upload(path, file)
    if (uploadErr) { toast.error('Erro no upload'); setLoading(false); return }
    setProgress(100)
    const { data: { publicUrl } } = supabase.storage.from('pieces').getPublicUrl(path)
    await supabase.from('piece_versions').insert({ piece_id: piece.id, version_number: 1, file_url: publicUrl, file_type: file.type })
    toast.success('Peça criada!')
    setTitle(''); setDescription(''); setFile(null); setProgress(0); setOpen(false); setLoading(false)
    onCreated()
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>+ Nova Peça</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Peça</DialogTitle></DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="title">Título</Label>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Banner Instagram 1080x1080" required />
            </div>
            <div>
              <Label htmlFor="desc">Descrição (opcional)</Label>
              <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Orientações para o cliente..." rows={2} />
            </div>
            <div>
              <Label>Arquivo (JPG, PNG ou PDF — máx. 10MB)</Label>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} className="hidden" />
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-300 transition-colors mt-1">
                {file ? <p className="text-sm text-slate-700">{file.name} — {formatFileSize(file.size)}</p>
                  : <p className="text-sm text-slate-400">Clique para selecionar</p>}
              </div>
              {progress > 0 && progress < 100 && (
                <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                  <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
              )}
            </div>
            <Button type="submit" disabled={loading || !file} className="w-full bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Enviando...' : 'Criar Peça'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
