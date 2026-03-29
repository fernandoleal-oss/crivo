'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'motion/react'
import { createClient } from '@/lib/supabase/client'
import { NewProjectModal } from './NewProjectModal'
import { WelcomeHero } from './WelcomeHero'
import { ActivityPanel } from './ActivityPanel'
import { AvatarStack, PersonAvatar } from '@/components/ui/PersonAvatar'
import type { ProjectWithCounts } from '@/lib/types'
import { useRole } from '@/lib/role-context'
import { CampaignPanel } from './CampaignPanel'
import { Plus, ArrowUpRight, Clock, CheckCircle2, RefreshCw } from 'lucide-react'
import { AIScoreBadge } from '@/components/ui/AIScoreBadge'
import { ApprovalChain, isFullyApprovedInternally } from '@/components/ui/ApprovalChain'
import TranscriptionModal from './TranscriptionModal'
import { cn } from '@/lib/utils'

const USER_BY_ROLE = {
  ceo: 'Desirre',
  criacao: 'Bruno',
  midia: 'Fabi',
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function calcApprovalRate(project: ProjectWithCounts) {
  const pieces = project.pieces ?? []
  if (!pieces.length) return 0
  return Math.round((pieces.filter(p => p.status === 'approved').length / pieces.length) * 100)
}

const CARD_ACCENTS = [
  { bg: 'bg-indigo-100', text: 'text-indigo-900', rate: 'text-indigo-400', badge: 'bg-indigo-200 text-indigo-800' },
  { bg: 'bg-[#e8f5c8]', text: 'text-[#2d5000]', rate: 'text-[#4a8a00]', badge: 'bg-[#c8e56d] text-[#2a4600]' },
  { bg: 'bg-rose-100', text: 'text-rose-900', rate: 'text-rose-400', badge: 'bg-rose-200 text-rose-800' },
  { bg: 'bg-violet-100', text: 'text-violet-900', rate: 'text-violet-400', badge: 'bg-violet-200 text-violet-800' },
]

const STATUS_STYLE: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  revision_requested: 'bg-rose-50 text-rose-700 border-rose-200',
}
const STATUS_LABEL: Record<string, string> = {
  pending: 'Pendente',
  approved: 'Aprovada',
  revision_requested: 'Em revisão',
}

interface PieceRow {
  id: string
  title: string
  status: string
  deadline: string | null
  project_id: string
  ai_score: number | null
  ai_issues: string[] | null
  projects: { name: string; client_name: string } | null
  piece_versions: { file_url: string; version_number: number }[]
  internal_status: string | null
  approvals: { decided_by: string; decision: string; role?: string; step_order?: number }[]
}

type Tab = 'pending' | 'revision_requested' | 'approved'

// Extract unique approver names from a project's pieces' approvals
function projectApprovers(project: ProjectWithCounts, pieces: PieceRow[]): string[] {
  const projectPieces = pieces.filter(p => p.project_id === project.id)
  const names = new Set<string>()
  for (const piece of projectPieces) {
    for (const a of piece.approvals ?? []) {
      if (a.decided_by) names.add(a.decided_by)
    }
  }
  // Also add the briefing aprovador if present
  const aprovador = (project as any).briefing_data?.aprovador
  if (aprovador) {
    // "Camila Torres (Head de Marketing)" → "Camila Torres"
    const clean = aprovador.replace(/\s*\(.*\)/, '').trim()
    if (clean) names.add(clean)
  }
  return Array.from(names)
}

export function ProjectGrid() {
  const { role } = useRole()
  const router = useRouter()
  if (role === 'midia') return <CampaignPanel />

  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [pieces, setPieces] = useState<PieceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [tab, setTab] = useState<Tab>('pending')
  const [showTranscription, setShowTranscription] = useState(false)
  const [transcriptionProject, setTranscriptionProject] = useState<{id:string,name:string,client:string}|null>(null)

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const [{ data: pj }, { data: pc }] = await Promise.all([
      supabase
        .from('projects')
        .select('*, pieces(status, notified_at, approvals(decision))')
        .order('created_at', { ascending: false }),
      supabase
        .from('pieces')
        .select('id, title, status, deadline, project_id, ai_score, ai_issues, internal_status, projects(name, client_name), piece_versions(file_url, version_number), approvals(decided_by, decision, role, step_order)')
        .order('updated_at', { ascending: false })
        .limit(30),
    ])
    setProjects((pj ?? []) as ProjectWithCounts[])
    setPieces((pc ?? []) as unknown as PieceRow[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pieces' }, () => { fetchData() })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'approvals' }, () => { fetchData() })
      .subscribe()
    return () => { supabase.removeChannel(channel) }
  }, [fetchData])

  const allPieces = projects.flatMap(p => p.pieces ?? [])
  const totalPieces = allPieces.length
  const approvedCount = allPieces.filter(p => p.status === 'approved').length

  const isFirstTime = !loading && projects.length === 0

  const lineUp = projects.slice(0, 2)
  const trending = projects.slice(2, 5)

  const filteredPieces = pieces.filter(p => p.status === tab)
  const tabCounts = {
    pending: pieces.filter(p => p.status === 'pending').length,
    revision_requested: pieces.filter(p => p.status === 'revision_requested').length,
    approved: pieces.filter(p => p.status === 'approved').length,
  }

  if (isFirstTime) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <WelcomeHero onCreateProject={() => setShowModal(true)} />
        <NewProjectModal open={showModal} onOpenChange={setShowModal} onCreated={fetchData} />
      </div>
    )
  }

  return (
    <div className="px-6 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {greeting()}, {USER_BY_ROLE[role]}!
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className="flex items-center gap-6">
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <Plus size={15} />
            Novo projeto
          </button>
          <div className="text-center cursor-default">
            <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
            <p className="text-xs text-slate-400 flex items-center gap-0.5">Projetos <ArrowUpRight size={10} /></p>
          </div>
          <div className="text-center cursor-default">
            <p className="text-2xl font-bold text-slate-900">{totalPieces}</p>
            <p className="text-xs text-slate-400 flex items-center gap-0.5">Peças <ArrowUpRight size={10} /></p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        <div className="flex-1 min-w-0 space-y-8">

          {/* LineUp — top 2 projetos */}
          {lineUp.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Em andamento ({lineUp.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lineUp.map((project, i) => {
                  const accent = CARD_ACCENTS[i % CARD_ACCENTS.length]
                  const rate = calcApprovalRate(project)
                  const pcs = project.pieces ?? []
                  const cover = pieces
                    .filter(p => p.project_id === project.id)
                    .flatMap(p => p.piece_versions)
                    .find(v => v.version_number === 1)?.file_url
                  const approvers = projectApprovers(project, pieces)
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 26 }}
                      className={cn('rounded-2xl p-5 flex flex-col gap-3 cursor-pointer hover:shadow-lg transition-shadow', accent.bg)}
                      onClick={() => router.push(`/project/${project.id}`)}
                    >
                      {/* Top row */}
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0 pr-4">
                          <p className={cn('text-[11px] font-semibold opacity-60 mb-0.5 uppercase tracking-wide', accent.text)}>
                            {project.client_name}
                          </p>
                          <p className={cn('text-base font-bold leading-tight', accent.text)}>{project.name}</p>
                        </div>
                        <span className={cn('text-4xl font-black tracking-tight flex-shrink-0', accent.rate)}>
                          {rate}%
                        </span>
                      </div>

                      {/* Cover photo */}
                      {cover && (
                        <div className="h-28 rounded-xl overflow-hidden">
                          <img src={cover} alt={project.name} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Bottom row: avatars + stats */}
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          {approvers.length > 0 && (
                            <AvatarStack names={approvers} size={26} />
                          )}
                          {approvers.length > 0 && (
                            <p className={cn('text-[10px] opacity-50', accent.text)}>
                              {approvers[0]}{approvers.length > 1 ? ` +${approvers.length - 1}` : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-3 text-[11px]">
                          <span className={cn('flex items-center gap-1', accent.text, 'opacity-70')}>
                            <CheckCircle2 size={11} />
                            {pcs.filter(p => p.status === 'approved').length}
                          </span>
                          <span className={cn('flex items-center gap-1', accent.text, 'opacity-70')}>
                            <Clock size={11} />
                            {pcs.filter(p => p.status === 'pending').length}
                          </span>
                          <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', accent.badge)}>
                            {pcs.length} peça{pcs.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </div>
                      {/* Transcription indicators */}
                      <div className="flex items-center gap-2 mt-1">
                        {(project as any).briefing_data?.transcription_summary && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            📞 Transcrição IA
                          </span>
                        )}
                        {role === 'ceo' && (
                          <button onClick={(e) => { e.stopPropagation(); setTranscriptionProject({id: project.id, name: project.name, client: project.client_name}); setShowTranscription(true) }}
                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800">
                            + Colar transcrição
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Trending — próximos projetos */}
          {trending.length > 0 && (
            <section>
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Outros projetos ({trending.length})
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {trending.map((project, i) => {
                  const accent = CARD_ACCENTS[(i + 2) % CARD_ACCENTS.length]
                  const rate = calcApprovalRate(project)
                  const pcs = project.pieces ?? []
                  const approvers = projectApprovers(project, pieces)
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.05, type: 'spring', stiffness: 280, damping: 26 }}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2 cursor-pointer hover:shadow-lg transition-shadow"
                      onClick={() => router.push(`/project/${project.id}`)}
                    >
                      <p className="text-[10px] text-slate-400 font-medium truncate uppercase tracking-wide">{project.client_name}</p>
                      <p className="text-sm font-bold text-slate-800 leading-tight truncate">{project.name}</p>
                      <span className={cn('text-2xl font-black', accent.rate)}>{rate}%</span>
                      <div className="flex items-center justify-between mt-1">
                        {approvers.length > 0 ? (
                          <AvatarStack names={approvers} size={22} />
                        ) : (
                          <span className="text-[10px] text-slate-300">Sem aprovadores</span>
                        )}
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock size={9} />
                          {pcs.filter(p => p.status === 'pending').length} pend.
                        </span>
                      </div>
                      {/* Transcription indicators */}
                      <div className="flex items-center gap-2 mt-1">
                        {(project as any).briefing_data?.transcription_summary && (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                            📞 Transcrição IA
                          </span>
                        )}
                        {role === 'ceo' && (
                          <button onClick={(e) => { e.stopPropagation(); setTranscriptionProject({id: project.id, name: project.name, client: project.client_name}); setShowTranscription(true) }}
                            className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800">
                            + Colar transcrição
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          )}

          {/* My Work — Peças com tabs */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Peças ({pieces.length})
              </h2>
            </div>

            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-4">
              {([
                { key: 'pending' as Tab, label: 'Pendentes', icon: Clock },
                { key: 'revision_requested' as Tab, label: 'Em revisão', icon: RefreshCw },
                { key: 'approved' as Tab, label: 'Aprovadas', icon: CheckCircle2 },
              ]).map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    tab === key ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  )}
                >
                  <Icon size={11} />
                  {label}
                  <span className={cn('rounded-full px-1.5 text-[10px]', tab === key ? 'bg-slate-100' : 'bg-slate-200')}>
                    {tabCounts[key]}
                  </span>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ))
              ) : filteredPieces.length === 0 ? (
                <div className="text-sm text-slate-400 text-center py-8">
                  Nenhuma peça {tab === 'pending' ? 'pendente' : tab === 'approved' ? 'aprovada' : 'em revisão'}
                </div>
              ) : (
                filteredPieces.map((piece, i) => {
                  const maxVersion = (piece.piece_versions ?? []).reduce((m, v) => Math.max(m, v.version_number), 0)
                  const typedApprovals = (piece.approvals ?? []).filter(a => a.role && a.step_order).map(a => ({
                    role: a.role!, step_order: a.step_order!, decision: a.decision, decided_by: a.decided_by
                  }))
                  return (
                    <motion.div
                      key={piece.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="rounded-2xl border-2 border-slate-100 bg-white overflow-hidden hover:shadow-lg hover:border-indigo-300 transition-all cursor-pointer"
                      onClick={() => router.push(`/project/${piece.project_id}`)}
                    >
                      {/* Color accent bar */}
                      <div className="flex h-1.5">
                        {(['da','redator','dc','ecd'] as const).map((r, idx) => {
                          const colors = ['bg-violet-600','bg-amber-500','bg-pink-500','bg-emerald-500']
                          const hasApproval = piece.approvals?.some(a => a.role === r && a.decision === 'approved')
                          return <div key={r} className={cn(colors[idx], hasApproval ? 'opacity-100' : 'opacity-20')} style={{flex:1}} />
                        })}
                      </div>
                      <div className="p-4">
                        {/* Title + AI Score */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm text-slate-900 truncate">{piece.title}</p>
                            <p className="text-xs text-slate-500 mt-0.5">{piece.projects?.client_name} · {piece.projects?.name}</p>
                          </div>
                          {role === 'criacao' && <AIScoreBadge score={piece.ai_score} issues={piece.ai_issues} />}
                        </div>

                        {/* Thumbnail */}
                        {piece.piece_versions?.[0]?.file_url && (
                          <img src={piece.piece_versions[0].file_url} className="w-full aspect-video object-cover rounded-xl mb-3" alt="" />
                        )}

                        {/* Approval Chain */}
                        <ApprovalChain approvals={typedApprovals} />

                        {/* Footer */}
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center gap-2">
                            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', STATUS_STYLE[piece.status])}>
                              {STATUS_LABEL[piece.status]}
                            </span>
                            {maxVersion > 0 && (
                              <span className="text-[10px] text-slate-400 font-medium">v{maxVersion}</span>
                            )}
                            {role === 'ceo' && isFullyApprovedInternally(typedApprovals) && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-100 text-sky-700">Pronta para envio</span>
                            )}
                          </div>
                          {piece.deadline && (
                            <span className="text-[11px] text-orange-500 font-semibold flex items-center gap-1">
                              <Clock size={11} /> {new Date(piece.deadline).toLocaleDateString('pt-BR', {day:'2-digit',month:'2-digit'})}
                            </span>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </section>
        </div>

        {/* Right Panel */}
        {!loading && (
          <ActivityPanel totalPieces={totalPieces} approvedPieces={approvedCount} />
        )}
      </div>

      <NewProjectModal open={showModal} onOpenChange={setShowModal} onCreated={fetchData} />

      {showTranscription && transcriptionProject && (
        <TranscriptionModal
          open={showTranscription}
          onClose={() => setShowTranscription(false)}
          projectName={transcriptionProject.name}
          clientName={transcriptionProject.client}
          projectId={transcriptionProject.id}
          onBriefingGenerated={async (data: any) => {
            const supabase = createClient()
            await supabase.from('projects').update({ briefing_data: data, briefing_score: data.confianca_analise ?? 0 }).eq('id', transcriptionProject.id)
            fetchData()
          }}
        />
      )}
    </div>
  )
}
