'use client'
import { isPdf } from '@/lib/utils'

interface PieceViewerProps { fileUrl: string; fileType: string; children?: React.ReactNode }

export function PieceViewer({ fileUrl, fileType, children }: PieceViewerProps) {
  if (isPdf(fileType)) {
    return (
      <div className="relative w-full bg-slate-100 rounded-lg overflow-hidden flex items-center justify-center" style={{ minHeight: 400 }}>
        <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-600 underline text-sm">Abrir PDF</a>
        {children}
      </div>
    )
  }
  return (
    <div className="relative w-full bg-slate-900 rounded-lg overflow-hidden flex items-center justify-center">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={fileUrl} alt="Peça criativa" className="max-w-full max-h-[70vh] object-contain" draggable={false} />
      <div className="absolute inset-0">{children}</div>
    </div>
  )
}
