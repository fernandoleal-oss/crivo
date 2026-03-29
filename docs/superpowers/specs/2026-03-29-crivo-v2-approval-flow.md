# Crivo v2 — Fluxo de Aprovação Sequencial + IA

**Data:** 2026-03-29
**Deadline:** 2026-03-30 09h
**Status:** Aprovado para implementação

## 1. Cadeia de Aprovação Sequencial

```
DA (produz) → Redator (aprova copy) → DC (aprova) → ECD (aprovação final)
  → Atendimento (envia ao cliente) → Cliente (aprova/revisa)
```

- Cada etapa só desbloqueia quando a anterior aprova
- Qualquer rejeição volta para o DA refazer
- Quando ECD aprova → peça fica "Pronta para envio"
- Atendimento escolhe o momento de enviar ao cliente

## 2. Card de Peça (estilo C — 4 colunas)

- Barra colorida no topo: cada segmento = um aprovador, preenchida quando aprova
- Grid 4 colunas: DA / Redator / DC / ECD com status visual (✅ aprovado, 👁️ aguardando, 🔒 bloqueado)
- Score IA badge no canto (verde ≥80, amber ≥50, vermelho <50)
- Thumbnail grande da peça no centro
- Quando todos 4 aprovam → badge "Pronta para envio" visível para Atendimento
- Deadline com ícone de relógio
- Nome do cliente + projeto + versão no footer

## 3. Personas (seletor na sidebar, sem auth)

| Persona | Papel | O que vê |
|---------|-------|----------|
| Desirre | Atendimento/CEO | Todos projetos, briefings, botão "Enviar ao cliente" (só após ECD), transcrições |
| Bruno | DA/Criação | Peças p/ produzir, upload versão, score IA, cadeia de aprovação |
| Fabi | Mídia/RTV | CampaignPanel, fornecedores, peças de mídia |

DC (Rodrigo), Redator (Carla) e ECD (Patricia) são nomes no seed — aprovações deles nos cards.

## 4. IA — Transcrição + Briefing Automático

### 4a. Seed simulado (dados prontos)
- Projetos no seed incluem campo `transcription_summary` em `briefing_data`
- Card do projeto mostra "📞 Transcrição da call" com resumo gerado
- Demonstra a visão completa no vídeo

### 4b. Upload de transcrição (funcionalidade real)
- Botão "Colar transcrição" no projeto
- Textarea para colar texto da call
- Claude API processa e gera `briefing_data` automaticamente (produto, verba, prazo, aprovador, assets, observações, score de confiança)
- Resultado aparece como briefing do projeto

### Não incluso (roadmap futuro)
- Integração real com Google Meet/Zoom
- Bot que entra na call automaticamente
- Transcrição em tempo real

## 5. Mudanças no Banco

### Migration
```sql
-- approvals: novo campo role e step_order
ALTER TABLE approvals
  ADD COLUMN IF NOT EXISTS role TEXT,
  ADD COLUMN IF NOT EXISTS step_order INT;

-- pieces: status interno separado do status do cliente
ALTER TABLE pieces
  ADD COLUMN IF NOT EXISTS internal_status TEXT DEFAULT 'draft';
```

### Valores de `role`
`'da' | 'redator' | 'dc' | 'ecd' | 'atendimento' | 'cliente'`

### Valores de `internal_status`
`'draft' | 'in_review' | 'internally_approved' | 'sent_to_client' | 'client_approved' | 'client_revision'`

### Valores de `step_order`
1=DA, 2=Redator, 3=DC, 4=ECD

## 6. Seed Rico v3

Atualizar seed com:
- Aprovações com `role` e `step_order` para cada peça em diferentes estágios
- `briefing_data` inclui `transcription_summary` simulando output da IA
- Nomes dos aprovadores: Bruno (DA), Carla (Redator), Rodrigo (DC), Patricia (ECD)
- Peças em vários estágios: uma só com DA, outra até DC, outra toda aprovada internamente

## 7. Entregáveis

1. Migration 004: `role`, `step_order`, `internal_status`
2. Seed v3 com fluxo sequencial realista
3. Componente `ApprovalChain` — grid 4 colunas reutilizável
4. Card de peça estilo C no ProjectGrid
5. Badge "Pronta para envio" para Atendimento
6. Modal "Colar transcrição" com chamada Claude API → briefing
7. Indicador de transcrição IA no card do projeto
8. Fix de erros visuais existentes
9. Vídeo de demo + README atualizado
