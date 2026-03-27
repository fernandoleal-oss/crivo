'use client'
import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { isValidFileType, isValidFileSize, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UploadProgress } from '@/components/shared/UploadProgress'

interface UploadNewVersionProps { pieceId: string; currentVersionNumber: number; onUploaded: () => void }

export function UploadNewVersion({ pieceId, currentVersionNumber, onUploaded }: UploadNewVersionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [uploadError, setUploadError] = useState<string | undefined>()
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!isValidFileType(f.type)) { toast.error('Só aceitamos JPG, PNG e PDF.'); return }
    if (!isValidFileSize(f.size)) { toast.error('Arquivo maior que 10MB.'); return }
    setFile(f)
    setUploadError(undefined)
    setProgress(0)
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    setUploadError(undefined)
    const supabase = createClient()
    const newVersion = currentVersionNumber + 1
    const path = `${pieceId}/${newVersion}/${file.name}`
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/pieces/${path}`

    try {
      const publicUrl = await new Promise<string>((resolve, reject) => {
        const xhr = new XMLHttpRequest()
        xhr.open('POST', url)
        xhr.setRequestHeader('Authorization', `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`)
        xhr.setRequestHeader('x-upsert', 'false')
        xhr.upload.onprogress = (e) => {
          if (e.lengthComputable) setProgress(Math.round((e.loaded / e.total) * 100))
        }
        xhr.onload = () => {
          if (xhr.status >= 200 && xhr.status < 300) {
            resolve(supabase.storage.from('pieces').getPublicUrl(path).data.publicUrl)
          } else {
            reject(new Error('Upload falhou'))
          }
        }
        xhr.onerror = () => reject(new Error('Falha na conexão. Tente novamente.'))
        const formData = new FormData()
        formData.append('', file)
        xhr.send(formData)
      })
      await supabase.from('piece_versions').insert({ piece_id: pieceId, version_number: newVersion, file_url: publicUrl, file_type: file.type })
      await supabase.from('pieces').update({ status: 'pending', updated_at: new Date().toISOString() }).eq('id', pieceId)
      toast.success(`Versão ${newVersion} enviada!`)
      setFile(null); setProgress(0); setLoading(false)
      onUploaded()
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro no upload'
      setUploadError(msg)
      setLoading(false)
    }
  }

  return (
    <div className="mt-2">
      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} className="hidden" />
      {!file ? (
        <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>↑ Nova versão</Button>
      ) : (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-slate-500">{file.name} — {formatFileSize(file.size)}</span>
          <Button size="sm" onClick={handleUpload} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">{loading ? 'Enviando...' : 'Enviar'}</Button>
          <Button variant="ghost" size="sm" onClick={() => { setFile(null); setProgress(0); setUploadError(undefined) }}>Cancelar</Button>
        </div>
      )}
      <UploadProgress
        progress={progress}
        fileName={file?.name ?? ''}
        error={uploadError}
        onRetry={() => { setUploadError(undefined); setProgress(0) }}
      />
    </div>
  )
}
