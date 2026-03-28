import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Toaster } from 'sonner'
import { ConditionalNav } from '@/components/layout/ConditionalNav'
import { DarkSidebar } from '@/components/layout/DarkSidebar'
import { RoleProvider } from '@/lib/role-context'
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
      <body className={`${inter.className} text-slate-900`} style={{ backgroundColor: '#F5F3EF' }}>
        <RoleProvider>
          <DarkSidebar />
          <main className="ml-52 min-h-screen">
            {children}
          </main>
        </RoleProvider>
        <Toaster richColors position="top-right" />
      </body>
    </html>
  )
}
