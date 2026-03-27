# Crivo — Design Spec
**Data:** 2026-03-27
**Prazo:** 2026-03-30 às 14h
**Desafio:** Human Academy Vibecoding

---

## Problema

Aprovação de peças criativas em agências de publicidade é caótica — acontece por WhatsApp, e-mail e mensagem de voz. Ninguém sabe qual versão foi aprovada, quem aprovou, quando. O Crivo organiza isso num fluxo limpo e rastreável.

---

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Backend/DB/Storage:** Supabase (PostgreSQL + Storage + Realtime)
- **PDF Viewer:** react-pdf (renderiza como canvas, permite pins HTML sobrepostos)
- **Token geração:** nanoid (tokens de 10 chars alfanuméricos)
- **Deploy:** Vercel + Supabase Cloud
- **Notificações:** n8n webhook → WhatsApp (Evolution API) ou Gmail

---

## Identidade Visual

- **Cor primária (navbar/dark):** `#0f172a` (navy slate)
- **Acento:** `#6366f1` (índigo)
- **Fundo:** `#f8fafc` (cinza quase-branco)
- **Cards:** `#ffffff` com borda `#e2e8f0`
- **Status — aprovado:** verde `#16a34a` / bg `#dcfce7`
- **Status — revisão:** âmbar `#d97706` / bg `#fef9c3`
- **Status — pendente:** cinza `#64748b` / bg `#f1f5f9`

---

## Arquitetura de Rendering

**Híbrido Server Components + Client Components** (Next.js 14 App Router):

- Server Components: fetch inicial de projetos, peças, versões, comentários (sem loading flicker)
- Client Components: realtime subscriptions, modais, upload, pin comments, PDF viewer
- Supabase client: `createBrowserClient` (client) e `createServerClient` (server)
- Sem autenticação — nem atendimento, nem cliente

---

## Banco de Dados (Supabase PostgreSQL)

```sql
-- projects
id uuid PK | name text | client_name text | created_at timestamptz

-- pieces
id uuid PK | project_id uuid FK | title text | description text
status enum('pending','approved','revision_requested') DEFAULT 'pending'
public_token text UNIQUE | created_at timestamptz | updated_at timestamptz
notified_at timestamptz  -- controle de deduplicação do n8n

-- piece_versions
id uuid PK | piece_id uuid FK | version_number int
file_url text | file_type text | uploaded_at timestamptz

-- comments
id uuid PK | piece_id uuid FK | version_id uuid FK
author_name text | content text
comment_type enum('general','pin')
pin_x float NULLABLE | pin_y float NULLABLE
created_at timestamptz

-- approvals
id uuid PK | piece_id uuid FK | version_id uuid FK
decision enum('approved','revision_requested')
feedback text NULLABLE | decided_by text | decided_at timestamptz
```

**Storage bucket `pieces`:**
- Bucket público, path: `{piece_id}/{version_number}/{filename}`
- SELECT público, INSERT liberado no MVP
- Aceita: JPG, PNG, PDF — máx 10MB

**RLS no MVP:**
- Leitura de peças por `public_token`: SELECT público
- INSERT em comments/approvals: público (cliente sem login)
- projects/pieces: sem RLS (atendimento acessa direto)

---

## Estrutura de Pastas

```
crivo/
├── src/
│   ├── app/
│   │   ├── page.tsx                     # Home — grid de projetos (Server Component)
│   │   ├── project/[id]/page.tsx        # Detalhe projeto + peças (Server Component)
│   │   ├── review/[token]/page.tsx      # Página pública cliente (Server Component shell)
│   │   └── layout.tsx                   # Navbar mínima + providers + metadata
│   ├── components/
│   │   ├── dashboard/
│   │   │   ├── ProjectGrid.tsx          # Grid de cards de projetos
│   │   │   ├── ProjectCard.tsx          # Card com contadores de status
│   │   │   ├── NewProjectModal.tsx      # Modal criar projeto (client)
│   │   │   ├── PieceList.tsx            # Lista de peças do projeto
│   │   │   ├── PieceCard.tsx            # Card da peça com badge de status
│   │   │   ├── NewPieceModal.tsx        # Modal criar peça + upload (client)
│   │   │   ├── UploadNewVersion.tsx     # Upload nova versão (client)
│   │   │   └── RealtimeToast.tsx        # Toast quando cliente interage (client)
│   │   ├── review/
│   │   │   ├── PieceViewer.tsx          # Viewer (imagem ou react-pdf) + overlay pins
│   │   │   ├── PinLayer.tsx             # Overlay de pins clicáveis (client)
│   │   │   ├── CommentPanel.tsx         # Painel lateral de comentários (client)
│   │   │   ├── ApprovalModal.tsx        # Modal aprovar/pedir revisão (client)
│   │   │   └── VersionNav.tsx           # Navegação entre versões + comparação
│   │   └── shared/
│   │       ├── StatusBadge.tsx          # Badge colorido de status
│   │       ├── EmptyState.tsx           # Tela vazia com ilustração
│   │       └── LoadingSkeleton.tsx      # Skeleton de loading
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts                # createBrowserClient
│   │   │   └── server.ts                # createServerClient (cookies)
│   │   ├── types.ts                     # Project, Piece, PieceVersion, Comment, Approval
│   │   ├── utils.ts                     # formatRelativeTime, generateToken, formatFileSize
│   │   └── n8n.ts                       # notifyDecision(payload)
│   └── hooks/
│       ├── useRealtimePiece.ts          # Realtime subscription numa peça
│       └── useRealtimeProject.ts        # Realtime subscription num projeto
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
└── public/
    └── favicon.ico
```

---

## Rotas

| Rota | Tipo | Descrição |
|------|------|-----------|
| `/` | Server | Grid de todos os projetos com contadores |
| `/project/[id]` | Server | Detalhe do projeto, lista de peças, histórico de versões |
| `/review/[token]` | Server shell + Client | Página pública do cliente |

---

## Painel do Atendimento (`/` e `/project/[id]`)

**Home (`/`):**
- Grid de ProjectCards — nome do projeto, cliente, contadores (aprovadas/revisão/pendentes)
- Botão "Novo Projeto" — modal com campos nome + cliente
- Filtros por status e busca por nome
- Empty state quando não há projetos

**Detalhe (`/project/[id]`):**
- Header com nome do projeto, cliente, breadcrumb
- Botão "Nova Peça" — modal com título + descrição + upload de arquivo
- Lista de PieceCards com badge de status, botão "Copiar link público", botão "Nova versão"
- Expandir card: histórico de versões, comentários, decisão do cliente
- `RealtimeToast` subscreve em comments + approvals — toast quando cliente interage

---

## Página Pública do Cliente (`/review/[token]`)

**Layout responsivo:**
- **Mobile:** peça full-width, botões "Aprovar" / "Pedir Revisão" fixos no rodapé
- **Desktop:** peça grande à esquerda (2/3) + painel lateral direito com comentários, pins e botões (1/3)

**Viewer:**
- Imagens (JPG/PNG): tag `<img>` com `object-contain`, overlay HTML para pins
- PDFs: `react-pdf` renderiza como canvas, overlay HTML para pins na mesma posição

**Pin Comments:**
1. Cliente clica em qualquer ponto da peça
2. Captura posição `(x%, y%)` relativa ao container
3. Marcador numerado índigo aparece no ponto clicado
4. Campo inline para texto do comentário + nome do autor
5. Salva: INSERT em `comments` com `comment_type='pin'`, `pin_x`, `pin_y`
6. Pins existentes renderizam sobre a peça com tooltip do comentário ao hover

**Fluxo de aprovação:**
1. Botão "Aprovar" ou "Pedir Revisão"
2. Modal: feedback (obrigatório em revisão, opcional em aprovação) + nome do aprovador
3. Confirmar: INSERT em `approvals` + UPDATE em `pieces.status`
4. Chama `notifyDecision()` → n8n webhook
5. Estado "decisão registrada" — botões somem, confirmação exibida
6. Comentários continuam liberados após decisão

**Navegação de versões:**
- Selector "Versão 1 / 2 / 3" no topo
- Botão "Comparar" (≥2 versões) → split side-by-side
- Download da versão atual

---

## n8n — Workflow de Notificação

**Trigger:** webhook POST recebido de `lib/n8n.ts`

**Payload:**
```json
{
  "pieceName": "Banner Instagram 1080x1080",
  "projectName": "Campanha Verão",
  "clientName": "Marca X",
  "decision": "approved",
  "feedback": "Ficou ótimo!",
  "decidedBy": "João Silva",
  "pieceToken": "abc123xyz0"
}
```

**Fluxo n8n (5 nós):**
```
Webhook → Switch (approved/revision_requested)
  → [approved]  Prep_WA_Aprovado → Call_WA (Evolution API / lFAnaQffXbIUpx3C)
  → [revision]  Prep_WA_Revisao  → Call_WA
```

Mensagem WA para o atendimento:
- Aprovado: `✅ *[pieceName]* aprovada por *[decidedBy]*. Projeto: [projectName]`
- Revisão: `↩ *[pieceName]* pediu revisão. Feedback: "[feedback]" — [decidedBy]`

**Variável de ambiente:** `N8N_WEBHOOK_URL` (URL do webhook n8n)

---

## Variáveis de Ambiente

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
N8N_WEBHOOK_URL=
```

---

## Comportamentos de UX

- **Timestamps humanizados:** "há 2 horas", "ontem às 15h" via `date-fns/formatDistanceToNow`
- **Toasts:** sucesso/erro em todas as ações (shadcn/ui Sonner)
- **Empty states:** projetos vazios, peças vazias, sem comentários, sem versões
- **Loading skeletons:** em todos os fetches async client-side
- **Feedback visual de upload:** barra de progresso no modal de nova peça/versão
- **Validação de arquivo:** tipo (JPG/PNG/PDF) e tamanho (≤10MB) antes do upload
- **Token público:** gerado com `nanoid(10)` na criação da peça, imutável

---

## Ordem de Construção

1. Setup Next.js 14 + Tailwind + shadcn/ui + Supabase
2. Migration SQL + bucket de storage + políticas
3. CRUD de projetos — Home grid + modal criar
4. CRUD de peças + upload — `/project/[id]`
5. Página pública do cliente — viewer + comentários gerais
6. Pin comments sobre imagem
7. react-pdf + pins sobre PDF
8. Fluxo de aprovação/revisão + modal
9. Realtime + RealtimeToast no painel
10. Navegação de versões + comparação side-by-side
11. Workflow n8n de notificação
12. Filtros, busca, polish, empty states, responsivo
13. README + deploy Vercel

---

## Fora de Escopo (MVP)

- Autenticação de qualquer tipo
- Múltiplos aprovadores por peça
- Integração com ferramentas de design (Figma)
- Histórico de comentários por versão no painel (disponível na página do cliente)
