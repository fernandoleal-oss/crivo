# Crivo — PM Brief
## Product Challenge Evaluation · March 2026

---

## Elevator Pitch

Crivo is the creative operations workspace built specifically for Brazilian advertising agencies — it replaces the WhatsApp chaos of creative approvals with a structured, role-aware platform where account managers see what's blocked, creatives get AI feedback before the client does, and media/RTV teams generate broadcast-compliant clapperboards in seconds. Unlike generic review tools such as Frame.io or Ziflow that bolt on approval workflows to asset storage, Crivo is organized around the three distinct jobs that happen inside every agency — and it surfaces exactly the right information to exactly the right person without requiring everyone to interpret the same messy feed.

---

## The 3 Personas: Jobs-to-be-Done

### Fernanda — CEO / Account Management
**Core job:** Know the status of every active project without asking anyone.
**JTBD:** "When a client calls me about their campaign, I want to answer without putting them on hold — so I need a live view of what's approved, what's late, and what's waiting on my team, without digging through WhatsApp threads."
**Surprise that earns loyalty:** Dashboard shows "3 peças aguardando cliente há mais de 48h" before she even has to ask. She becomes proactive instead of reactive.

### Bruno — Creative Director / Designer
**Core job:** Ship work that doesn't come back.
**JTBD:** "When I'm about to send a piece to the client, I want to know if there's an obvious problem — so I can fix it before the client sees it and loses confidence in our team."
**Surprise that earns loyalty:** AI score (0–100) with specific issues ("tipografia abaixo de 16px no mobile") appears before he sends. "Enviar para cliente" is gated at score < 50. He feels protected, not surveilled.

### Marcos — Media Buyer / RTV Producer
**Core job:** Get productions documented and broadcast-ready without fighting Word templates.
**JTBD:** "When I'm coordinating a TV production, I want a clapperboard that's always in the right version and downloadable as PDF — so I never show up on set with the wrong information."
**Surprise that earns loyalty:** Creates a broadcast-ready clapperboard in under 60 seconds, inline in the same project where the approval happened. No copy-paste. No Word. No email.

---

## Key Differentiators vs. Competitors

| Dimension | ApproveThis | Ziflow | Frame.io | **Crivo** |
|-----------|-------------|--------|----------|-----------|
| Role-aware UI | No | No | No | **3 personas, one login, different dashboards** |
| AI quality gate before client sees | No | No | No | **Blocks send if score < 50** |
| Clapperboard / broadcast docs | No | No | Partial | **Inline, versioned, ANCINE-compliant, PDF** |
| Client review | Link-based | Link-based | Link-based | **Link + dark mode + pin comments** |
| Market fit | US-generic | US-generic | Hollywood | **Brazilian agency ops** |
| Supplier directory | No | No | No | **Homologated vendor CRM built in** |

The decisive differentiator: Crivo has a mental model of how Brazilian agencies work. Competitors treat everyone as a generic "reviewer." Crivo treats the account manager, the creative, and the RTV producer as fundamentally different users with different needs.

---

## Surprise Utility Features ("Wow" Moments)

**1. AI Score Gate** — The animated radial badge on every piece card in Criação view gates the send at score < 50. Evaluators say: "They thought about the cost of a bad send, not just the workflow."

**2. RoleSwitcher** — One login, three worlds. The CEO can see what the creative sees. A demo reviewer gets role-contextual UX without reading documentation.

**3. ClapperboardDigital** — A fully inline, click-to-edit digital clapperboard with ANCINE fields, versioning, and PDF export. Nothing else in the market does this.

**4. Pin Comments on Dark Mode Review** — Client clicks anywhere on the image → numbered pin → agency sees coordinate 50%, 60%. Turns "the text is bad" into an actionable location.

**5. first_opened_at Tracking** — "Visualizado" appears the moment the client opens the link. Eliminates the most common passive-aggressive agency email: "Just checking if you had a chance to review..."

---

## Metrics That Prove This Is Working

**Activation:** % of new agencies that send a piece to a client within 7 days → target > 60%
**Engagement:** DAU/MAU → target > 0.4 (daily creative operations)
**Core value:** Median approval cycle time → target < 24h (vs. 72h+ on WhatsApp)
**Quality:** % of pieces sent with ai_score ≥ 80 → should increase MoM as creatives learn the gate
**Retention:** Agencies with 3+ active roles → indicates full team adoption, not just one champion
**Stickiness:** Clapperboard PDF downloads per active Mídia user/month → target > 3

---

## 3-Phase Roadmap

### Phase 1 — Replace the WhatsApp thread (Months 1–4)
Core piece lifecycle, RoleSwitcher, AIReviewScoreBadge, ClapperboardDigital, n8n webhooks, realtime Supabase, Fornecedores directory.
**Gate:** 5 paying agencies, median cycle time < 24h.

### Phase 2 — Make the team indispensable (Months 5–9)
Real auth, multi-user per agency, ANCINE fields on clapperboard (CRT, CNPJ, Segmento, SAP), AI score backed by real model (Claude Vision), Slack/Teams integration, mobile review, agency analytics dashboard.
**Gate:** 3+ roles active per agency, NPS > 45.

### Phase 3 — Become the agency OS (Months 10–18)
Multi-tenant, Figma/Adobe API, brief-to-piece AI generation, client portal (branded subdomain), Crivo-verified supplier network across agencies, CONAR guidelines check.
**Gate:** 50+ agencies, R$200k ARR.

---

## The Unexpected PM Insight

Most teams building creative review tools obsess over the reviewer experience — better annotation, richer comment threads, cleaner version history. Crivo's insight is the opposite: **the bottleneck is not the review, it's the send.**

The moment Bruno hesitates before clicking "Enviar para cliente" — that hesitation is where agency credibility is won or lost. The AI score gate doesn't just improve quality; it restructures the power dynamic. The agency arrives at the client conversation already knowing what the AI flagged. Either they fixed it (high score) or consciously decided it was acceptable (override with confirmation). Either way, they're in control of the narrative.

This is not a feature. It is a product philosophy: **protect the professional before they expose themselves to the client.** Every "wow" feature in Crivo flows from this principle — the score badge, the send gate, the first_opened_at tracking, the amber ViewAsBanner. Build the tool that makes agency people look good, and they will never leave.

---

*Crivo — Aprovação de peças sem WhatsApp, sem confusão.*
*Brief prepared March 2026.*
