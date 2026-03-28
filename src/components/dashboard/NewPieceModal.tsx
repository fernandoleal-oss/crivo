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
import { UploadProgress } from '@/components/shared/UploadProgress'

interface NewPieceModalProps { projectId: string; onCreated: () => void }

function getUploadError(file: File): string | null {
  if (!isValidFileType(file.type)) return 'Só aceitamos JPG, PNG e PDF.'
  if (!isValidFileSize(file.size)) return 'Arquivo maior que 10MB.'
  return null
}

export function NewPieceModal({ projectId, onCreated }: NewPieceModalProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [deadline, setDeadline] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const err = getUploadError(f)
    if (err) { toast.error(err); return }
    setFile(f)
    setUploadError(undefined)
    setProgress(0)
  }

  function reset() {
    setTitle(''); setDescription(''); setDeadline(''); setFile(null)
    setProgress(0); setUploadError(undefined); setLoading(false)
  }

  async function uploadWithProgress(path: string, fileToUpload: File, bucketName: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const supabase = createClient()
      const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/${bucketName}/${path}`
      const xhr = new XMLHttpRequest()
      xhr.open('POST', url)
      xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
      xhr.setRequestHeader('x-upsert', 'false')
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
      }
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const { data } = supabase.storage.from(bucketName).getPublicUrl(path)
          resolve(data.publicUrl)
        } else {
          reject(new Error('Upload falhou'))
        }
      }
      xhr.onerror = () => reject(new Error('Falha na conexão. Tente novamente.'))
      const formData = new FormData()
      formData.append('', fileToUpload)
      xhr.send(formData)
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !file) { toast.error('Preencha o título e selecione um arquivo.'); return }
    setLoading(true)
    setUploadError(undefined)
    setProgress(0)
    const supabase = createClient()
    const token = generateToken()
    const { data: piece, error: pieceErr } = await supabase
      .from('pieces')
      .insert({ project_id: projectId, title: title.trim(), description: description.trim() || null, public_token: token, deadline: deadline || null })
      .select().single()
    if (pieceErr || !piece) { toast.error('Erro ao criar peça'); setLoading(false); return }
    const path = `${piece.id}/1/${file.name}`
    let publicUrl: string
    try {
      publicUrl = await uploadWithProgress(path, file, 'pieces')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro no upload'
      setUploadError(msg)
      await supabase.from('pieces').delete().eq('id', piece.id)
      setLoading(false)
      return
    }
    await supabase.from('piece_versions').insert({ piece_id: piece.id, version_number: 1, file_url: publicUrl, file_type: file.type })
    toast.success('Peça criada!')
    reset(); setOpen(false)
    onCreated()
  }

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)}>+ Nova Peça</Button>
      <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); setOpen(v) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova Peça</DialogTitle></DialogHeader>
          <p className="text-sm text-slate-500 -mt-1 mb-2">
            Uma peça é o arquivo criativo que será enviado para aprovação. O cliente verá o título e a descrição ao revisar.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <Label htmlFor="title">Título da peça</Label>
              <p className="text-xs text-slate-500 mb-1">Nome descritivo que o cliente verá na tela de revisão.</p>
              <Input id="title" value={title} onChange={e => setTitle(e.target.value)} placeholder="Ex: Banner Instagram 1080x1080" required />
            </div>
            <div>
              <Label htmlFor="desc">Descrição (opcional)</Label>
              <p className="text-xs text-slate-500 mb-1">Instruções ou contexto para o cliente entender a peça. Ex: &quot;Versão com fundo azul conforme briefing&quot;.</p>
              <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)} placeholder="Orientações para o cliente..." rows={2} />
            </div>
            <div>
              <Label htmlFor="deadline">Prazo de aprovação (opcional)</Label>
              <Input id="deadline" type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="mt-1" />
            </div>
            <div>
              <Label>Arquivo (JPG, PNG ou PDF — máx. 10MB)</Label>
              <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} className="hidden" />
              <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-300 transition-colors mt-1">
                {file
                  ? <p className="text-sm text-slate-700">{file.name} — {formatFileSize(file.size)}</p>
                  : <p className="text-sm text-slate-500">Clique para selecionar</p>}
              </div>
              <UploadProgress
                progress={progress}
                fileName={file?.name ?? ''}
                error={uploadError}
                onRetry={() => { setUploadError(undefined); setProgress(0) }}
              />
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
