'use client'

import { usePathname } from 'next/navigation'

export function ConditionalNav() {
  const pathname = usePathname()

  // Hide navbar on review pages
  if (pathname.startsWith('/review/')) {
    return null
  }

  return (
    <nav className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
      <div className="flex items-center">
        <a href="/" className="font-bold text-lg tracking-tight text-indigo-400 hover:text-indigo-300 transition-colors">crivo</a>
        <span className="ml-3 text-xs text-slate-500 hidden sm:block">Aprovação de peças sem WhatsApp, sem confusão.</span>
      </div>
      <a
        href="/"
        className="text-xs text-slate-500 hover:text-slate-300 transition-colors hidden sm:block"
      >
        Dashboard
      </a>
    </nav>
  )
}
