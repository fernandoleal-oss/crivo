# Crivo

**Plataforma de aprovação de peças criativas para agências de publicidade.**

Substitui o WhatsApp como ferramenta de aprovação com um fluxo rastreável, sequencial e inteligente.

**[Demo ao vivo](https://c-rivo.lovable.app)** | **[Video demo (52s)](https://drive.google.com/drive/folders/14Wvx6_aoPJB17ihbmBZtd-KzEoDh81Pp?usp=sharing)**

---

## O problema

Agências brasileiras aprovam peças criativas por WhatsApp. Versões se perdem, feedbacks somem, prazos estouram e ninguém sabe quem aprovou o quê.

O gargalo não é a revisão — é o envio. O momento em que o criativo hesita antes de enviar ao cliente é onde a credibilidade da agência é ganha ou perdida.

---

## O que o Crivo faz

### Approval Chain — 4 etapas sequenciais

```
DA → Redator → DC → ECD → Atendimento envia ao cliente → Cliente aprova
```

Cada peça passa pelos 4 aprovadores internos na ordem. Se um reprova, volta pra ajuste com feedback. Quando os 4 aprovam, o Atendimento escolhe o momento de enviar ao cliente.

### Duas personas, dois mundos

| Persona | Papel | O que vê |
|---------|-------|----------|
| **Desirre** | Atendimento | Dashboard completo: KPIs, briefing score, prazos urgentes, peças prontas para envio, cliente aguardando resposta |
| **Fabiana** | Gerente de Mídia | Plano de mídia: ficha-mestre por campanha (preenche uma vez, replica pra todos os veículos), export CSV |

### AI Score

IA analisa cada peça (contraste, tipografia, CTA, acessibilidade) e atribui score 0–100. Score abaixo de 50 bloqueia envio ao cliente.

### Briefing com IA

Atendimento cola a transcrição de uma call. A IA extrai produto, verba, prazo, aprovador, assets necessários, informações faltantes e score de confiança.

### Tempo real

Feed de atividades via Supabase Realtime. Google Calendar sincronizado. Notificações push (peça aprovada, prazo próximo, revisão solicitada).

### Review público do cliente

Link sem login. Cliente abre, vê a peça, comenta (com pin na imagem), aprova ou pede revisão. Histórico de versões preservado.

### Diretório de fornecedores

CRM de fornecedores homologados com rating, categorias, badge de verificação e contato.

---

## Dados do demo

O banco tem **11 campanhas reais** com clientes brasileiros:

| Cliente | Campanha | Briefing Score |
|---------|----------|---------------|
| iFood | Dia das Mães 2026 | 94/100 |
| Nubank | Lançamento NuPay | 61/100 |
| Magazine Luiza | Black Friday Digital | sem briefing |
| Itaú Unibanco | Renegocia Fácil | 88/100 |
| Ambev / Brahma | Copa do Mundo 2026 | 72/100 |
| Natura | Dia dos Namorados | 89/100 |
| Havaianas | Verão 2027 | 76/100 |
| Bradesco / Next | Conta Gen Z | 82/100 |
| 99 | Carnaval 2027 | sem briefing |
| Nestlé | KitKat Gold | 95/100 |
| Vivo | 5G para Todos | 67/100 |

25 peças, 28 versões, 33 aprovações em diferentes estágios, 13 comentários e 10 fornecedores.

---

## Stack

| Camada | Tecnologia |
|--------|-----------|
| Frontend | Lovable (Vite + React + Tailwind + shadcn/ui) |
| Backend | Supabase (PostgreSQL + Realtime + RLS) |
| IA | Claude API (AI Score + briefing extraction) |
| Vídeo demo | Remotion (React → MP4 programático) |
| Dev tool | Claude Code |

---

## Como explorar

1. Abra o [demo](https://p-vivo.lovable.app)
2. Você entra como **Desirre (Atendimento)** — explore KPIs, projetos, peças
3. Troque para **Fabiana (Gerente de Mídia)** na sidebar — veja o plano de mídia
4. Clique em qualquer projeto para ver detalhes, briefing IA e peças
5. Clique em uma peça para ver a imagem, comentários e approval chain

---

## Decisões de produto

**Por que link público sem login?** A taxa de abertura cai ~60% quando há tela de login. Token único por peça, sem dado sensível.

**Por que 2 personas e não 1 dashboard genérico?** Atendimento e Mídia têm necessidades opostas. Uma quer visão geral e controle. A outra quer preencher dados uma vez e exportar.

**Por que approval chain sequencial?** Garante que nenhuma peça chegue ao cliente sem passar por todos os filtros internos. Protege o profissional.

**Por que AI Score?** O criativo sabe antes de enviar se a peça tem problemas técnicos. Errar antes do cliente ver é barato; errar depois, caro.

---

*Construído em 48h com Lovable + Claude Code + Supabase.*

*Fernando Leal — Março 2026*
