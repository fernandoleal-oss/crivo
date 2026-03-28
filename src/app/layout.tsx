import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ConditionalNav } from '@/components/layout/ConditionalNav'
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
        <ConditionalNav />
        <main className="min-h-[calc(100vh-48px)]">
          {children}
        </main>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
