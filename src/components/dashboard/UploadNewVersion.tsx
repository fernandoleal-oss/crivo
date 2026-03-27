'use client'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { isValidFileType, isValidFileSize, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface UploadNewVersionProps { pieceId: string; currentVersionNumber: number; onUploaded: () => void }

export function UploadNewVersion({ pieceId, currentVersionNumber, onUploaded }: UploadNewVersionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!isValidFileType(f.type)) { toast.error('Tipo inválido.'); return }
    if (!isValidFileSize(f.size)) { toast.error('Máximo 10MB.'); return }
    setFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    const supabase = createClient()
    const newVersion = currentVersionNumber + 1
    const path = `${pieceId}/${newVersion}/${file.name}`
    const { error } = await supabase.storage.from('pieces').upload(path, file)
    if (error) { toast.error('Erro no upload'); setLoading(false); return }
    const { data: { publicUrl } } = supabase.storage.from('pieces').getPublicUrl(path)
    await supabase.from('piece_versions').insert({ piece_id: pieceId, version_number: newVersion, file_url: publicUrl, file_type: file.type })
    await supabase.from('pieces').update({ status: 'pending', updated_at: new Date().toISOString() }).eq('id', pieceId)
    toast.success(`Versão ${newVersion} enviada!`)
    setFile(null); setLoading(false); onUploaded()
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} className="hidden" />
      {!file ? (
        <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>↑ Nova versão</Button>
      ) : (
        <>
          <span className="text-xs text-slate-500">{file.name} — {formatFileSize(file.size)}</span>
          <Button size="sm" onClick={handleUpload} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">{loading ? 'Enviando...' : 'Enviar'}</Button>
          <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Cancelar</Button>
        </>
      )}
    </div>
  )
}
