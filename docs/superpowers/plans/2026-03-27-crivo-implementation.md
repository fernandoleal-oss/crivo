# Crivo Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build Crivo — uma ferramenta de aprovação de peças criativas para agências de publicidade, com painel do atendimento e página pública do cliente, sem autenticação.

**Architecture:** Next.js 14 App Router com Server Components para fetch inicial e Client Components para interatividade/realtime. Supabase como banco, storage e realtime. n8n webhook para notificações WhatsApp quando o cliente decide.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, shadcn/ui, Supabase JS v2, react-pdf, nanoid, date-fns, sonner (toasts)

---

## File Map

```
crivo/
├── src/
│   ├── app/
│   │   ├── layout.tsx                          # Root layout + Toaster provider
│   │   ├── page.tsx                            # Home — grid de projetos (Server)
│   │   └── project/
│   │       └── [id]/
│   │           └── page.tsx                    # Detalhe projeto (Server)
│   │   └── review/
│   │       └── [token]/
│   │           └── page.tsx                    # Página pública cliente (Server shell)
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ProjectGrid.tsx                 # Grid de ProjectCards (client — realtime)
│   │   │   ├── ProjectCard.tsx                 # Card com contadores de status
│   │   │   ├── NewProjectModal.tsx             # Modal criar projeto
│   │   │   ├── DashboardCounters.tsx           # Contadores globais no topo
│   │   │   ├── PieceList.tsx                   # Lista de peças + realtime toast
│   │   │   ├── PieceCard.tsx                   # Card da peça expandível
│   │   │   ├── NewPieceModal.tsx               # Modal criar peça + upload
│   │   │   └── UploadNewVersion.tsx            # Upload nova versão inline
│   │   ├── review/
│   │   │   ├── ReviewShell.tsx                 # Shell client da página de review
│   │   │   ├── PieceViewer.tsx                 # Viewer imagem ou PDF
│   │   │   ├── PinLayer.tsx                    # Overlay de pins clicáveis
│   │   │   ├── CommentPanel.tsx                # Painel lateral de comentários
│   │   │   ├── CommentItem.tsx                 # Item individual de comentário
│   │   │   ├── ApprovalModal.tsx               # Modal aprovar/pedir revisão
│   │   │   └── VersionNav.tsx                  # Seletor de versão + comparação
│   │   └── shared/
│   │       ├── StatusBadge.tsx                 # Badge colorido de status
│   │       ├── EmptyState.tsx                  # Tela vazia genérica
│   │       └── LoadingSkeleton.tsx             # Skeleton de loading
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                       # createBrowserClient
│   │   │   └── server.ts                       # createServerClient
│   │   ├── types.ts                            # Todas as interfaces TypeScript
│   │   ├── utils.ts                            # formatRelativeTime, generateToken, etc.
│   │   └── n8n.ts                              # notifyDecision()
│   └── hooks/
│       ├── useRealtimePiece.ts                 # Realtime numa peça
│       └── useRealtimeProject.ts               # Realtime num projeto
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── __tests__/
│   └── utils.test.ts                           # Testes de utilitários
├── .env.local
├── .env.example
└── README.md
```

---

## Task 1: Setup do Projeto

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `next.config.ts`
- Create: `.env.example`, `.env.local`
- Create: `src/app/layout.tsx`

- [ ] **Step 1: Criar projeto Next.js 14**

```bash
cd /Users/fsleal
npx create-next-app@latest crivo \
  --typescript \
  --tailwind \
  --eslint \
  --app \
  --src-dir \
  --import-alias "@/*" \
  --no-turbopack
cd crivo
```

- [ ] **Step 2: Instalar dependências**

```bash
npm install @supabase/supabase-js @supabase/ssr nanoid date-fns react-pdf sonner
npm install -D @types/node vitest @vitejs/plugin-react jsdom @testing-library/react @testing-library/dom
```

- [ ] **Step 3: Instalar shadcn/ui**

```bash
npx shadcn@latest init
# Escolher: Default style, slate base color, CSS variables: yes
npx shadcn@latest add button dialog input label textarea badge card toast separator skeleton
```

- [ ] **Step 4: Criar `.env.example`**

```bash
cat > .env.example << 'EOF'
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
N8N_WEBHOOK_URL=https://n8n.nummo-ai.com.br/webhook/crivo-notify
EOF
```

- [ ] **Step 5: Criar `.env.local`** com os valores reais do Supabase (criar projeto novo no Supabase dashboard)

- [ ] **Step 6: Configurar `vitest.config.ts`**

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, './src') },
  },
})
```

- [ ] **Step 7: Adicionar script de test no `package.json`**

```json
{
  "scripts": {
    "test": "vitest",
    "test:run": "vitest run"
  }
}
```

- [ ] **Step 8: Configurar `src/app/layout.tsx`**

```typescript
// src/app/layout.tsx
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crivo — Aprovação de Peças Criativas',
  description: 'Fluxo limpo e rastreável para aprovação de peças entre agências e clientes.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <nav className="bg-slate-900 text-white px-6 py-3 flex items-center">
          <a href="/" className="font-bold text-lg tracking-tight text-indigo-400">crivo</a>
        </nav>
        <main className="min-h-[calc(100vh-48px)]">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
```

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: project setup — Next.js 14 + Supabase + shadcn/ui + vitest"
```

---

## Task 2: Schema do Banco + Storage

**Files:**
- Create: `supabase/migrations/001_initial_schema.sql`

- [ ] **Step 1: Criar migration SQL**

```sql
-- supabase/migrations/001_initial_schema.sql

-- Enums
CREATE TYPE piece_status AS ENUM ('pending', 'approved', 'revision_requested');
CREATE TYPE comment_type AS ENUM ('general', 'pin');
CREATE TYPE approval_decision AS ENUM ('approved', 'revision_requested');

-- Projetos
CREATE TABLE projects (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name        text NOT NULL,
  client_name text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- Peças
CREATE TABLE pieces (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title        text NOT NULL,
  description  text,
  status       piece_status NOT NULL DEFAULT 'pending',
  public_token text NOT NULL UNIQUE,
  notified_at  timestamptz,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- Versões
CREATE TABLE piece_versions (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_id       uuid NOT NULL REFERENCES pieces(id) ON DELETE CASCADE,
  version_number int NOT NULL,
  file_url       text NOT NULL,
  file_type      text NOT NULL,
  uploaded_at    timestamptz NOT NULL DEFAULT now()
);

-- Comentários
CREATE TABLE comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_id     uuid NOT NULL REFERENCES pieces(id) ON DELETE CASCADE,
  version_id   uuid NOT NULL REFERENCES piece_versions(id) ON DELETE CASCADE,
  author_name  text NOT NULL,
  content      text NOT NULL,
  comment_type comment_type NOT NULL DEFAULT 'general',
  pin_x        float,
  pin_y        float,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- Aprovações
CREATE TABLE approvals (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  piece_id    uuid NOT NULL REFERENCES pieces(id) ON DELETE CASCADE,
  version_id  uuid NOT NULL REFERENCES piece_versions(id) ON DELETE CASCADE,
  decision    approval_decision NOT NULL,
  feedback    text,
  decided_by  text NOT NULL,
  decided_at  timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX idx_pieces_project_id ON pieces(project_id);
CREATE INDEX idx_pieces_public_token ON pieces(public_token);
CREATE INDEX idx_piece_versions_piece_id ON piece_versions(piece_id);
CREATE INDEX idx_comments_piece_id ON comments(piece_id);
CREATE INDEX idx_approvals_piece_id ON approvals(piece_id);

-- RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE piece_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE approvals ENABLE ROW LEVEL SECURITY;

-- Políticas permissivas (MVP sem auth)
CREATE POLICY "public_all" ON projects FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON pieces FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON piece_versions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON comments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "public_all" ON approvals FOR ALL USING (true) WITH CHECK (true);
```

- [ ] **Step 2: Rodar migration no Supabase**

No Supabase dashboard → SQL Editor → colar e executar o conteúdo de `001_initial_schema.sql`.

- [ ] **Step 3: Criar bucket de storage**

No Supabase dashboard → Storage → New bucket:
- Name: `pieces`
- Public: ✅ (marcar como público)

Depois em Storage → Policies → bucket `pieces` → adicionar política:
```sql
-- Leitura pública
CREATE POLICY "public read" ON storage.objects FOR SELECT USING (bucket_id = 'pieces');
-- Insert público (MVP)
CREATE POLICY "public insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'pieces');
```

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: database schema + storage bucket configuration"
```

---

## Task 3: Types, Utils e Clientes Supabase

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/utils.ts`
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `src/lib/n8n.ts`
- Create: `__tests__/utils.test.ts`

- [ ] **Step 1: Escrever testes de utilitários (failing)**

```typescript
// __tests__/utils.test.ts
import { describe, it, expect } from 'vitest'
import { formatRelativeTime, generateToken, formatFileSize, isValidFileType } from '@/lib/utils'

describe('formatRelativeTime', () => {
  it('returns "agora" for recent dates', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('agora')
  })

  it('returns relative time for older dates', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const result = formatRelativeTime(twoHoursAgo.toISOString())
    expect(result).toContain('hora')
  })
})

describe('generateToken', () => {
  it('generates a 10-char alphanumeric token', () => {
    const token = generateToken()
    expect(token).toHaveLength(10)
    expect(token).toMatch(/^[a-zA-Z0-9]+$/)
  })

  it('generates unique tokens', () => {
    const tokens = Array.from({ length: 100 }, () => generateToken())
    const unique = new Set(tokens)
    expect(unique.size).toBe(100)
  })
})

describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB')
    expect(formatFileSize(1048576)).toBe('1.0 MB')
    expect(formatFileSize(500)).toBe('500 B')
  })
})

describe('isValidFileType', () => {
  it('accepts valid file types', () => {
    expect(isValidFileType('image/jpeg')).toBe(true)
    expect(isValidFileType('image/png')).toBe(true)
    expect(isValidFileType('application/pdf')).toBe(true)
  })

  it('rejects invalid file types', () => {
    expect(isValidFileType('video/mp4')).toBe(false)
    expect(isValidFileType('text/plain')).toBe(false)
  })
})
```

- [ ] **Step 2: Rodar testes — verificar que falham**

```bash
npm run test:run
```
Esperado: FAIL — "Cannot find module '@/lib/utils'"

- [ ] **Step 3: Criar `src/lib/types.ts`**

```typescript
// src/lib/types.ts
export type PieceStatus = 'pending' | 'approved' | 'revision_requested'
export type CommentType = 'general' | 'pin'
export type ApprovalDecision = 'approved' | 'revision_requested'

export interface Project {
  id: string
  name: string
  client_name: string
  created_at: string
}

export interface ProjectWithCounts extends Project {
  pieces: { status: PieceStatus }[]
}

export interface Piece {
  id: string
  project_id: string
  title: string
  description: string | null
  status: PieceStatus
  public_token: string
  notified_at: string | null
  created_at: string
  updated_at: string
}

export interface PieceWithVersions extends Piece {
  piece_versions: PieceVersion[]
  approvals: Approval[]
}

export interface PieceVersion {
  id: string
  piece_id: string
  version_number: number
  file_url: string
  file_type: string
  uploaded_at: string
}

export interface Comment {
  id: string
  piece_id: string
  version_id: string
  author_name: string
  content: string
  comment_type: CommentType
  pin_x: number | null
  pin_y: number | null
  created_at: string
}

export interface Approval {
  id: string
  piece_id: string
  version_id: string
  decision: ApprovalDecision
  feedback: string | null
  decided_by: string
  decided_at: string
}

export interface NotifyDecisionPayload {
  pieceName: string
  projectName: string
  clientName: string
  decision: ApprovalDecision
  feedback?: string
  decidedBy: string
  pieceToken: string
}
```

- [ ] **Step 4: Criar `src/lib/utils.ts`**

```typescript
// src/lib/utils.ts
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { customAlphabet } from 'nanoid'

const VALID_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10)

export function generateToken(): string {
  return nanoid()
}

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const diffMs = Date.now() - date.getTime()
  if (diffMs < 60_000) return 'agora'
  return formatDistanceToNow(date, { locale: ptBR, addSuffix: true })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isValidFileType(mimeType: string): boolean {
  return VALID_FILE_TYPES.includes(mimeType)
}

export function isValidFileSize(bytes: number): boolean {
  return bytes <= MAX_FILE_SIZE
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    revision_requested: 'Revisão',
  }
  return labels[status] ?? status
}

export function isPdf(fileType: string): boolean {
  return fileType === 'application/pdf'
}
```

- [ ] **Step 5: Criar `src/lib/supabase/client.ts`**

```typescript
// src/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

- [ ] **Step 6: Criar `src/lib/supabase/server.ts`**

```typescript
// src/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  )
}
```

- [ ] **Step 7: Criar `src/lib/n8n.ts`**

```typescript
// src/lib/n8n.ts
import type { NotifyDecisionPayload } from './types'

export async function notifyDecision(payload: NotifyDecisionPayload): Promise<void> {
  const webhookUrl = process.env.N8N_WEBHOOK_URL
  if (!webhookUrl) return // silently skip if not configured

  try {
    await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {
    // notificação é best-effort, não bloqueia o fluxo do usuário
  }
}
```

- [ ] **Step 8: Rodar testes — verificar que passam**

```bash
npm run test:run
```
Esperado: PASS — 7 testes passando

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: types, utils, supabase clients, n8n notifier — tests passing"
```

---

## Task 4: Componentes Compartilhados

**Files:**
- Create: `src/components/shared/StatusBadge.tsx`
- Create: `src/components/shared/EmptyState.tsx`
- Create: `src/components/shared/LoadingSkeleton.tsx`

- [ ] **Step 1: Criar `src/components/shared/StatusBadge.tsx`**

```typescript
// src/components/shared/StatusBadge.tsx
import { Badge } from '@/components/ui/badge'
import type { PieceStatus } from '@/lib/types'
import { getStatusLabel } from '@/lib/utils'

interface StatusBadgeProps {
  status: PieceStatus
}

const statusStyles: Record<PieceStatus, string> = {
  pending: 'bg-slate-100 text-slate-600 hover:bg-slate-100',
  approved: 'bg-green-100 text-green-700 hover:bg-green-100',
  revision_requested: 'bg-amber-100 text-amber-700 hover:bg-amber-100',
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <Badge className={statusStyles[status]}>
      {getStatusLabel(status)}
    </Badge>
  )
}
```

- [ ] **Step 2: Criar `src/components/shared/EmptyState.tsx`**

```typescript
// src/components/shared/EmptyState.tsx
interface EmptyStateProps {
  title: string
  description: string
  action?: React.ReactNode
}

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      </div>
      <h3 className="text-lg font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm mb-4 max-w-xs">{description}</p>
      {action}
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/components/shared/LoadingSkeleton.tsx`**

```typescript
// src/components/shared/LoadingSkeleton.tsx
import { Skeleton } from '@/components/ui/skeleton'

export function ProjectGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 space-y-3">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-16" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function PieceListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-white border border-slate-200 rounded-lg p-4 space-y-2">
          <div className="flex justify-between items-center">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: shared components — StatusBadge, EmptyState, LoadingSkeleton"
```

---

## Task 5: Painel — Home e Projetos

**Files:**
- Create: `src/app/page.tsx`
- Create: `src/components/dashboard/ProjectCard.tsx`
- Create: `src/components/dashboard/DashboardCounters.tsx`
- Create: `src/components/dashboard/NewProjectModal.tsx`
- Create: `src/components/dashboard/ProjectGrid.tsx`

- [ ] **Step 1: Criar `src/components/dashboard/ProjectCard.tsx`**

```typescript
// src/components/dashboard/ProjectCard.tsx
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import type { ProjectWithCounts } from '@/lib/types'

interface ProjectCardProps {
  project: ProjectWithCounts
}

export function ProjectCard({ project }: ProjectCardProps) {
  const pieces = project.pieces ?? []
  const approved = pieces.filter(p => p.status === 'approved').length
  const revision = pieces.filter(p => p.status === 'revision_requested').length
  const pending = pieces.filter(p => p.status === 'pending').length

  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-semibold text-slate-900 leading-tight">{project.name}</h3>
        </div>
        <p className="text-sm text-slate-500 mb-3">{project.client_name}</p>
        <div className="flex gap-2 flex-wrap">
          {approved > 0 && (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {approved} aprovada{approved > 1 ? 's' : ''}
            </span>
          )}
          {revision > 0 && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
              {revision} revisão
            </span>
          )}
          {pending > 0 && (
            <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">
              {pending} pendente{pending > 1 ? 's' : ''}
            </span>
          )}
          {pieces.length === 0 && (
            <span className="text-xs text-slate-400">Sem peças</span>
          )}
        </div>
        <p className="text-xs text-slate-400 mt-3">{formatRelativeTime(project.created_at)}</p>
      </div>
    </Link>
  )
}
```

- [ ] **Step 2: Criar `src/components/dashboard/DashboardCounters.tsx`**

```typescript
// src/components/dashboard/DashboardCounters.tsx
interface DashboardCountersProps {
  total: number
  approved: number
  revision: number
  pending: number
}

export function DashboardCounters({ total, approved, revision, pending }: DashboardCountersProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {[
        { label: 'Total de peças', value: total, color: 'text-slate-700' },
        { label: 'Aprovadas', value: approved, color: 'text-green-600' },
        { label: 'Em revisão', value: revision, color: 'text-amber-600' },
        { label: 'Pendentes', value: pending, color: 'text-slate-500' },
      ].map(({ label, value, color }) => (
        <div key={label} className="bg-white border border-slate-200 rounded-lg p-3 text-center">
          <div className={`text-2xl font-bold ${color}`}>{value}</div>
          <div className="text-xs text-slate-500 mt-0.5">{label}</div>
        </div>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/components/dashboard/NewProjectModal.tsx`**

```typescript
// src/components/dashboard/NewProjectModal.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from '@/components/ui/dialog'

interface NewProjectModalProps {
  onCreated: () => void
}

export function NewProjectModal({ onCreated }: NewProjectModalProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [clientName, setClientName] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim() || !clientName.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('projects').insert({ name: name.trim(), client_name: clientName.trim() })
    setLoading(false)
    if (error) { toast.error('Erro ao criar projeto'); return }
    toast.success('Projeto criado!')
    setName(''); setClientName(''); setOpen(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-indigo-600 hover:bg-indigo-700">+ Novo Projeto</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Projeto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="name">Nome do projeto / campanha</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)}
              placeholder="Ex: Campanha Verão 2026" required />
          </div>
          <div>
            <Label htmlFor="client">Nome do cliente</Label>
            <Input id="client" value={clientName} onChange={e => setClientName(e.target.value)}
              placeholder="Ex: Marca X" required />
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {loading ? 'Criando...' : 'Criar Projeto'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 4: Criar `src/components/dashboard/ProjectGrid.tsx`**

```typescript
// src/components/dashboard/ProjectGrid.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ProjectCard } from './ProjectCard'
import { NewProjectModal } from './NewProjectModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { ProjectGridSkeleton } from '@/components/shared/LoadingSkeleton'
import { DashboardCounters } from './DashboardCounters'
import { Input } from '@/components/ui/input'
import type { ProjectWithCounts, PieceStatus } from '@/lib/types'

export function ProjectGrid() {
  const [projects, setProjects] = useState<ProjectWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

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

  const filtered = projects.filter(p =>
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
        <h1 className="text-2xl font-bold text-slate-900">Projetos</h1>
        <NewProjectModal onCreated={fetchProjects} />
      </div>

      <DashboardCounters {...counters} />

      <div className="mb-4">
        <Input
          placeholder="Buscar por projeto ou cliente..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-sm"
        />
      </div>

      {loading ? (
        <ProjectGridSkeleton />
      ) : filtered.length === 0 ? (
        <EmptyState
          title={search ? 'Nenhum projeto encontrado' : 'Nenhum projeto ainda'}
          description={search ? 'Tente outro termo de busca.' : 'Crie seu primeiro projeto para começar.'}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => <ProjectCard key={project.id} project={project} />)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Criar `src/app/page.tsx`**

```typescript
// src/app/page.tsx
import { ProjectGrid } from '@/components/dashboard/ProjectGrid'

export default function HomePage() {
  return <ProjectGrid />
}
```

- [ ] **Step 6: Rodar dev server e testar visualmente**

```bash
npm run dev
```
Abrir http://localhost:3000 — deve mostrar o grid vazio com botão "Novo Projeto". Criar um projeto e verificar que aparece no grid.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: home page — project grid with counters, search, and create modal"
```

---

## Task 6: Painel — Detalhe do Projeto e Peças

**Files:**
- Create: `src/app/project/[id]/page.tsx`
- Create: `src/components/dashboard/PieceCard.tsx`
- Create: `src/components/dashboard/PieceList.tsx`
- Create: `src/components/dashboard/NewPieceModal.tsx`
- Create: `src/components/dashboard/UploadNewVersion.tsx`

- [ ] **Step 1: Criar `src/components/dashboard/NewPieceModal.tsx`**

```typescript
// src/components/dashboard/NewPieceModal.tsx
'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { generateToken, isValidFileType, isValidFileSize, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'

interface NewPieceModalProps {
  projectId: string
  onCreated: () => void
}

export function NewPieceModal({ projectId, onCreated }: NewPieceModalProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!isValidFileType(f.type)) { toast.error('Tipo inválido. Use JPG, PNG ou PDF.'); return }
    if (!isValidFileSize(f.size)) { toast.error(`Arquivo muito grande. Máximo 10MB.`); return }
    setFile(f)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!title.trim() || !file) { toast.error('Preencha o título e selecione um arquivo.'); return }
    setLoading(true)
    const supabase = createClient()
    const token = generateToken()
    const { data: piece, error: pieceErr } = await supabase
      .from('pieces')
      .insert({ project_id: projectId, title: title.trim(), description: description.trim() || null, public_token: token })
      .select()
      .single()
    if (pieceErr || !piece) { toast.error('Erro ao criar peça'); setLoading(false); return }

    const path = `${piece.id}/1/${file.name}`
    const { error: uploadErr } = await supabase.storage.from('pieces').upload(path, file, {
      onUploadProgress: ({ loaded, total }) => setProgress(Math.round((loaded / total!) * 100)),
    })
    if (uploadErr) { toast.error('Erro no upload'); setLoading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('pieces').getPublicUrl(path)
    await supabase.from('piece_versions').insert({ piece_id: piece.id, version_number: 1, file_url: publicUrl, file_type: file.type })

    toast.success('Peça criada!')
    setTitle(''); setDescription(''); setFile(null); setProgress(0); setOpen(false); setLoading(false)
    onCreated()
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">+ Nova Peça</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader><DialogTitle>Nova Peça</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={e => setTitle(e.target.value)}
              placeholder="Ex: Banner Instagram 1080x1080" required />
          </div>
          <div>
            <Label htmlFor="desc">Descrição (opcional)</Label>
            <Textarea id="desc" value={description} onChange={e => setDescription(e.target.value)}
              placeholder="Orientações para o cliente..." rows={2} />
          </div>
          <div>
            <Label>Arquivo (JPG, PNG ou PDF — máx. 10MB)</Label>
            <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} className="hidden" />
            <div onClick={() => fileRef.current?.click()}
              className="border-2 border-dashed border-slate-200 rounded-lg p-4 text-center cursor-pointer hover:border-indigo-300 transition-colors mt-1">
              {file ? (
                <p className="text-sm text-slate-700">{file.name} — {formatFileSize(file.size)}</p>
              ) : (
                <p className="text-sm text-slate-400">Clique para selecionar</p>
              )}
            </div>
            {progress > 0 && progress < 100 && (
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2">
                <div className="bg-indigo-500 h-1.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>
          <Button type="submit" disabled={loading || !file} className="w-full bg-indigo-600 hover:bg-indigo-700">
            {loading ? `Enviando... ${progress}%` : 'Criar Peça'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 2: Criar `src/components/dashboard/UploadNewVersion.tsx`**

```typescript
// src/components/dashboard/UploadNewVersion.tsx
'use client'

import { useState, useRef } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { isValidFileType, isValidFileSize, formatFileSize } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface UploadNewVersionProps {
  pieceId: string
  currentVersionNumber: number
  onUploaded: () => void
}

export function UploadNewVersion({ pieceId, currentVersionNumber, onUploaded }: UploadNewVersionProps) {
  const [file, setFile] = useState<File | null>(null)
  const [progress, setProgress] = useState(0)
  const [loading, setLoading] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    if (!isValidFileType(f.type)) { toast.error('Tipo inválido. Use JPG, PNG ou PDF.'); return }
    if (!isValidFileSize(f.size)) { toast.error('Arquivo muito grande. Máximo 10MB.'); return }
    setFile(f)
  }

  async function handleUpload() {
    if (!file) return
    setLoading(true)
    const supabase = createClient()
    const newVersion = currentVersionNumber + 1
    const path = `${pieceId}/${newVersion}/${file.name}`
    const { error: uploadErr } = await supabase.storage.from('pieces').upload(path, file, {
      onUploadProgress: ({ loaded, total }) => setProgress(Math.round((loaded / total!) * 100)),
    })
    if (uploadErr) { toast.error('Erro no upload'); setLoading(false); return }

    const { data: { publicUrl } } = supabase.storage.from('pieces').getPublicUrl(path)
    await supabase.from('piece_versions').insert({
      piece_id: pieceId, version_number: newVersion, file_url: publicUrl, file_type: file.type
    })
    await supabase.from('pieces').update({ status: 'pending', updated_at: new Date().toISOString() }).eq('id', pieceId)

    toast.success(`Versão ${newVersion} enviada!`)
    setFile(null); setProgress(0); setLoading(false)
    onUploaded()
  }

  return (
    <div className="flex items-center gap-2 mt-2">
      <input ref={fileRef} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} className="hidden" />
      {!file ? (
        <Button variant="ghost" size="sm" onClick={() => fileRef.current?.click()}>
          ↑ Nova versão
        </Button>
      ) : (
        <>
          <span className="text-xs text-slate-500">{file.name} — {formatFileSize(file.size)}</span>
          <Button size="sm" onClick={handleUpload} disabled={loading} className="bg-indigo-600 hover:bg-indigo-700">
            {loading ? `${progress}%` : 'Enviar'}
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setFile(null)}>Cancelar</Button>
        </>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/components/dashboard/PieceCard.tsx`**

```typescript
// src/components/dashboard/PieceCard.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { UploadNewVersion } from './UploadNewVersion'
import { formatRelativeTime } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import type { PieceWithVersions } from '@/lib/types'

interface PieceCardProps {
  piece: PieceWithVersions
  onRefresh: () => void
}

export function PieceCard({ piece, onRefresh }: PieceCardProps) {
  const [expanded, setExpanded] = useState(false)
  const latestVersion = piece.piece_versions?.at(-1)
  const approval = piece.approvals?.at(-1)

  function copyLink() {
    const url = `${window.location.origin}/review/${piece.public_token}`
    navigator.clipboard.writeText(url)
    toast.success('Link copiado!')
  }

  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden">
      <div className="p-4 flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-medium text-slate-900">{piece.title}</h3>
            <StatusBadge status={piece.status} />
          </div>
          {piece.description && <p className="text-sm text-slate-500 mt-0.5">{piece.description}</p>}
          <p className="text-xs text-slate-400 mt-1">{formatRelativeTime(piece.updated_at)}</p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <Button variant="outline" size="sm" onClick={copyLink}>Copiar link</Button>
          <Button variant="ghost" size="sm" onClick={() => setExpanded(v => !v)}>
            {expanded ? '▲' : '▼'}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-slate-100 px-4 pb-4 pt-3 space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Versões</p>
            {(piece.piece_versions ?? []).map(v => (
              <div key={v.id} className="flex items-center gap-2 text-sm text-slate-600">
                <span>v{v.version_number}</span>
                <span className="text-slate-400">·</span>
                <span>{formatRelativeTime(v.uploaded_at)}</span>
                <a href={v.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-indigo-600 hover:underline text-xs">Abrir</a>
              </div>
            ))}
            {latestVersion && (
              <UploadNewVersion
                pieceId={piece.id}
                currentVersionNumber={latestVersion.version_number}
                onUploaded={onRefresh}
              />
            )}
          </div>

          {approval && (
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Decisão do cliente</p>
              <div className="text-sm text-slate-700">
                <span className={approval.decision === 'approved' ? 'text-green-600 font-medium' : 'text-amber-600 font-medium'}>
                  {approval.decision === 'approved' ? '✅ Aprovado' : '↩ Revisão solicitada'}
                </span>
                {' '}por <strong>{approval.decided_by}</strong> — {formatRelativeTime(approval.decided_at)}
                {approval.feedback && <p className="text-slate-500 mt-1 italic">"{approval.feedback}"</p>}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 4: Criar `src/components/dashboard/PieceList.tsx`**

```typescript
// src/components/dashboard/PieceList.tsx
'use client'

import { useState, useEffect, useCallback } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { PieceCard } from './PieceCard'
import { NewPieceModal } from './NewPieceModal'
import { EmptyState } from '@/components/shared/EmptyState'
import { PieceListSkeleton } from '@/components/shared/LoadingSkeleton'
import type { PieceWithVersions } from '@/lib/types'

interface PieceListProps {
  projectId: string
  projectName: string
}

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

  // Realtime: atualiza quando cliente comenta ou aprova
  useEffect(() => {
    const supabase = createClient()
    const channel = supabase
      .channel(`project-${projectId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'approvals' }, payload => {
        const decision = (payload.new as { decision: string }).decision
        toast.info(decision === 'approved' ? '✅ Cliente aprovou uma peça!' : '↩ Cliente pediu revisão!')
        fetchPieces()
      })
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments' }, () => {
        fetchPieces()
      })
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
          title="Nenhuma peça ainda"
          description="Crie a primeira peça desse projeto para enviar ao cliente."
        />
      ) : (
        <div className="space-y-3">
          {pieces.map(piece => <PieceCard key={piece.id} piece={piece} onRefresh={fetchPieces} />)}
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 5: Criar `src/app/project/[id]/page.tsx`**

```typescript
// src/app/project/[id]/page.tsx
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { PieceList } from '@/components/dashboard/PieceList'

interface Props {
  params: Promise<{ id: string }>
}

export default async function ProjectPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: project } = await supabase
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()

  if (!project) notFound()

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href="/" className="hover:text-indigo-600">Projetos</Link>
          <span>/</span>
          <span>{project.name}</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
        <p className="text-slate-500">Cliente: {project.client_name}</p>
      </div>
      <PieceList projectId={project.id} projectName={project.name} />
    </div>
  )
}
```

- [ ] **Step 6: Testar fluxo completo no browser**

```bash
npm run dev
```
- Criar projeto → aparece no grid ✓
- Abrir projeto → página de detalhe ✓
- Criar peça com upload → aparece na lista com badge "Pendente" ✓
- Copiar link → URL copiada ✓

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: project detail page — piece list, create piece, upload, realtime toasts"
```

---

## Task 7: Página Pública do Cliente — Viewer + Comentários Gerais

**Files:**
- Create: `src/app/review/[token]/page.tsx`
- Create: `src/components/review/ReviewShell.tsx`
- Create: `src/components/review/PieceViewer.tsx`
- Create: `src/components/review/VersionNav.tsx`
- Create: `src/components/review/CommentItem.tsx`
- Create: `src/components/review/CommentPanel.tsx`

- [ ] **Step 1: Criar `src/app/review/[token]/page.tsx`**

```typescript
// src/app/review/[token]/page.tsx
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ReviewShell } from '@/components/review/ReviewShell'
import type { PieceWithVersions } from '@/lib/types'

interface Props {
  params: Promise<{ token: string }>
}

export async function generateMetadata({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('pieces').select('title').eq('public_token', token).single()
  return { title: data ? `${data.title} — Crivo` : 'Crivo' }
}

export default async function ReviewPage({ params }: Props) {
  const { token } = await params
  const supabase = await createClient()
  const { data: piece } = await supabase
    .from('pieces')
    .select('*, piece_versions(*), approvals(*)')
    .eq('public_token', token)
    .single()

  if (!piece) notFound()

  // Buscar projeto para exibir nome do cliente
  const { data: project } = await supabase
    .from('projects')
    .select('name, client_name')
    .eq('id', piece.project_id)
    .single()

  return <ReviewShell piece={piece as PieceWithVersions} projectName={project?.name ?? ''} />
}
```

- [ ] **Step 2: Criar `src/components/review/VersionNav.tsx`**

```typescript
// src/components/review/VersionNav.tsx
import type { PieceVersion } from '@/lib/types'

interface VersionNavProps {
  versions: PieceVersion[]
  currentVersionId: string
  onSelect: (version: PieceVersion) => void
}

export function VersionNav({ versions, currentVersionId, onSelect }: VersionNavProps) {
  if (versions.length <= 1) return null
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500">Versão:</span>
      {versions.map(v => (
        <button
          key={v.id}
          onClick={() => onSelect(v)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            v.id === currentVersionId
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          v{v.version_number}
        </button>
      ))}
    </div>
  )
}
```

- [ ] **Step 3: Criar `src/components/review/CommentItem.tsx`**

```typescript
// src/components/review/CommentItem.tsx
import { formatRelativeTime } from '@/lib/utils'
import type { Comment } from '@/lib/types'

interface CommentItemProps {
  comment: Comment
  pinIndex?: number
  onPinHover?: (pinIndex: number | null) => void
}

export function CommentItem({ comment, pinIndex, onPinHover }: CommentItemProps) {
  return (
    <div
      className="bg-slate-50 rounded-lg p-3 text-sm group cursor-default"
      onMouseEnter={() => pinIndex !== undefined && onPinHover?.(pinIndex)}
      onMouseLeave={() => onPinHover?.(null)}
    >
      {comment.comment_type === 'pin' && pinIndex !== undefined && (
        <div className="flex items-center gap-1.5 mb-1">
          <span className="w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold">
            {pinIndex + 1}
          </span>
          <span className="text-xs text-indigo-600 font-medium">Comentário de posição</span>
        </div>
      )}
      <p className="text-slate-700">{comment.content}</p>
      <div className="flex items-center gap-1 mt-1.5 text-xs text-slate-400">
        <span className="font-medium text-slate-500">{comment.author_name}</span>
        <span>·</span>
        <span>{formatRelativeTime(comment.created_at)}</span>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Criar `src/components/review/CommentPanel.tsx`**

```typescript
// src/components/review/CommentPanel.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { CommentItem } from './CommentItem'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { Comment } from '@/lib/types'

interface CommentPanelProps {
  pieceId: string
  versionId: string
  comments: Comment[]
  onCommentAdded: () => void
  onPinHover?: (pinIndex: number | null) => void
  disabled?: boolean
}

export function CommentPanel({ pieceId, versionId, comments, onCommentAdded, onPinHover, disabled }: CommentPanelProps) {
  const [content, setContent] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [loading, setLoading] = useState(false)

  const generalComments = comments.filter(c => c.comment_type === 'general')
  const pinComments = comments.filter(c => c.comment_type === 'pin')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim() || !authorName.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('comments').insert({
      piece_id: pieceId, version_id: versionId,
      author_name: authorName.trim(), content: content.trim(),
      comment_type: 'general',
    })
    setLoading(false)
    if (error) { toast.error('Erro ao enviar comentário'); return }
    setContent('')
    toast.success('Comentário enviado!')
    onCommentAdded()
  }

  return (
    <div className="flex flex-col gap-4">
      {pinComments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Pins na imagem</p>
          <div className="space-y-2">
            {pinComments.map((c, i) => (
              <CommentItem key={c.id} comment={c} pinIndex={i} onPinHover={onPinHover} />
            ))}
          </div>
        </div>
      )}

      {generalComments.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Comentários gerais</p>
          <div className="space-y-2">
            {generalComments.map(c => <CommentItem key={c.id} comment={c} />)}
          </div>
        </div>
      )}

      {comments.length === 0 && (
        <p className="text-sm text-slate-400 text-center py-4">Nenhum comentário ainda.</p>
      )}

      <form onSubmit={handleSubmit} className="border-t border-slate-100 pt-4 space-y-3">
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Deixar comentário</p>
        <div>
          <Label htmlFor="author" className="text-xs">Seu nome</Label>
          <Input id="author" value={authorName} onChange={e => setAuthorName(e.target.value)}
            placeholder="Ex: Maria Silva" required className="mt-1" />
        </div>
        <div>
          <Label htmlFor="comment" className="text-xs">Comentário</Label>
          <Textarea id="comment" value={content} onChange={e => setContent(e.target.value)}
            placeholder="Escreva seu comentário..." rows={3} required className="mt-1" />
        </div>
        <Button type="submit" disabled={loading} size="sm" className="w-full bg-indigo-600 hover:bg-indigo-700">
          {loading ? 'Enviando...' : 'Enviar comentário'}
        </Button>
      </form>
    </div>
  )
}
```

- [ ] **Step 5: Criar `src/components/review/PieceViewer.tsx`** (apenas imagem por enquanto — PDF na Task 8)

```typescript
// src/components/review/PieceViewer.tsx
'use client'

import { isPdf } from '@/lib/utils'

interface PieceViewerProps {
  fileUrl: string
  fileType: string
  children?: React.ReactNode  // PinLayer overlay
}

export function PieceViewer({ fileUrl, fileType, children }: PieceViewerProps) {
  if (isPdf(fileType)) {
    // PDF placeholder — implementado na Task 8
    return (
      <div className="relative w-full bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: 400 }}>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer"
          className="text-indigo-600 underline text-sm">Abrir PDF em nova aba (visualização em breve)</a>
        {children}
      </div>
    )
  }

  return (
    <div className="relative w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fileUrl}
        alt="Peça criativa"
        className="max-w-full max-h-[70vh] object-contain"
        draggable={false}
      />
      {children}
    </div>
  )
}
```

- [ ] **Step 6: Criar `src/components/review/ReviewShell.tsx`** (sem pins ainda — adicionados na Task 8)

```typescript
// src/components/review/ReviewShell.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PieceViewer } from './PieceViewer'
import { CommentPanel } from './CommentPanel'
import { VersionNav } from './VersionNav'
import { ApprovalModal } from './ApprovalModal'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import type { PieceWithVersions, PieceVersion, Comment } from '@/lib/types'

interface ReviewShellProps {
  piece: PieceWithVersions
  projectName: string
}

export function ReviewShell({ piece, projectName }: ReviewShellProps) {
  const versions = piece.piece_versions?.sort((a, b) => a.version_number - b.version_number) ?? []
  const [currentVersion, setCurrentVersion] = useState<PieceVersion>(versions.at(-1)!)
  const [comments, setComments] = useState<Comment[]>([])
  const [decided, setDecided] = useState(!!piece.approvals?.length)
  const [showApprove, setShowApprove] = useState(false)
  const [showRevision, setShowRevision] = useState(false)

  const fetchComments = useCallback(async () => {
    if (!currentVersion) return
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('piece_id', piece.id)
      .eq('version_id', currentVersion.id)
      .order('created_at', { ascending: true })
    setComments((data ?? []) as Comment[])
  }, [piece.id, currentVersion])

  useEffect(() => { fetchComments() }, [fetchComments])

  if (!currentVersion) return <div className="p-8 text-center text-slate-500">Nenhuma versão disponível.</div>

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-start justify-between flex-wrap gap-2">
          <div>
            <p className="text-xs text-slate-400">{projectName}</p>
            <h1 className="font-semibold text-slate-900">{piece.title}</h1>
            {piece.description && <p className="text-sm text-slate-500 mt-0.5">{piece.description}</p>}
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={piece.status} />
            <VersionNav versions={versions} currentVersionId={currentVersion.id} onSelect={setCurrentVersion} />
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        {/* Desktop: split layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Viewer */}
          <div className="flex-1 min-w-0">
            <PieceViewer fileUrl={currentVersion.file_url} fileType={currentVersion.file_type} />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-400">
                Versão {currentVersion.version_number} · {formatRelativeTime(currentVersion.uploaded_at)}
              </p>
              <a href={currentVersion.file_url} download
                className="text-xs text-indigo-600 hover:underline">⬇ Download</a>
            </div>
          </div>

          {/* Right panel (desktop) */}
          <div className="w-full lg:w-80 flex-shrink-0">
            {decided ? (
              <div className="bg-slate-100 rounded-lg p-4 text-center mb-4">
                <p className="font-medium text-slate-700">Decisão registrada ✓</p>
                <p className="text-sm text-slate-500 mt-1">Você ainda pode deixar comentários.</p>
              </div>
            ) : (
              <div className="flex gap-2 mb-4">
                <Button onClick={() => setShowApprove(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700">Aprovar</Button>
                <Button onClick={() => setShowRevision(true)} variant="outline"
                  className="flex-1 border-amber-400 text-amber-700 hover:bg-amber-50">Pedir Revisão</Button>
              </div>
            )}
            <CommentPanel
              pieceId={piece.id}
              versionId={currentVersion.id}
              comments={comments}
              onCommentAdded={fetchComments}
            />
          </div>
        </div>

        {/* Mobile: botões no rodapé fixo */}
        {!decided && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex gap-2 lg:hidden z-10">
            <Button onClick={() => setShowApprove(true)}
              className="flex-1 bg-green-600 hover:bg-green-700">Aprovar</Button>
            <Button onClick={() => setShowRevision(true)} variant="outline"
              className="flex-1 border-amber-400 text-amber-700">Pedir Revisão</Button>
          </div>
        )}
      </div>

      <ApprovalModal
        open={showApprove}
        decision="approved"
        pieceId={piece.id}
        versionId={currentVersion.id}
        pieceName={piece.title}
        projectName={projectName}
        pieceToken={piece.public_token}
        onClose={() => setShowApprove(false)}
        onDecided={() => setDecided(true)}
      />
      <ApprovalModal
        open={showRevision}
        decision="revision_requested"
        pieceId={piece.id}
        versionId={currentVersion.id}
        pieceName={piece.title}
        projectName={projectName}
        pieceToken={piece.public_token}
        onClose={() => setShowRevision(false)}
        onDecided={() => setDecided(true)}
      />
    </div>
  )
}
```

- [ ] **Step 7: Criar `src/components/review/ApprovalModal.tsx`**

```typescript
// src/components/review/ApprovalModal.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { notifyDecision } from '@/lib/n8n'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import type { ApprovalDecision } from '@/lib/types'

interface ApprovalModalProps {
  open: boolean
  decision: ApprovalDecision
  pieceId: string
  versionId: string
  pieceName: string
  projectName: string
  pieceToken: string
  onClose: () => void
  onDecided: () => void
}

export function ApprovalModal({
  open, decision, pieceId, versionId, pieceName, projectName, pieceToken, onClose, onDecided
}: ApprovalModalProps) {
  const [feedback, setFeedback] = useState('')
  const [decidedBy, setDecidedBy] = useState('')
  const [loading, setLoading] = useState(false)

  const isApproval = decision === 'approved'

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!decidedBy.trim()) return
    if (!isApproval && !feedback.trim()) { toast.error('Descreva o que precisa ser revisado.'); return }
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('approvals').insert({
      piece_id: pieceId, version_id: versionId,
      decision, feedback: feedback.trim() || null,
      decided_by: decidedBy.trim(),
    })
    if (error) { toast.error('Erro ao registrar decisão'); setLoading(false); return }
    await supabase.from('pieces').update({ status: decision }).eq('id', pieceId)

    // Notificar via n8n (best-effort)
    await notifyDecision({
      pieceName, projectName, clientName: decidedBy.trim(),
      decision, feedback: feedback.trim() || undefined,
      decidedBy: decidedBy.trim(), pieceToken,
    })

    toast.success(isApproval ? 'Aprovação registrada!' : 'Revisão solicitada!')
    setFeedback(''); setDecidedBy(''); setLoading(false)
    onClose(); onDecided()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isApproval ? '✅ Aprovar peça' : '↩ Pedir revisão'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div>
            <Label htmlFor="who">Seu nome</Label>
            <Input id="who" value={decidedBy} onChange={e => setDecidedBy(e.target.value)}
              placeholder="Ex: João Silva" required />
          </div>
          <div>
            <Label htmlFor="fb">
              {isApproval ? 'Feedback (opcional)' : 'O que precisa ser revisado? *'}
            </Label>
            <Textarea
              id="fb" value={feedback} onChange={e => setFeedback(e.target.value)}
              placeholder={isApproval ? 'Ficou ótimo!' : 'Descreva o que precisa mudar...'}
              rows={3} required={!isApproval}
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
            <Button type="submit" disabled={loading}
              className={`flex-1 ${isApproval ? 'bg-green-600 hover:bg-green-700' : 'bg-amber-500 hover:bg-amber-600'}`}>
              {loading ? 'Enviando...' : isApproval ? 'Confirmar aprovação' : 'Solicitar revisão'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
```

- [ ] **Step 8: Testar página de review no browser**

```bash
npm run dev
```
- Criar peça no painel → copiar link → abrir em nova aba
- Verificar que mostra a imagem/PDF e o painel de comentários
- Deixar um comentário → aparece na lista ✓
- Clicar "Aprovar" → modal abre → confirmar → badge muda para "Aprovado" ✓
- Voltar ao painel → toast de realtime aparece ✓

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: review page — viewer, comments, approval/revision flow, realtime toast"
```

---

## Task 8: Pin Comments + react-pdf

**Files:**
- Modify: `src/components/review/PieceViewer.tsx`
- Create: `src/components/review/PinLayer.tsx`
- Modify: `src/components/review/ReviewShell.tsx`
- Modify: `src/components/review/CommentPanel.tsx`

- [ ] **Step 1: Criar `src/components/review/PinLayer.tsx`**

```typescript
// src/components/review/PinLayer.tsx
'use client'

import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import type { Comment } from '@/lib/types'

interface PendingPin {
  x: number
  y: number
}

interface PinLayerProps {
  pieceId: string
  versionId: string
  pinComments: Comment[]
  hoveredPinIndex: number | null
  onCommentAdded: () => void
  disabled?: boolean
}

export function PinLayer({ pieceId, versionId, pinComments, hoveredPinIndex, onCommentAdded, disabled }: PinLayerProps) {
  const [pending, setPending] = useState<PendingPin | null>(null)
  const [authorName, setAuthorName] = useState('')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)

  function handleClick(e: React.MouseEvent<HTMLDivElement>) {
    if (disabled) return
    const rect = e.currentTarget.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setPending({ x, y })
  }

  async function handleSavePin(e: React.FormEvent) {
    e.preventDefault()
    if (!pending || !content.trim() || !authorName.trim()) return
    setLoading(true)
    const supabase = createClient()
    const { error } = await supabase.from('comments').insert({
      piece_id: pieceId, version_id: versionId,
      author_name: authorName.trim(), content: content.trim(),
      comment_type: 'pin', pin_x: pending.x, pin_y: pending.y,
    })
    setLoading(false)
    if (error) { toast.error('Erro ao salvar pin'); return }
    toast.success('Pin adicionado!')
    setPending(null); setContent(''); onCommentAdded()
  }

  return (
    <div
      className="absolute inset-0 cursor-crosshair"
      onClick={handleClick}
    >
      {/* Pins existentes */}
      {pinComments.map((c, i) => (
        <div
          key={c.id}
          className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
          style={{ left: `${c.pin_x}%`, top: `${c.pin_y}%` }}
        >
          <div className={`group relative w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-lg transition-transform ${
            hoveredPinIndex === i ? 'scale-125 bg-indigo-500' : 'bg-indigo-600'
          }`}>
            {i + 1}
            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-20">
              <div className="bg-slate-900 text-white text-xs rounded-lg px-3 py-2 max-w-48 shadow-xl whitespace-pre-wrap">
                <p className="font-semibold mb-0.5">{c.author_name}</p>
                {c.content}
              </div>
            </div>
          </div>
        </div>
      ))}

      {/* Pin pendente (aguardando texto) */}
      {pending && (
        <div
          className="absolute -translate-x-1/2 -translate-y-1/2 z-20"
          style={{ left: `${pending.x}%`, top: `${pending.y}%` }}
          onClick={e => e.stopPropagation()}
        >
          <div className="w-7 h-7 rounded-full bg-indigo-400 flex items-center justify-center text-white text-xs font-bold shadow-lg animate-pulse">
            {pinComments.length + 1}
          </div>
          <form
            onSubmit={handleSavePin}
            onClick={e => e.stopPropagation()}
            className="absolute left-8 top-0 bg-white border border-slate-200 rounded-lg p-3 shadow-xl w-56 space-y-2 z-30"
          >
            <Input value={authorName} onChange={e => setAuthorName(e.target.value)}
              placeholder="Seu nome" required className="text-sm h-8" />
            <textarea value={content} onChange={e => setContent(e.target.value)}
              placeholder="Comentário..." required rows={2}
              className="w-full border border-slate-200 rounded-md p-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-indigo-500" />
            <div className="flex gap-1">
              <Button type="submit" size="sm" disabled={loading} className="flex-1 h-7 text-xs bg-indigo-600 hover:bg-indigo-700">
                {loading ? '...' : 'Salvar'}
              </Button>
              <Button type="button" variant="ghost" size="sm" className="h-7 text-xs"
                onClick={() => setPending(null)}>×</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}
```

- [ ] **Step 2: Atualizar `src/components/review/PieceViewer.tsx` com react-pdf e suporte a PinLayer**

```typescript
// src/components/review/PieceViewer.tsx
'use client'

import { useState } from 'react'
import { Document, Page, pdfjs } from 'react-pdf'
import 'react-pdf/dist/Page/AnnotationLayer.css'
import 'react-pdf/dist/Page/TextLayer.css'
import { isPdf } from '@/lib/utils'

// Worker do react-pdf via CDN (evita config de webpack)
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`

interface PieceViewerProps {
  fileUrl: string
  fileType: string
  children?: React.ReactNode
}

export function PieceViewer({ fileUrl, fileType, children }: PieceViewerProps) {
  const [numPages, setNumPages] = useState<number>(1)
  const [pageNumber, setPageNumber] = useState(1)
  const containerRef = (node: HTMLDivElement | null) => {
    // ref para calcular largura responsiva
  }

  if (isPdf(fileType)) {
    return (
      <div className="relative w-full bg-slate-100 rounded-lg overflow-hidden">
        <Document
          file={fileUrl}
          onLoadSuccess={({ numPages }) => setNumPages(numPages)}
          className="flex flex-col items-center"
        >
          <div className="relative w-full">
            <Page
              pageNumber={pageNumber}
              width={Math.min(typeof window !== 'undefined' ? window.innerWidth - 80 : 600, 800)}
              renderAnnotationLayer={false}
              renderTextLayer={false}
            />
            {/* Overlay para pins — posicionado sobre o canvas do PDF */}
            <div className="absolute inset-0">
              {children}
            </div>
          </div>
        </Document>
        {numPages > 1 && (
          <div className="flex items-center justify-center gap-3 py-2 bg-white border-t border-slate-200 text-sm text-slate-600">
            <button disabled={pageNumber <= 1} onClick={() => setPageNumber(p => p - 1)}
              className="px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40">←</button>
            Página {pageNumber} de {numPages}
            <button disabled={pageNumber >= numPages} onClick={() => setPageNumber(p => p + 1)}
              className="px-2 py-1 rounded hover:bg-slate-100 disabled:opacity-40">→</button>
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="relative w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={fileUrl}
        alt="Peça criativa"
        className="max-w-full max-h-[70vh] object-contain"
        draggable={false}
      />
      <div className="absolute inset-0">
        {children}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Atualizar `src/components/review/ReviewShell.tsx` para incluir PinLayer**

Adicionar import de `PinLayer` e estado `hoveredPinIndex`. Passar `PinLayer` como `children` do `PieceViewer` e conectar `onPinHover` ao `CommentPanel`:

```typescript
// Adicionar ao ReviewShell.tsx — novos imports:
import { PinLayer } from './PinLayer'

// Adicionar estado:
const [hoveredPinIndex, setHoveredPinIndex] = useState<number | null>(null)

// Dentro do return, no PieceViewer, adicionar children:
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

// No CommentPanel, adicionar prop:
<CommentPanel
  ...
  onPinHover={setHoveredPinIndex}
/>
```

O arquivo completo atualizado:

```typescript
// src/components/review/ReviewShell.tsx
'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { PieceViewer } from './PieceViewer'
import { PinLayer } from './PinLayer'
import { CommentPanel } from './CommentPanel'
import { VersionNav } from './VersionNav'
import { ApprovalModal } from './ApprovalModal'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import { formatRelativeTime } from '@/lib/utils'
import type { PieceWithVersions, PieceVersion, Comment } from '@/lib/types'

interface ReviewShellProps {
  piece: PieceWithVersions
  projectName: string
}

export function ReviewShell({ piece, projectName }: ReviewShellProps) {
  const versions = piece.piece_versions?.sort((a, b) => a.version_number - b.version_number) ?? []
  const [currentVersion, setCurrentVersion] = useState<PieceVersion>(versions.at(-1)!)
  const [comments, setComments] = useState<Comment[]>([])
  const [decided, setDecided] = useState(!!piece.approvals?.length)
  const [showApprove, setShowApprove] = useState(false)
  const [showRevision, setShowRevision] = useState(false)
  const [hoveredPinIndex, setHoveredPinIndex] = useState<number | null>(null)

  const fetchComments = useCallback(async () => {
    if (!currentVersion) return
    const supabase = createClient()
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('piece_id', piece.id)
      .eq('version_id', currentVersion.id)
      .order('created_at', { ascending: true })
    setComments((data ?? []) as Comment[])
  }, [piece.id, currentVersion])

  useEffect(() => { fetchComments() }, [fetchComments])

  const pinComments = comments.filter(c => c.comment_type === 'pin')

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
            <VersionNav versions={versions} currentVersionId={currentVersion.id} onSelect={setCurrentVersion} />
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
                pinComments={pinComments}
                hoveredPinIndex={hoveredPinIndex}
                onCommentAdded={fetchComments}
                disabled={decided}
              />
            </PieceViewer>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-slate-400">
                {!decided && <span className="text-indigo-500 mr-2">Clique na imagem para fixar um comentário</span>}
                v{currentVersion.version_number} · {formatRelativeTime(currentVersion.uploaded_at)}
              </p>
              <a href={currentVersion.file_url} download
                className="text-xs text-indigo-600 hover:underline">⬇ Download</a>
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
                <Button onClick={() => setShowApprove(true)}
                  className="flex-1 bg-green-600 hover:bg-green-700">Aprovar</Button>
                <Button onClick={() => setShowRevision(true)} variant="outline"
                  className="flex-1 border-amber-400 text-amber-700 hover:bg-amber-50">Pedir Revisão</Button>
              </div>
            )}
            <CommentPanel
              pieceId={piece.id}
              versionId={currentVersion.id}
              comments={comments}
              onCommentAdded={fetchComments}
              onPinHover={setHoveredPinIndex}
              disabled={decided}
            />
          </div>
        </div>

        {!decided && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-3 flex gap-2 lg:hidden z-10">
            <Button onClick={() => setShowApprove(true)}
              className="flex-1 bg-green-600 hover:bg-green-700">Aprovar</Button>
            <Button onClick={() => setShowRevision(true)} variant="outline"
              className="flex-1 border-amber-400 text-amber-700">Pedir Revisão</Button>
          </div>
        )}
      </div>

      <ApprovalModal open={showApprove} decision="approved" pieceId={piece.id}
        versionId={currentVersion.id} pieceName={piece.title} projectName={projectName}
        pieceToken={piece.public_token} onClose={() => setShowApprove(false)} onDecided={() => setDecided(true)} />
      <ApprovalModal open={showRevision} decision="revision_requested" pieceId={piece.id}
        versionId={currentVersion.id} pieceName={piece.title} projectName={projectName}
        pieceToken={piece.public_token} onClose={() => setShowRevision(false)} onDecided={() => setDecided(true)} />
    </div>
  )
}
```

- [ ] **Step 4: Testar pins no browser**

```bash
npm run dev
```
- Abrir página de review de uma peça de imagem
- Clicar na imagem → formulário de pin aparece no ponto clicado ✓
- Preencher nome + comentário → pin numerado aparece ✓
- Hover no CommentPanel sobre o pin → marcador cresce na imagem ✓
- Testar com PDF → documento renderiza, pins funcionam ✓

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: pin comments on images and PDFs with react-pdf support"
```

---

## Task 9: Comparação de Versões Side-by-Side

**Files:**
- Modify: `src/components/review/VersionNav.tsx`
- Create: `src/components/review/VersionCompare.tsx`
- Modify: `src/components/review/ReviewShell.tsx`

- [ ] **Step 1: Criar `src/components/review/VersionCompare.tsx`**

```typescript
// src/components/review/VersionCompare.tsx
import type { PieceVersion } from '@/lib/types'
import { isPdf } from '@/lib/utils'

interface VersionCompareProps {
  versions: PieceVersion[]
  onClose: () => void
}

export function VersionCompare({ versions, onClose }: VersionCompareProps) {
  const sorted = [...versions].sort((a, b) => a.version_number - b.version_number)
  const left = sorted.at(-2)!
  const right = sorted.at(-1)!

  return (
    <div className="fixed inset-0 bg-slate-900/90 z-50 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-slate-900 text-white">
        <h2 className="font-semibold">Comparação de versões</h2>
        <button onClick={onClose} className="text-slate-400 hover:text-white text-xl">×</button>
      </div>
      <div className="flex flex-1 overflow-hidden">
        {[left, right].map(v => (
          <div key={v.id} className="flex-1 flex flex-col overflow-auto bg-slate-800">
            <div className="text-center text-white text-sm py-2 border-b border-slate-700">
              Versão {v.version_number}
            </div>
            <div className="flex-1 flex items-center justify-center p-4">
              {isPdf(v.file_type) ? (
                <a href={v.file_url} target="_blank" rel="noopener noreferrer"
                  className="text-indigo-400 underline">Abrir PDF v{v.version_number}</a>
              ) : (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={v.file_url} alt={`Versão ${v.version_number}`}
                  className="max-w-full max-h-full object-contain" />
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Atualizar `VersionNav.tsx` para incluir botão de comparar**

```typescript
// src/components/review/VersionNav.tsx
import type { PieceVersion } from '@/lib/types'

interface VersionNavProps {
  versions: PieceVersion[]
  currentVersionId: string
  onSelect: (version: PieceVersion) => void
  onCompare?: () => void
}

export function VersionNav({ versions, currentVersionId, onSelect, onCompare }: VersionNavProps) {
  if (versions.length <= 1) return null
  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-xs text-slate-500">Versão:</span>
      {versions.map(v => (
        <button key={v.id} onClick={() => onSelect(v)}
          className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
            v.id === currentVersionId
              ? 'bg-indigo-600 text-white'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}>
          v{v.version_number}
        </button>
      ))}
      {versions.length >= 2 && onCompare && (
        <button onClick={onCompare}
          className="px-2 py-1 rounded text-xs font-medium bg-slate-700 text-white hover:bg-slate-800 transition-colors">
          Comparar
        </button>
      )}
    </div>
  )
}
```

- [ ] **Step 3: Adicionar estado e componente de comparação no `ReviewShell.tsx`**

Adicionar ao ReviewShell:
```typescript
import { VersionCompare } from './VersionCompare'

// Novo estado:
const [comparing, setComparing] = useState(false)

// No VersionNav, adicionar props:
<VersionNav
  versions={versions}
  currentVersionId={currentVersion.id}
  onSelect={setCurrentVersion}
  onCompare={() => setComparing(true)}
/>

// Antes do fechamento do return, adicionar:
{comparing && (
  <VersionCompare versions={versions} onClose={() => setComparing(false)} />
)}
```

- [ ] **Step 4: Testar comparação**

- Criar peça com 2+ versões
- Na página de review → clicar "Comparar" → janela side-by-side aparece ✓
- Fechar com × ✓

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: side-by-side version comparison"
```

---

## Task 10: Workflow n8n de Notificação

**Files:** (workflow n8n — criado via UI ou API)

- [ ] **Step 1: Criar workflow no n8n**

Acessar https://n8n.nummo-ai.com.br e criar novo workflow chamado **"Crivo_Notify"** com os seguintes nós:

**Nó 1 — Webhook** (trigger)
- Path: `crivo-notify`
- Method: POST
- Authentication: None (MVP)
- Response Mode: Immediately

**Nó 2 — Switch** (roteador por decision)
- Expressão: `{{ $json.decision }}`
- Regra 0 (`approved`): `{{ $json.decision === 'approved' }}`
- Regra 1 (`revision_requested`): `{{ $json.decision === 'revision_requested' }}`

**Nó 3 — Set (Prep_Aprovado)**
- Conectado ao Switch[0]
- Campo `mensagem`:
  ```
  ✅ *{{ $json.pieceName }}* aprovada por *{{ $json.decidedBy }}*.
  Projeto: {{ $json.projectName }}
  {{ $json.feedback ? 'Feedback: "' + $json.feedback + '"' : '' }}
  🔗 /review/{{ $json.pieceToken }}
  ```

**Nó 4 — Set (Prep_Revisao)**
- Conectado ao Switch[1]
- Campo `mensagem`:
  ```
  ↩ *{{ $json.pieceName }}* pediu revisão.
  Feedback: "{{ $json.feedback }}"
  Por: {{ $json.decidedBy }} | Projeto: {{ $json.projectName }}
  🔗 /review/{{ $json.pieceToken }}
  ```

**Nó 5 — HTTP Request (Call_WA_Aprovado)**
- Conectado ao Prep_Aprovado
- URL: `https://evolutionapi.nummo-ai.com.br/message/sendText/zanini`
- Method: POST
- Auth: Header `apikey: [EVOLUTION_API_KEY]`
- Body: `{ "number": "NUMERO_ATENDIMENTO", "text": "{{ $json.mensagem }}" }`

**Nó 6 — HTTP Request (Call_WA_Revisao)**
- Conectado ao Prep_Revisao
- Mesma configuração do nó 5

- [ ] **Step 2: Ativar workflow e copiar URL do webhook**

Após ativar, a URL será: `https://n8n.nummo-ai.com.br/webhook/crivo-notify`

- [ ] **Step 3: Adicionar ao `.env.local`**

```
N8N_WEBHOOK_URL=https://n8n.nummo-ai.com.br/webhook/crivo-notify
```

- [ ] **Step 4: Testar end-to-end**

- Abrir página de review → aprovar uma peça
- Verificar no n8n → execução bem-sucedida ✓
- WhatsApp do atendimento recebe notificação ✓

- [ ] **Step 5: Commit**

```bash
git add .env.example
git commit -m "feat: n8n notification workflow for approvals and revision requests"
```

---

## Task 11: Polish, Responsivo e README

**Files:**
- Modify: `src/app/layout.tsx` (mobile viewport meta)
- Modify: `src/components/review/ReviewShell.tsx` (hint de pin no mobile)
- Create: `README.md`

- [ ] **Step 1: Verificar responsividade mobile**

Abrir DevTools → modo mobile (375px) e verificar:
- Home: grid de 1 coluna ✓
- Projeto: lista de peças legível ✓
- Review: peça full-width, botões no rodapé fixo ✓
- Modal de pin: popup não sai da tela → ajustar se necessário

Se o popup do pin sair da tela em mobile, atualizar `PinLayer.tsx` para reposicionar o formulário quando próximo das bordas:
```typescript
// Em PinLayer.tsx, no popup de formulário, trocar `left-8` por lógica responsiva:
className={`absolute ${pending.x > 60 ? 'right-8' : 'left-8'} ${pending.y > 70 ? 'bottom-0' : 'top-0'} ...`}
```

- [ ] **Step 2: Criar `README.md`**

```markdown
# Crivo — Aprovação de Peças Criativas

Crivo é uma ferramenta de aprovação de peças criativas para agências de publicidade brasileiras. O atendimento faz upload da peça, gera um link público, e o cliente abre esse link — sem login — para visualizar, comentar e aprovar ou pedir revisão.

## O problema que resolve

Em agências, a aprovação de peças criativas é caótica — acontece por WhatsApp, e-mail, mensagem de voz. Ninguém sabe qual versão foi aprovada, quem aprovou, quando. O Crivo organiza isso num fluxo limpo e rastreável.

## Quem usa

- **Atendimento:** acessa o painel principal, cria projetos e peças, envia links para clientes, acompanha o status em tempo real
- **Cliente:** abre o link recebido (sem login), visualiza a peça, deixa comentários com pins, e aprova ou pede revisão

## Como funciona

1. Atendimento cria um projeto (nome + cliente)
2. Dentro do projeto, cria uma peça (título + upload de imagem ou PDF)
3. Copia o link público e envia ao cliente (WhatsApp, email, qualquer canal)
4. Cliente abre o link, vê a peça, pode clicar na imagem para fixar comentários com pin
5. Cliente clica "Aprovar" ou "Pedir Revisão" — o atendimento recebe notificação no WhatsApp e vê o status atualizado em tempo real no painel

## Stack Técnica

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Banco de dados:** Supabase (PostgreSQL + Storage + Realtime)
- **PDF Viewer:** react-pdf
- **Notificações:** n8n + Evolution API (WhatsApp)
- **Deploy:** Vercel + Supabase Cloud

## Como rodar localmente

### Pré-requisitos
- Node.js 20+
- Conta no Supabase

### 1. Clonar e instalar
```bash
git clone <repo>
cd crivo
npm install
```

### 2. Configurar variáveis de ambiente
```bash
cp .env.example .env.local
# Editar .env.local com suas credenciais do Supabase
```

### 3. Configurar banco de dados
No Supabase dashboard → SQL Editor → executar o conteúdo de `supabase/migrations/001_initial_schema.sql`

### 4. Configurar storage
No Supabase dashboard → Storage → criar bucket `pieces` como público

### 5. Rodar
```bash
npm run dev
# Abrir http://localhost:3000
```

## Deploy

### Supabase
1. Criar novo projeto em supabase.com
2. Rodar migration SQL
3. Criar bucket `pieces` como público
4. Copiar `Project URL` e `anon key`

### Vercel
1. Conectar repositório GitHub
2. Adicionar variáveis de ambiente:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `N8N_WEBHOOK_URL` (opcional — notificações WhatsApp)
3. Deploy

## Testes
```bash
npm run test:run
```
```

- [ ] **Step 3: Testar build de produção**

```bash
npm run build
```
Esperado: build sem erros. Corrigir quaisquer type errors ou warnings de build.

- [ ] **Step 4: Commit final**

```bash
git add -A
git commit -m "feat: responsive polish, README, production build verified"
```

---

## Self-Review

### Cobertura do Spec

| Requisito | Task |
|-----------|------|
| Painel com lista de projetos e contadores | Task 5 |
| Criar novo projeto | Task 5 (NewProjectModal) |
| Lista de peças com badge de status | Task 6 (PieceCard) |
| Criar nova peça + upload | Task 6 (NewPieceModal) |
| Histórico de versões | Task 6 (PieceCard expandido) |
| Upload de nova versão | Task 6 (UploadNewVersion) |
| Copiar link público | Task 6 (PieceCard) |
| Busca por nome de projeto/peça | Task 5 (ProjectGrid) |
| Realtime toast quando cliente interage | Task 6 (PieceList) |
| Visualização de imagem (PNG/JPG) | Task 7 (PieceViewer) |
| Visualização de PDF | Task 8 (PieceViewer + react-pdf) |
| Pin comments na imagem | Task 8 (PinLayer) |
| Comentários gerais | Task 7 (CommentPanel) |
| Botão Aprovar + modal | Task 7 (ApprovalModal) |
| Botão Pedir Revisão + modal | Task 7 (ApprovalModal) |
| Decisão registrada — botões somem | Task 7 (ReviewShell decided state) |
| Download da peça | Task 7 (ReviewShell) |
| Navegação entre versões | Task 7 (VersionNav) |
| Comparação side-by-side | Task 9 (VersionCompare) |
| Notificação WhatsApp n8n | Task 10 |
| Realtime no painel | Task 6 (PieceList useEffect subscription) |
| Timestamps humanizados | Task 3 (utils.formatRelativeTime) |
| Empty states | Task 4 (EmptyState) |
| Loading skeletons | Task 4 (LoadingSkeleton) |
| Toasts de sucesso/erro | Todos (sonner) |
| Mobile-first na página do cliente | Task 11 |
| Botões fixos no rodapé mobile | Task 7 (ReviewShell) |
| Responsivo completo | Task 11 |
| README | Task 11 |
| Testes de utilitários | Task 3 |

Todos os requisitos cobertos. ✓
