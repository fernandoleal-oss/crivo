# Crivo

> "Aprova essa versão?" — enviado no grupo do WhatsApp, junto com 47 outras mensagens, 3 áudios e uma foto de gato.

Toda agência conhece essa cena. O cliente aprova a versão errada porque não achou a certa no histórico. A revisão chega sem feedback estruturado. Ninguém sabe exatamente quem aprovou o quê, e quando. O processo de aprovação criativa em agências acontece no caos — e o caos gera retrabalho.

**Crivo** resolve isso com um link.

---

## A solução

A criação sobe a peça, gera um link público e envia pro cliente. O cliente abre no celular — sem instalar nada, sem criar conta — vê a peça em tamanho real, deixa comentários ancorados na posição exata da imagem, e aprova ou solicita revisão. A agência recebe notificação no WhatsApp em tempo real.

O fluxo completo:

```
Criação sobe peça → gera link → envia pro cliente
Cliente abre no celular → comenta na imagem → aprova
Agência recebe no WhatsApp → fecha o loop
```

**→ [Abrir o app](https://crivo-neon.vercel.app)** — há projetos de demo criados, explore sem precisar cadastrar nada.

Funcionalidades do core:
- Upload de peças com versionamento — cada revisão é uma nova versão, nunca se perde o histórico
- Comentários ancorados por posição — clique em qualquer ponto da imagem para comentar
- Comparação lado a lado de versões — o cliente vê exatamente o que mudou
- Link público sem autenticação — o cliente não precisa criar conta
- Aprovação com registro — quem aprovou, quando, com qual feedback
- Notificação via WhatsApp — n8n + Evolution API entregam o status em tempo real

---

## Como explorar o demo

O app já tem projetos criados. Siga esse roteiro para ver as principais funcionalidades:

**1. Briefing incompleto (gate de envio)**
Abra o projeto **Magazine Luiza — Black Friday**. O briefing está zerado — o ProjectCard mostra o alerta âmbar. Tente enviar ao cliente e veja o bloqueio consciente.

**2. Fluxo completo de aprovação**
Abra o projeto **Nubank — Lançamento NuPay**. Clique na peça "Key Visual Principal". Copie o link público e abra numa aba anônima — essa é a visão do cliente. Clique em qualquer ponto da imagem para deixar um comentário ancorado. Veja as duas versões no histórico (a v1 teve revisão solicitada).

**3. Projeto saudável**
Abra **iFood — Campanha Dia das Mães**. Briefing 94%, duas peças aprovadas, uma pendente. O estado ideal de um projeto no Crivo.

**4. Visão de Mídia (Fabi)**
No canto superior direito, troque o role para **Mídia / RTV**. O dashboard vira um painel de campanhas com claquete digital e botões de export CSV e TXT.

**5. Extração de briefing por IA**
Crie um novo projeto. No segundo step, cole qualquer texto de briefing (pode ser inventado: "Precisamos de uma campanha para o lançamento do produto X. Verba: R$50.000. Prazo: 30/04."). Clique em "Analisar com IA" e veja os campos extraídos automaticamente.

---

## E fui além: personas reais de agência

Enquanto construía, percebi que o problema de aprovação é só a camada mais visível. Cada papel dentro de uma agência tem sua própria fricção diária.

Mapeei três personas reais e construí uma visão dedicada para cada uma no app:

**Desirre — Atendimento**
Recebe briefings de clientes por WhatsApp, e-mail e áudio. Passa minutos verificando manualmente se tem produto, verba, prazo, aprovador. Agora ela cola o texto bruto no Crivo e a IA (Claude) extrai os campos estruturados automaticamente — com um score de completude que bloqueia o envio ao cliente se o briefing estiver incompleto.

**Fabi — Mídia / RTV**
Preenche as mesmas informações de campanha em três planilhas diferentes (cliente, veículo, controle interno). Agora ela tem um painel de campanhas com claquete digital e dois exports automáticos: planilha de veiculação (CSV) e spec técnica para emissoras (TXT) — gerados client-side, sem backend.

**Bruno — Criação**
Visão focada em peças, revisões pendentes e feedback não resolvido.

O **RoleSwitcher** na navbar permite alternar entre as três visões — experimente no app.

---

## Decisões técnicas

**Por que link público sem autenticação?**
O maior atrito no processo de aprovação é pedir pro cliente criar uma conta. Remover esse passo aumenta a taxa de resposta e elimina o suporte de "não consigo logar". Segurança adequada: tokens aleatórios (nanoid, 10 chars) por peça, sem informação sensível exposta.

**Por que Supabase Realtime em vez de polling?**
O status de aprovação precisa aparecer instantaneamente para a agência. Polling a cada 5s funciona, mas Realtime é mais elegante e não gera carga desnecessária no banco. A subscription é feita no client component — o server component faz o fetch inicial sem latência.

**Por que n8n para o WhatsApp?**
A integração com WhatsApp via Evolution API tem quirks específicos (formato de payload, instâncias). n8n isola esse conhecimento num workflow dedicado — se o provider mudar, só o workflow muda, o app não sabe.

**Estrutura de dados:**
```
projects → pieces → piece_versions → comments
                  ↘ approvals
```
Cada `piece` tem um `public_token` que identifica o link público. `piece_versions` guarda o histórico de uploads. `approvals` registra decisão, timestamp e feedback por versão.

**Stack:**
- Next.js 14 (App Router) + TypeScript + Tailwind CSS + shadcn/ui
- Supabase (PostgreSQL + Storage + Realtime)
- n8n webhook → WhatsApp (Evolution API)
- Claude API (Haiku) para extração de briefing
- Vercel (deploy)

---

## Rodar localmente

```bash
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
ANTHROPIC_API_KEY=          # para extração de briefing
N8N_WEBHOOK_URL=            # opcional, para notificações WhatsApp
```

Migrations em `supabase/migrations/` — rode em ordem contra seu projeto Supabase.
