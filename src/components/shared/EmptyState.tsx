interface EmptyStateProps {
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ title, description, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="text-center py-16 px-4">
      <div className="text-4xl mb-3">📁</div>
      <h3 className="font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm mb-4 max-w-xs mx-auto">{description}</p>
      {actionLabel && onAction && (
        <button
          onClick={onAction}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  )
}
