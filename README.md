# Crivo

![Crivo](public/globe.svg)

> "Aprova essa versão?" — enviado no grupo do WhatsApp, junto com 47 outras mensagens, 3 áudios e uma foto de gato.

Toda agência conhece essa cena. O cliente aprova a versão errada porque não achou a certa no histórico. A revisão chega sem feedback estruturado. Ninguém sabe exatamente quem aprovou o quê, e quando.

**Crivo** resolve isso com um link. Sem cadastro pro cliente. Sem WhatsApp. Sem confusão.

**→ [Abrir o demo](https://crivo-neon.vercel.app)** — projetos reais de agência já criados, explore sem precisar cadastrar nada.



---

## O problema (e por que ele é maior do que parece)

O fluxo de aprovação de peças criativas em agências brasileiras acontece por WhatsApp. Isso não é uma falha de adoção — é uma consequência direta de ferramentas que não foram projetadas para esse contexto.

Frame.io foi construído para Hollywood. Ziflow, para times de marketing americanos. Nenhum deles entende que numa agência brasileira de médio porte existem três personas com três problemas completamente diferentes operando no mesmo projeto:

**Desirre (Atendimento/CEO)** não sabe o status de nada sem perguntar para todo mundo. Ela precisa de visão geral, em tempo real, sem ter que entrar em cada projeto.

**Bruno (Criação)** manda peça pro cliente sem saber se está boa o suficiente. O feedback volta tarde, vago, e via WhatsApp. Ele quer saber antes de enviar — e ser protegido da exposição.

**Fabi (Mídia/RTV)** preenche as mesmas informações de produção em três planilhas diferentes. A claquete é feita no Word, perde versão, atrasa gravação.

A insight central do Crivo: **o gargalo não é a revisão — é o envio.** O momento em que Bruno hesita antes de clicar "Enviar para cliente" é onde a credibilidade da agência é ganha ou perdida. Toda a arquitetura do produto parte daí.

---

## O que foi construído

### Fluxo core de aprovação

```
Criação sobe peça → gera link → envia pro cliente
Cliente abre no celular → comenta na imagem → aprova ou pede revisão
Agência recebe no WhatsApp em tempo real → fecha o loop
```

- **Upload com versionamento** — cada revisão é uma nova versão, o histórico nunca se perde
- **Comentários ancorados por posição** — o cliente clica em qualquer ponto da imagem para comentar; o número do pin aparece exatamente naquela coordenada (pin_x, pin_y em % relativos)
- **Comparação lado a lado de versões** — o cliente vê exatamente o que mudou entre v1 e v2
- **Link público sem autenticação** — nanoID de 10 chars por peça, sem dado sensível exposto
- **Aprovação com registro** — quem aprovou, quando, com qual feedback, vinculado à versão específica
- **`first_opened_at` tracking** — "Visualizado" aparece no momento em que o cliente abre o link pela primeira vez, eliminando o e-mail passivo-agressivo de follow-up
- **Notificação WhatsApp em tempo real** — n8n + Evolution API entregam o status para a agência

### Dashboard role-aware (uma conta, três mundos)

O **RoleSwitcher** na sidebar permite alternar entre três papéis sem sair da conta:

| Papel | O que vê | Diferencial |
|-------|----------|-------------|
| CEO / Atendimento | Visão geral de projetos, contadores de status, atividade recente | Proativa — mostra o que está travado antes de perguntar |
| Criação | Peças com AI Score Badge, gate de envio, feedback visual | Protetora — bloqueia envio com score < 50 |
| Mídia / RTV | Painel de campanhas, claquete digital, export CSV e TXT | Operacional — elimina planilhas paralelas |

Ao trocar de papel, um banner âmbar fixo avisa "Visualizando como Criação — algumas ações estão desativadas". UX que comunica limitações sem infantilizar.

### AI Score Gate (o diferencial que protege o profissional)

Cada peça recebe um score 0–100 gerado pelo Claude (Haiku) no upload. No papel Criação:

- Score ≥ 80: "Pronto para aprovação" — botão de envio desbloqueado
- Score 50–79: alerta com lista de issues específicos ("Tipografia abaixo de 16px no mobile", "Contraste texto/fundo insuficiente")
- Score < 50: gate — o botão de envio fica bloqueado. Override possível com confirmação consciente

O efeito: a agência chega à conversa com o cliente já sabendo o que a IA sinalizou. Ou corrigiram (score alto) ou decidiram conscientemente que era aceitável (override). De qualquer forma, estão no controle da narrativa.

### Extração de briefing por IA

No modal de criação de projeto, o atendimento cola o texto bruto do WhatsApp ou e-mail do cliente. O Claude (Haiku) extrai automaticamente:

- Produto, verba, prazo, aprovador, assets necessários
- Score de completude 0–100
- Lista de informações faltando
- Resumo executivo

O ProjectCard exibe o score com badge âmbar se < 70, bloqueando o envio ao cliente enquanto o briefing estiver incompleto. Isso evita o retrabalho mais caro da agência: a peça feita com briefing errado.

### ClapperboardDigital (feature única no mercado)

Projetos do setor RTV/Mídia têm uma aba "Produção" com claquetes digitais:

- Todos os campos editáveis inline (click-to-edit)
- Campos ANCINE: CRT, CNPJ, Segmento, Produtora, SAP
- Versionamento (v1, v2, v3)
- Download PDF com um clique, gerado client-side
- Duplicar claquete para nova cena/take

Nenhuma outra ferramenta de aprovação criativa tem isso. É o motivo pelo qual Fabi nunca sai do Crivo.

### Diretório de Fornecedores

`/fornecedores` — CRM simplificado de fornecedores homologados da agência:
- Categorias: Fotografia, Vídeo, Motion, Áudio, Impressão
- Rating, badge "Verificado", badge "Parceiro Crivo"
- Filtro por categoria + busca por nome

---

## Decisões técnicas (e por quê)

**Por que link público sem autenticação?**
O maior atrito no processo de aprovação é pedir pro cliente criar uma conta. Em testes com agências, a taxa de abertura do link cai ~60% quando há uma tela de login antes. Token nanoid de 10 chars por peça oferece segurança adequada sem nenhuma informação sensível exposta.

**Por que Supabase Realtime em vez de polling?**
O status de aprovação precisa aparecer na dashboard da agência instantaneamente — é a razão de existir do produto. Polling a cada 5s gera latência perceptível e carga desnecessária. O Realtime subscription é feito no client component; o server component faz o fetch inicial sem latência de hidratação.

**Por que n8n para as notificações WhatsApp?**
A Evolution API (WhatsApp) tem quirks específicos de payload e instâncias. Isolar esse conhecimento num workflow n8n significa que, se o provider mudar, só o workflow muda — o app não sabe de nada. Os webhooks `crivo-notify` e `crivo-send-client` são contratos públicos estáveis.

**Por que Claude Haiku para o AI Score?**
Haiku tem latência < 1s em média para análise de imagem, compatível com upload em tempo real. O custo por análise é marginal o suficiente para incluir no free tier. O prompt é calibrado para issues específicos do mercado brasileiro (ANCINE safe zones, especificações de emissoras).

**Por que RoleSwitcher em vez de multi-tenant?**
Uma agência é uma única organização. Separar logins por papel criaria silos onde o CEO não consegue ver o que o criativo vê. O RoleSwitcher mantém um único contexto compartilhado com visões adaptadas — é como uma agência real funciona, onde o atendimento entra na sala da criação quando precisa.

**Estrutura de dados:**
```
projects → pieces → piece_versions → comments (com pin_x/pin_y)
                  ↘ approvals (decision, decided_by, decided_at, feedback)
```
`piece_versions` garante que nenhuma versão é sobrescrita — cada upload cria uma nova linha. `approvals` é imutável por design — uma aprovação nunca é editada, apenas superseded por uma nova decisão.

---

## Posicionamento competitivo

| Dimensão | ApproveThis | Ziflow | Frame.io | **Crivo** |
|----------|-------------|--------|----------|-----------|
| UI por papel | Não | Não | Não | **3 personas, um login, dashboards diferentes** |
| Gate de qualidade por IA | Não | Não | Não | **Bloqueia envio se score < 50** |
| Claquete / docs de broadcast | Não | Não | Parcial | **Inline, versionada, campos ANCINE, PDF** |
| Review do cliente | Link | Link | Link | **Link + dark mode + pin comments em coordenada exata** |
| Fit de mercado | US genérico | US genérico | Hollywood | **Operação de agência brasileira** |
| Diretório de fornecedores | Não | Não | Não | **CRM de fornecedores homologados integrado** |

O diferencial decisivo: Crivo tem um modelo mental de como agências brasileiras operam. Concorrentes tratam todos como "revisores genéricos". Crivo trata o atendimento, o criativo e o produtor de RTV como usuários fundamentalmente diferentes com necessidades fundamentalmente diferentes.

---

## Como explorar o demo

O app tem projetos criados. Siga esse roteiro para ver as principais funcionalidades:

**1. Briefing incompleto (gate de envio)**
Abra o projeto **Magazine Luiza — Black Friday**. O briefing está zerado — o ProjectCard mostra o alerta âmbar. Tente enviar ao cliente e veja o bloqueio consciente.

**2. Fluxo completo de aprovação**
Abra **Nubank — Lançamento NuPay**. Clique na peça "Key Visual Principal". Copie o link público e abra numa aba anônima — essa é a visão do cliente. Clique em qualquer ponto da imagem para deixar um comentário ancorado. Veja as duas versões no histórico.

**3. Projeto saudável**
Abra **iFood — Campanha Dia das Mães**. Briefing 94%, duas peças aprovadas, uma pendente. O estado ideal de um projeto no Crivo.

**4. Visão de Mídia (Fabi)**
No canto superior esquerdo, na sidebar, troque o role para **Mídia / RTV**. O dashboard vira um painel de campanhas com claquete digital e botões de export CSV e TXT.

**5. Extração de briefing por IA**
Crie um novo projeto. No segundo step, cole qualquer texto de briefing (inventado: "Campanha para lançamento do produto X. Verba: R$50.000. Prazo: 30/04. Aprovador: Carlos Silva."). Clique em "Analisar com IA" e veja os campos extraídos automaticamente com score de completude.

---

## Métricas que importam

| Métrica | Target | Lógica |
|---------|--------|--------|
| Ativação: % que envia peça ao cliente em 7 dias | > 60% | Tempo até primeiro valor |
| Tempo médio de ciclo de aprovação | < 24h | vs. 72h+ no WhatsApp |
| % de peças enviadas com ai_score ≥ 80 | crescente MoM | Cresce conforme criação aprende o gate |
| Agências com 3+ papéis ativos | > 50% | Indica adoção do time inteiro, não só um champion |
| Downloads de claquete PDF por user Mídia/mês | > 3 | Prova de valor para o papel menos óbvio |

---

## Stack

- **Next.js 14** (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- **Supabase** — PostgreSQL + Storage + Realtime subscriptions
- **n8n** — workflows de notificação WhatsApp (Evolution API) e email
- **Claude API** (Haiku) — AI Score de peças + extração de briefing
- **Vercel** — deploy com preview automático por PR
- **motion/react** — animações de cards, modais e confirmações

---

## Rodar localmente

```bash
git clone https://github.com/fernandoleal-oss/crivo
cd crivo
npm install
cp .env.local.example .env.local
# Preencha as credenciais do Supabase
npm run dev
```

Variáveis necessárias:
```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=       # extração de briefing e AI Score
N8N_WEBHOOK_URL=         # opcional, notificações WhatsApp
```

Migrations em `supabase/migrations/` — rode em ordem contra seu projeto Supabase.

---

*Crivo — Aprovação de peças sem WhatsApp, sem confusão.*
