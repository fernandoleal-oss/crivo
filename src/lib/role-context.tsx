'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import type { AppRole } from '@/components/ui/RoleSwitcher'

interface RoleContextValue {
  role: AppRole
  setRole: (r: AppRole) => void
}

const RoleContext = createContext<RoleContextValue>({
  role: 'ceo',
  setRole: () => {},
})

export function RoleProvider({ children }: { children: ReactNode }) {
  const [role, setRoleState] = useState<AppRole>('ceo')

  useEffect(() => {
    const saved = localStorage.getItem('crivo_role') as AppRole | null
    if (saved && ['ceo', 'criacao', 'midia'].includes(saved)) {
      setRoleState(saved)
    }
  }, [])

  function setRole(r: AppRole) {
    setRoleState(r)
    localStorage.setItem('crivo_role', r)
  }

  return <RoleContext.Provider value={{ role, setRole }}>{children}</RoleContext.Provider>
}

export function useRole() {
  return useContext(RoleContext)
}
