import type { ReactNode } from 'react'

interface IntegrationCardProps {
  name: string
  description: string
  icon: ReactNode
  status: 'active' | 'coming_soon'
  howItWorks?: string
  onRequest?: () => void
  requested?: boolean
}

export function IntegrationCard({ name, description, icon, status, howItWorks, onRequest, requested }: IntegrationCardProps) {
  return (
    <div className={`bg-white border rounded-xl p-5 flex items-start gap-4 transition-colors ${
      status === 'active' ? 'border-green-200' : 'border-slate-200'
    }`}>
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">{icon}</div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="font-semibold text-slate-900">{name}</h3>
          {status === 'active' ? (
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">✓ Ativo</span>
          ) : (
            <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-medium">Em breve</span>
          )}
        </div>
        <p className="text-sm text-slate-500 mt-1">{description}</p>
        {howItWorks && (
          <p className="text-xs text-slate-500 mt-2 bg-slate-50 rounded-lg px-3 py-2">
            <strong>Como funciona:</strong> {howItWorks}
          </p>
        )}
      </div>
      {status === 'coming_soon' && onRequest && (
        <button
          onClick={requested ? undefined : onRequest}
          disabled={requested}
          className={`flex-shrink-0 text-xs rounded-lg px-3 py-1.5 transition-colors ${
            requested
              ? 'bg-green-50 text-green-600 border border-green-200 cursor-default'
              : 'text-indigo-600 border border-indigo-200 hover:bg-indigo-50'
          }`}
        >
          {requested ? '✓ Solicitado' : 'Solicitar acesso'}
        </button>
      )}
    </div>
  )
}
