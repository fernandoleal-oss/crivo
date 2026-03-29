'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Radio, Download, Copy, Check, ChevronDown, ChevronRight, Tv, Globe, Mic, Smartphone, Mail, FileSpreadsheet, Save, Pencil } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import type { ProjectWithCounts } from '@/lib/types'
import { cn } from '@/lib/utils'

// Veículos de mídia
const VEICULOS = [
  { id: 'tv_aberta', label: 'TV Aberta', icon: Tv, formats: ['30s', '15s', '5s'], color: 'bg-blue-500' },
  { id: 'tv_paga', label: 'TV Paga', icon: Tv, formats: ['30s', '15s'], color: 'bg-indigo-500' },
  { id: 'digital_display', label: 'Display Digital', icon: Globe, formats: ['300x250', '728x90', '160x600', '970x250'], color: 'bg-emerald-500' },
  { id: 'social_meta', label: 'Meta (FB/IG)', icon: Smartphone, formats: ['Feed 1080x1080', 'Story 1080x1920', 'Reels 1080x1920'], color: 'bg-pink-500' },
  { id: 'social_tiktok', label: 'TikTok', icon: Smartphone, formats: ['Feed 1080x1920', 'TopView'], color: 'bg-slate-800' },
  { id: 'radio', label: 'Rádio', icon: Mic, formats: ['30s', '15s', '5s (vinheta)'], color: 'bg-amber-500' },
  { id: 'ooh', label: 'OOH / DOOH', icon: Globe, formats: ['Outdoor', 'Metrô', 'Busdoor', 'Empena'], color: 'bg-violet-500' },
  { id: 'email_mkt', label: 'E-mail Marketing', icon: Mail, formats: ['600px HTML'], color: 'bg-rose-500' },
] as const

type VeiculoId = typeof VEICULOS[number]['id']

// Dados-mestre da campanha — preenchidos uma vez, replicados em todas as linhas
interface FichaMestre {
  pi: string            // Pedido de Inserção
  produto: string
  agencia: string
  periodo_inicio: string
  periodo_fim: string
  verba: string
  contato_cliente: string
  obs_geral: string
}

const EMPTY_FICHA: FichaMestre = {
  pi: '', produto: '', agencia: '', periodo_inicio: '', periodo_fim: '', verba: '', contato_cliente: '', obs_geral: '',
}

interface VeiculacaoRow {
  veiculo: VeiculoId
  formato: string
  prazo: string
  material: string
  obs: string
  status: 'pendente' | 'enviado' | 'confirmado'
}

function greeting() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}

// Persist fichas in localStorage
function loadFichas(): Record<string, FichaMestre> {
  if (typeof window === 'undefined') return {}
  try { return JSON.parse(localStorage.getItem('crivo_fichas_mestre') || '{}') } catch { return {} }
}
function saveFichas(fichas: Record<string, FichaMestre>) {
  localStorage.setItem('crivo_fichas_mestre', JSON.stringify(fichas))
}

const FIELD_LABELS: { key: keyof FichaMestre; label: string; placeholder: string; type?: string }[] = [
  { key: 'pi', label: 'Nº PI', placeholder: 'Ex: PI-2026-0042' },
  { key: 'produto', label: 'Produto', placeholder: 'Ex: NuPay — Pagamento por Aproximação' },
  { key: 'agencia', label: 'Agência', placeholder: 'Ex: Crivo Publicidade' },
  { key: 'periodo_inicio', label: 'Início Veiculação', placeholder: '', type: 'date' },
  { key: 'periodo_fim', label: 'Fim Veiculação', placeholder: '', type: 'date' },
  { key: 'verba', label: 'Verba Total', placeholder: 'Ex: R$ 120.000' },
  { key: 'contato_cliente', label: 'Contato Cliente', placeholder: 'Ex: Camila Torres — camila@ifood.com.br' },
  { key: 'obs_geral', label: 'Observações Gerais', placeholder: 'Restrições, horários, praças…' },
]

export function CampaignPanel() {
  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)
  const [veiculacao, setVeiculacao] = useState<Record<string, VeiculacaoRow[]>>({})
  const [fichas, setFichas] = useState<Record<string, FichaMestre>>({})
  const [editingFicha, setEditingFicha] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [savedId, setSavedId] = useState<string | null>(null)

  // Load fichas from localStorage on mount
  useEffect(() => { setFichas(loadFichas()) }, [])

  const fetchProjects = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select('*, pieces(id, title, status, deadline, ai_score)')
      .order('created_at', { ascending: false })
    const pjs = (data ?? []) as ProjectWithCounts[]
    setProjects(pjs)

    // Auto-generate veiculação rows from approved pieces
    const autoRows: Record<string, VeiculacaoRow[]> = {}
    for (const pj of pjs) {
      const pieces = (pj.pieces ?? []) as any[]
      const approvedPieces = pieces.filter((p: any) => p.status === 'approved')
      if (approvedPieces.length > 0) {
        autoRows[pj.id] = approvedPieces.flatMap((piece: any) => {
          const title = (piece.title || '').toLowerCase()
          const rows: VeiculacaoRow[] = []
          if (title.includes('instagram') || title.includes('feed') || title.includes('story') || title.includes('reels'))
            rows.push({ veiculo: 'social_meta', formato: title.includes('story') || title.includes('reels') ? 'Story 1080x1920' : 'Feed 1080x1080', prazo: piece.deadline ? new Date(piece.deadline).toLocaleDateString('pt-BR') : '', material: piece.title, obs: '', status: 'pendente' })
          if (title.includes('banner') || title.includes('display') || title.includes('header'))
            rows.push({ veiculo: 'digital_display', formato: title.includes('300') ? '300x250' : '728x90', prazo: piece.deadline ? new Date(piece.deadline).toLocaleDateString('pt-BR') : '', material: piece.title, obs: '', status: 'pendente' })
          if (title.includes('rádio') || title.includes('radio') || title.includes('spot'))
            rows.push({ veiculo: 'radio', formato: '30s', prazo: piece.deadline ? new Date(piece.deadline).toLocaleDateString('pt-BR') : '', material: piece.title, obs: '', status: 'pendente' })
          if (title.includes('vídeo') || title.includes('video') || title.includes('manifesto') || title.includes('youtube'))
            rows.push({ veiculo: 'tv_aberta', formato: '30s', prazo: piece.deadline ? new Date(piece.deadline).toLocaleDateString('pt-BR') : '', material: piece.title, obs: '', status: 'pendente' })
          if (title.includes('ooh') || title.includes('outdoor') || title.includes('metrô') || title.includes('busdoor'))
            rows.push({ veiculo: 'ooh', formato: 'Outdoor', prazo: piece.deadline ? new Date(piece.deadline).toLocaleDateString('pt-BR') : '', material: piece.title, obs: '', status: 'pendente' })
          if (title.includes('email') || title.includes('e-mail'))
            rows.push({ veiculo: 'email_mkt', formato: '600px HTML', prazo: piece.deadline ? new Date(piece.deadline).toLocaleDateString('pt-BR') : '', material: piece.title, obs: '', status: 'pendente' })
          if (title.includes('tiktok'))
            rows.push({ veiculo: 'social_tiktok', formato: 'Feed 1080x1920', prazo: piece.deadline ? new Date(piece.deadline).toLocaleDateString('pt-BR') : '', material: piece.title, obs: '', status: 'pendente' })
          if (rows.length === 0)
            rows.push({ veiculo: 'digital_display', formato: '300x250', prazo: piece.deadline ? new Date(piece.deadline).toLocaleDateString('pt-BR') : '', material: piece.title, obs: '', status: 'pendente' })
          return rows
        })
      }
    }
    setVeiculacao(autoRows)
    setLoading(false)
  }, [])

  useEffect(() => { fetchProjects() }, [fetchProjects])

  function updateFicha(projectId: string, field: keyof FichaMestre, value: string) {
    setFichas(prev => {
      const updated = { ...prev, [projectId]: { ...(prev[projectId] || EMPTY_FICHA), [field]: value } }
      saveFichas(updated)
      return updated
    })
  }

  function fichaFilled(projectId: string): number {
    const f = fichas[projectId]
    if (!f) return 0
    return FIELD_LABELS.filter(fl => f[fl.key]?.trim()).length
  }

  function exportVeiculacaoCSV(project: ProjectWithCounts, rows: VeiculacaoRow[]) {
    const ficha = fichas[project.id] || EMPTY_FICHA
    const headers = ['PI', 'Produto', 'Agência', 'Início', 'Fim', 'Verba', 'Contato', 'Veículo', 'Formato', 'Material', 'Prazo', 'Status', 'Obs']
    const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
    const csvRows = rows.map(r => {
      const veiculoLabel = VEICULOS.find(v => v.id === r.veiculo)?.label ?? r.veiculo
      return [ficha.pi, ficha.produto, ficha.agencia, ficha.periodo_inicio, ficha.periodo_fim, ficha.verba, ficha.contato_cliente, veiculoLabel, r.formato, r.material, r.prazo, r.status, r.obs].map(escape).join(',')
    })
    const csv = [headers.map(escape).join(','), ...csvRows].join('\n')
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `plano_midia_${project.name.replace(/\s+/g, '_')}.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  function copyAsTable(project: ProjectWithCounts, rows: VeiculacaoRow[]) {
    const ficha = fichas[project.id] || EMPTY_FICHA
    const headers = 'PI\tProduto\tAgência\tInício\tFim\tVerba\tContato\tVeículo\tFormato\tMaterial\tPrazo\tStatus\tObs'
    const body = rows.map(r => {
      const veiculoLabel = VEICULOS.find(v => v.id === r.veiculo)?.label ?? r.veiculo
      return `${ficha.pi}\t${ficha.produto}\t${ficha.agencia}\t${ficha.periodo_inicio}\t${ficha.periodo_fim}\t${ficha.verba}\t${ficha.contato_cliente}\t${veiculoLabel}\t${r.formato}\t${r.material}\t${r.prazo}\t${r.status}\t${r.obs}`
    }).join('\n')
    navigator.clipboard.writeText(headers + '\n' + body)
  }

  if (loading) {
    return (
      <div className="px-6 py-8 space-y-2">
        {[1, 2, 3].map(i => <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />)}
      </div>
    )
  }

  const allPieces = projects.flatMap(p => (p.pieces ?? []) as any[])
  const totalApproved = allPieces.filter((p: any) => p.status === 'approved').length
  const totalVeiculacoes = Object.values(veiculacao).reduce((s, rows) => s + rows.length, 0)
  const veiculosUsados = new Set(Object.values(veiculacao).flatMap(rows => rows.map(r => r.veiculo))).size

  return (
    <div className="px-6 py-8 min-h-screen">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{greeting()}, Fabiana!</h1>
          <p className="text-sm text-slate-400 mt-1">
            {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-3 mb-8">
        <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100">
          <p className="text-[10px] font-semibold text-orange-400 uppercase tracking-wider mb-1">Campanhas Ativas</p>
          <p className="text-3xl font-black text-orange-700">{projects.length}</p>
        </div>
        <div className="bg-emerald-50 rounded-2xl p-4 border border-emerald-100">
          <p className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider mb-1">Peças Aprovadas</p>
          <p className="text-3xl font-black text-emerald-700">{totalApproved}</p>
          <p className="text-[11px] text-emerald-500 mt-1">prontas p/ veicular</p>
        </div>
        <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100">
          <p className="text-[10px] font-semibold text-indigo-400 uppercase tracking-wider mb-1">Veiculações</p>
          <p className="text-3xl font-black text-indigo-700">{totalVeiculacoes}</p>
          <p className="text-[11px] text-indigo-500 mt-1">entradas no plano</p>
        </div>
        <div className="bg-violet-50 rounded-2xl p-4 border border-violet-100">
          <p className="text-[10px] font-semibold text-violet-400 uppercase tracking-wider mb-1">Veículos</p>
          <p className="text-3xl font-black text-violet-700">{veiculosUsados}</p>
          <p className="text-[11px] text-violet-500 mt-1">canais de distribuição</p>
        </div>
      </div>

      {/* Campaigns */}
      <div className="space-y-3">
        {projects.map(project => {
          const pieces = (project.pieces ?? []) as any[]
          const approved = pieces.filter((p: any) => p.status === 'approved').length
          const pending = pieces.filter((p: any) => p.status === 'pending').length
          const revision = pieces.filter((p: any) => p.status === 'revision_requested').length
          const isOpen = expanded === project.id
          const rows = veiculacao[project.id] ?? []
          const ficha = fichas[project.id] || EMPTY_FICHA
          const isEditing = editingFicha === project.id
          const filled = fichaFilled(project.id)

          const byVeiculo = VEICULOS.map(v => ({
            ...v,
            rows: rows.filter(r => r.veiculo === v.id),
          })).filter(v => v.rows.length > 0)

          return (
            <div key={project.id} className="border border-slate-200 rounded-2xl bg-white overflow-hidden">
              {/* Campaign header */}
              <button
                onClick={() => setExpanded(isOpen ? null : project.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
              >
                {isOpen ? <ChevronDown size={16} className="text-slate-400" /> : <ChevronRight size={16} className="text-slate-400" />}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-900 truncate">{project.name}</p>
                  <p className="text-xs text-slate-500">{project.client_name} · {formatRelativeTime(project.created_at)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {filled > 0 && (
                    <span className="text-[11px] font-semibold bg-orange-50 text-orange-600 px-2.5 py-1 rounded-full">
                      Ficha {filled}/{FIELD_LABELS.length}
                    </span>
                  )}
                  {approved > 0 && <span className="text-[11px] font-semibold bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{approved} aprovada{approved > 1 ? 's' : ''}</span>}
                  {revision > 0 && <span className="text-[11px] font-semibold bg-rose-50 text-rose-600 px-2.5 py-1 rounded-full">{revision} revisão</span>}
                  {pending > 0 && <span className="text-[11px] font-semibold bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">{pending} pendente{pending > 1 ? 's' : ''}</span>}
                </div>
              </button>

              {isOpen && (
                <div className="border-t border-slate-100">
                  {/* ── FICHA-MESTRE ── */}
                  <div className="bg-orange-50/50 border-b border-orange-100">
                    <div className="flex items-center justify-between px-5 py-3">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet size={14} className="text-orange-500" />
                        <h3 className="text-xs font-bold text-orange-700 uppercase tracking-wider">Dados da Campanha</h3>
                        {filled > 0 && !isEditing && (
                          <span className="text-[10px] text-orange-400">{filled} de {FIELD_LABELS.length} preenchidos</span>
                        )}
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (isEditing) {
                            setSavedId(project.id)
                            setTimeout(() => setSavedId(null), 1500)
                          }
                          setEditingFicha(isEditing ? null : project.id)
                        }}
                        className={cn(
                          'flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors',
                          isEditing
                            ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                            : 'text-orange-600 hover:bg-orange-100'
                        )}
                      >
                        {isEditing ? (
                          <>{savedId === project.id ? <Check size={12} /> : <Save size={12} />} {savedId === project.id ? 'Salvo!' : 'Salvar'}</>
                        ) : (
                          <><Pencil size={12} /> Editar ficha</>
                        )}
                      </button>
                    </div>

                    {isEditing ? (
                      /* Edit mode — form */
                      <div className="px-5 pb-4 grid grid-cols-2 gap-3">
                        {FIELD_LABELS.map(({ key, label, placeholder, type }) => (
                          <div key={key} className={key === 'obs_geral' ? 'col-span-2' : ''}>
                            <label className="text-[10px] font-semibold text-orange-500 uppercase tracking-wider">{label}</label>
                            {key === 'obs_geral' ? (
                              <textarea
                                value={ficha[key]}
                                onChange={e => updateFicha(project.id, key, e.target.value)}
                                placeholder={placeholder}
                                rows={2}
                                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-orange-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-slate-300 resize-none"
                              />
                            ) : (
                              <input
                                type={type || 'text'}
                                value={ficha[key]}
                                onChange={e => updateFicha(project.id, key, e.target.value)}
                                placeholder={placeholder}
                                className="w-full mt-1 px-3 py-2 text-sm rounded-lg border border-orange-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-300 placeholder:text-slate-300"
                              />
                            )}
                          </div>
                        ))}
                      </div>
                    ) : filled > 0 ? (
                      /* View mode — compact summary */
                      <div className="px-5 pb-3 flex flex-wrap gap-x-6 gap-y-1">
                        {FIELD_LABELS.filter(f => ficha[f.key]?.trim()).map(({ key, label }) => (
                          <div key={key} className="flex items-baseline gap-1.5">
                            <span className="text-[10px] text-orange-400 font-medium">{label}:</span>
                            <span className="text-xs text-slate-700 font-medium">{ficha[key]}</span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="px-5 pb-3">
                        <p className="text-xs text-orange-400">Clique em "Editar ficha" para preencher os dados-mestre da campanha.</p>
                      </div>
                    )}
                  </div>

                  {/* ── PLANO DE VEICULAÇÃO ── */}
                  {rows.length > 0 ? (
                    <div className="p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-sm font-bold text-slate-700">Plano de Veiculação</h3>
                        <div className="flex gap-2">
                          <button
                            onClick={() => { copyAsTable(project, rows); setCopiedId(project.id); setTimeout(() => setCopiedId(null), 2000) }}
                            className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 px-3 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                          >
                            {copiedId === project.id ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                            {copiedId === project.id ? 'Copiado!' : 'Copiar tabela'}
                          </button>
                          <button
                            onClick={() => exportVeiculacaoCSV(project, rows)}
                            className="flex items-center gap-1.5 text-xs font-medium text-white bg-slate-900 px-3 py-1.5 rounded-lg hover:bg-slate-800 transition-colors"
                          >
                            <Download size={12} />
                            Exportar CSV
                          </button>
                        </div>
                      </div>

                      {/* Info: dados-mestre incluídos no export */}
                      {filled > 0 && (
                        <p className="text-[10px] text-slate-400 mb-3 flex items-center gap-1">
                          <Check size={10} className="text-emerald-500" />
                          Dados da ficha-mestre serão incluídos em cada linha do CSV e na cópia.
                        </p>
                      )}

                      <div className="space-y-3">
                        {byVeiculo.map(({ id, label, icon: Icon, color, rows: vRows }) => (
                          <div key={id} className="rounded-xl border border-slate-100 overflow-hidden">
                            <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-50">
                              <div className={cn('w-6 h-6 rounded-md flex items-center justify-center', color)}>
                                <Icon size={13} className="text-white" />
                              </div>
                              <span className="text-xs font-bold text-slate-700">{label}</span>
                              <span className="text-[10px] text-slate-400 ml-auto">{vRows.length} material{vRows.length > 1 ? 'is' : ''}</span>
                            </div>
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="text-[10px] text-slate-400 uppercase tracking-wider">
                                  <th className="text-left px-4 py-2 font-semibold">Material</th>
                                  <th className="text-left px-4 py-2 font-semibold">Formato</th>
                                  <th className="text-left px-4 py-2 font-semibold">Prazo</th>
                                  <th className="text-left px-4 py-2 font-semibold">Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {vRows.map((row, idx) => (
                                  <tr key={idx} className="border-t border-slate-50 hover:bg-slate-50/50">
                                    <td className="px-4 py-2.5 font-medium text-slate-800">{row.material}</td>
                                    <td className="px-4 py-2.5 text-slate-600">{row.formato}</td>
                                    <td className="px-4 py-2.5 text-slate-600">{row.prazo || '—'}</td>
                                    <td className="px-4 py-2.5">
                                      <span className={cn(
                                        'text-[10px] font-semibold px-2 py-0.5 rounded-full',
                                        row.status === 'pendente' && 'bg-amber-50 text-amber-700',
                                        row.status === 'enviado' && 'bg-blue-50 text-blue-700',
                                        row.status === 'confirmado' && 'bg-emerald-50 text-emerald-700',
                                      )}>
                                        {row.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-8 text-center">
                      <p className="text-sm text-slate-400">Nenhuma peça aprovada neste projeto ainda.</p>
                      <p className="text-xs text-slate-300 mt-1">O plano de veiculação é gerado quando peças são aprovadas.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
