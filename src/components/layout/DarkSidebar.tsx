'use client'

import { usePathname } from 'next/navigation'
import { useRole } from '@/lib/role-context'
import type { AppRole } from '@/components/ui/RoleSwitcher'
import { LayoutDashboard, Settings, Briefcase, Palette, Radio } from 'lucide-react'
import Link from 'next/link'
import { cn } from '@/lib/utils'

const PERSONAS: { role: AppRole; name: string; initial: string; color: string; icon: any; label: string }[] = [
  { role: 'ceo',     name: 'Desirre', initial: 'D', color: 'bg-indigo-500', icon: Briefcase, label: 'CEO / Atendimento' },
  { role: 'criacao', name: 'Bruno',   initial: 'B', color: 'bg-violet-500', icon: Palette,   label: 'Criação' },
  { role: 'midia',   name: 'Fabi',    initial: 'F', color: 'bg-orange-500', icon: Radio,     label: 'Mídia / RTV' },
]

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/integrations', label: 'Integrações', icon: Settings },
]

export function DarkSidebar() {
  const pathname = usePathname()
  const { role, setRole } = useRole()

  if (pathname.startsWith('/review/')) return null

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
                active ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* Personas inline selector */}
      <div className="px-3 py-4 border-t border-slate-800">
        <p className="text-slate-500 text-[10px] font-semibold uppercase tracking-wider px-2 mb-2">Visualizar como</p>
        <div className="space-y-1">
          {PERSONAS.map(({ role: r, name, initial, color, icon: Icon, label }) => {
            const active = role === r
            return (
              <button
                key={r}
                onClick={() => setRole(r)}
                className={cn(
                  'w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-colors text-left',
                  active ? 'bg-slate-800' : 'hover:bg-slate-800/60'
                )}
              >
                <div className={cn('w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0', color)}>
                  {initial}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={cn('text-xs font-semibold truncate', active ? 'text-white' : 'text-slate-400')}>
                    {name}
                  </p>
                  <p className="text-[10px] text-slate-600 truncate">{label}</p>
                </div>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 flex-shrink-0" />}
              </button>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
