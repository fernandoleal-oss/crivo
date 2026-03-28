# Crivo — Prompt completo para Lovable

> Cole tudo abaixo diretamente no Lovable como prompt inicial.

---

## O produto

Crie o **Crivo** — uma ferramenta de aprovação de peças criativas para agências de publicidade.

**Dor resolvida:** Agências aprovam peças por WhatsApp. O cliente some, ninguém sabe qual versão foi aprovada, arquivos se chamam `banner_FINAL_v3_aprovado2.jpg`. O Crivo centraliza tudo num link público — sem app, sem cadastro para o cliente.

**Tagline:** *"Aprovação de peças sem WhatsApp, sem confusão."*

---

## Dois fluxos principais

### 1. Dashboard da agência (requer "login")

**Tela de login demo** (não é autenticação real — é uma tela simples de acesso):
- Email: `demo@crivo.app` / Senha: `crivo2026`
- Ao entrar: carrega dashboard com projetos demo pré-preenchidos
- Botão secundário: "Entrar como visitante" (dashboard vazio)

**Dashboard:**
- Lista de projetos com cards (nome, cliente, setor, contadores de status)
- Abas de filtro por setor: Todos / Criação / Atendimento / RTV / Mídia / Geral
- Contadores globais no topo: total projetos, peças aprovadas, revisões pendentes, aguardando cliente
- Botão "+ Novo Projeto" → modal (nome do projeto, nome do cliente, setor)

**Dentro de um projeto:**
- Lista de peças com thumbnail (imagem ou ícone PDF), título, status badge, tempo relativo
- Badge "Enviado há X dias" se já foi enviado para cliente
- Badge "Visualizado" se o cliente já abriu o link
- Badge de prazo / "Atrasado" se houver deadline
- Expandir peça: botões "Copiar link" e "Enviar para cliente" / "Reenviar para cliente"
- Histórico de versões com datas
- Decisão do cliente (quando houver): quem aprovou/pediu revisão + feedback + data
- Upload de nova versão inline
- Botão "+ Nova Peça" → modal (título, descrição, upload imagem/PDF com barra de progresso real)

**Modal "Enviar para cliente":**
- Campos: Nome do cliente, Email do cliente
- Ao confirmar: chama webhook n8n que envia email com o link público da peça
- Registra `notified_at` na peça

### 2. Página pública do cliente — `/review/[token]`

**Sem login, sem cadastro.** Acessada pelo link enviado por email.

- Exibe nome do projeto e título da peça
- Viewer de imagem (ou PDF embed) com suporte a pins
- Ao clicar na imagem: abre popover para deixar comentário fixado naquele ponto (pin_x, pin_y em % relativo à imagem)
- Painel lateral de comentários: gerais + pins numerados
- Navegação entre versões (se houver mais de uma)
- Botão de comparação side-by-side de versões
- Botões de decisão: **"Aprovar"** (verde) e **"Pedir Revisão"** (âmbar)
- Modal de aprovação/revisão: campo "Seu nome" + campo "Feedback" (obrigatório em revisão, opcional em aprovação)
- Pós-decisão: card de confirmação (verde = aprovado / âmbar = revisão) + mensagem "A agência foi notificada"
- Onboarding banner no topo (primeira visita): "Clique na imagem para fixar um comentário. Quando terminar, use Aprovar ou Pedir Revisão."

---

## Onboarding por etapa (para usuário novo)

| Etapa | Condição | Mensagem |
|-------|----------|----------|
| 1 | Dashboard sem projetos | "Seu primeiro projeto é onde tudo começa. Dê um nome, informe o cliente e escolha o setor responsável." → CTA "Criar primeiro projeto" |
| 2 | Projeto sem peças | Banner: "Agora adicione a primeira peça — uma imagem ou PDF que o cliente precisa aprovar." → CTA "+ Nova Peça" |
| 3 | Peça não enviada | Tooltip no botão "Enviar para cliente": "O cliente não precisa criar conta — é só um link." |
| 4 | Tela do cliente | Banner fixo: "Clique em qualquer ponto da imagem para fixar um comentário. Depois use Aprovar ou Pedir Revisão." |
| 5 | Pós-aprovação | Card verde: "Aprovado! A agência foi notificada. Você ainda pode deixar comentários." |

---

## Projetos demo (pré-populados com máximo de riqueza)

### Projeto 1 — "Campanha Janeiro 2026" · EMS Pharma · Criação

**Peça 1: Banner Instagram 1080×1080**
- Status: Aprovado
- 1 versão · Cliente: Carlos Mendes · carlos@ems.com.br
- Aprovação: "Ficou excelente! Pode publicar." — 16 Jan 2026
- 1 comentário pin (x:35%, y:20%): "Logo bem posicionado ✓" — Carlos Mendes
- notified_at: 14 Jan 2026 · first_opened_at: 15 Jan 2026

**Peça 2: Post Feed — Produto Destaque**
- Status: Revisão solicitada
- 2 versões (v1 enviado, v2 enviado após correção)
- Cliente: Ana Beatriz · ana@ems.com.br
- Feedback revisão: "A fonte está pequena demais no mobile. Aumentar para 18px."
- 1 comentário pin (x:50%, y:60%): "Aqui o texto some no fundo claro" — Ana Beatriz
- notified_at: 20 Jan 2026 · first_opened_at: 20 Jan 2026

**Peça 3: Story 9:16 — Promoção**
- Status: Pendente
- 1 versão · notified_at: 2 dias atrás · first_opened_at: null (não visualizado)

---

### Projeto 2 — "Rebranding Q1" · Nubank · Atendimento

**Peça 1: Logo Novo — Variação Horizontal**
- Status: Aprovado
- Cliente: Rodrigo Lima · rodrigo@nubank.com.br
- Aprovação: "Perfeito, segue o brand guide." — 10 Jan 2026
- notified_at: 8 Jan · first_opened_at: 9 Jan

**Peça 2: Paleta de Cores 2026**
- Status: Revisão solicitada
- Cliente: Rodrigo Lima
- Feedback: "O roxo está saturado demais para impressão offset."
- notified_at: 15 Jan · first_opened_at: 15 Jan

**Peça 3: Manual de Marca — Capa (PDF)**
- Status: Pendente
- file_type: pdf · notified_at: hoje · first_opened_at: null

---

### Projeto 3 — "Black Friday 2026" · Magazine Luiza · Mídia

**Peça 1: Banner Hero Site**
- Status: Aprovado
- 3 versões no histórico (mostra a evolução):
  - v1: Revisão — "Muito texto, simplificar"
  - v2: Revisão — "Cores fracas, aumentar contraste"
  - v3: Aprovado — "Perfeito agora!" — Fernanda Souza
- notified_at: 5 Mar · first_opened_at: 5 Mar

**Peça 2: Email Marketing — Header**
- Status: Pendente
- 1 versão · notified_at: hoje · first_opened_at: null

---

## Visual e identidade

| Token | Valor |
|-------|-------|
| Cor primária | indigo-600 `#4F46E5` |
| Hover primária | indigo-700 |
| Neutros | slate (todos os tons) |
| Aprovado | green-600 / green-50 |
| Revisão | amber-600 / amber-50 |
| Pendente | slate-500 / slate-100 |
| Fonte | Inter |
| Navbar | bg-slate-900, logo "crivo" em indigo-400 |
| Cards | border-slate-200, rounded-xl, shadow-sm |
| Status badge | pill colorida conforme status |
| Thumbnails | h-32, object-cover, rounded-md |

---

## Banco de dados (Supabase existente)

**Projeto:** `pvtozapmwecuqpzbdtfd`
**URL:** `https://pvtozapmwecuqpzbdtfd.supabase.co`
**Anon key:** `sb_publishable_V72q-CcD63mNu2-tkMS0lA_Y9bR0ZTO`

### Schema completo

```sql
-- Projetos
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  sector text default 'geral',  -- 'geral' | 'criacao' | 'atendimento' | 'rtv' | 'midia'
  created_at timestamptz default now()
);

-- Peças
create table pieces (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'pending',  -- 'pending' | 'approved' | 'revision_requested'
  public_token text unique default gen_random_uuid()::text,
  notified_at timestamptz,
  first_opened_at timestamptz,
  deadline timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Versões de peças
create table piece_versions (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid references pieces(id) on delete cascade,
  version_number int not null,
  file_url text not null,
  file_type text,  -- 'image' | 'pdf'
  uploaded_at timestamptz default now()
);

-- Comentários (gerais e pins)
create table comments (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid references pieces(id) on delete cascade,
  version_id uuid references piece_versions(id),
  author_name text not null,
  content text not null,
  comment_type text default 'general',  -- 'general' | 'pin'
  pin_x float,   -- % horizontal (0-100), só quando comment_type='pin'
  pin_y float,   -- % vertical (0-100), só quando comment_type='pin'
  is_internal boolean default false,  -- true = visível só para agência
  resolved boolean default false,
  created_at timestamptz default now()
);

-- Aprovações e revisões
create table approvals (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid references pieces(id) on delete cascade,
  version_id uuid references piece_versions(id),
  decision text not null,  -- 'approved' | 'revision_requested'
  feedback text,
  decided_by text not null,
  decided_at timestamptz default now()
);
```

### Migrações pendentes (rodar no SQL Editor ANTES de conectar o Lovable)

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sector text DEFAULT 'geral';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false NOT NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS resolved boolean DEFAULT false;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS first_opened_at timestamptz;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS deadline timestamptz;
```

### Storage bucket

Nome: `pieces` (já existe, público)
- Aceita: image/jpeg, image/png, application/pdf
- Tamanho máximo: 10MB
- Path de upload: `{piece_id}/{version_number}/{filename}`

---

## Integrações (n8n)

### Envio de email para cliente
- Webhook: POST `https://n8n.nummo-ai.com.br/webhook/crivo-send-client`
- Payload: `{ piece_id, piece_title, project_name, client_name, client_email, review_url }`
- O n8n envia o email via Gmail com template HTML e o link de revisão

### Notificação de aprovação/revisão para agência
- Webhook: POST `https://n8n.nummo-ai.com.br/webhook/crivo-notify`
- Payload: `{ piece_id, piece_title, project_name, decision, decided_by, feedback }`
- O n8n envia WhatsApp para o número da agência via Evolution API

---

## Rotas da aplicação

| Rota | Descrição |
|------|-----------|
| `/` ou `/login` | Tela de login demo |
| `/dashboard` | Lista de projetos (requer "login") |
| `/project/[id]` | Detalhe do projeto com lista de peças |
| `/review/[token]` | Página pública do cliente (sem login) |
| `/integrations` | Tela estática de integrações ativas e em breve |

---

## Funcionalidades obrigatórias (must have)

- [ ] Tela de login demo (email/senha fixos, sem JWT real)
- [ ] Dashboard com projetos + SectorTabs
- [ ] DashboardCounters: total, aprovados, revisão, pendentes
- [ ] Modal criar projeto (nome, cliente, setor)
- [ ] Lista de peças com thumbnail + StatusBadge
- [ ] Modal criar peça + upload real com barra de progresso
- [ ] Botão "Enviar para cliente" → modal nome + email → chama webhook
- [ ] Badge "Enviado há X" e badge "Visualizado"
- [ ] Histórico de versões com datas
- [ ] Upload de nova versão inline
- [ ] Página `/review/[token]` sem autenticação
- [ ] Viewer imagem com suporte a pins clicáveis
- [ ] Painel de comentários (gerais + pins)
- [ ] Navegação entre versões
- [ ] Modal aprovação/revisão com feedback
- [ ] Card de confirmação pós-decisão (verde/âmbar)
- [ ] Realtime Supabase: status atualiza sem reload
- [ ] Onboarding por etapa (banners/tooltips contextuais)
- [ ] Registrar `first_opened_at` quando cliente abre o link pela primeira vez

## Funcionalidades desejáveis (nice to have)

- [ ] Comentários internos (toggle "interno" — visível só na agência)
- [ ] Resolver/marcar comentário como resolvido
- [ ] Comparação side-by-side de versões
- [ ] Deadline em peças + badge "Atrasado"
- [ ] Tela `/integrations` (WhatsApp ativo, Gmail ativo, Taskrow/Monday/Slack/GDrive/Notion/Zapier em breve)
- [ ] Persistência do nome do autor no localStorage (ao comentar como cliente)

---

## O que NÃO precisa

- Autenticação real (JWT, OAuth, magic link) — o login demo é apenas `if email === 'demo@crivo.app' && password === 'crivo2026'`
- Multi-tenant / workspaces — todos os projetos são da mesma agência
- Planos / pagamento
- Notificações in-app / push
