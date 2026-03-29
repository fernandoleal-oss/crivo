# Crivo v2 — Sequential Approval Flow + AI Transcription

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement sequential 4-stage internal approval chain (DA→Redator→DC→ECD), visual piece cards with approval status, and AI-powered transcription-to-briefing feature.

**Architecture:** Add `role`/`step_order` to approvals table and `internal_status` to pieces for sequential gating. New `ApprovalChain` component renders 4-column approval grid. API route calls Claude to parse transcriptions into structured briefings.

**Tech Stack:** Next.js 14 App Router, Supabase, Tailwind, motion/react v12, Claude API (via Anthropic SDK)

---

### Task 1: Migration 004 — approval chain + internal status

**Files:**
- Create: `supabase/migrations/004_approval_chain.sql`

- [ ] **Step 1: Write migration SQL**

```sql
ALTER TABLE approvals
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS step_order INT;

ALTER TABLE pieces
  ADD COLUMN IF NOT EXISTS internal_status TEXT DEFAULT 'draft';
```

- [ ] **Step 2: Copy to clipboard for Supabase SQL Editor**

User must run this in Supabase Dashboard SQL Editor (no service role key available locally).

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/004_approval_chain.sql
git commit -m "feat: migration 004 — approval chain role/step_order + internal_status"
```

---

### Task 2: Seed v3 — sequential approvals + AI transcription data

**Files:**
- Modify: `supabase/seed_demo.sql`

- [ ] **Step 1: Update briefing_data to include transcription_summary**

Add to each project's `briefing_data` JSON a field `"transcription_summary"` with a realistic 2-3 sentence call summary. Example for iFood:

```json
"transcription_summary": "Call 26/03 14h — Camila Torres (iFood) com Desirre. Campanha emocional Dia das Mães, foco entrega grátis. Verba R$120k aprovada. Prazo 05/05. Evitar humor, tom gratidão. Assets: logo HD, fotos mães+entregadores, paleta especial."
```

- [ ] **Step 2: Update approvals INSERT to include role and step_order**

Each approval gets `role` and `step_order`. Create approvals at different stages per piece:

- iFood Feed (approved): DA(1)✅ Redator(2)✅ DC(3)✅ ECD(4)✅ — fully approved internally
- iFood Story (approved): same as above
- Nubank KV (revision_requested): DA(1)✅ Redator(2)✅ DC(3)❌ — DC requested revision
- Itaú Video (approved): DA(1)✅ Redator(2)✅ DC(3)✅ ECD(4)✅
- Itaú LinkedIn (revision_requested): DA(1)✅ Redator(2)❌ — Redator requested revision
- Ambev OOH (approved): DA(1)✅ Redator(2)✅ DC(3)✅ ECD(4)✅

Approver names: Bruno (DA), Carla (Redator), Rodrigo (DC), Patricia (ECD)

- [ ] **Step 3: Update internal_status on pieces**

```sql
-- In the pieces INSERT, add internal_status values:
-- approved pieces with all 4 approvals: 'internally_approved' or 'sent_to_client'
-- pieces mid-chain: 'in_review'
-- new pieces: 'draft'
```

- [ ] **Step 4: Commit**

```bash
git add supabase/seed_demo.sql
git commit -m "feat: seed v3 — sequential approvals with role/step_order + AI transcription data"
```

---

### Task 3: ApprovalChain component — 4-column grid

**Files:**
- Create: `src/components/ui/ApprovalChain.tsx`

- [ ] **Step 1: Create the component**

Props: `approvals: { role: string; step_order: number; decision: string; decided_by: string }[]`

Renders a 4-column grid (DA / Redator / DC / ECD). For each column:
- ✅ green bg if approved
- 👁️ amber bg if it's the current active step (previous approved, this one pending)
- 🔒 gray bg if locked (previous step not yet approved)
- ❌ red bg if revision_requested

Show decided_by name when approved, "Aguardando" when active, "—" when locked.

Color bar at top: 4 segments, each colored by role (DA=#6d28d9, Redator=#f59e0b, DC=#ec4899, ECD=#10b981), opacity 100% if approved, 30% if not.

- [ ] **Step 2: Export from component**

```typescript
export function ApprovalChain({ approvals }: ApprovalChainProps)
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/ApprovalChain.tsx
git commit -m "feat: ApprovalChain component — 4-column sequential approval grid"
```

---

### Task 4: Piece Card estilo C in ProjectGrid

**Files:**
- Modify: `src/components/dashboard/ProjectGrid.tsx`
- Modify: `src/lib/types.ts`

- [ ] **Step 1: Update types**

Add to `Approval` interface: `role?: string; step_order?: number`
Add to `Piece` interface: `internal_status?: string`

- [ ] **Step 2: Update Supabase query in ProjectGrid**

Add `role, step_order` to the approvals select in the pieces query.

- [ ] **Step 3: Replace piece card rendering with Card C layout**

Replace current piece rows in the "My Work" section with Card C design:
- Color accent bar at top (4 segments by approval role)
- Title + AI score badge top row
- Thumbnail from piece_versions[0].file_url (16:9 ratio, rounded)
- ApprovalChain component with approvals data
- Footer: client · project · version + deadline

- [ ] **Step 4: Add "Pronta para envio" badge**

When `role === 'ceo'` (Atendimento persona) and all 4 internal approvals are present and approved, show a blue badge "Pronta para envio" on the card.

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/ProjectGrid.tsx src/lib/types.ts
git commit -m "feat: piece card estilo C with ApprovalChain + ready-to-send badge"
```

---

### Task 5: Transcription indicator on project cards

**Files:**
- Modify: `src/components/dashboard/ProjectGrid.tsx`

- [ ] **Step 1: Show transcription badge on LineUp/Trending cards**

When `project.briefing_data?.transcription_summary` exists, render a small badge:
```
📞 Transcrição IA
```
Below the project name on the LineUp and Trending cards. Clicking shows the summary in a tooltip or expandable section.

- [ ] **Step 2: Commit**

```bash
git add src/components/dashboard/ProjectGrid.tsx
git commit -m "feat: transcription indicator on project cards"
```

---

### Task 6: TranscriptionModal — paste transcription → AI briefing

**Files:**
- Create: `src/components/dashboard/TranscriptionModal.tsx`
- Create: `src/app/api/transcription/route.ts`

- [ ] **Step 1: Create API route**

POST `/api/transcription` receives `{ text: string, projectName: string, clientName: string }`.

Uses Anthropic SDK (`@anthropic-ai/sdk`) to call Claude with a system prompt that extracts structured briefing data from raw transcription text. Returns JSON matching `BriefingData` type + `transcription_summary`.

Environment variable: `ANTHROPIC_API_KEY` (add to `.env.local`).

```typescript
import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: Request) {
  const { text, projectName, clientName } = await req.json()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `You extract structured briefing data from meeting transcriptions for a creative agency. Return JSON only with fields: produto, verba, prazo, aprovador, assets_necessarios (array), observacoes, informacoes_faltando (array), resumo_executivo, confianca_analise (0-100), transcription_summary (2-3 sentence summary). All fields in Portuguese.`,
    messages: [{ role: 'user', content: `Project: ${projectName}\nClient: ${clientName}\n\nTranscription:\n${text}` }]
  })

  const content = message.content[0]
  if (content.type === 'text') {
    const json = JSON.parse(content.text)
    return Response.json(json)
  }
  return Response.json({ error: 'Failed to parse' }, { status: 500 })
}
```

- [ ] **Step 2: Create TranscriptionModal component**

Modal with:
- Textarea "Cole a transcrição da call aqui..."
- Button "Gerar Briefing com IA"
- Loading state while API processes
- On success: calls `onBriefingGenerated(briefingData)` callback
- Parent updates project briefing_data in Supabase

- [ ] **Step 3: Add trigger button to ProjectGrid**

In the LineUp card or project detail, add button "📞 Colar transcrição" that opens TranscriptionModal. Only visible for Atendimento role.

- [ ] **Step 4: Install Anthropic SDK**

```bash
npm install @anthropic-ai/sdk
```

- [ ] **Step 5: Commit**

```bash
git add src/components/dashboard/TranscriptionModal.tsx src/app/api/transcription/route.ts
git commit -m "feat: TranscriptionModal — paste call text, Claude generates briefing"
```

---

### Task 7: Visual polish + error fixes

**Files:**
- Modify: various components as needed

- [ ] **Step 1: Audit current UI for visual issues**

Check: sidebar clipping, card overflow, mobile responsiveness, missing loading states.

- [ ] **Step 2: Fix identified issues**

- [ ] **Step 3: Commit**

```bash
git commit -am "fix: visual polish and error fixes"
```

---

### Task 8: README update with demo instructions

**Files:**
- Modify: `README.md`

- [ ] **Step 1: Update README**

Add sections:
- Fluxo de aprovação sequencial (DA→Redator→DC→ECD→Atendimento→Cliente)
- Screenshot/GIF placeholder for demo video
- How to test: 3 personas, review links
- AI transcription feature description
- Tech stack summary

- [ ] **Step 2: Commit**

```bash
git add README.md
git commit -m "docs: README updated with v2 approval flow and demo instructions"
```

---

### Execution Order

Tasks 1-2 (migration + seed) → Task 3 (ApprovalChain) → Task 4 (Card C) → Task 5 (transcription indicator) → Task 6 (TranscriptionModal + API) → Task 7 (polish) → Task 8 (README)

Tasks 1+2 can run in parallel. Tasks 3+6 can run in parallel (independent components). Task 4 depends on Task 3. Task 5 depends on Task 4. Task 7-8 are final.
