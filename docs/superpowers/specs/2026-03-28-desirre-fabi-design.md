# Crivo — Integração Desirre & Fabi
**Data:** 2026-03-28
**Prazo:** 2026-03-30 às 14h

---

## Problema

O Crivo já resolve aprovação de peças. Mas as personas reais da agência têm dores específicas que o app ainda não toca:

- **Desirre (atendimento):** recebe briefing do cliente e verifica manualmente se tem todas as informações, materiais e aprovações — tarefa repetitiva que toma tempo mas não agrega valor criativo.
- **Fabi (mídia):** preenche as mesmas informações de campanha em múltiplas planilhas com formatos diferentes para diferentes destinos (cliente, veículo, controle interno).

---

## Decisões de Design

### Feature 1 — Extração de Briefing por IA (Desirre)

**Onde:** `NewProjectModal` — nova aba "Briefing" após os dados básicos do projeto.

**Fluxo:**
1. Desirre cria projeto normalmente (nome + cliente)
2. Na aba "Briefing", cola o texto bruto que recebeu (e-mail, WhatsApp, resumo da call)
3. Botão "Analisar com IA" → chama `/api/ai/analyze-brief` (já existe!) com o texto
4. IA retorna campos estruturados: produto, verba, prazo, assets necessários, aprovador, observações
5. Campos preenchidos automaticamente — o que a IA não encontrou fica marcado como "⚠ não identificado"
6. Desirre confirma/edita e salva — `briefing_score` (0–100) é calculado com base nos campos preenchidos

**Banco:** adicionar coluna `briefing_data jsonb` e `briefing_score int` em `projects`.

**Gate de envio:** `SendToClientModal` verifica `briefing_score`. Se < 80, exibe aviso âmbar com override consciente — mesmo padrão filosófico do AI Score Gate.

**Onde aparece no UI:**
- `ProjectCard`: badge "Briefing incompleto" âmbar se `briefing_score < 80`
- `project/[id]`: seção "Briefing" colapsável com os campos e score

---

### Feature 2 — Painel de Campanhas (Fabi, role Mídia)

**Onde:** `ProjectGrid` quando `currentRole === 'midia'` — renderiza `CampaignPanel` em vez do grid de cards.

**Layout do CampaignPanel:**
- Tabela de campanhas ativas: Projeto | Cliente | Período | Verba | Status Aprovação | Claquetes
- Click em linha expande detalhes do claquete + botões de export
- Filtros: período, status, cliente

**Exports do claquete (3 formatos):**
1. **PDF Claquete** — já existe (`ClapperboardDigital`)
2. **Planilha de Veiculação** — CSV com colunas: Produto, Versão, Duração, Período, Praça, Verba, Aprovador, Data Aprovação
3. **Spec de TV** — texto estruturado em formato de especificação técnica para emissoras (Produto, Anunciante, Agência, CNPJ, Título, Duração, Formato)

Os exports 2 e 3 geram arquivo client-side (sem backend) — dados já estão no claquete.

---

## Arquitetura

### Banco (migrations)
```sql
ALTER TABLE projects
  ADD COLUMN briefing_data jsonb,
  ADD COLUMN briefing_score int DEFAULT 0;
```

### API existente reutilizada
- `/api/ai/analyze-brief` já existe — ajustar prompt para retornar campos estruturados do briefing de agência.

### Novos componentes
- `src/components/dashboard/BriefingTab.tsx` — aba no modal de criação de projeto
- `src/components/dashboard/CampaignPanel.tsx` — view alternativa para role mídia
- `src/lib/exports.ts` — funções `exportVeiculacaoCSV()` e `exportTVSpec()`

### Componentes modificados
- `NewProjectModal.tsx` — adicionar aba "Briefing" com `BriefingTab`
- `SendToClientModal.tsx` — gate `briefing_score < 80`
- `ProjectCard.tsx` — badge briefing incompleto
- `ProjectGrid.tsx` — branch `if role === 'midia'` → `<CampaignPanel />`
- `ClapperboardDigital.tsx` — 2 botões de export adicionais
- `project/[id]/page.tsx` — seção briefing colapsável
- `lib/types.ts` — adicionar `briefing_data` e `briefing_score` em `Project`

---

## O que NÃO entra
- Google Sheets integration (OAuth complexo, fora do prazo)
- Gravação de áudio (Whisper API, arriscado para demo)
- Notificações automáticas de briefing incompleto (fase 2)
