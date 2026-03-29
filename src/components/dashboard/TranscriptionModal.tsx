'use client'

import { useState } from 'react'

interface TranscriptionModalProps {
  open: boolean
  onClose: () => void
  projectName: string
  clientName: string
  projectId: string
  onBriefingGenerated: (briefingData: any) => void
}

export default function TranscriptionModal({
  open,
  onClose,
  projectName,
  clientName,
  projectId,
  onBriefingGenerated,
}: TranscriptionModalProps) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!open) return null

  async function handleSubmit() {
    if (!text.trim()) return
    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/transcription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, projectName, clientName }),
      })

      if (!res.ok) {
        throw new Error('Erro ao processar transcrição')
      }

      const data = await res.json()
      onBriefingGenerated(data)
      setText('')
      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        <div className="mb-1 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Gerar Briefing com IA
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Fechar"
          >
            &times;
          </button>
        </div>

        <p className="mb-4 text-sm text-gray-500">
          Cole a transcrição da call abaixo
        </p>

        <textarea
          rows={8}
          className="mb-4 w-full rounded-lg border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          placeholder="Cole aqui a transcrição da reunião com o cliente..."
          value={text}
          onChange={(e) => setText(e.target.value)}
          disabled={loading}
        />

        {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

        <button
          onClick={handleSubmit}
          disabled={loading || !text.trim()}
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50"
        >
          {loading ? (
            <>
              <svg
                className="h-4 w-4 animate-spin"
                viewBox="0 0 24 24"
                fill="none"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analisando transcrição...
            </>
          ) : (
            'Gerar Briefing'
          )}
        </button>
      </div>
    </div>
  )
}
