import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Crivo — Aprovação de Peças Criativas',
  description: 'Fluxo limpo e rastreável para aprovação de peças entre agências e clientes. Sem WhatsApp, sem confusão.',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.className} bg-slate-50 text-slate-900`}>
        <nav className="bg-slate-900 text-white px-6 py-3 flex items-center justify-between">
          <div className="flex items-center">
            <a href="/" className="font-bold text-lg tracking-tight text-indigo-400 hover:text-indigo-300 transition-colors">Crivo</a>
            <span className="ml-3 text-xs text-slate-500 hidden sm:block">Aprovação de peças sem WhatsApp, sem confusão.</span>
          </div>
          <a
            href="/"
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors hidden sm:block"
          >
            Dashboard
          </a>
        </nav>
        <main className="min-h-[calc(100vh-48px)]">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
