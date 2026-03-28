# Crivo — Design Review
**Reviewed:** 2026-03-28
**Reviewer role:** Senior product designer, Brazilian adtech context
**Screens reviewed:** Login, CEO Dashboard, Project Detail, Piece Expanded, Review Page (client), Fornecedores, Criação role dashboard, Bruno/Criação view, Black Friday project (Criação), Marcos/Mídia produção tab, Marcos dashboard, Claquete card

---

## 1. What's Working Well

### Login screen — the headline earns its place
"Aprovação de peças sem WhatsApp." is a perfect product headline: specific pain, no jargon, immediate. The left-right split (value prop left / form right) on the dark navy background is clean and confident. The three checkmark bullet points below the headline reinforce benefits at exactly the right moment before the user logs in. The indigo CTA "Entrar no demo" has strong contrast and clear hierarchy. This screen could ship to investors tomorrow.

### Project card thumbnails in grid view (Project Detail screen)
The card grid with real image thumbnails for each peça (Banner Instagram, Post Feed, Story) is the strongest visual moment in the app. The status badges — green "Aprovado", yellow "Revisão", gray "Pendente" — sit at just the right size and position (top-right corner of each card). The subtle dark overlay on cards makes text legible without destroying the image. This is exactly how a creative approval tool should feel.

### Role-based context banner (Marcos/Mídia dashboard)
The amber warning strip "Visualizando como Mídia / RTV — algumas ações estão desativadas" is a small but brilliant piece of UX. It tells users exactly what mode they're in and what limitations apply. Most tools bury this. Crivo surfaces it at the top. This is mature product thinking.

### Fornecedores directory
The avatar initials + category label + star rating layout for each supplier card is readable and appropriately dense. The "Verificado" badge on Studio B1 and Frame Motion in teal/green is a strong trust signal. The tab filter row (Todos / Fotografia / Vídeo / Motion / Áudio / Impressão) is exactly the right interaction model for this page.

### Review page (client-facing, dark mode)
The dark mode on the client review URL is the right call — it puts all attention on the creative asset. The three-step instruction banner at the top ("1. Visualize a imagem abaixo → 2. Clique para comentar → 3. Aprove ou peça ajuste") is genuinely useful onboarding in context. The "Aprovado" green + "Pedir Revisão" outline button pairing is clear and decisive.

### Claquete card (Black Friday 2026, Produção tab)
The claquete as a structured data card with two-column layout, PDF download and duplicate actions is a strong differentiator. No other approval SaaS has a broadcast-ready claquete built in. The typography hierarchy (field labels in gray, values in white) is clean. This is Crivo's most unique feature.

---

## 2. Critical Fixes — Ranked by Impact

### #1 — The review page comment panel has no visual weight (Review screen)
**Impact: Very High.** The right panel (comment input, Comentários list) is the core interaction on the most important screen in the product — the one the client sees. Right now it's a flat dark box with zero personality. There's no separation between the image area and the panel, no depth, no sense that this is a "live conversation space." The two Carlos Mendes comments lack avatars that are visually distinct, and the comment timestamp contrast is too low to read easily.

**Fix:**
```css
/* Panel: add glass border and subtle background */
.review-comment-panel {
  background: rgba(15, 15, 30, 0.85);
  backdrop-filter: blur(16px);
  border-left: 1px solid rgba(99, 102, 241, 0.2); /* indigo-500/20 */
  box-shadow: -8px 0 32px rgba(0, 0, 0, 0.4);
}

/* Comment bubbles: distinguish author vs client */
.comment-item--agency { border-left: 2px solid #6366f1; } /* indigo */
.comment-item--client { border-left: 2px solid #10b981; } /* emerald */
```

Tailwind equivalent: `bg-slate-900/85 backdrop-blur-lg border-l border-indigo-500/20 shadow-[-8px_0_32px_rgba(0,0,0,.4)]`

### #2 — Stat cards in the dashboard are visually identical — status meaning is lost (CEO Dashboard)
**Impact: High.** The four metric cards (Projetos ativos, Aguardando cliente, Aprovados, Revisões pendentes) all use the same white-icon-on-dark-card treatment. "Revisões pendentes: 2" is an urgent state — it should look urgent. Currently a user's eye slides over all four equally.

**Fix:** Tint the "Revisões pendentes" card with `bg-amber-950/40 border border-amber-500/30` and use `text-amber-400` for the number. Apply `bg-emerald-950/40 border border-emerald-500/30 text-emerald-400` to "Aprovados". Keep neutral for the other two. This takes 30 seconds and makes the dashboard scannable in under 2 seconds.

### #3 — Project cards have no hover state (Project Detail grid)
**Impact: High.** The piece cards (Banner, Post Feed, Story) are the primary interactive element on the project detail page, but they have no visible hover affordance. Users cannot tell if they're clickable until they click. This is especially harmful on the "Email Marketing — Header" card on the Black Friday screen, which appears broken (no thumbnail, just placeholder text).

**Fix:**
```css
.piece-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(99, 102, 241, 0.2);
  border-color: rgba(99, 102, 241, 0.4);
}
/* transition: transform 150ms ease, box-shadow 150ms ease */
```

Tailwind: `hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.2)] hover:border-indigo-500/40 transition-all duration-150`

### #4 — The "Dica da semana" sidebar widget competes with primary content (Criação dashboard)
**Impact: Medium.** On the Criação role dashboard, a "Dica da semana" card about contrast ratios sits at the same visual weight as the project list. It's useful information but not task-critical. It draws the eye away from pending work (the amber warning "4 peças com atenção antes de enviar ao cliente" is far more important but visually quieter).

**Fix:** Reduce the dica card to `opacity-60` by default, `hover:opacity-100 transition-opacity`. Give the amber alert strip `border-l-4 border-amber-400 bg-amber-950/50 font-medium` so it reads as urgent.

### #5 — The Claquete card typography is undersized on a low-density screen (Produção tab)
**Impact: Medium.** The claquete's field labels (PRODUÇÃO, CLIENTE, TÍTULO, etc.) are rendered at what appears to be ~10-11px in uppercase — below the comfortable reading threshold for dense data. On a large monitor this is fine, but at 1280px it becomes strained. The "Baixar PDF" and "Duplicar" buttons at the bottom have no icon to reinforce their action.

**Fix:** Set field labels to `text-xs` (12px) minimum with `tracking-wider`. Add `<FileDown />` before "Baixar PDF" and `<Copy />` before "Duplicar" using Lucide icons already in the shadcn stack.

---

## 3. Quick Wins — 5 Micro-Improvements (1 Lovable prompt each)

1. **Status badge pulse animation** — The "Aguardando cliente" and "Revisão" badges should have a subtle `animate-pulse` on the dot indicator to signal "needs action." Static badges don't demand attention.

2. **Empty thumbnail placeholder** — The "Email Marketing — Header" card shows a gray box with text. Replace with a branded empty state: indigo gradient + document icon + "Preview não disponível" in small text. Currently it looks broken.

3. **Avatar initials color diversity in Fornecedores** — All avatars use the same indigo/purple hue family. Studio B1, Frame Motion, Voxa Audio should each get a distinct but harmonious hue (indigo, violet, emerald, amber, rose, cyan) derived from the first letter, so the directory has visual rhythm.

4. **"Nova Peça" button icon** — The "+ Nova Peça" CTA is text-only. Adding a `<Plus />` icon with `mr-1.5` makes it more immediately scannable, especially when the button appears twice (project detail + Black Friday view).

5. **Breadcrumb separator upgrade** — "Dashboard > Campanha Janeiro 2026" uses the plain ">" character. Swap to a Lucide `<ChevronRight className="w-3.5 h-3.5 text-slate-500" />` component for visual consistency with the rest of the shadcn system.

---

## 4. The "Encher os Olhos" Moment

**The review page at dark mode, transformed into a cinematic approval experience.**

Right now the client review page (`/review/tok-banner-ems`) is good but not memorable. It's dark, it has the asset, it has buttons. It could be the screen that makes an agency principal say "preciso disso" the moment they see a demo.

Here is the one change that would make it unforgettable:

**Glassmorphism comment panel + AIReviewScoreBadge + micro-celebration on approval.**

Specifically:

1. The right panel becomes a true glass panel: `backdrop-blur-xl bg-white/5 border border-white/10 shadow-2xl` — it appears to float over the dark background, not sit inside it. The asset on the left bleeds edge-to-edge behind it.

2. When the client clicks "Aprovar", instead of a silent state change: the button does a brief scale-up (`scale-110` → `scale-100` over 300ms), a confetti burst fires (3-5 indigo/emerald particles upward, CSS keyframe only, no library), and the status badge at the top transitions from neutral to "Aprovado" with a green glow pulse (`shadow-[0_0_12px_rgba(16,185,129,0.6)]`).

3. Add an `AIReviewScoreBadge` in the top-right of the asset area — a small pill showing "IA: Alta complexidade visual · 3 versões" in slate-700/indigo text. It doesn't need to be functional in v1 — it just signals intelligence and premium positioning.

The combined effect: a review page that feels like a premium SaaS product, not a shared Google Drive link. This is the screen the client screenshots and sends to their team. That virality loop is worth more than any feature.

---

## 5. Lovable Prompts — Ready to Paste

### Prompt 1 — Review page glass panel
```
On the client review page (/review/[slug]), update the right-side comment panel to use glassmorphism styling:
- Background: bg-slate-900/80 with backdrop-blur-xl
- Left border: border-l border-indigo-500/20
- Box shadow: shadow-[-8px_0_32px_rgba(0,0,0,0.5)]
- Each comment item: add a 2px left border — indigo-500 for agency comments, emerald-500 for client comments
- The "Aprovar" button on click: add a scale animation (scale-110 → scale-100 over 200ms) and trigger a brief CSS confetti effect (5 particles in indigo and emerald that rise and fade over 600ms using keyframes)
Keep all existing functionality. Dark mode only on this page.
```

### Prompt 2 — Dashboard stat cards with status tinting
```
On the CEO/agency dashboard, update the four metric stat cards to communicate urgency through color:
- "Revisões pendentes": bg-amber-950/40 border border-amber-500/30, number in text-amber-400, icon in text-amber-500
- "Aprovados": bg-emerald-950/40 border border-emerald-500/30, number in text-emerald-400, icon in text-emerald-500
- "Aguardando cliente": add a pulsing dot indicator (w-2 h-2 rounded-full bg-yellow-400 animate-pulse) next to the count
- "Projetos ativos": keep neutral slate styling
All cards retain the same size, padding, and layout. Only colors change.
```

### Prompt 3 — Piece card hover states
```
On the project detail page (piece grid), add hover interaction to each piece card:
- On hover: translateY(-2px), box-shadow: 0 8px 24px rgba(99,102,241,0.2), border-color: rgba(99,102,241,0.4)
- Transition: all 150ms ease
- Tailwind classes to add: hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(99,102,241,0.2)] hover:border-indigo-500/40 transition-all duration-150
Also: for piece cards with no preview thumbnail (broken/empty state), replace the blank gray area with a centered layout: indigo-900/50 background + a FileImage icon (Lucide, w-8 h-8 text-indigo-400) + text "Preview não disponível" in text-xs text-slate-500.
```

### Prompt 4 — Fornecedores avatar color diversity
```
On the Fornecedores page, update the supplier avatar initials to use distinct background colors per supplier, derived deterministically from the supplier name (first char code % color palette length).
Use this palette of 6 Tailwind bg colors: bg-indigo-600, bg-violet-600, bg-emerald-600, bg-amber-600, bg-rose-600, bg-cyan-700.
Keep all avatars the same size (w-10 h-10) and keep white text initials.
Also: add Lucide icons to the action buttons at bottom of each supplier card — Phone icon before "Ver contato" and ExternalLink icon before any URL link.
```

### Prompt 5 — Claquete card polish
```
On the Produção tab claquete card, make these improvements:
1. Field labels (PRODUÇÃO, CLIENTE, TÍTULO, etc.): increase to text-xs (12px minimum) with tracking-wider uppercase — currently they're too small to read comfortably
2. "Baixar PDF" button: add a FileDown icon (Lucide) with mr-1.5 before the text
3. "Duplicar" button: add a Copy icon (Lucide) with mr-1.5 before the text
4. Add a thin indigo-600/30 top border to the claquete card header section to visually separate the card title "CLAQUETE" from the metadata grid
5. The card counter badge (top right, showing "4f" or similar): style as a small pill with bg-indigo-600/20 text-indigo-300 text-xs px-2 py-0.5 rounded-full
```

---

## Summary

The login screen and client review page are Crivo's two strongest screens — the headline copy is sharp and the dark mode review UX has the right instinct. The critical gap is that the dashboard's metric cards all look the same regardless of urgency, and the review page comment panel (the most important interaction in the product) lacks the visual polish that would make it feel premium. The single highest-leverage investment is turning the client approval moment — the confetti, the glass panel, the status glow — into a micro-celebration that clients remember and share.
