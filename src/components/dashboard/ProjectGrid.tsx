'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { ProjectCard } from './ProjectCard'
import { NewProjectModal } from './NewProjectModal'
import { SectorTabs } from './SectorTabs'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProjectGridSkeleton } from '@/components/shared/LoadingSkeleton'
import { DashboardCounters } from './DashboardCounters'
import { WelcomeHero } from './WelcomeHero'
import { GuidedTourBanner } from './GuidedTourBanner'
import { Input } from '@/components/ui/input'
import type { ProjectWithCounts } from '@/lib/types'
import type { Sector } from '@/lib/types'

export function ProjectGrid() {
  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState<Sector | 'all'>('all')
  const [showModal, setShowModal] = useState(false)

  const fetchProjects = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select('*, pieces(status, notified_at, approvals(decision))')
      .order('created_at', { ascending: false })
    setProjects((data ?? []) as ProjectWithCounts[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  const filtered = projects
    .filter(p => sector === 'all' || p.sector === sector)
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.client_name.toLowerCase().includes(search.toLowerCase())
    )

  const allPieces = projects.flatMap(p => p.pieces ?? [])
  const counters = {
    total: allPieces.length,
    approved: allPieces.filter(p => p.status === 'approved').length,
    revision: allPieces.filter(p => p.status === 'revision_requested').length,
    pending: allPieces.filter(p => p.status === 'pending').length,
  }

  // Tour progress indicators
  const hasProjects = projects.length > 0
  const hasPieces = allPieces.length > 0
  const hasSentToClient = allPieces.some((p: any) => p.notified_at)
  const hasApproval = allPieces.some((p: any) =>
    p.approvals?.length > 0 || p.status === 'approved' || p.status === 'revision_requested'
  )

  const isFirstTime = !loading && projects.length === 0

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Show WelcomeHero only on first access (no projects yet) */}
      {isFirstTime && <WelcomeHero onCreateProject={() => setShowModal(true)} />}

      {/* Show GuidedTourBanner when user has started but hasn't completed flow */}
      {!isFirstTime && !loading && (
        <GuidedTourBanner
          hasProjects={hasProjects}
          hasPieces={hasPieces}
          hasSentToClient={hasSentToClient}
          hasApproval={hasApproval}
        />
      )}

      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projetos</h1>
          <p className="text-sm text-slate-500 mt-1">
            {isFirstTime
              ? 'Comece criando seu primeiro projeto para organizar as peças e enviá-las ao cliente.'
              : `Gerencie aprovações de peças criativas com seus clientes. ${projects.length} projeto${projects.length !== 1 ? 's' : ''} no total.`
            }
          </p>
        </div>
        <NewProjectModal open={showModal} onOpenChange={setShowModal} onCreated={fetchProjects} />
      </div>

      {!isFirstTime && (
        <>
          <DashboardCounters {...counters} />

          {/* Counters explainer for new users */}
          {counters.total === 0 && (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4 text-xs text-slate-500">
              📊 Os contadores acima refletem o status das peças em todos os seus projetos. Quando você subir peças e enviar para clientes, os números se atualizam automaticamente.
            </div>
          )}

          <SectorTabs value={sector} onChange={setSector} />

          <div className="mb-4">
            <Input
              placeholder="🔍 Buscar por nome do projeto ou cliente..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="max-w-sm"
            />
          </div>
        </>
      )}

      {loading ? (
        <ProjectGridSkeleton />
      ) : filtered.length === 0 && !isFirstTime ? (
        <EmptyState
          title={search ? 'Nenhum projeto encontrado' : 'Nenhum projeto neste filtro'}
          description={
            search
              ? 'Tente outro termo de busca ou limpe o filtro para ver todos os projetos.'
              : 'Altere o setor selecionado ou crie um novo projeto clicando no botão acima.'
          }
          actionLabel={search ? 'Limpar busca' : undefined}
          onAction={search ? () => setSearch('') : undefined}
        />
      ) : !isFirstTime ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => <ProjectCard key={project.id} project={project} />)}
        </div>
      ) : null}

      <div className="mt-8 pt-4 border-t border-slate-100 text-center">
        <Link href="/integrations" className="text-sm text-slate-400 hover:text-indigo-600 transition-colors">
          🔌 Ver integrações disponíveis (WhatsApp, Gmail e mais)
        </Link>
      </div>
    </div>
  )
}
