# Desirre & Fabi — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar as dores reais de Desirre (atendimento) e Fabi (mídia) no Crivo — IA extrai briefing de texto colado, gate de envio para cliente, e painel de campanhas exclusivo para role Mídia com exports multi-formato do claquete.

**Architecture:** Role state via React Context persistido em localStorage, consumido pelo nav (RoleSwitcher) e pelo ProjectGrid (branch ceo→grid / midia→CampaignPanel). Briefing via nova API route que aceita texto puro. Exports do claquete gerados client-side sem backend.

**Tech Stack:** Next.js 14 App Router, React Context, Supabase client, @ai-sdk/anthropic, lucide-react, shadcn/ui

---

## File Map

| Ação | Arquivo |
|------|---------|
| Create | `src/lib/role-context.tsx` |
| Create | `src/app/api/ai/analyze-brief-text/route.ts` |
| Create | `src/components/dashboard/BriefingTab.tsx` |
| Create | `src/components/dashboard/CampaignPanel.tsx` |
| Create | `src/lib/exports.ts` |
| Modify | `src/lib/types.ts` |
| Modify | `src/app/layout.tsx` |
| Modify | `src/components/layout/ConditionalNav.tsx` |
| Modify | `src/components/dashboard/NewProjectModal.tsx` |
| Modify | `src/components/dashboard/ProjectCard.tsx` |
| Modify | `src/components/dashboard/ProjectGrid.tsx` |
| Modify | `src/components/dashboard/SendToClientModal.tsx` |
| Modify | `src/components/ui/ClapperboardDigital.tsx` |
| DB | `supabase/migrations/002_briefing_score.sql` |

---

## Task 1: DB migration — adicionar briefing_data e briefing_score em projects

**Files:**
- Create: `supabase/migrations/002_briefing_score.sql`

- [ ] **Step 1: Criar arquivo de migration**

```sql
-- supabase/migrations/002_briefing_score.sql
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS briefing_data jsonb,
  ADD COLUMN IF NOT EXISTS briefing_score int NOT NULL DEFAULT 0;
```

- [ ] **Step 2: Aplicar no Supabase**

Abra o Supabase Dashboard → SQL Editor → cole o SQL acima → Run.

Ou via CLI: `npx supabase db push` (se estiver configurado localmente).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/002_briefing_score.sql
git commit -m "feat: add briefing_data and briefing_score to projects"
```

---

## Task 2: Atualizar types.ts

**Files:**
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Adicionar campos no Project e ProjectWithCounts**

Substitua a interface `Project`:

```typescript
export interface Project {
  id: string
  name: string
  client_name: string
  sector: Sector
  briefing_data: BriefingData | null
  briefing_score: number
  created_at: string
}
```

Substitua a interface `ProjectWithCounts`:

```typescript
export interface ProjectWithCounts extends Project {
  pieces: { status: PieceStatus; first_opened_at: string | null; notified_at: string | null }[]
}
```

Adicione o tipo `BriefingData` antes de `Project`:

```typescript
export interface BriefingData {
  produto: string | null
  verba: string | null
  prazo: string | null
  assets_necessarios: string[]
  aprovador: string | null
  observacoes: string | null
  informacoes_faltando: string[]
  resumo_executivo: string
  confianca_analise: number
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/types.ts
git commit -m "feat: add BriefingData type and briefing fields to Project"
```

---

## Task 3: API route — analyze-brief-text

**Files:**
- Create: `src/app/api/ai/analyze-brief-text/route.ts`

- [ ] **Step 1: Criar a route**

```typescript
// POST /api/ai/analyze-brief-text
// Body: { text: string }
// Retorna: BriefingData como JSON

import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { NextRequest } from 'next/server'
import type { BriefingData } from '@/lib/types'

function buildPrompt(text: string): string {
  return `Você é especialista em gestão de projetos para agências de publicidade brasileiras.

Analise o texto abaixo (pode ser um e-mail, mensagem de WhatsApp ou resumo de call) e extraia as informações do briefing.

Responda APENAS com JSON válido, sem texto antes ou depois. Se uma informação não estiver no texto, use null ou array vazio.

SCHEMA:
{
  "produto": string | null,
  "verba": string | null,
  "prazo": "YYYY-MM-DD" | null,
  "assets_necessarios": string[],
  "aprovador": string | null,
  "observacoes": string | null,
  "informacoes_faltando": string[],
  "resumo_executivo": string,
  "confianca_analise": number
}

Regras:
- "confianca_analise": 0-100, onde 100 = brief completo para começar produção
- "informacoes_faltando": liste o que impede a produção de começar agora
- "resumo_executivo": 2-3 frases em PT-BR resumindo o que foi solicitado

TEXTO DO BRIEFING:
---
${text.slice(0, 8000)}
---`
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()

    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return Response.json({ error: 'Texto muito curto para análise.' }, { status: 400 })
    }

    const { text: raw } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt: buildPrompt(text),
      maxTokens: 1024,
      temperature: 0.1,
    })

    // Extrai JSON da resposta (pode vir com ```json ... ```)
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'IA não retornou JSON válido.' }, { status: 422 })
    }

    const data: BriefingData = JSON.parse(jsonMatch[0])
    return Response.json(data)
  } catch (err) {
    console.error('[analyze-brief-text]', err)
    return Response.json({ error: 'Erro ao processar briefing.' }, { status: 500 })
  }
}
```

- [ ] **Step 2: Testar manualmente**

Com o servidor rodando (`npm run dev`), execute:

```bash
curl -X POST http://localhost:3000/api/ai/analyze-brief-text \
  -H "Content-Type: application/json" \
  -d '{"text":"Campanha de lançamento do novo cartão Itaú Black. Verba: R$150.000. Prazo: 30/04/2026. Precisamos de 3 posts Instagram e 1 video 30s. Aprovador: Marcos Andrade."}'
```

Esperado: JSON com `produto`, `verba`, `prazo` preenchidos e `confianca_analise` entre 60-90.

- [ ] **Step 3: Commit**

```bash
git add src/app/api/ai/analyze-brief-text/route.ts
git commit -m "feat: add analyze-brief-text API route for plain text briefing extraction"
```

---

## Task 4: RoleContext — estado global de role

**Files:**
- Create: `src/lib/role-context.tsx`

- [ ] **Step 1: Criar o contexto**

```typescript
'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AppRole } from '@/components/ui/RoleSwitcher'

interface RoleContextValue {
  role: AppRole
  setRole: (r: AppRole) => void
}

const RoleContext = createContext<RoleContextValue>({
  role: 'ceo',
  setRole: () => {},
})

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole>('ceo')

  useEffect(() => {
    const saved = localStorage.getItem('crivo_role') as AppRole | null
    if (saved && ['ceo', 'criacao', 'midia'].includes(saved)) {
      setRoleState(saved)
    }
  }, [])

  function setRole(r: AppRole) {
    setRoleState(r)
    localStorage.setItem('crivo_role', r)
  }

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  return useContext(RoleContext)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/role-context.tsx
git commit -m "feat: add RoleContext for global role state"
```

---

## Task 5: Integrar RoleProvider no layout e RoleSwitcher no nav

**Files:**
- Modify: `src/app/layout.tsx`
- Modify: `src/components/layout/ConditionalNav.tsx`

- [ ] **Step 1: Ler layout.tsx atual**

```bash
cat src/app/layout.tsx
```

- [ ] **Step 2: Envolver children com RoleProvider**

No `src/app/layout.tsx`, importe e envolva:

```typescript
import { RoleProvider } from '@/lib/role-context'

// dentro de <body>:
<RoleProvider>
  <ConditionalNav />
  {children}
</RoleProvider>
```

- [ ] **Step 3: Atualizar ConditionalNav para mostrar RoleSwitcher**

Substitua o conteúdo de `src/components/layout/ConditionalNav.tsx`:

```typescript
'use client'

import { usePathname } from 'next/navigation'
import { useRole } from '@/lib/role-context'
import { RoleSwitcher, ViewAsBanner } from '@/components/ui/RoleSwitcher'
import { AnimatePresence } from 'motion/react'

const USER_BY_ROLE = {
  ceo: { name: 'Desirre', initial: 'D' },
  criacao: { name: 'Bruno', initial: 'B' },
  midia: { name: 'Fabi', initial: 'F' },
}

export function ConditionalNav() {
  const pathname = usePathname()
  const { role, setRole } = useRole()

  if (pathname.startsWith('/review/')) return null

  const user = USER_BY_ROLE[role]
  const isViewingAs = role !== 'ceo'

  return (
    <>
      <AnimatePresence>
        {isViewingAs && (
          <ViewAsBanner
            viewingAs={role}
            originalRole="ceo"
            onReset={() => setRole('ceo')}
          />
        )}
      </AnimatePresence>
      <nav className={`bg-slate-900 text-white px-6 py-3 flex items-center justify-between ${isViewingAs ? 'mt-10' : ''}`}>
        <div className="flex items-center">
          <a href="/" className="font-bold text-lg tracking-tight text-indigo-400 hover:text-indigo-300 transition-colors">crivo</a>
          <span className="ml-3 text-xs text-slate-500 hidden sm:block">Aprovação de peças sem WhatsApp, sem confusão.</span>
        </div>
        <RoleSwitcher
          originalRole="ceo"
          currentRole={role}
          userName={user.name}
          userInitial={user.initial}
          onRoleChange={setRole}
        />
      </nav>
    </>
  )
}
```

- [ ] **Step 4: Verificar que app compila**

```bash
npm run build 2>&1 | tail -20
```

Esperado: sem erros de tipo.

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/components/layout/ConditionalNav.tsx
git commit -m "feat: integrate RoleSwitcher into nav with Desirre/Fabi/Bruno personas"
```

---

## Task 6: BriefingTab — componente de extração de briefing por IA

**Files:**
- Create: `src/components/dashboard/BriefingTab.tsx`

- [ ] **Step 1: Criar o componente**

```typescript
'use client'

import { useState } from 'react'
import { Sparkles, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { BriefingData } from '@/lib/types'

interface BriefingTabProps {
  value: BriefingData | null
  onChange: (data: BriefingData | null) => void
}

export function BriefingTab({ value, onChange }: BriefingTabProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/analyze-brief-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Erro ao analisar.')
        return
      }
      const data: BriefingData = await res.json()
      onChange(data)
    } catch {
      setError('Não foi possível conectar à IA.')
    } finally {
      setLoading(false)
    }
  }

  const score = value?.confianca_analise ?? 0
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
  const scoreBg = score >= 80 ? 'bg-green-50 border-green-200' : score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="brief-text">Cole o briefing do cliente</Label>
        <p className="text-xs text-slate-500 mb-1">
          Pode ser um e-mail, mensagem de WhatsApp ou resumo da call. A IA extrai as informações automaticamente.
        </p>
        <Textarea
          id="brief-text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Ex: Olá, precisamos de uma campanha para o lançamento do produto X. Verba aprovada: R$80.000. Prazo: 15/05..."
          rows={5}
          className="resize-none"
        />
      </div>

      <Button
        type="button"
        onClick={handleAnalyze}
        disabled={loading || !text.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-700"
      >
        <Sparkles className="h-4 w-4 mr-2" />
        {loading ? 'Analisando...' : 'Analisar com IA'}
      </Button>

      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle className="h-4 w-4" /> {error}
        </p>
      )}

      {value && (
        <div className={`rounded-lg border p-4 space-y-3 ${scoreBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Resultado da análise</span>
            <span className={`text-lg font-bold ${scoreColor}`}>{score}% completo</span>
          </div>

          <p className="text-sm text-slate-600 italic">"{value.resumo_executivo}"</p>

          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: 'Produto', val: value.produto },
              { label: 'Verba', val: value.verba },
              { label: 'Prazo', val: value.prazo },
              { label: 'Aprovador', val: value.aprovador },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-start gap-1">
                {val
                  ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" />
                  : <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                }
                <span>
                  <span className="font-medium text-slate-600">{label}:</span>{' '}
                  <span className="text-slate-800">{val ?? <em className="text-amber-600">não identificado</em>}</span>
                </span>
              </div>
            ))}
          </div>

          {value.informacoes_faltando.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ainda falta:</p>
              <ul className="space-y-0.5">
                {value.informacoes_faltando.map((item, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/BriefingTab.tsx
git commit -m "feat: add BriefingTab component with AI text extraction"
```

---

## Task 7: Atualizar NewProjectModal com aba de Briefing

**Files:**
- Modify: `src/components/dashboard/NewProjectModal.tsx`

- [ ] **Step 1: Adicionar estado de step e briefing, e renderizar aba**

Substitua o conteúdo completo do arquivo:

```typescript
'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { BriefingTab } from './BriefingTab'
import type { Sector, BriefingData } from '@/lib/types'

const SECTOR_OPTIONS: { value: Sector; label: string }[] = [
  { value: 'atendimento', label: '📋 Atendimento' },
  { value: 'criacao', label: '🎨 Criação' },
  { value: 'rtv', label: '📺 RTV' },
  { value: 'midia', label: '📡 Mídia' },
  { value: 'geral', label: '📁 Geral' },
]

interface NewProjectModalProps { onCreated: () => void; open?: boolean; onOpenChange?: (v: boolean) => void }

export function NewProjectModal({ onCreated, open: externalOpen, onOpenChange }: NewProjectModalProps) {
  const [internalOpen, setInternalOpen] = useState(false)
  const open = externalOpen !== undefined ? externalOpen : internalOpen
  const setOpen = (v: boolean) => { setInternalOpen(v); onOpenChange?.(v) }

  const [step, setStep] = useState<'dados' | 'briefing'>('dados')
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [sector, setSector] = useState<Sector>('atendimento')
  const [briefingData, setBriefingData] = useState<BriefingData | null>(null)
  const [loading, setLoading] = useState(false)

  function handleClose() {
    setOpen(false)
    setStep('dados')
    setName(''); setClientName(''); setSector('atendimento'); setBriefingData(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (step === 'dados') {
      setStep('briefing')
      return
    }
    if (!name.trim() || !clientName.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('projects').insert({
      name: name.trim(),
      client_name: clientName.trim(),
      sector,
      briefing_data: briefingData ?? null,
      briefing_score: briefingData?.confianca_analise ?? 0,
    })
    setLoading(false)
    if (error) { toast.error('Erro ao criar projeto'); return }
    toast.success('Projeto criado!')
    handleClose()
    onCreated()
  }

  return (
    <>
      <Button onClick={() => setOpen(true)} className="bg-indigo-600 hover:bg-indigo-700">+ Novo Projeto</Button>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo Projeto</DialogTitle></DialogHeader>

          {/* Tab indicator */}
          <div className="flex gap-1 -mt-1 mb-2">
            {(['dados', 'briefing'] as const).map(s => (
              <button
                key={s}
                type="button"
                onClick={() => setStep(s)}
                className={`px-3 py-1 text-xs rounded-full transition-colors ${
                  step === s ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {s === 'dados' ? '1. Dados' : '2. Briefing'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 'dados' && (
              <>
                <div>
                  <Label htmlFor="name">Nome do projeto</Label>
                  <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Campanha Janeiro 2026" required />
                </div>
                <div>
                  <Label htmlFor="client">Cliente</Label>
                  <Input id="client" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: EMS Pharma" required />
                </div>
                <div>
                  <Label>Setor responsável</Label>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {SECTOR_OPTIONS.map(s => (
                      <button
                        key={s.value}
                        type="button"
                        onClick={() => setSector(s.value)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors ${
                          sector === s.value ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={!name.trim() || !clientName.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700">
                  Próximo: Briefing →
                </Button>
              </>
            )}

            {step === 'briefing' && (
              <>
                <BriefingTab value={briefingData} onChange={setBriefingData} />
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep('dados')} className="flex-1">← Voltar</Button>
                  <Button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                    {loading ? 'Criando...' : briefingData ? 'Criar Projeto' : 'Criar sem briefing'}
                  </Button>
                </div>
              </>
            )}
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/NewProjectModal.tsx
git commit -m "feat: add 2-step NewProjectModal with AI briefing extraction"
```

---

## Task 8: Badge de briefing incompleto no ProjectCard

**Files:**
- Modify: `src/components/dashboard/ProjectCard.tsx`

- [ ] **Step 1: Adicionar badge de briefing_score**

Substitua o conteúdo do arquivo:

```typescript
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import type { ProjectWithCounts } from '@/lib/types'
import { SECTORS } from './SectorTabs'

interface ProjectCardProps { project: ProjectWithCounts }

export function ProjectCard({ project }: ProjectCardProps) {
  const pieces = project.pieces ?? []
  const approved = pieces.filter(p => p.status === 'approved').length
  const revision = pieces.filter(p => p.status === 'revision_requested').length
  const pending = pieces.filter(p => p.status === 'pending').length
  const sectorInfo = SECTORS.find(s => s.value === project.sector)
  const briefingIncompleto = (project.briefing_score ?? 0) < 80 && (project.briefing_score ?? 0) > 0

  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-900 leading-tight">{project.name}</h3>
          {briefingIncompleto && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              ⚠ Briefing {project.briefing_score}%
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-1">{project.client_name}</p>
        {sectorInfo && sectorInfo.value !== 'all' && (
          <span className="text-xs text-slate-500 flex items-center gap-1 mb-2"><sectorInfo.Icon size={12} /> {sectorInfo.label}</span>
        )}
        <div className="flex gap-2 flex-wrap">
          {approved > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{approved} aprovada{approved > 1 ? 's' : ''}</span>}
          {revision > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{revision} revisão</span>}
          {pending > 0 && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{pending} pendente{pending > 1 ? 's' : ''}</span>}
          {pieces.length === 0 && <span className="text-xs text-slate-500">Sem peças</span>}
        </div>
        <p className="text-xs text-slate-500 mt-3">{formatRelativeTime(project.created_at)}</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/ProjectCard.tsx
git commit -m "feat: show briefing incomplete badge on ProjectCard"
```

---

## Task 9: Gate de envio no SendToClientModal

**Files:**
- Modify: `src/components/dashboard/SendToClientModal.tsx`

- [ ] **Step 1: Adicionar prop briefingScore e aviso âmbar**

Substitua o conteúdo do arquivo:

```typescript
'use client'
import { useState } from 'react'
import { toast } from 'sonner'
import { AlertTriangle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { notifySendClient } from '@/lib/actions'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { PieceWithVersions } from '@/lib/types'

interface SendToClientModalProps {
  open: boolean
  piece: PieceWithVersions | null
  projectName: string
  briefingScore?: number
  onClose: () => void
  onSent: () => void
}

export function SendToClientModal({ open, piece, projectName, briefingScore = 100, onClose, onSent }: SendToClientModalProps) {
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [confirmedIncomplete, setConfirmedIncomplete] = useState(false)
  const [loading, setLoading] = useState(false)

  const briefingIncompleto = briefingScore < 80 && briefingScore > 0
  const canSend = !briefingIncompleto || confirmedIncomplete

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!piece || !clientName.trim() || !clientEmail.trim() || !canSend) return
    setLoading(true)

    const reviewUrl = `${window.location.origin}/review/${piece.public_token}`
    try {
      await notifySendClient({ pieceName: piece.title, projectName, clientName: clientName.trim(), clientEmail: clientEmail.trim(), reviewUrl })
    } catch (err) {
      console.error('[SendToClientModal] notifySendClient failed:', err)
    }

    const supabase = createClient()
    await supabase.from('pieces').update({ notified_at: new Date().toISOString() }).eq('id', piece.id)

    toast.success(`Email enviado para ${clientName}!`)
    setClientName(''); setClientEmail(''); setConfirmedIncomplete(false); setLoading(false)
    onClose(); onSent()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader><DialogTitle>Enviar para o cliente</DialogTitle></DialogHeader>

        {briefingIncompleto && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 -mt-1 mb-2">
            <p className="text-sm text-amber-800 font-medium flex items-center gap-1.5 mb-1">
              <AlertTriangle className="h-4 w-4" />
              Briefing incompleto ({briefingScore}%)
            </p>
            <p className="text-xs text-amber-700 mb-2">
              O briefing deste projeto ainda tem informações faltando. Enviar agora pode gerar revisões desnecessárias.
            </p>
            <label className="flex items-center gap-2 text-sm text-amber-800 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmedIncomplete}
                onChange={e => setConfirmedIncomplete(e.target.checked)}
                className="rounded"
              />
              Entendo e quero enviar assim mesmo
            </label>
          </div>
        )}

        {!briefingIncompleto && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 -mt-1 mb-2">
            <p className="text-sm text-blue-700">
              <strong>O que acontece:</strong> O cliente receberá um email com o link de revisão. Ele poderá visualizar, comentar e aprovar — sem precisar criar conta.
            </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="cname">Nome do cliente</Label>
            <Input id="cname" value={clientName} onChange={e => setClientName(e.target.value)} placeholder="Ex: João Silva" required />
          </div>
          <div>
            <Label htmlFor="cemail">Email do cliente</Label>
            <Input id="cemail" type="email" value={clientEmail} onChange={e => setClientEmail(e.target.value)} placeholder="joao@empresa.com" required />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={loading || !canSend} className="flex-1 bg-indigo-600 hover:bg-indigo-700">
              {loading ? 'Enviando...' : '✉ Enviar'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Verificar onde SendToClientModal é instanciado e passar briefingScore**

```bash
grep -r "SendToClientModal" src/ --include="*.tsx" -l
```

Em cada arquivo encontrado, adicionar `briefingScore={project.briefing_score ?? 0}` como prop.

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/SendToClientModal.tsx
git commit -m "feat: gate send-to-client when briefing score < 80%"
```

---

## Task 10: Funções de export do claquete

**Files:**
- Create: `src/lib/exports.ts`

- [ ] **Step 1: Criar as funções de export**

```typescript
import type { ClapperboardData } from '@/components/ui/ClapperboardDigital'

/**
 * Gera CSV de veiculação e inicia download no browser.
 * Colunas: Produto, Versão/Título, Duração, Período, Local, Produção Exec., Diretor, Data, Observações
 */
export function exportVeiculacaoCSV(data: ClapperboardData): void {
  const headers = ['Produto', 'Título', 'Cena', 'Take', 'Diretor', 'D.O.P.', 'Prod. Exec.', 'Data', 'Local', 'Observações']
  const values = [
    data.produto,
    data.titulo,
    data.cena,
    data.take,
    data.diretor,
    data.dop,
    data.producaoExec,
    data.data,
    data.local,
    data.obs.replace(/\n/g, ' '),
  ]

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const csv = [headers.map(escape).join(','), values.map(escape).join(',')].join('\n')

  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `veiculacao_${data.produto.replace(/\s+/g, '_')}_${data.data.replace(/\//g, '-')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

/**
 * Gera Spec de TV em formato texto estruturado e inicia download.
 */
export function exportTVSpec(data: ClapperboardData): void {
  const lines = [
    'ESPECIFICAÇÃO TÉCNICA DE PRODUÇÃO',
    '='.repeat(40),
    '',
    `PRODUÇÃO:         ${data.producao}`,
    `CLIENTE:          ${data.cliente}`,
    `PRODUTO:          ${data.produto}`,
    `TÍTULO:           ${data.titulo}`,
    '',
    `DIRETOR:          ${data.diretor}`,
    `D.O.P.:           ${data.dop}`,
    `PRODUÇÃO EXEC.:   ${data.producaoExec}`,
    '',
    `DATA:             ${data.data}`,
    `LOCAL:            ${data.local}`,
    `CENA:             ${data.cena}`,
    `TAKE:             ${data.take}`,
    '',
    'OBSERVAÇÕES:',
    data.obs,
    '',
    '='.repeat(40),
    `Gerado por Crivo · ${new Date().toLocaleDateString('pt-BR')}`,
  ]

  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `spec_tv_${data.produto.replace(/\s+/g, '_')}.txt`
  link.click()
  URL.revokeObjectURL(url)
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/exports.ts
git commit -m "feat: add exportVeiculacaoCSV and exportTVSpec functions"
```

---

## Task 11: Botões de export no ClapperboardDigital

**Files:**
- Modify: `src/components/ui/ClapperboardDigital.tsx`

- [ ] **Step 1: Adicionar props e botões novos**

Adicione `onExportVeiculacao` e `onExportTVSpec` na interface `ClapperboardDigitalProps`:

```typescript
interface ClapperboardDigitalProps {
  initialData?: Partial<ClapperboardData>
  onExportPDF?: (data: ClapperboardData) => void
  onExportPNG?: (data: ClapperboardData) => void
  onExportVeiculacao?: (data: ClapperboardData) => void
  onExportTVSpec?: (data: ClapperboardData) => void
  className?: string
}
```

Substitua o bloco `{/* Action buttons */}` existente:

```typescript
{/* Action buttons */}
<div className="flex gap-2 self-end print:hidden flex-wrap">
  <button
    onClick={() => onExportPNG?.(data)}
    className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
  >
    <FileImage className="h-3.5 w-3.5" />
    PNG
  </button>
  <button
    onClick={() => onExportPDF?.(data)}
    className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
  >
    <Download className="h-3.5 w-3.5" />
    PDF Claquete
  </button>
  <button
    onClick={() => onExportVeiculacao?.(data)}
    className="flex items-center gap-1.5 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-green-700 transition-colors"
  >
    <Download className="h-3.5 w-3.5" />
    Planilha Veiculação
  </button>
  <button
    onClick={() => onExportTVSpec?.(data)}
    className="flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-blue-700 transition-colors"
  >
    <Download className="h-3.5 w-3.5" />
    Spec de TV
  </button>
</div>
```

- [ ] **Step 2: Encontrar onde ClapperboardDigital é instanciado e passar as novas props**

```bash
grep -r "ClapperboardDigital" src/ --include="*.tsx" -l
```

Em cada uso, adicionar:

```typescript
import { exportVeiculacaoCSV, exportTVSpec } from '@/lib/exports'

// nas props:
onExportVeiculacao={exportVeiculacaoCSV}
onExportTVSpec={exportTVSpec}
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ClapperboardDigital.tsx
git commit -m "feat: add Planilha Veiculação and Spec TV export buttons to claquete"
```

---

## Task 12: CampaignPanel — view exclusiva para role Mídia

**Files:**
- Create: `src/components/dashboard/CampaignPanel.tsx`

- [ ] **Step 1: Criar o componente**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Radio, Download } from 'lucide-react'
import { formatRelativeTime } from '@/lib/utils'
import { exportVeiculacaoCSV, exportTVSpec } from '@/lib/exports'
import { ClapperboardDigital, type ClapperboardData } from '@/components/ui/ClapperboardDigital'
import type { ProjectWithCounts } from '@/lib/types'

export function CampaignPanel() {
  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string | null>(null)

  const fetch = useCallback(async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from('projects')
      .select('*, pieces(status, first_opened_at, notified_at)')
      .order('created_at', { ascending: false })
    setProjects((data ?? []) as ProjectWithCounts[])
    setLoading(false)
  }, [])

  useEffect(() => { fetch() }, [fetch])

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-14 bg-slate-100 rounded-lg animate-pulse" />
        ))}
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
          <p className="text-sm text-slate-500">Visão de mídia: todas as campanhas com claquetes e exports</p>
        </div>
      </div>

      {projects.length === 0 && (
        <p className="text-slate-500 text-sm">Nenhuma campanha ainda.</p>
      )}

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
              {/* Row */}
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

              {/* Expanded claquete */}
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
```

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/CampaignPanel.tsx
git commit -m "feat: add CampaignPanel for Mídia role with claquete and exports"
```

---

## Task 13: Branch no ProjectGrid por role

**Files:**
- Modify: `src/components/dashboard/ProjectGrid.tsx`

- [ ] **Step 1: Importar useRole e renderizar CampaignPanel para role mídia**

No topo do arquivo, adicionar imports:

```typescript
import { useRole } from '@/lib/role-context'
import { CampaignPanel } from './CampaignPanel'
```

No início da função `ProjectGrid`, antes de qualquer return:

```typescript
const { role } = useRole()
if (role === 'midia') return <CampaignPanel />
```

- [ ] **Step 2: Verificar que build passa**

```bash
npm run build 2>&1 | tail -30
```

- [ ] **Step 3: Commit**

```bash
git add src/components/dashboard/ProjectGrid.tsx
git commit -m "feat: show CampaignPanel for Mídia role in ProjectGrid"
```

---

## Task 14: Verificação final

- [ ] **Step 1: Testar fluxo Desirre**

1. Abrir `/` no browser com role "CEO / Atendimento" (Desirre)
2. Clicar "+ Novo Projeto" → preencher nome e cliente → "Próximo: Briefing"
3. Colar um texto de briefing → "Analisar com IA" → aguardar resultado
4. Verificar que campos são extraídos e score é exibido
5. Criar projeto → verificar badge "⚠ Briefing X%" no card se score < 80

- [ ] **Step 2: Testar gate de envio**

1. No projeto criado, abrir uma peça → "Enviar para cliente"
2. Verificar aviso âmbar com checkbox de confirmação se briefing_score < 80
3. Desmarcar checkbox → botão Enviar desabilitado ✓

- [ ] **Step 3: Testar fluxo Fabi**

1. Clicar no RoleSwitcher → selecionar "Fabi / Mídia"
2. Verificar ViewAsBanner âmbar no topo
3. Verificar que a home mostra CampaignPanel (tabela de campanhas, não grid de cards)
4. Expandir uma campanha → verificar claquete com botões "Planilha Veiculação" e "Spec de TV"
5. Clicar "Planilha Veiculação" → verificar download de CSV
6. Clicar "Spec de TV" → verificar download de .txt

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "chore: final verification — Desirre briefing flow and Fabi campaign panel complete"
```
