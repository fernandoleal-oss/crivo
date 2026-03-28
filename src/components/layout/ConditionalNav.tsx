'use client'

import { usePathname } from 'next/navigation'
import { useRole } from '@/lib/role-context'
import { RoleSwitcher, ViewAsBanner } from '@/components/ui/RoleSwitcher'
import { AnimatePresence } from 'motion/react'

const USER_BY_ROLE = {
  ceo: { name: 'Desirre', initial: 'D' },
  criacao: { name: 'Bruno', initial: 'B' },
  midia: { name: 'Fabi', initial: 'F' },
}

export function ConditionalNav() {
  const pathname = usePathname()
  const { role, setRole } = useRole()

  if (pathname.startsWith('/review/')) return null

  const user = USER_BY_ROLE[role]
  const isViewingAs = role !== 'ceo'

  return (
    <>
      <AnimatePresence>
        {isViewingAs && (
          <ViewAsBanner
            viewingAs={role}
            originalRole="ceo"
            onReset={() => setRole('ceo')}
          />
        )}
      </AnimatePresence>
      <nav className={`bg-slate-900 text-white px-6 py-3 flex items-center justify-between ${isViewingAs ? 'mt-10' : ''}`}>
        <div className="flex items-center">
          <a href="/" className="font-bold text-lg tracking-tight text-indigo-400 hover:text-indigo-300 transition-colors">crivo</a>
          <span className="ml-3 text-xs text-slate-500 hidden sm:block">Aprovação de peças sem WhatsApp, sem confusão.</span>
        </div>
        <RoleSwitcher
          originalRole="ceo"
          currentRole={role}
          userName={user.name}
          userInitial={user.initial}
          onRoleChange={setRole}
        />
      </nav>
    </>
  )
}
