'use client'

import { useState } from 'react'
import { Target, CheckCircle2, ArrowRight, X } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface GuidedTourBannerProps {
  hasProjects: boolean
  hasPieces: boolean
  hasSentToClient: boolean
  hasApproval: boolean
}

const TOUR_STEPS = [
  { key: 'project', label: 'Criar projeto' },
  { key: 'piece', label: 'Subir peça' },
  { key: 'send', label: 'Enviar ao cliente' },
  { key: 'approval', label: 'Receber aprovação' },
]

export function GuidedTourBanner({ hasProjects, hasPieces, hasSentToClient, hasApproval }: GuidedTourBannerProps) {
  const [dismissed, setDismissed] = useState(false)

  if (dismissed || hasApproval) return null

  const steps = TOUR_STEPS.map(s => ({
    ...s,
    done:
      s.key === 'project' ? hasProjects :
      s.key === 'piece' ? hasPieces :
      s.key === 'send' ? hasSentToClient :
      hasApproval,
  }))

  const completedCount = steps.filter(s => s.done).length
  const progress = (completedCount / steps.length) * 100

  return (
    <div className="bg-white border border-indigo-200 rounded-xl p-4 mb-6">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={16} className="text-indigo-600" />
          <p className="text-sm font-semibold text-slate-800">Seu progresso no Crivo</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setDismissed(true)}
          className="h-auto p-1 text-slate-500 hover:text-slate-700"
        >
          <X size={14} />
        </Button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-slate-100 rounded-full mb-3 overflow-hidden">
        <div
          className="h-full bg-indigo-600 rounded-full transition-all duration-700"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {steps.map((step, i) => (
          <div
            key={step.key}
            className={`flex items-center gap-2 text-sm rounded-lg px-3 py-2 transition-colors ${
              step.done
                ? 'bg-green-50 text-green-700'
                : i === completedCount
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : 'bg-slate-50 text-slate-500'
            }`}
          >
            <span className="flex-shrink-0">
              {step.done
                ? <CheckCircle2 size={14} />
                : i === completedCount
                ? <ArrowRight size={14} />
                : <span className="text-xs">{i + 1}.</span>}
            </span>
            <span>{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
