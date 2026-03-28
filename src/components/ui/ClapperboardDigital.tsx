'use client'

import { useRef, useState } from 'react'
import { Download, FileImage } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ClapperboardData {
  producao: string
  cliente: string
  produto: string
  titulo: string
  diretor: string
  dop: string
  producaoExec: string
  data: string
  local: string
  cena: string
  take: string
  obs: string
  produtoraLogo?: string
  produtoraNome?: string
}

const DEFAULT_DATA: ClapperboardData = {
  producao: 'Natura Plant Launch',
  cliente: 'Natura S.A.',
  produto: 'Linha Plant',
  titulo: 'VT 30s "Jardim Urbano"',
  diretor: 'Ricardo Almeida',
  dop: 'Ana Costa',
  producaoExec: 'Marcos Silva',
  data: '15/04/2026',
  local: 'Estúdio Z, São Paulo',
  cena: '04',
  take: '02',
  obs: 'Cena com fumaça — verificar ventilação',
  produtoraNome: 'CRIVO STUDIO',
}

interface EditableFieldProps {
  value: string
  onChange: (v: string) => void
  className?: string
  multiline?: boolean
}

function EditableField({ value, onChange, className, multiline }: EditableFieldProps) {
  if (multiline) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={2}
        className={cn(
          'w-full resize-none bg-transparent focus:outline-none focus:ring-0',
          'border-b border-transparent hover:border-slate-300 focus:border-slate-400',
          'transition-colors duration-150',
          className,
        )}
      />
    )
  }
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'w-full bg-transparent focus:outline-none focus:ring-0',
        'border-b border-transparent hover:border-slate-300 focus:border-slate-400',
        'transition-colors duration-150',
        className,
      )}
    />
  )
}

interface ClapperboardDigitalProps {
  initialData?: Partial<ClapperboardData>
  onExportPDF?: (data: ClapperboardData) => void
  onExportPNG?: (data: ClapperboardData) => void
  className?: string
}

export function ClapperboardDigital({
  initialData,
  onExportPDF,
  onExportPNG,
  className,
}: ClapperboardDigitalProps) {
  const [data, setData] = useState<ClapperboardData>({
    ...DEFAULT_DATA,
    ...initialData,
  })
  const boardRef = useRef<HTMLDivElement>(null)

  function set(field: keyof ClapperboardData) {
    return (value: string) => setData((d) => ({ ...d, [field]: value }))
  }

  const cellLabel = 'text-[10px] font-bold uppercase tracking-widest text-slate-500 print:text-[8px]'
  const cellValue = 'text-[13px] font-medium text-slate-900 print:text-[11px]'

  return (
    <div className={cn('flex flex-col items-center gap-4', className)}>
      {/* Action buttons */}
      <div className="flex gap-2 self-end print:hidden">
        <button
          onClick={() => onExportPNG?.(data)}
          className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
        >
          <FileImage className="h-3.5 w-3.5" />
          Exportar PNG
        </button>
        <button
          onClick={() => onExportPDF?.(data)}
          className="flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 transition-colors"
        >
          <Download className="h-3.5 w-3.5" />
          Exportar PDF
        </button>
      </div>

      {/* Board */}
      <div
        ref={boardRef}
        className="w-full max-w-2xl overflow-hidden rounded-xl border-2 border-slate-900 bg-white shadow-2xl shadow-slate-300/40 print:rounded-none print:shadow-none print:border"
      >
        {/* ── Header ────────────────────────────────── */}
        <div className="flex items-center justify-between border-b-2 border-slate-900 bg-slate-900 px-5 py-3">
          {/* Crivo wordmark */}
          <span className="font-mono text-xl font-black uppercase tracking-widest text-white">
            CRIVO
          </span>

          {/* Clapperboard stripe decoration */}
          <div className="flex h-6 overflow-hidden rounded">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className={cn(
                  'w-5',
                  i % 2 === 0 ? 'bg-white' : 'bg-slate-900 border border-white',
                )}
              />
            ))}
          </div>

          {/* Produtora */}
          <div className="text-right">
            <EditableField
              value={data.produtoraNome ?? ''}
              onChange={set('produtoraNome')}
              className="text-right text-[11px] font-bold uppercase tracking-widest text-slate-300"
            />
          </div>
        </div>

        {/* ── Section 1: Produção/Projeto ───────────── */}
        <div className="grid grid-cols-2 border-b border-slate-200">
          <Section label="PRODUÇÃO">
            <EditableField value={data.producao} onChange={set('producao')} className={cellValue} />
          </Section>
          <Section label="CLIENTE" left>
            <EditableField value={data.cliente} onChange={set('cliente')} className={cellValue} />
          </Section>
          <Section label="PRODUTO">
            <EditableField value={data.produto} onChange={set('produto')} className={cellValue} />
          </Section>
          <Section label="TÍTULO" left>
            <EditableField value={data.titulo} onChange={set('titulo')} className={cellValue} />
          </Section>
        </div>

        {/* ── Section 2: Equipe ─────────────────────── */}
        <div className="grid grid-cols-2 border-b border-slate-200">
          <Section label="DIRETOR">
            <EditableField value={data.diretor} onChange={set('diretor')} className={cellValue} />
          </Section>
          <Section label="D.O.P." left>
            <EditableField value={data.dop} onChange={set('dop')} className={cellValue} />
          </Section>
          <Section label="PRODUÇÃO EXEC." className="col-span-2 border-r-0">
            <EditableField value={data.producaoExec} onChange={set('producaoExec')} className={cellValue} />
          </Section>
        </div>

        {/* ── Section 3: Logística + Cena/Take ─────── */}
        <div className="grid grid-cols-2 border-b border-slate-200">
          <Section label="DATA">
            <EditableField value={data.data} onChange={set('data')} className={cellValue} />
          </Section>
          <Section label="LOCAL" left>
            <EditableField value={data.local} onChange={set('local')} className={cellValue} />
          </Section>
          {/* Cena and Take as large boxes */}
          <div className="flex flex-col items-center justify-center border-r border-slate-200 py-4">
            <span className={cellLabel}>CENA</span>
            <EditableField
              value={data.cena}
              onChange={set('cena')}
              className="text-center text-4xl font-black text-slate-900 w-20"
            />
          </div>
          <div className="flex flex-col items-center justify-center py-4">
            <span className={cellLabel}>TAKE</span>
            <EditableField
              value={data.take}
              onChange={set('take')}
              className="text-center text-4xl font-black text-slate-900 w-20"
            />
          </div>
        </div>

        {/* ── OBS ───────────────────────────────────── */}
        <div className="bg-slate-50 px-5 py-3">
          <span className={cn(cellLabel, 'block mb-1')}>OBS</span>
          <EditableField
            value={data.obs}
            onChange={set('obs')}
            className="text-[13px] text-slate-700 w-full"
            multiline
          />
        </div>

        {/* ── Footer ────────────────────────────────── */}
        <div className="border-t border-slate-200 bg-white px-5 py-2 text-center">
          <span className="text-[10px] uppercase tracking-widest text-slate-400">
            Gerado por Crivo · Documento de produção
          </span>
        </div>
      </div>
    </div>
  )
}

/* ── Internal helper ──────────────────────────────────────────────── */

function Section({
  label,
  children,
  left,
  className,
}: {
  label: string
  children: React.ReactNode
  left?: boolean
  className?: string
}) {
  return (
    <div
      className={cn(
        'border-r border-slate-200 px-5 py-3 last:border-r-0',
        left && 'border-r-0',
        className,
      )}
    >
      <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-0.5">
        {label}
      </span>
      {children}
    </div>
  )
}
