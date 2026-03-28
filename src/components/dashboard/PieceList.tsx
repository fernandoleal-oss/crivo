'use client'
import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { PieceCard } from './PieceCard'
import { NewPieceModal } from './NewPieceModal'
import { SendToClientModal } from './SendToClientModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { PieceListSkeleton } from '@/components/shared/LoadingSkeleton'
import type { PieceWithVersions } from '@/lib/types'

interface PieceListProps { projectId: string; projectName: string }

export function PieceList({ projectId, projectName }: PieceListProps) {
  const [pieces, setPieces] = useState<PieceWithVersions[]>([])
  const [loading, setLoading] = useState(true)
  const [sendTarget, setSendTarget] = useState<PieceWithVersions | null>(null)

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
        toast.info(decision === 'approved' ? 'Cliente aprovou uma peça!' : 'Cliente pediu revisão!')
        fetchPieces()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => { fetchPieces() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [projectId, fetchPieces])

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-800">Peças</h2>
        <NewPieceModal projectId={projectId} onCreated={fetchPieces} />
      </div>
      {loading ? <PieceListSkeleton /> : pieces.length === 0 ? (
        <EmptyState
          title="Nenhuma peça nesse projeto"
          description='Clique em "+ Nova Peça" acima para fazer upload de uma imagem ou PDF. Cada peça ganha um link único que você envia pro cliente revisar.'
          tip="Formatos aceitos: JPG, PNG e PDF (até 10MB). Você pode subir várias versões depois."
        />
      ) : (
        <div className="space-y-3">
          {pieces.map(piece => <PieceCard key={piece.id} piece={piece} onRefresh={fetchPieces} onSendToClient={setSendTarget} />)}
        </div>
      )}
      <SendToClientModal
        open={!!sendTarget}
        piece={sendTarget}
        projectName={projectName}
        onClose={() => setSendTarget(null)}
        onSent={fetchPieces}
      />
    </div>
  )
}
