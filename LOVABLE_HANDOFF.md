# Crivo — Workspace criativo para agências de publicidade
## Prompt completo para Lovable · Versão final

---

## 1. Visão de produto

### O problema real

Agências de publicidade perdem tempo e credibilidade todos os dias porque não têm um sistema central de operação criativa. O fluxo de aprovação acontece por WhatsApp — arquivos se perdem, versões se confundem, clientes somem, ninguém sabe o que foi aprovado. Mas esse é só o sintoma visível.

O problema mais fundo: cada papel dentro da agência (atendimento, criação, mídia, RTV) precisa de uma visão diferente do trabalho. O atendimento quer saber se o cliente aprovou. A criação quer saber o que mudar. A mídia precisa da claquete da produção. Hoje todo mundo olha para a mesma bagunça no WhatsApp e cada um interpreta o que pode.

### A solução

**Crivo** é o workspace operacional da agência criativa. O centro é a aprovação de peças — mas ao redor existe inteligência, contexto e utilidade específica para cada papel.

**Tagline:** *"Aprovação de peças sem WhatsApp, sem confusão."*

**Por que agora:** IA tornou possível analisar qualidade criativa antes de enviar ao cliente. Agências que usarem isso param de queimar a credibilidade mandando peça errada.

### Personas (3 papéis, 3 dores)

**1. Fernanda — Atendimento / CEO**
- Dor: não sabe o status de nada sem perguntar pra todo mundo
- Quer: visão geral de todos os projetos, ver o que está travado, falar com o cliente
- Surpresa que a encanta: dashboard que mostra pendências urgentes sem ela perguntar

**2. Bruno — Criação**
- Dor: manda peça pro cliente e não sabe se está boa o suficiente; feedback vem tarde e vago
- Quer: saber antes de enviar se a peça tem problema; feedback organizado por ponto visual
- Surpresa que o encanta: score de IA que aponta o que revisar antes de o cliente ver

**3. Marcos — Mídia / RTV**
- Dor: claquete de produção é feita no Word, perde versão, atrasa gravação
- Quer: gerar claquete profissional em segundos; ter a produção documentada
- Surpresa que o encanta: claquete digital editável inline, download PDF com um clique

---

## 2. Arquitetura de produto

### Rotas

| Rota | Quem usa | O que faz |
|------|----------|-----------|
| `/` ou `/login` | Todos | Login demo |
| `/dashboard` | Agência | Home personalizada por papel (RoleSwitcher) |
| `/project/[id]` | Agência | Detalhe do projeto + peças + claquetes |
| `/review/[token]` | Cliente externo | Revisão pública sem login — dark mode |
| `/fornecedores` | Agência | Diretório de fornecedores homologados |
| `/integrations` | Agência | Integrações ativas e em breve |

### RoleSwitcher — a feature que une tudo

Na navbar, um pill dropdown animado (framer-motion) permite alternar entre:
- **CEO / Atendimento** → Fernanda
- **Criação** → Bruno
- **Mídia / RTV** → Marcos

Ao trocar de papel: um banner âmbar fixo no topo avisa "Visualizando como Criação — algumas ações estão desativadas". O dashboard e as peças renderizam conteúdo diferente por papel.

**Isso não é multi-tenant.** É uma agência, um login, mas cada pessoa vê o que importa para ela.

---

## 3. Dashboard por papel

### CEO / Atendimento (Fernanda)

Layout: header com contadores globais + lista de projetos + sidebar direita com NewsWidget.

**Contadores globais:**
- Total de projetos ativos
- Peças aguardando cliente (enviadas, sem resposta)
- Aprovações esta semana
- Revisões pendentes (cliente pediu, agência ainda não corrigiu)

**Lista de projetos:** cards com nome, cliente, setor, badges de status das peças. Clique abre o projeto.

**SectorTabs:** filtro por setor — Todos / Criação / Atendimento / RTV / Mídia / Geral.

**NewsWidget (sidebar):** 4 notícias do dia do mercado publicitário (M&M, AdAge, Propmark, Meio & Mensagem) com resumo gerado por IA. Filtradas por setor ativo. Cada item: fonte com badge colorido, headline, resumo IA expansível, categoria (Criação / Mídia / Prêmios / Tecnologia).

### Criação (Bruno)

Mesmo layout base, mas:
- Substitui NewsWidget por **LearningCard** semanal contextual (dica/artigo para o setor Criação)
- Cada PieceCard exibe **AIReviewScoreBadge** (círculo animado com score 0-100)
- Score verde (≥80): "Pronto para aprovação". Score âmbar (50-79): "Revisar antes de enviar". Score vermelho (<50): "Atenção necessária"
- Hover no score: tooltip com lista de issues detectados
- Botão "Enviar para cliente" só fica desbloqueado com score ≥ 50 (ou override com confirmação)

**AISuggestionCard** no topo da lista de peças do projeto (quando há issues):
- variant `warning`: "2 peças com atenção antes de enviar ao cliente"
- variant `action`: "Feedback recebido em 3 peças — hora de corrigir"
- variant `info`: "Todos os itens prontos para aprovação"

### Mídia / RTV (Marcos)

Igual ao CEO, mas dentro de cada projeto que tem setor "RTV" ou "Mídia":
- Aba extra: **"Produção"** — lista de claquetes do projeto
- Botão "Nova Claquete" → ClapperboardDigital inline (editável campo a campo)
- Download PDF com um clique
- Cada claquete tem: produção, cliente, produto, título, diretor, DOP, produção executiva, data, local, cena, take, observações

---

## 4. Projeto (detalhe)

### Header
- Nome do projeto, cliente, setor (badge colorido)
- Botões: "+ Nova Peça" e (se RTV/Mídia) "+ Nova Claquete"

### Lista de peças (PieceList)

Cada **PieceCard** mostra:
- Thumbnail (imagem ou ícone PDF)
- Título + StatusBadge (Pendente / Aprovado / Revisão)
- Tempo relativo ("há 2 dias")
- Badge "Enviado há X" (se notified_at preenchido)
- Badge "Visualizado" (se first_opened_at preenchido)
- Badge "⏱ Atrasado" vermelho (se deadline passou e status ≠ approved)
- **AIReviewScoreBadge** (visível só no papel Criação)
- Chevron → expande para ações e histórico

**Expanded:**
- Botões: "Copiar link", "Enviar / Reenviar para cliente", "Nova versão"
- Decisão do cliente (se houver): quem aprovou/pediu revisão + feedback + data
- Histórico de versões com datas
- ActivityTimeline: audit trail completo (criado, enviado, visualizado, comentário, revisão, aprovado)
- **AISuggestionCard** contextual (só visível no papel Criação, quando há issues)

### Aba Produção (só projetos RTV/Mídia)

Lista de claquetes. Cada uma com:
- Header com nome da produção e data
- Campos todos editáveis inline (click-to-edit)
- Badge "v1 / v2 / v3"
- Botão "Baixar PDF" + "Duplicar"
- Claquete renderizada visualmente (preto e branco, listras diagonais animadas no header)

---

## 5. Página de revisão do cliente — `/review/[token]`

**Dark mode.** Fundo `#0F172A` (slate-950). Peça centralizada com destaque. Glassmorphism no painel de comentários.

### Layout
- Header: nome do projeto + título da peça + versão atual (navegação entre versões discreta)
- Viewer: imagem full-width com overlay de pins, ou PDF embed
- Clicar na imagem: abre popover fixado naquele ponto (pin_x, pin_y em % relativos)
- Painel lateral (ou drawer mobile): comentários gerais + pins numerados
- Botões de decisão: **"Aprovar"** (verde) e **"Pedir Revisão"** (âmbar)

### Onboarding banner (primeiro acesso)
Fundo indigo translúcido, fechável:
> "Clique em qualquer ponto da imagem para fixar um comentário. Quando terminar, use **Aprovar** ou **Pedir Revisão**."

### Pós-decisão
Card grande centralizado:
- Aprovado: fundo verde escuro, ícone animado (check que cresce), "Aprovado! A agência foi notificada."
- Revisão: fundo âmbar escuro, ícone de loop animado, "Revisão solicitada. Retornaremos em breve."
- Ambos: "Você ainda pode deixar comentários."

### Registrar `first_opened_at`
Ao carregar a página pela primeira vez (verificar se já tem valor), fazer PATCH no Supabase.

---

## 6. Fornecedores — `/fornecedores`

Diretório de fornecedores homologados da agência. Cada **SupplierCard** mostra:
- Avatar (logo ou iniciais com cor definida)
- Nome + especialidade
- Categorias (badges: Fotografia / Vídeo / Motion / Áudio / Impressão)
- Rating (estrelas)
- Badge "Verificado" (ícone CheckBadge)
- Badge "Parceiro Crivo" (destaque indigo)
- Website, email, telefone (expandíveis)

Filtro por categoria no topo. Busca por nome.

**Demo data:** 6 fornecedores pré-populados (2 fotografia, 2 vídeo/motion, 1 áudio, 1 impressão).

---

## 7. Onboarding por etapa

| Momento | O que aparece |
|---------|--------------|
| Dashboard vazio (visitante) | Banner: "Seu primeiro projeto é onde tudo começa." + CTA "Criar projeto" |
| Projeto sem peças | Banner inline: "Adicione a primeira peça — imagem ou PDF para o cliente aprovar." |
| Peça criada, não enviada | Tooltip no botão "Enviar para cliente": "O cliente não precisa criar conta — é só um link." |
| Tela do cliente | Banner: "Clique na imagem para fixar comentário. Depois: Aprovar ou Pedir Revisão." |
| Pós-decisão | Card de confirmação (verde/âmbar) com instrução de próximo passo |
| Score baixo ao tentar enviar | Modal: "A IA identificou 2 pontos de atenção. Deseja enviar mesmo assim?" |

---

## 8. Design system

### Cores
| Token | Valor |
|-------|-------|
| Primária | indigo-600 `#4F46E5` |
| Hover primária | indigo-700 `#4338CA` |
| Criação | violet-600 `#7C3AED` |
| Mídia | orange-600 `#EA580C` |
| CEO | indigo-600 |
| Aprovado | emerald-600 `#059669` |
| Revisão | amber-500 `#F59E0B` |
| Pendente | slate-400 `#94A3B8` |
| Fundo review (dark) | slate-950 `#0F172A` |
| Glassmorphism | `bg-white/10 backdrop-blur-md border-white/20` |

### Tipografia
- Fonte: **Inter** (Google Fonts)
- Display: 24px / 700
- Heading: 18px / 600
- Body: 14px / 400
- Caption: 12px / 500

### Componentes
- Cards: `rounded-xl border border-slate-200 shadow-sm`
- Modais: `rounded-2xl shadow-2xl` com overlay `bg-black/50`
- Badges: `rounded-full text-xs font-medium px-2 py-0.5`
- Buttons primários: `bg-indigo-600 hover:bg-indigo-700 rounded-lg`
- Transições: `duration-150 ease-in-out`
- Animações: Framer Motion (já instalado) para modais, dropdowns, score circle, cards

### Navbar
- Fundo `bg-slate-900`, logo "crivo" em `text-indigo-400 font-bold`
- Direita: **RoleSwitcher pill** + link "Fornecedores" + link "Integrações"
- Some na rota `/review/*` (cliente não vê a navbar da agência)

---

## 9. Banco de dados (Supabase existente)

**Projeto:** `pvtozapmwecuqpzbdtfd`
**URL:** `https://pvtozapmwecuqpzbdtfd.supabase.co`
**Anon key:** `${NEXT_PUBLIC_SUPABASE_ANON_KEY}`

### Schema completo

```sql
create table projects (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  client_name text not null,
  sector text default 'geral', -- 'geral'|'criacao'|'atendimento'|'rtv'|'midia'
  created_at timestamptz default now()
);

create table pieces (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  title text not null,
  description text,
  status text default 'pending', -- 'pending'|'approved'|'revision_requested'
  public_token text unique default gen_random_uuid()::text,
  notified_at timestamptz,
  first_opened_at timestamptz,
  deadline timestamptz,
  ai_score integer,           -- 0-100, gerado na criação/upload
  ai_issues text[],           -- array de strings com pontos de atenção
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table piece_versions (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid references pieces(id) on delete cascade,
  version_number int not null,
  file_url text not null,
  file_type text, -- 'image'|'pdf'
  uploaded_at timestamptz default now()
);

create table comments (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid references pieces(id) on delete cascade,
  version_id uuid references piece_versions(id),
  author_name text not null,
  content text not null,
  comment_type text default 'general', -- 'general'|'pin'
  pin_x float,
  pin_y float,
  is_internal boolean default false,
  resolved boolean default false,
  created_at timestamptz default now()
);

create table approvals (
  id uuid primary key default gen_random_uuid(),
  piece_id uuid references pieces(id) on delete cascade,
  version_id uuid references piece_versions(id),
  decision text not null, -- 'approved'|'revision_requested'
  feedback text,
  decided_by text not null,
  decided_at timestamptz default now()
);

create table clapperboards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  producao text not null,
  cliente text,
  produto text,
  titulo text,
  diretor text,
  dop text,
  producao_exec text,
  data text,
  local text,
  cena text default '01',
  take text default '01',
  obs text,
  version_number int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  specialty text,
  categories text[],
  rating numeric(2,1) default 5.0,
  verified boolean default false,
  crivo_partner boolean default false,
  website text,
  email text,
  phone text,
  avatar_color text default 'bg-indigo-500',
  created_at timestamptz default now()
);
```

### Migrações pendentes (rodar no SQL Editor antes de conectar)

```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sector text DEFAULT 'geral';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false NOT NULL;
ALTER TABLE comments ADD COLUMN IF NOT EXISTS resolved boolean DEFAULT false;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS first_opened_at timestamptz;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS deadline timestamptz;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS ai_score integer;
ALTER TABLE pieces ADD COLUMN IF NOT EXISTS ai_issues text[];

CREATE TABLE IF NOT EXISTS clapperboards (
  id uuid primary key default gen_random_uuid(),
  project_id uuid references projects(id) on delete cascade,
  producao text not null,
  cliente text, produto text, titulo text,
  diretor text, dop text, producao_exec text,
  data text, local text,
  cena text default '01', take text default '01', obs text,
  version_number int default 1,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

CREATE TABLE IF NOT EXISTS suppliers (
  id uuid primary key default gen_random_uuid(),
  name text not null, specialty text, categories text[],
  rating numeric(2,1) default 5.0,
  verified boolean default false, crivo_partner boolean default false,
  website text, email text, phone text,
  avatar_color text default 'bg-indigo-500',
  created_at timestamptz default now()
);
```

### Storage bucket
Nome: `pieces` (público) · image/jpeg, image/png, application/pdf · max 10MB
Path: `{piece_id}/{version_number}/{filename}`

---

## 10. Integrações n8n

### Envio de email para cliente
POST `https://n8n.nummo-ai.com.br/webhook/crivo-send-client`
```json
{ "piece_id": "", "piece_title": "", "project_name": "", "client_name": "", "client_email": "", "review_url": "" }
```

### Notificação de decisão para agência (WhatsApp)
POST `https://n8n.nummo-ai.com.br/webhook/crivo-notify`
```json
{ "piece_id": "", "piece_title": "", "project_name": "", "decision": "", "decided_by": "", "feedback": "" }
```

---

## 11. Demo data (pré-populada com máximo de riqueza)

### Login demo
- Email: `demo@crivo.app` / Senha: `crivo2026`
- Entra como Fernanda (CEO/Atendimento) por padrão
- Botão "Entrar como visitante" disponível (dashboard vazio + onboarding)

### Projeto 1 — "Campanha Janeiro 2026" · EMS Pharma · Criação

**Peça 1: Banner Instagram 1080×1080**
- Status: approved · ai_score: 92 · ai_issues: []
- v1 · Enviado 14/Jan · Visualizado 15/Jan
- Aprovação: Carlos Mendes · "Ficou excelente! Pode publicar." · 16/Jan
- Pin (35%, 20%): "Logo bem posicionado ✓" — Carlos Mendes

**Peça 2: Post Feed — Produto Destaque**
- Status: revision_requested · ai_score: 61 · ai_issues: ["Tipografia abaixo de 16px no mobile", "Contraste texto/fundo insuficiente"]
- v2 · Enviado 20/Jan · Visualizado 20/Jan
- Revisão: Ana Beatriz · "A fonte está pequena demais no mobile. Aumentar para 18px."
- Pin (50%, 60%): "Aqui o texto some no fundo claro"

**Peça 3: Story 9:16 — Promoção**
- Status: pending · ai_score: 78 · ai_issues: ["Verificar safe zone para stories"]
- v1 · Enviado há 2 dias · first_opened_at: null
- deadline: amanhã → badge "⏱ Atrasado"

### Projeto 2 — "Rebranding Q1" · Nubank · Atendimento

**Peça 1: Logo Novo — Variação Horizontal**
- Status: approved · ai_score: 95 · ai_issues: []
- Rodrigo Lima · "Perfeito, segue o brand guide." · 10/Jan

**Peça 2: Paleta de Cores 2026**
- Status: revision_requested · ai_score: 55 · ai_issues: ["Saturação acima do recomendado para impressão offset"]
- Rodrigo Lima · "O roxo está saturado demais para impressão."

**Peça 3: Manual de Marca — Capa (PDF)**
- Status: pending · ai_score: 88 · file_type: pdf · notified_at: hoje

### Projeto 3 — "Black Friday 2026" · Magazine Luiza · Mídia

**Peça 1: Banner Hero Site**
- Status: approved · ai_score: 91 · 3 versões
- v1: revision ("Muito texto") · v2: revision ("Cores fracas") · v3: approved "Perfeito agora!" — Fernanda Souza

**Peça 2: Email Marketing — Header**
- Status: pending · ai_score: 73 · ai_issues: ["Peso total do email pode exceder limite Gmail"]

**Claquete 1: VT 30s "Semana do Brasil"**
- producao: Black Friday 2026 · cliente: Magazine Luiza · produto: Linha Eletro
- diretor: Ricardo Almeida · dop: Ana Costa · data: 15/Mar/2026
- cena: 03 · take: 01

### Fornecedores (6 pré-cadastrados)
1. **Studio 81** · Fotografia · Verificado + Parceiro Crivo · rating: 4.9
2. **Frame Motion** · Motion Design / Vídeo · Verificado · rating: 4.7
3. **Voxa Audio** · Áudio / Locução · rating: 4.5
4. **Pixel Makers** · Fotografia / Retoque · rating: 4.3
5. **TeleArte Produções** · RTV / Produção de Vídeo · Verificado · rating: 4.8
6. **Gráfica Premium** · Impressão / Acabamento · rating: 4.2

---

## 12. Funcionalidades — priorização PM

### Must ship (core do produto)
- [ ] Tela de login demo + RoleSwitcher na navbar
- [ ] Dashboard com contadores + lista de projetos + SectorTabs
- [ ] NewsWidget na sidebar (papel CEO/Atendimento)
- [ ] LearningCard contextual (papel Criação)
- [ ] Modal criar projeto (nome, cliente, setor)
- [ ] Lista de peças com thumbnail + StatusBadge + AIReviewScoreBadge
- [ ] Modal criar peça + upload real com XHR + barra de progresso
- [ ] AISuggestionCard contextual na lista de peças (papel Criação)
- [ ] Modal "Enviar para cliente" → chama webhook n8n
- [ ] Badges: "Enviado há X", "Visualizado", "Atrasado"
- [ ] Histórico de versões + upload nova versão inline
- [ ] ActivityTimeline por peça (audit trail)
- [ ] Página `/review/[token]` — dark mode, sem login
- [ ] Viewer com pins clicáveis na imagem
- [ ] Painel de comentários (gerais + pins numerados)
- [ ] Modal aprovação/revisão com feedback
- [ ] Card pós-decisão com animação (verde/âmbar)
- [ ] Registrar `first_opened_at` no primeiro acesso do cliente
- [ ] Realtime Supabase nos status (sem reload)
- [ ] Onboarding por etapa em cada momento crítico
- [ ] ClapperboardDigital em projetos RTV/Mídia (editável + download)
- [ ] Página `/fornecedores` com SupplierCard + filtro + busca

### Nice to ship
- [ ] Comentários internos (toggle — invisível para o cliente)
- [ ] Resolver comentário (checkbox)
- [ ] Comparação side-by-side de versões
- [ ] Bloqueio de envio se ai_score < 50 (com override)
- [ ] Página `/integrations` (WhatsApp ativo, Gmail ativo, outros em breve)

### Fora do escopo
- Autenticação real (JWT/OAuth) — login demo é `if email === 'demo@crivo.app'`
- Multi-tenant / múltiplas agências
- Planos / pagamento
- Push notifications

---

## 13. Componentes existentes para reutilizar

Os componentes abaixo já existem e estão funcionando — importe e integre diretamente:

| Componente | Arquivo | Onde usar |
|-----------|---------|-----------|
| `RoleSwitcher` + `ViewAsBanner` | `ui/RoleSwitcher.tsx` | Navbar (role switching) |
| `AISuggestionCard` | `ui/AISuggestionCard.tsx` | PieceList (papel Criação) |
| `AIReviewScoreBadge` | `ui/AIReviewScore.tsx` | PieceCard (papel Criação) |
| `ClapperboardDigital` | `ui/ClapperboardDigital.tsx` | Aba Produção em projetos RTV |
| `NewsWidget` | `ui/NewsWidget.tsx` | Dashboard sidebar (papel CEO) |
| `LearningCard` | `ui/LearningCard.tsx` | Dashboard sidebar (papel Criação) |
| `SupplierCard` | `ui/SupplierCard.tsx` | Página /fornecedores |
| `StatusBadge` | `shared/StatusBadge.tsx` | PieceCard |
| `UploadProgress` | `shared/UploadProgress.tsx` | NewPieceModal |
| `ActivityTimeline` | `review/ActivityTimeline.tsx` | PieceCard expanded |
| `VersionCompare` | `review/VersionCompare.tsx` | PieceCard expanded |
| `ApprovalConfirmation` | `review/ApprovalConfirmation.tsx` | Pós-decisão na review |
