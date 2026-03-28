'use client'

import { useState } from 'react'
import { Sparkles, AlertTriangle, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import type { BriefingData } from '@/lib/types'

interface BriefingTabProps {
  value: BriefingData | null
  onChange: (data: BriefingData | null) => void
}

export function BriefingTab({ value, onChange }: BriefingTabProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleAnalyze() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/ai/analyze-brief-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      })
      if (!res.ok) {
        const { error: msg } = await res.json()
        setError(msg ?? 'Erro ao analisar.')
        return
      }
      const data: BriefingData = await res.json()
      onChange(data)
    } catch {
      setError('Não foi possível conectar à IA.')
    } finally {
      setLoading(false)
    }
  }

  const score = value?.confianca_analise ?? 0
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
  const scoreBg = score >= 80 ? 'bg-green-50 border-green-200' : score >= 50 ? 'bg-amber-50 border-amber-200' : 'bg-red-50 border-red-200'

  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="brief-text">Cole o briefing do cliente</Label>
        <p className="text-xs text-slate-500 mb-1">
          Pode ser um e-mail, mensagem de WhatsApp ou resumo da call. A IA extrai as informações automaticamente.
        </p>
        <Textarea
          id="brief-text"
          value={text}
          onChange={e => setText(e.target.value)}
          placeholder="Ex: Olá, precisamos de uma campanha para o lançamento do produto X. Verba aprovada: R$80.000. Prazo: 15/05..."
          rows={5}
          className="resize-none"
        />
      </div>
      <Button type="button" onClick={handleAnalyze} disabled={loading || !text.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700">
        <Sparkles className="h-4 w-4 mr-2" />
        {loading ? 'Analisando...' : 'Analisar com IA'}
      </Button>
      {error && (
        <p className="text-sm text-red-600 flex items-center gap-1">
          <AlertTriangle className="h-4 w-4" /> {error}
        </p>
      )}
      {value && (
        <div className={`rounded-lg border p-4 space-y-3 ${scoreBg}`}>
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Resultado da análise</span>
            <span className={`text-lg font-bold ${scoreColor}`}>{score}% completo</span>
          </div>
          <p className="text-sm text-slate-600 italic">"{value.resumo_executivo}"</p>
          <div className="grid grid-cols-2 gap-2 text-sm">
            {[
              { label: 'Produto', val: value.produto },
              { label: 'Verba', val: value.verba },
              { label: 'Prazo', val: value.prazo },
              { label: 'Aprovador', val: value.aprovador },
            ].map(({ label, val }) => (
              <div key={label} className="flex items-start gap-1">
                {val ? <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />}
                <span>
                  <span className="font-medium text-slate-600">{label}:</span>{' '}
                  <span className="text-slate-800">{val ?? <em className="text-amber-600">não identificado</em>}</span>
                </span>
              </div>
            ))}
          </div>
          {value.informacoes_faltando.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Ainda falta:</p>
              <ul className="space-y-0.5">
                {value.informacoes_faltando.map((item, i) => (
                  <li key={i} className="text-sm text-amber-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
