# Crivo — Handoff de Sessão
**Data:** 2026-03-27

## Estado atual
Branch de trabalho: `feature/build`
Worktree: `/Users/fsleal/crivo/.worktrees/build`
Build: ✅ limpo (Next.js 16.2.1)
Testes: ✅ 7/7 passando

## Commits na feature/build
- `50b1a51` — feat: project setup — Next.js 14 + Supabase + shadcn/ui + vitest
- `a724b79` — feat: types, utils (tests passing), supabase clients, n8n notifier
- `a056c10` — feat: shared components — StatusBadge, EmptyState, LoadingSkeleton
- `937b903` — feat: home page — project grid, counters, search, create modal
- `b054c6d` — feat: project detail — piece list, create, upload, realtime toasts
- `395602b` — feat: review page — viewer, comments, approval/revision flow
- `c767f8d` — feat: pin comments on images
- `1ad283f` — feat: version comparison side-by-side

## Falta fazer

### Task 10 — Workflow n8n de notificação
Criar workflow "Crivo_Notify" em https://n8n.nummo-ai.com.br com:
- Nó 1: Webhook trigger, path `crivo-notify`, POST
- Nó 2: Switch por `{{ $json.decision }}` (approved / revision_requested)
- Nó 3: Set Prep_Aprovado — mensagem: `✅ *{{ $json.pieceName }}* aprovada por *{{ $json.decidedBy }}*. Projeto: {{ $json.projectName }}`
- Nó 4: Set Prep_Revisao — mensagem: `↩ *{{ $json.pieceName }}* pediu revisão. Feedback: "{{ $json.feedback }}" — {{ $json.decidedBy }}`
- Nó 5/6: HTTP Request → Evolution API zanini para cada branch
- URL webhook final: https://n8n.nummo-ai.com.br/webhook/crivo-notify
- Adicionar ao .env.local: N8N_WEBHOOK_URL=https://n8n.nummo-ai.com.br/webhook/crivo-notify

### Task 11 — Polish, README, build final
- Verificar responsividade mobile (375px) no browser
- Criar README.md completo (ver spec em docs/superpowers/specs/2026-03-27-crivo-design.md)
- Rodar `npm run build` final sem erros
- Commit

### Merge + Deploy
- Merge `feature/build` → `main`
- Push para GitHub
- Conectar repo no Vercel, adicionar env vars:
  - NEXT_PUBLIC_SUPABASE_URL=https://pvtozapmwecuqpzbdtfd.supabase.co
  - NEXT_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_V72q-CcD63mNu2-tkMS0lA_Y9bR0ZTO
  - N8N_WEBHOOK_URL=https://n8n.nummo-ai.com.br/webhook/crivo-notify

## Credenciais Supabase
- Project ID: pvtozapmwecuqpzbdtfd
- URL: https://pvtozapmwecuqpzbdtfd.supabase.co
- Anon key: sb_publishable_V72q-CcD63mNu2-tkMS0lA_Y9bR0ZTO

## Spec e plano
- Design: docs/superpowers/specs/2026-03-27-crivo-design.md
- Plano: docs/superpowers/plans/2026-03-27-crivo-implementation.md

## Para retomar
Diga: "continua o Crivo — faltam Tasks 10 e 11, worktree em /Users/fsleal/crivo/.worktrees/build"
