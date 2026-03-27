# Crivo v2 — Design Spec
**Data:** 2026-03-27
**Prazo desafio:** 2026-03-30 às 14h
**Contexto:** Evolução do MVP para plataforma de review com workspaces por setor

---

## Problema

O MVP resolve o fluxo básico de aprovação. A v2 resolve dois problemas adicionais:
1. **Dentro da agência:** cada setor (Criação, RTV, Mídia, Atendimento) não tem visão filtrada do que é relevante para ele
2. **Com o cliente:** o envio do link é manual e sem registro — o cliente não recebe nada formal, e a agência não sabe quando foi enviado

---

## Escopo v2

### Dentro do prazo do desafio (até 30/03)
- Bloco 1: Polish do MVP (6 melhorias de UX)
- Bloco 2: Workspaces por setor (tags + filtro no dashboard)
- Bloco 3: Email automático + WhatsApp ao enviar para o cliente

### Pós-desafio
- Bloco 4: Exportação PDF por projeto

---

## Bloco 1 — Polish do MVP

### 1.1 Thumbnail das peças no dashboard
- `PieceCard` exibe preview da última versão acima do título
- Imagens: `<img>` com `object-cover` no Supabase URL
- PDFs: ícone de PDF estilizado (sem renderizar)
- Status badge sobreposto no canto superior direito da thumbnail

### 1.2 Progress bar no upload
- Componentes `NewPieceModal` e `UploadNewVersion` usam `XMLHttpRequest` em vez de `fetch` para ter acesso ao evento `progress`
- Barra de progresso exibe percentual em tempo real
- Estado: `idle → uploading (0–100%) → success → error`

### 1.3 Mensagem de erro clara
- Ao falhar, exibe mensagem específica:
  - Tipo inválido: "Só aceitamos JPG, PNG e PDF"
  - Tamanho: "Arquivo maior que 10MB"
  - Rede: "Falha na conexão. Tente novamente."
- Botão "Tentar novamente" reseta o estado

### 1.4 Empty state com CTA
- Quando não há projetos: ícone + texto + botão "Novo projeto" que abre o modal
- Quando projeto não tem peças: ícone + texto + botão "Adicionar peça"

### 1.5 Tela de review mais guiada
- Banner azul no topo do painel lateral: "Clique na imagem para fixar um comentário. Quando terminar, use os botões abaixo."
- Banner some após a primeira decisão

### 1.6 Confirmação visual após aprovação
- Após aprovar: card verde com ✅, "Aprovado!", "A agência foi notificada."
- Após pedir revisão: card âmbar com ↩, "Revisão solicitada.", "A agência foi notificada."
- Substituem os botões de decisão — não somem apenas

---

## Bloco 2 — Workspaces por setor

### Modelo de dados
```sql
-- Adicionar coluna sector em projects
ALTER TABLE projects ADD COLUMN sector text DEFAULT 'geral';
-- Valores: 'criacao', 'rtv', 'midia', 'atendimento', 'geral'

-- Comentários internos (não visíveis ao cliente)
ALTER TABLE comments ADD COLUMN is_internal boolean DEFAULT false;
```

### Dashboard filtrado
- Tabs no topo do dashboard: Todos · Criação · RTV · Mídia · Atendimento
- Filtro é client-side (sem nova query) — filtra por `project.sector`
- Ao criar projeto, Atendimento escolhe o setor responsável

### Comentários internos
- No `CommentPanel`, toggle "Interno" (visível só para a agência)
- Na tela `/review/[token]` (cliente), comentários com `is_internal=true` são filtrados do fetch
- Badge "Interno" em azul nos comentários internos no dashboard

### Login por setor (simples)
- Sem Supabase Auth completo — cookie de sessão simples
- Tela `/login`: escolhe nome + setor → salva em `localStorage`
- Não é autenticação real — é identificação para filtro e para assinar comentários internos
- Suficiente para o desafio; auth real fica para pós-desafio

---

## Bloco 3 — Envio formal para o cliente

### Fluxo
1. Atendimento clica "Enviar para cliente" no `PieceCard`
2. Modal pede: nome do cliente, email do cliente
3. Crivo chama n8n webhook `/crivo-send-client`
4. n8n envia email via Gmail com link de review + instruções
5. n8n envia WhatsApp para o número do Atendimento: "Link enviado para [cliente] — [email]"
6. `pieces.notified_at` é atualizado (campo já existe no schema)

### Email para o cliente
- Assunto: "[Projeto] — Peça para sua aprovação"
- Corpo: nome da peça, link de review, instrução de 3 passos (clique no link → veja a peça → aprove ou peça revisão)
- Remetente: conta Gmail da agência (mesmo credential do n8n já configurado)

### Workflow n8n — Crivo_Send_Client
- Webhook POST `/crivo-send-client`
- Payload: `{ pieceName, projectName, clientName, clientEmail, reviewUrl, attendantPhone }`
- Nó Gmail: envia email para `clientEmail`
- Nó Evolution API: WhatsApp para `attendantPhone`
- Responde `{ ok: true }`

### UI
- `PieceCard`: botão "Enviar para cliente" (além de "Copiar link")
- Modal `SendToClientModal`: campos nome + email, botão "Enviar"
- Após envio: badge "Enviado em [data]" no card, botão fica "Reenviar"

---

## Bloco 4 — Exportação PDF (pós-desafio)

### O que o PDF contém
- Header: nome do projeto, cliente, data de geração
- Por peça: título, status, todas as versões com datas, decisão (quem aprovou, quando, feedback)
- Rodapé: "Documento gerado pelo Crivo — [url]"

### Implementação
- `react-pdf/renderer` para geração client-side
- Botão "Exportar PDF" na página do projeto
- Download direto no browser, sem servidor

---

## Banco de dados — migrações necessárias

```sql
-- Setor nos projetos
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sector text DEFAULT 'geral';

-- Comentários internos
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false;
```

---

## Componentes novos

| Componente | Localização | Descrição |
|---|---|---|
| `SectorTabs` | `dashboard/SectorTabs.tsx` | Tabs de filtro por setor |
| `SendToClientModal` | `dashboard/SendToClientModal.tsx` | Modal email + nome do cliente |
| `ApprovalConfirmation` | `review/ApprovalConfirmation.tsx` | Card verde/âmbar pós-decisão |
| `UploadProgress` | `shared/UploadProgress.tsx` | Barra de progresso reutilizável |

---

## Workflow n8n adicional

| Workflow | ID | Path | Status |
|---|---|---|---|
| Crivo_Notify | a9k75jXlwOizH43p | `/crivo-notify` | ATIVO |
| Crivo_Send_Client | (novo) | `/crivo-send-client` | A criar |

---

## Fora de escopo

- Autenticação real com Supabase Auth (pós-desafio)
- Permissões granulares por usuário
- Integração com Taskrow
- Notificações push / in-app
