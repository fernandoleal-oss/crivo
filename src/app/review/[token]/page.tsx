import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewShell } from '@/components/review/ReviewShell'
import type { PieceWithVersions } from '@/lib/types'

interface Props { params: Promise<{ token: string }> }

export async function generateMetadata({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('pieces').select('title').eq('public_token', token).single()
  return { title: data ? `${data.title} — Crivo` : 'Crivo' }
}

export default async function ReviewPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()
  const { data: piece } = await supabase.from('pieces')
    .select('*, piece_versions(*), approvals(*)')
    .eq('public_token', token)
    .order('version_number', { referencedTable: 'piece_versions', ascending: true })
    .order('decided_at', { referencedTable: 'approvals', ascending: true })
    .single()
  if (!piece) notFound()
  if (!piece.first_opened_at) {
    await supabase.from('pieces').update({ first_opened_at: new Date().toISOString() }).eq('id', piece.id)
  }
  const { data: project } = await supabase.from('projects').select('name, client_name').eq('id', piece.project_id).single()
  return <ReviewShell piece={piece as PieceWithVersions} projectName={project?.name ?? ''} />
}
