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
      <nav className={`bg-white border-b border-stone-200 px-6 py-3 flex items-center justify-between ${isViewingAs ? 'mt-10' : ''}`}>
        <a href="/" className="flex items-center gap-2.5 group">
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0">
            <rect width="32" height="32" rx="10" fill="#4F46E5"/>
            <text x="7" y="21" fontFamily="sans-serif" fontWeight="700" fontSize="17" fill="white">C</text>
            <line x1="15" y1="12" x2="25" y2="12" stroke="white" strokeWidth="3" strokeLinecap="round"/>
            <line x1="15" y1="16" x2="24" y2="16" stroke="white" strokeWidth="2" strokeLinecap="round"/>
            <line x1="15" y1="20" x2="23" y2="20" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
          <div className="flex flex-col">
            <span className="font-bold text-lg leading-none text-slate-900 group-hover:text-indigo-600 transition-colors">Crivo</span>
            <span className="text-xs text-slate-400 italic hidden sm:block leading-none mt-0.5">Aprovação criativa sem caos.</span>
          </div>
        </a>
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
