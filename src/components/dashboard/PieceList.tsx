'use client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { PieceCard } from './PieceCard'
import { NewPieceModal } from './NewPieceModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { PieceListSkeleton } from '@/components/shared/LoadingSkeleton'
import type { PieceWithVersions } from '@/lib/types'

interface PieceListProps { projectId: string; projectName: string }

export function PieceList({ projectId, projectName }: PieceListProps) {
  const [pieces, setPieces] = useState<PieceWithVersions[]>([])
  const [loading, setLoading] = useState(true)

  const fetchPieces = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('pieces')
      .select('*, piece_versions(*), approvals(*)')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false })
    setPieces((data ?? []) as PieceWithVersions[])
    setLoading(false)
  }, [projectId])

  useEffect(() => { fetchPieces() }, [fetchPieces])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase.channel(`project-${projectId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'approvals' }, payload => {
        const decision = (payload.new as { decision: string }).decision
        toast.info(decision === 'approved' ? '✅ Cliente aprovou uma peça!' : '↩ Cliente pediu revisão!')
        fetchPieces()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => { fetchPieces() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [projectId, fetchPieces])

  void projectName

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Peças</h2>
        <NewPieceModal projectId={projectId} onCreated={fetchPieces} />
      </div>
      {loading ? <PieceListSkeleton /> : pieces.length === 0 ? (
        <EmptyState title="Nenhuma peça ainda" description="Crie a primeira peça desse projeto para enviar ao cliente." />
      ) : (
        <div className="space-y-3">
          {pieces.map(piece => <PieceCard key={piece.id} piece={piece} onRefresh={fetchPieces} />)}
        </div>
      )}
    </div>
  )
}
