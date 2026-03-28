'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'motion/react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { NewProjectModal } from './NewProjectModal'
import { WelcomeHero } from './WelcomeHero'
import { ActivityPanel } from './ActivityPanel'
import type { ProjectWithCounts } from '@/lib/types'
import { useRole } from '@/lib/role-context'
import { CampaignPanel } from './CampaignPanel'
import { Plus, ArrowUpRight, Clock, CheckCircle2, RefreshCw } from 'lucide-react'
import { cn } from '@/lib/utils'

const USER_BY_ROLE = {
  ceo: 'Desirre',
  criacao: 'Bruno',
  midia: 'Fabi',
}

// Greet based on hour
function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

function approvalRate(project: ProjectWithCounts) {
  const pieces = project.pieces ?? []
  if (!pieces.length) return 0
  const approved = pieces.filter(p => p.status === 'approved').length
  return Math.round((approved / pieces.length) * 100)
}

// Rotate through accent colors for cards
const CARD_ACCENTS = [
  { bg: 'bg-indigo-100', text: 'text-indigo-900', rate: 'text-indigo-500', badge: 'bg-indigo-200 text-indigo-800' },
  { bg: 'bg-rose-100', text: 'text-rose-900', rate: 'text-rose-500', badge: 'bg-rose-200 text-rose-800' },
  { bg: 'bg-[#e8f5c8]', text: 'text-[#2d5000]', rate: 'text-[#4a8a00]', badge: 'bg-[#c8e56d] text-[#2a4600]' },
  { bg: 'bg-violet-100', text: 'text-violet-900', rate: 'text-violet-500', badge: 'bg-violet-200 text-violet-800' },
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
  projects: { name: string; client_name: string } | null
  piece_versions: { file_url: string; version_number: number }[]
}

type Tab = 'pending' | 'revision_requested' | 'approved'

export function ProjectGrid() {
  const { role } = useRole()
  if (role === 'midia') return <CampaignPanel />

  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [pieces, setPieces] = useState<PieceRow[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [tab, setTab] = useState<Tab>('pending')

  const fetchData = useCallback(async () => {
    const supabase = createClient()
    const [{ data: pj }, { data: pc }] = await Promise.all([
      supabase
        .from('projects')
        .select('*, pieces(status, notified_at, approvals(decision))')
        .order('created_at', { ascending: false }),
      supabase
        .from('pieces')
        .select('id, title, status, deadline, project_id, projects(name, client_name), piece_versions(file_url, version_number)')
        .order('updated_at', { ascending: false })
        .limit(30),
    ])
    setProjects((pj ?? []) as ProjectWithCounts[])
    setPieces((pc ?? []) as unknown as PieceRow[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const allPieces = projects.flatMap(p => p.pieces ?? [])
  const totalPieces = allPieces.length
  const approvedCount = allPieces.filter(p => p.status === 'approved').length

  const isFirstTime = !loading && projects.length === 0

  // Split projects into LineUp (top 2) and Trending (next 3)
  const lineUp = projects.slice(0, 2)
  const trending = projects.slice(2, 5)

  // Filter pieces by tab
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
      {/* ── Header ── */}
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
          <button onClick={() => setShowModal(true)} className="flex items-center gap-2 bg-slate-900 text-white text-sm font-medium px-4 py-2 rounded-xl hover:bg-slate-800 transition-colors">
            <Plus size={15} />
            Novo projeto
          </button>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{projects.length}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">Projetos <ArrowUpRight size={10} /></p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-slate-900">{totalPieces}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">Peças <ArrowUpRight size={10} /></p>
          </div>
        </div>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── Main content ── */}
        <div className="flex-1 min-w-0 space-y-8">

          {/* LineUp */}
          {lineUp.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Em andamento ({lineUp.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {lineUp.map((project, i) => {
                  const accent = CARD_ACCENTS[i % CARD_ACCENTS.length]
                  const rate = approvalRate(project)
                  const pcs = project.pieces ?? []
                  const cover = (pieces.find(p => p.project_id === project.id)?.piece_versions ?? [])
                    .find(v => v.version_number === 1)?.file_url
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 26 }}
                      className={cn('rounded-2xl p-5 flex flex-col gap-4', accent.bg)}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <p className={cn('text-xs font-semibold opacity-60 mb-0.5', accent.text)}>{project.client_name}</p>
                          <p className={cn('text-base font-bold leading-tight', accent.text)}>{project.name}</p>
                        </div>
                        <span className={cn('text-4xl font-black tracking-tight', accent.rate)}>{rate}%</span>
                      </div>

                      {/* Photo strip */}
                      {cover && (
                        <div className="h-24 rounded-xl overflow-hidden">
                          <img src={cover} alt={project.name} className="w-full h-full object-cover" />
                        </div>
                      )}

                      {/* Stats row */}
                      <div className="flex items-center justify-between">
                        <div className="flex gap-3 text-xs">
                          <span className={cn('flex items-center gap-1', accent.text, 'opacity-70')}>
                            <CheckCircle2 size={11} />
                            {pcs.filter(p => p.status === 'approved').length} aprovadas
                          </span>
                          <span className={cn('flex items-center gap-1', accent.text, 'opacity-70')}>
                            <Clock size={11} />
                            {pcs.filter(p => p.status === 'pending').length} aguardando
                          </span>
                        </div>
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full', accent.badge)}>
                          {pcs.length} peça{pcs.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Trending */}
          {trending.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Outros projetos ({trending.length})
              </h2>
              <div className="grid grid-cols-3 gap-3">
                {trending.map((project, i) => {
                  const accent = CARD_ACCENTS[(i + 2) % CARD_ACCENTS.length]
                  const rate = approvalRate(project)
                  const pcs = project.pieces ?? []
                  return (
                    <motion.div
                      key={project.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.12 + i * 0.05, type: 'spring', stiffness: 280, damping: 26 }}
                      className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex flex-col gap-2"
                    >
                      <p className="text-xs text-slate-400 font-medium truncate">{project.client_name}</p>
                      <p className="text-sm font-bold text-slate-800 leading-tight truncate">{project.name}</p>
                      <span className={cn('text-2xl font-black', accent.rate)}>{rate}%</span>
                      <div className="flex items-center gap-1 text-[10px] text-slate-400">
                        <Clock size={9} />
                        {pcs.filter(p => p.status === 'pending').length} pendentes
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
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
                Peças ({pieces.length})
              </h2>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit mb-4">
              {([
                { key: 'pending', label: 'Pendentes', icon: Clock },
                { key: 'revision_requested', label: 'Em revisão', icon: RefreshCw },
                { key: 'approved', label: 'Aprovadas', icon: CheckCircle2 },
              ] as { key: Tab; label: string; icon: any }[]).map(({ key, label, icon: Icon }) => (
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
                  <span className={cn('rounded-full px-1.5 py-0.5 text-[10px]', tab === key ? 'bg-slate-100' : 'bg-slate-200')}>
                    {tabCounts[key]}
                  </span>
                </button>
              ))}
            </div>

            {/* Pieces list */}
            <div className="space-y-2">
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
                ))
              ) : filteredPieces.length === 0 ? (
                <div className="text-sm text-slate-400 text-center py-8">
                  Nenhuma peça {tab === 'pending' ? 'pendente' : tab === 'approved' ? 'aprovada' : 'em revisão'}
                </div>
              ) : (
                filteredPieces.map((piece, i) => {
                  const cover = (piece.piece_versions ?? []).find(v => v.version_number === 1)?.file_url
                  return (
                    <motion.div
                      key={piece.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      className="bg-white rounded-xl border border-slate-100 px-4 py-3 flex items-center gap-4 hover:shadow-sm transition-shadow"
                    >
                      {cover && (
                        <div className="w-10 h-10 rounded-lg overflow-hidden flex-shrink-0">
                          <img src={cover} alt={piece.title} className="w-full h-full object-cover" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{piece.title}</p>
                        <p className="text-xs text-slate-400 truncate">
                          {piece.projects?.name ?? '—'} · {piece.projects?.client_name ?? '—'}
                        </p>
                      </div>
                      <div className="flex items-center gap-3 flex-shrink-0">
                        {piece.deadline && (
                          <span className="text-xs text-slate-400">
                            {new Date(piece.deadline).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })}
                          </span>
                        )}
                        <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', STATUS_STYLE[piece.status])}>
                          {STATUS_LABEL[piece.status] ?? piece.status}
                        </span>
                      </div>
                    </motion.div>
                  )
                })
              )}
            </div>
          </section>
        </div>

        {/* ── Right Panel ── */}
        {!loading && (
          <ActivityPanel totalPieces={totalPieces} approvedPieces={approvedCount} />
        )}
      </div>

      <NewProjectModal open={showModal} onOpenChange={setShowModal} onCreated={fetchData} />
    </div>
  )
}
