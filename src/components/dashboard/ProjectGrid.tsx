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
      .select('*, pieces(status)')
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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Projetos</h1>
          <p className="text-sm text-slate-500 mt-1">Gerencie aprovações de peças criativas com seus clientes. Sem WhatsApp, sem planilha, sem confusão.</p>
        </div>
        <NewProjectModal open={showModal} onOpenChange={setShowModal} onCreated={fetchProjects} />
      </div>
      <DashboardCounters {...counters} />
      <SectorTabs value={sector} onChange={setSector} />
      <div className="mb-4">
        <Input placeholder="Buscar por projeto ou cliente..." value={search}
          onChange={e => setSearch(e.target.value)} className="max-w-sm" />
      </div>
      {loading ? <ProjectGridSkeleton /> : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
          description={search ? 'Tente outro termo de busca.' : 'Chega de aprovar peça por WhatsApp. Crie seu primeiro projeto e envie um link pro cliente revisar — sem app, sem cadastro.'}
          actionLabel={search ? undefined : 'Criar primeiro projeto'}
          onAction={search ? undefined : () => setShowModal(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
      <div className="mt-8 pt-4 border-t border-slate-100 text-center">
        <Link href="/integrations" className="text-sm text-slate-400 hover:text-indigo-600 transition-colors">
          🔌 Ver integrações disponíveis
        </Link>
      </div>
    </div>
  )
}
