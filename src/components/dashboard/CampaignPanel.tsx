'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Radio } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { exportVeiculacaoCSV, exportTVSpec } from '@/lib/exports'
import { ClapperboardDigital, type ClapperboardData } from '@/components/ui/ClapperboardDigital'
import type { ProjectWithCounts } from '@/lib/types'

export function CampaignPanel() {
  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetchProjects = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select('*, pieces(status, first_opened_at, notified_at)')
      .order('created_at', { ascending: false })
    setProjects((data ?? []) as ProjectWithCounts[])
    setLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8 space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-100">
          <Radio className="h-5 w-5 text-orange-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Campanhas — Fabi</h1>
          <p className="text-sm text-slate-500">Visão de mídia: campanhas com claquetes e exports multi-formato</p>
        </div>
      </div>
      {projects.length === 0 && <p className="text-slate-500 text-sm">Nenhuma campanha ainda.</p>}
      <div className="space-y-2">
        {projects.map(project => {
          const pieces = project.pieces ?? []
          const approved = pieces.filter(p => p.status === 'approved').length
          const pending = pieces.filter(p => p.status === 'pending').length
          const isOpen = expanded === project.id

          const claqueteData: ClapperboardData = {
            producao: project.name,
            cliente: project.client_name,
            produto: project.name,
            titulo: '',
            diretor: '',
            dop: '',
            producaoExec: '',
            data: new Date(project.created_at).toLocaleDateString('pt-BR'),
            local: '',
            cena: '01',
            take: '01',
            obs: '',
            produtoraNome: 'CRIVO STUDIO',
          }

          return (
            <div key={project.id} className="border border-slate-200 rounded-lg bg-white overflow-hidden">
              <button
                onClick={() => setExpanded(isOpen ? null : project.id)}
                className="w-full flex items-center gap-4 px-4 py-3 hover:bg-slate-50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">{project.name}</p>
                  <p className="text-xs text-slate-500">{project.client_name} · {formatRelativeTime(project.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {approved > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{approved} aprovada{approved > 1 ? 's' : ''}</span>}
                  {pending > 0 && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{pending} pendente{pending > 1 ? 's' : ''}</span>}
                  <span className="text-xs text-slate-400">{isOpen ? '▲' : '▼'}</span>
                </div>
              </button>
              {isOpen && (
                <div className="border-t border-slate-100 p-4 bg-slate-50">
                  <ClapperboardDigital
                    initialData={claqueteData}
                    onExportVeiculacao={exportVeiculacaoCSV}
                    onExportTVSpec={exportTVSpec}
                  />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
