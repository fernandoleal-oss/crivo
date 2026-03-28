interface UploadProgressProps {
  progress: number // 0–100
  fileName: string
  error?: string
  onRetry?: () => void
}

export function UploadProgress({ progress, fileName, error, onRetry }: UploadProgressProps) {
  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-2">
        <p className="text-red-600 font-medium text-sm">❌ Falha no upload</p>
        <p className="text-red-500 text-xs mt-1">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-2 text-xs bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700"
          >
            Tentar novamente
          </button>
        )}
      </div>
    )
  }

  if (progress === 0) return null

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mt-2">
      <div className="flex justify-between items-center mb-1">
        <span className="text-sm text-slate-600 truncate max-w-[200px]">{fileName}</span>
        <span className="text-sm text-indigo-600 font-semibold">{progress}%</span>
      </div>
      <div className="bg-slate-200 rounded-full h-1.5">
        <div
          className="bg-indigo-500 h-1.5 rounded-full transition-all duration-200"
          style={{ width: `${progress}%` }}
        />
      </div>
      {progress < 100 && (
        <p className="text-xs text-slate-500 mt-1">Enviando para o servidor...</p>
      )}
    </div>
  )
}
