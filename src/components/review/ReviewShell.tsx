'use client'
import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PieceViewer } from './PieceViewer'
import { CommentPanel } from './CommentPanel'
import { VersionNav } from './VersionNav'
import { ApprovalModal } from './ApprovalModal'
import { PinLayer } from './PinLayer'
import { VersionCompare } from './VersionCompare'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import type { PieceWithVersions, PieceVersion, Comment } from '@/lib/types'

interface ReviewShellProps { piece: PieceWithVersions; projectName: string }

export function ReviewShell({ piece, projectName }: ReviewShellProps) {
  const versions = piece.piece_versions?.sort((a, b) => a.version_number - b.version_number) ?? []
  const [currentVersion, setCurrentVersion] = useState<PieceVersion>(versions.at(-1)!)
  const [comments, setComments] = useState<Comment[]>([])
  const [decided, setDecided] = useState(!!piece.approvals?.length)
  const [showApprove, setShowApprove] = useState(false)
  const [showRevision, setShowRevision] = useState(false)
  const [hoveredPinIndex, setHoveredPinIndex] = useState<number | null>(null)
  const [comparing, setComparing] = useState(false)

  const fetchComments = useCallback(async () => {
    if (!currentVersion) return
    const supabase = createClient()
    const { data } = await supabase.from('comments').select('*')
      .eq('piece_id', piece.id).eq('version_id', currentVersion.id).order('created_at', { ascending: true })
    setComments((data ?? []) as Comment[])
  }, [piece.id, currentVersion])

  useEffect(() => { fetchComments() }, [fetchComments])

  if (!currentVersion) return <div className="p-8 text-center text-slate-500">Nenhuma versão disponível.</div>

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-start justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-slate-400">{projectName}</p>
            <h1 className="font-semibold text-slate-900">{piece.title}</h1>
            {piece.description && <p className="text-sm text-slate-500 mt-0.5">{piece.description}</p>}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={piece.status} />
            <VersionNav versions={versions} currentVersionId={currentVersion.id} onSelect={setCurrentVersion} onCompare={() => setComparing(true)} />
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="flex-1 min-w-0">
            <PieceViewer fileUrl={currentVersion.file_url} fileType={currentVersion.file_type}>
              <PinLayer
                pieceId={piece.id}
                versionId={currentVersion.id}
                pinComments={comments.filter(c => c.comment_type === 'pin')}
                hoveredPinIndex={hoveredPinIndex}
                onCommentAdded={fetchComments}
                disabled={decided}
              />
            </PieceViewer>
            <div className="flex items-center justify-between mt-2">
              <div className="flex items-center gap-2">
                {!decided && <span className="text-indigo-500 text-xs">Clique na imagem para fixar um comentário</span>}
                <p className="text-xs text-slate-400">v{currentVersion.version_number} · {formatRelativeTime(currentVersion.uploaded_at)}</p>
              </div>
              <a href={currentVersion.file_url} download className="text-xs text-indigo-600 hover:underline">⬇ Download</a>
            </div>
          </div>
          <div className="w-full lg:w-80 flex-shrink-0">
            {decided ? (
              <div className="bg-slate-100 rounded-lg p-4 text-center mb-4">
                <p className="font-medium text-slate-700">Decisão registrada ✓</p>
                <p className="text-sm text-slate-500 mt-1">Você ainda pode deixar comentários.</p>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <Button onClick={() => setShowApprove(true)} className="flex-1 bg-green-600 hover:bg-green-700">Aprovar</Button>
                <Button onClick={() => setShowRevision(true)} variant="outline" className="flex-1 border-amber-400 text-amber-700 hover:bg-amber-50">Pedir Revisão</Button>
              </div>
            )}
            <CommentPanel pieceId={piece.id} versionId={currentVersion.id} comments={comments}
              onCommentAdded={fetchComments} onPinHover={setHoveredPinIndex} />
          </div>
        </div>
        {!decided && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex gap-2 lg:hidden z-10">
            <Button onClick={() => setShowApprove(true)} className="flex-1 bg-green-600 hover:bg-green-700">Aprovar</Button>
            <Button onClick={() => setShowRevision(true)} variant="outline" className="flex-1 border-amber-400 text-amber-700">Pedir Revisão</Button>
          </div>
        )}
      </div>
      <ApprovalModal open={showApprove} decision="approved" pieceId={piece.id} versionId={currentVersion.id}
        pieceName={piece.title} projectName={projectName} pieceToken={piece.public_token}
        onClose={() => setShowApprove(false)} onDecided={() => setDecided(true)} />
      <ApprovalModal open={showRevision} decision="revision_requested" pieceId={piece.id} versionId={currentVersion.id}
        pieceName={piece.title} projectName={projectName} pieceToken={piece.public_token}
        onClose={() => setShowRevision(false)} onDecided={() => setDecided(true)} />
      {comparing && <VersionCompare versions={versions} onClose={() => setComparing(false)} />}
    </div>
  )
}
