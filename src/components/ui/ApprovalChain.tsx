'use client'

interface ApprovalStep {
  role: string
  step_order: number
  decision: string
  decided_by: string
}

interface ApprovalChainProps {
  approvals: ApprovalStep[]
}

const ROLES = ['da', 'redator', 'dc', 'ecd'] as const
const ROLE_COLORS: Record<string, string> = {
  da: '#6d28d9',
  redator: '#f59e0b',
  dc: '#ec4899',
  ecd: '#10b981',
}

export function isFullyApprovedInternally(approvals: ApprovalStep[]): boolean {
  return ROLES.every((role) =>
    approvals.some(
      (a) => a.role.toLowerCase() === role && a.decision === 'approved'
    )
  )
}

export function ApprovalChain({ approvals }: ApprovalChainProps) {
  const approvalMap = new Map<string, ApprovalStep>()
  for (const a of approvals) {
    approvalMap.set(a.role.toLowerCase(), a)
  }

  function getStatus(index: number): 'approved' | 'rejected' | 'active' | 'locked' {
    const role = ROLES[index]
    const step = approvalMap.get(role)
    if (step) {
      return step.decision === 'approved' ? 'approved' : 'rejected'
    }
    const allPreviousApproved = ROLES.slice(0, index).every((r) => {
      const s = approvalMap.get(r)
      return s && s.decision === 'approved'
    })
    return allPreviousApproved ? 'active' : 'locked'
  }

  return (
    <div className="w-full">
      {/* Color accent bar */}
      <div className="grid grid-cols-4 gap-1 mb-1">
        {ROLES.map((role) => {
          const step = approvalMap.get(role)
          const isApproved = step?.decision === 'approved'
          return (
            <div
              key={role}
              className="h-1.5 rounded-full"
              style={{
                backgroundColor: ROLE_COLORS[role],
                opacity: isApproved ? 1 : 0.3,
              }}
            />
          )
        })}
      </div>

      {/* 4-column grid */}
      <div className="grid grid-cols-4 gap-1">
        {ROLES.map((role, i) => {
          const status = getStatus(i)
          const step = approvalMap.get(role)

          const bgClass =
            status === 'approved'
              ? 'bg-[#dcfce7]'
              : status === 'rejected'
                ? 'bg-[#fee2e2]'
                : status === 'active'
                  ? 'bg-[#fef3c7]'
                  : 'bg-[#f1f5f9]'

          const icon =
            status === 'approved'
              ? '✅'
              : status === 'rejected'
                ? '❌'
                : status === 'active'
                  ? '👁️'
                  : '🔒'

          const label =
            status === 'approved' || status === 'rejected'
              ? step?.decided_by ?? '—'
              : status === 'active'
                ? 'Aguardando'
                : '—'

          return (
            <div
              key={role}
              className={`${bgClass} rounded-lg py-2 text-center`}
            >
              <div className="text-base leading-none mb-1">{icon}</div>
              <div className="text-[9px] font-bold uppercase tracking-wide text-gray-500">
                {role}
              </div>
              <div className="text-[11px] font-semibold text-gray-700 truncate px-1">
                {label}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
