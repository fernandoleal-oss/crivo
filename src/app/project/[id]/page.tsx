import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PieceList } from '@/components/dashboard/PieceList'

interface Props { params: Promise<{ id: string }> }

export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase.from('projects').select('*').eq('id', id).single()
  if (!project) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href="/" className="hover:text-indigo-600">← Dashboard</Link>
          <span>/</span>
          <span className="text-slate-700 font-medium">{project.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
        <p className="text-slate-500">Cliente: <strong>{project.client_name}</strong></p>
      </div>

      {/* Contextual help */}
      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-indigo-800">
          <strong>Como funciona este projeto:</strong> Suba as peças criativas abaixo (imagens ou PDFs).
          Cada peça ganha um link único. Clique em <strong>&quot;Enviar para cliente&quot;</strong> para que ele receba
          o link por email e possa aprovar ou pedir revisão — sem precisar instalar nada.
        </p>
      </div>

      <PieceList projectId={project.id} projectName={project.name} />
    </div>
  )
}
