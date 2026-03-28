'use client'

import { usePathname } from 'next/navigation'
import { useRole } from '@/lib/role-context'
import { RoleSwitcher } from '@/components/ui/RoleSwitcher'
import { LayoutDashboard, FolderOpen, Settings } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const USER_BY_ROLE = {
  ceo: { name: 'Desirre', initial: 'D', color: 'bg-indigo-500' },
  criacao: { name: 'Bruno', initial: 'B', color: 'bg-violet-500' },
  midia: { name: 'Fabi', initial: 'F', color: 'bg-orange-500' },
}

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/integrations', label: 'Integrações', icon: Settings },
]

export function DarkSidebar() {
  const pathname = usePathname()
  const { role, setRole } = useRole()

  if (pathname.startsWith('/review/')) return null

  const user = USER_BY_ROLE[role]

  return (
    <aside className="fixed top-0 left-0 h-screen w-52 bg-slate-900 flex flex-col z-50">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-slate-800">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <text x="1" y="13" fontFamily="sans-serif" fontWeight="700" fontSize="10" fill="white">C</text>
              <line x1="8" y1="6" x2="16" y2="6" stroke="white" strokeWidth="2" strokeLinecap="round"/>
              <line x1="8" y1="9" x2="15" y2="9" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              <line x1="8" y1="12" x2="14" y2="12" stroke="white" strokeWidth="1" strokeLinecap="round"/>
            </svg>
          </div>
          <span className="font-bold text-base text-white">Crivo</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider px-2 mb-2">Geral</p>
        {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors',
                active
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* User + Role Switcher */}
      <div className="px-3 py-4 border-t border-slate-800 space-y-3">
        <div className="flex items-center gap-3 px-2">
          <div className={cn('w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold flex-shrink-0', user.color)}>
            {user.initial}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user.name}</p>
            <p className="text-xs text-slate-500 truncate capitalize">{role}</p>
          </div>
        </div>
        <div className="px-1">
          <RoleSwitcher
            originalRole="ceo"
            currentRole={role}
            userName={user.name}
            userInitial={user.initial}
            onRoleChange={setRole}
          />
        </div>
      </div>
    </aside>
  )
}
