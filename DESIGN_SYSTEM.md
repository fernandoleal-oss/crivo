# Crivo — Design System v1.0
> Gerado por Claude Code em 2026-03-27. Stack: Next.js + Tailwind + shadcn/ui + lucide-react.

---

## 1. Sistema de Cores

### tailwind.config.ts — extend.colors
```ts
brand: {
  DEFAULT: '#4F46E5',  // indigo-600
  light:   '#6366F1',  // indigo-500
  dark:    '#4338CA',  // indigo-700
},
```

### Setores — src/lib/sector-config.ts
```ts
export const SECTOR_CONFIG = {
  criacao:     { label: 'Criacao',     badge: 'bg-violet-100 text-violet-700 border border-violet-200',      accent: 'border-t-4 border-t-violet-500'   },
  atendimento: { label: 'Atendimento', badge: 'bg-sky-100 text-sky-700 border border-sky-200',               accent: 'border-t-4 border-t-sky-500'      },
  rtv:         { label: 'RTV',         badge: 'bg-amber-100 text-amber-700 border border-amber-200',         accent: 'border-t-4 border-t-amber-500'    },
  midia:       { label: 'Midia',       badge: 'bg-emerald-100 text-emerald-700 border border-emerald-200',   accent: 'border-t-4 border-t-emerald-500'  },
  geral:       { label: 'Geral',       badge: 'bg-slate-100 text-slate-600 border border-slate-200',         accent: 'border-t-4 border-t-slate-400'    },
} as const
```

### Deadline — src/lib/deadline-config.ts
```ts
export const DEADLINE_STYLES = {
  on_track:  { container: 'bg-blue-50 text-blue-700 border border-blue-200',  dot: 'bg-blue-500'  },
  due_today: { container: 'bg-lime-50 text-lime-700 border border-lime-200',  dot: 'bg-lime-500'  },
  overdue:   { container: 'bg-red-50  text-red-700  border border-red-200',   dot: 'bg-red-500'   },
}
```

### Status de Peca
```ts
export const PIECE_STATUS_STYLES = {
  approved:           'bg-emerald-50 text-emerald-700 border border-emerald-200',
  revision_requested: 'bg-amber-50   text-amber-700   border border-amber-200',
  pending:            'bg-slate-100  text-slate-500   border border-slate-200',
}
```

---

## 2. Animacoes — tailwind.config.ts extend

### Keyframes
```ts
keyframes: {
  'fade-up':  { '0%': { opacity:'0', transform:'translateY(12px)' }, '100%': { opacity:'1', transform:'translateY(0)' } },
  'fade-in':  { '0%': { opacity:'0' }, '100%': { opacity:'1' } },
  'scale-in': { '0%': { opacity:'0', transform:'scale(0.96)' }, '100%': { opacity:'1', transform:'scale(1)' } },
  'shimmer':  { '0%': { backgroundPosition:'-200% 0' }, '100%': { backgroundPosition:'200% 0' } },
  'pulse-ring': {
    '0%, 100%': { boxShadow:'0 0 0 0px rgba(251,191,36,0.4)' },
    '50%':      { boxShadow:'0 0 0 6px rgba(251,191,36,0)'   },
  },
  'progress-indeterminate': {
    '0%':   { left:'-40%', width:'40%' },
    '60%':  { left:'100%', width:'40%' },
    '100%': { left:'100%', width:'0'   },
  },
},
animation: {
  'fade-up':    'fade-up 0.35s ease-out both',
  'fade-in':    'fade-in 0.25s ease-out both',
  'scale-in':   'scale-in 0.2s ease-out both',
  'shimmer':    'shimmer 1.6s linear infinite',
  'pulse-ring': 'pulse-ring 2s cubic-bezier(0.4,0,0.6,1) infinite',
  'progress':   'progress-indeterminate 1.4s ease-in-out infinite',
},
```

### Cascata de entrada de cards
```tsx
<div className="animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
  <ProjectCard ... />
</div>
```

### Hover em cards
```
transition-all duration-200 ease-out hover:-translate-y-0.5 hover:shadow-md hover:shadow-slate-200/80
```

### Abertura de modal (globals.css)
```css
[data-radix-dialog-content] {
  animation: scale-in 0.18s ease-out;
  transform-origin: center center;
}
```

### Transicao entre paginas (next-view-transitions + globals.css)
```css
::view-transition-old(root) { animation: fade-in 0.18s ease-in reverse; }
::view-transition-new(root) { animation: fade-up 0.28s ease-out;        }
```

### Skeleton base
```tsx
const skeleton = 'rounded-md bg-slate-200 bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-shimmer'
```

### Badge pendente stale (> 48h)
```tsx
const isStale = differenceInHours(new Date(), new Date(piece.updated_at)) > 48
// Adicionar ao badge: isStale && 'animate-pulse-ring'
// Trocar dot para: isStale ? 'bg-amber-400' : 'bg-slate-400'
```

### UploadProgress
```tsx
// Indeterminado (progress === 0):
<div className="relative h-1 w-full overflow-hidden rounded-full bg-slate-200">
  <div className="absolute h-full w-2/5 rounded-full bg-indigo-500 animate-progress" />
</div>
// Determinado:
<div className="h-1 w-full rounded-full bg-slate-200">
  <div className="h-full rounded-full bg-indigo-500 transition-[width] duration-300 ease-out" style={{ width:`${progress}%` }} />
</div>
```

---

## 3. StatusDeadlineBadge — src/components/ui/StatusDeadlineBadge.tsx
```tsx
import { Clock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { differenceInCalendarDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

type Variant = 'on_track' | 'due_today' | 'overdue'

const CONFIG: Record<Variant, { container: string; dot: string; Icon: any; label: (d:Date)=>string }> = {
  on_track:  { container:'bg-blue-50 text-blue-700 border border-blue-200', dot:'bg-blue-500', Icon:Clock,        label:(d)=>`Entrega ${format(d,"d 'de' MMM",{locale:ptBR})}` },
  due_today: { container:'bg-lime-50 text-lime-700 border border-lime-200', dot:'bg-lime-500', Icon:CheckCircle2, label:()=>'Vence hoje' },
  overdue:   { container:'bg-red-50  text-red-700  border border-red-200',  dot:'bg-red-500',  Icon:AlertCircle,  label:(d)=>`Atrasado ${format(d,"d 'de' MMM",{locale:ptBR})}` },
}

export function StatusDeadlineBadge({ deadlineAt, className }: { deadlineAt:string; className?:string }) {
  const date = new Date(deadlineAt)
  const diff = differenceInCalendarDays(date, new Date())
  const variant: Variant = diff > 1 ? 'on_track' : diff === 0 ? 'due_today' : 'overdue'
  const { container, dot, Icon, label } = CONFIG[variant]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium', container, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full shrink-0', dot)} />
      <Icon className="h-3 w-3 shrink-0" strokeWidth={2.5} />
      {label(date)}
    </span>
  )
}
```

---

## 4. ToolBadge — src/components/ui/ToolBadge.tsx
```tsx
import { cn } from '@/lib/utils'

const TOOL_CONFIG = {
  figma:         { label:'Figma',         bg:'bg-[#F5F0FF]', text:'text-[#7C3AED]', dot:'bg-[#A259FF]' },
  photoshop:     { label:'Photoshop',     bg:'bg-[#EAF4FF]', text:'text-[#0059B3]', dot:'bg-[#31A8FF]' },
  after_effects: { label:'After Effects', bg:'bg-[#EEE5FF]', text:'text-[#4A0099]', dot:'bg-[#9999FF]' },
  illustrator:   { label:'Illustrator',   bg:'bg-[#FFF6E5]', text:'text-[#7C4A00]', dot:'bg-[#FF9A00]' },
  premiere:      { label:'Premiere',      bg:'bg-[#F5E5FF]', text:'text-[#5C0099]', dot:'bg-[#E040FB]' },
  indesign:      { label:'InDesign',      bg:'bg-[#FFE5F0]', text:'text-[#99003D]', dot:'bg-[#FF3366]' },
  canva:         { label:'Canva',         bg:'bg-[#E5F9FF]', text:'text-[#00727F]', dot:'bg-[#00C4CC]' },
} as const

type Tool = keyof typeof TOOL_CONFIG

export function ToolBadge({ tool, className }: { tool:Tool; className?:string }) {
  const { label, bg, text, dot } = TOOL_CONFIG[tool]
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium border border-black/5', bg, text, className)}>
      <span className={cn('h-2 w-2 rounded-full shrink-0', dot)} />
      {label}
    </span>
  )
}

// Uso: <div className="flex flex-wrap gap-1.5">{tools.map(t => <ToolBadge key={t} tool={t} />)}</div>
```

---

## 5. Breadcrumb — src/components/ui/Breadcrumb.tsx
```tsx
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Crumb { label: string; href?: string }

export function Breadcrumb({ crumbs, className }: { crumbs:Crumb[]; className?:string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn('flex items-center gap-1 text-sm', className)}>
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1
        return (
          <span key={i} className="flex items-center gap-1">
            {crumb.href && !isLast
              ? <Link href={crumb.href} className="text-slate-400 hover:text-indigo-600 transition-colors duration-150 font-normal">{crumb.label}</Link>
              : <span className={isLast ? 'text-slate-900 font-medium' : 'text-slate-400 font-normal'}>{crumb.label}</span>
            }
            {!isLast && <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" strokeWidth={2} />}
          </span>
        )
      })}
    </nav>
  )
}
```

### Wrapper de pagina padrao
```tsx
<div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-6">
  <Breadcrumb crumbs={...} />
  {/* conteudo */}
</div>
```

### Uso por rota
```tsx
// /               → crumbs={[{ label:'Projetos' }]}
// /project/[id]  → crumbs={[{ label:'Projetos', href:'/' }, { label:project.name }]}
// /review/[token]→ crumbs={[{ label:'Projetos', href:'/' }, { label:project.name, href:`/project/${id}` }, { label:piece.title }]}
```

---

## 6. Contextual Help System

### ContextualHelp (tooltip inline) — src/components/ui/ContextualHelp.tsx
```tsx
import { Info } from 'lucide-react'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

type UserType = 'agency' | 'client'

export function ContextualHelp({ agency, client, userType, side='top' }: {
  agency: string; client: string; userType: UserType; side?: 'top'|'right'|'bottom'|'left'
}) {
  const content = userType === 'agency' ? agency : client
  const color = userType === 'agency'
    ? 'text-indigo-400 hover:text-indigo-600'
    : 'text-sky-400 hover:text-sky-600'
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button type="button" className={cn('inline-flex transition-colors duration-150', color)} aria-label="Ajuda">
            <Info className="h-4 w-4" strokeWidth={2} />
          </button>
        </TooltipTrigger>
        <TooltipContent side={side} sideOffset={6} className="max-w-[240px] text-xs leading-relaxed bg-slate-900 text-slate-50 border-0 shadow-xl">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
```

### HelpBanner (onboarding) — src/components/ui/HelpBanner.tsx
```tsx
import { X, Lightbulb } from 'lucide-react'
import { cn } from '@/lib/utils'

type UserType = 'agency' | 'client'

const STYLES = {
  agency: { wrapper:'bg-indigo-50 border border-indigo-200 text-indigo-800', icon:'text-indigo-500' },
  client: { wrapper:'bg-sky-50    border border-sky-200    text-sky-800',    icon:'text-sky-500'    },
}

export function HelpBanner({ userType, message, onDismiss, className }: {
  userType:UserType; message:string; onDismiss?:()=>void; className?:string
}) {
  const { wrapper, icon } = STYLES[userType]
  return (
    <div className={cn('flex items-start gap-3 rounded-xl px-4 py-3 text-sm animate-fade-in', wrapper, className)}>
      <Lightbulb className={cn('h-4 w-4 mt-0.5 shrink-0', icon)} strokeWidth={2} />
      <p className="flex-1 leading-relaxed">{message}</p>
      {onDismiss && (
        <button type="button" onClick={onDismiss} className="shrink-0 opacity-50 hover:opacity-100 transition-opacity" aria-label="Fechar dica">
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  )
}
```

### Mensagens — src/lib/help-messages.ts
```ts
export const HELP = {
  dashboard: {
    agency: 'Organize seus projetos por setor. Use as abas para filtrar por Criacao, Atendimento, RTV, Midia ou Geral.',
    client: 'Aqui voce ve todos os projetos que estao aguardando sua revisao ou aprovacao.',
  },
  piece_list: {
    agency: 'Cada peca tem um status. Envie para o cliente pelo botao "Enviar para cliente" ao lado de cada peca.',
    client: 'Clique em uma peca para abrir o revisor. Voce pode fixar comentarios direto na imagem ou aprovar.',
  },
  piece_viewer: {
    agency: 'Acompanhe as versoes no painel direito. Comentarios internos nao aparecem para o cliente.',
    client: 'Clique em qualquer ponto da imagem para fixar um comentario naquele local. Depois use os botoes abaixo para aprovar ou pedir revisao.',
  },
  version_compare: {
    agency: 'Compare duas versoes lado a lado para identificar o que mudou entre iteracoes.',
    client: 'Veja o que mudou da versao anterior para a atual antes de dar sua decisao.',
  },
  send_to_client: {
    agency: 'O cliente recebera um link seguro com acesso apenas a essa peca. Voce pode reenviar quantas vezes precisar.',
    client: null,
  },
} satisfies Record<string, { agency: string; client: string | null }>
```
