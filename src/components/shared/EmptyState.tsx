interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  icon?: string
  tip?: string
}

export function EmptyState({ title, description, actionLabel, onAction, icon = '📁', tip }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-4xl mb-3">{icon}</div>
      <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm mb-4 max-w-sm mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-indigo-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-indigo-700 transition-colors shadow-sm"
        >
          {actionLabel}
        </button>
      )}
      {tip && (
        <div className="mt-6 bg-slate-50 border border-slate-200 rounded-lg p-3 max-w-sm mx-auto">
          <p className="text-xs text-slate-500">💡 <strong>Dica:</strong> {tip}</p>
        </div>
      )}
    </div>
  )
}
