# Crivo — Handoff para Lovable

## O produto

**Crivo** é uma ferramenta de aprovação de peças criativas para agências de publicidade.

**Dor resolvida:** Agências aprovam peças por WhatsApp. O cliente some, ninguém sabe qual versão foi aprovada, arquivos se chamam `banner_FINAL_v3_aprovado2.jpg`. O Crivo centraliza tudo num link público — sem app, sem cadastro.

**Tagline:** "Aprovação de peças sem WhatsApp, sem confusão."

---

## Fluxo principal

### Visão da agência (dashboard)
1. Cria um projeto (nome, cliente, setor: Criação / Atendimento / RTV / Mídia / Geral)
2. Dentro do projeto, cria peças (título, descrição, upload de imagem/PDF)
3. Clica "Enviar para cliente" → preenche nome e email do cliente → sistema envia email com link
4. Acompanha status: Pendente / Aprovado / Revisão solicitada

### Visão do cliente (página pública — sem login)
1. Recebe link único por email
2. Abre a peça, vê a imagem/PDF
3. Clica na imagem para fixar um comentário (pin) em qualquer ponto
4. Deixa comentários gerais
5. Clica "Aprovar" ou "Pedir Revisão" com feedback
6. Vê card de confirmação (verde = aprovado, âmbar = revisão)

---

## Demo login / modo demo

Como o produto é sem autenticação real, o "login de teste" é uma tela inicial simples:

- **Email:** `demo@crivo.app`
- **Senha:** `crivo2026`
- Ao entrar, carrega o dashboard com projetos demo pré-preenchidos
- Botão "Entrar como visitante" também disponível (sem dados demo)

---

## Projetos demo pré-preenchidos (3 projetos, máximo de riqueza)

### Projeto 1 — "Campanha Janeiro 2026" · EMS Pharma · Setor: Criação
**Peça 1: Banner Instagram 1080x1080**
- Status: ✅ Aprovado
- Versão 1 (imagem de remédio/saúde)
- Cliente: Carlos Mendes · `carlos@ems.com.br`
- Aprovação: "Ficou excelente! Pode publicar." — 16 Jan 2026
- Comentário pin na imagem: "Logo bem posicionado ✓"

**Peça 2: Post Feed — Produto Destaque**
- Status: ↩ Revisão solicitada
- Versão 2 (já teve revisão)
- Cliente: Ana Beatriz · `ana@ems.com.br`
- Feedback: "A fonte está pequena demais no mobile. Aumentar para 18px."
- Comentário pin: "Aqui o texto some no fundo claro"

**Peça 3: Story 9:16 — Promoção**
- Status: ⏳ Pendente
- Enviado há 2 dias, cliente ainda não visualizou

### Projeto 2 — "Rebranding Q1" · Nubank · Setor: Atendimento
**Peça 1: Logo Novo — Variação Horizontal**
- Status: ✅ Aprovado · Rodrigo Lima · "Perfeito, segue o brand guide."

**Peça 2: Paleta de Cores 2026**
- Status: ↩ Revisão · "O roxo está saturado demais para impressão."

**Peça 3: Manual de Marca — Capa**
- Status: ⏳ Pendente · PDF · Enviado hoje

### Projeto 3 — "Black Friday 2026" · Magazine Luiza · Setor: Mídia
**Peça 1: Banner Hero Site**
- Status: ✅ Aprovado · 3 versões no histórico (mostra evolução)
- v1: reprovado ("muito texto"), v2: reprovado ("cores fracas"), v3: aprovado

**Peça 2: Email Marketing — Header**
- Status: ⏳ Pendente · Recém enviado

---

## Onboarding por etapa

### Onboarding 1 — Dashboard vazio (primeiro acesso real)
Tooltip/modal: "Seu primeiro projeto é onde tudo começa. Dê um nome, informe o cliente e escolha o setor responsável."
CTA: "Criar primeiro projeto →"

### Onboarding 2 — Projeto criado, sem peças
Banner no topo: "Agora adicione a primeira peça. Pode ser uma imagem ou PDF — qualquer arquivo que o cliente precisa aprovar."
CTA: "+ Nova Peça"

### Onboarding 3 — Peça criada, não enviada
Tooltip no botão "Enviar para cliente": "Quando estiver pronto, envie o link pro cliente. Ele não precisa criar conta — é só um link."

### Onboarding 4 — Tela do cliente (primeiro comentário)
Banner fixo no topo: "💬 Clique em qualquer ponto da imagem para fixar um comentário. Quando terminar, use Aprovar ou Pedir Revisão."

### Onboarding 5 — Pós-aprovação
Card verde: "✅ Aprovado! A agência foi notificada." + "Você ainda pode deixar comentários."

---

## Funcionalidades essenciais para o Lovable

### Must have
- [ ] Dashboard com lista de projetos + filtro por setor (tabs)
- [ ] Modal criar projeto (nome, cliente, setor)
- [ ] Lista de peças dentro do projeto com thumbnail
- [ ] Modal criar peça (título, descrição, upload imagem/PDF)
- [ ] Upload com barra de progresso real
- [ ] Status badge (Pendente / Aprovado / Revisão)
- [ ] Página pública `/review/[token]` — sem login
- [ ] Viewer de imagem com pins clicáveis
- [ ] Painel de comentários com pin na imagem
- [ ] Modal de aprovação/revisão com feedback
- [ ] Card ApprovalConfirmation pós-decisão
- [ ] Botão "Enviar para cliente" → abre modal com nome + email
- [ ] `notified_at` na peça (badge "Enviado há X dias")
- [ ] Histórico de versões com datas
- [ ] Onboarding em cada etapa (banners/tooltips)
- [ ] Tela login demo (email/senha fixos)

### Nice to have
- [ ] Comentários internos (visíveis só para a agência)
- [ ] Comparação side-by-side de versões
- [ ] Tela de integrações (WhatsApp, Gmail, em breve: Taskrow, Monday, Slack)
- [ ] DashboardCounters (total projetos, aprovados, pendentes, revisão)

---

## Visual / estilo

- Cores: indigo-600 (#4F46E5) como primária, slate para neutros
- Fonte: Inter
- Cards com bordas sutis (border-slate-200)
- Thumbnails nas peças (h-32, object-cover)
- StatusBadge: verde (aprovado), âmbar (revisão), slate (pendente)
- Navbar escura (bg-slate-900) com logo "crivo" em indigo

---

## Banco de dados (Supabase)

Projeto existente: `pvtozapmwecuqpzbdtfd`
URL: `https://pvtozapmwecuqpzbdtfd.supabase.co`

### Tabelas
```sql
projects: id, name, client_name, sector (text, default 'geral'), created_at
pieces: id, project_id, title, description, status, public_token, notified_at, created_at, updated_at
piece_versions: id, piece_id, version_number, file_url, file_type, uploaded_at
comments: id, piece_id, version_id, author_name, content, comment_type (general/pin), pin_x, pin_y, is_internal, created_at
approvals: id, piece_id, version_id, decision (approved/revision_requested), feedback, decided_by, decided_at
```

Storage bucket: `pieces` (público, aceita image/jpeg, image/png, application/pdf, max 10MB)

**Migração pendente (rodar no SQL Editor):**
```sql
ALTER TABLE projects ADD COLUMN IF NOT EXISTS sector text DEFAULT 'geral';
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_internal boolean DEFAULT false NOT NULL;
```

---

## Prompt sugerido para iniciar no Lovable

```
Crie o Crivo — uma ferramenta de aprovação de peças criativas para agências de publicidade.

Tagline: "Aprovação de peças sem WhatsApp, sem confusão."

O produto tem duas visões:
1. Dashboard da agência (com login demo: demo@crivo.app / crivo2026)
2. Página pública do cliente (sem login, acessada por token único)

[Cole o conteúdo completo deste arquivo aqui]
```
