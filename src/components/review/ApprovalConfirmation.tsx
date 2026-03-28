'use client'
import { motion } from 'motion/react'
import { CheckCircle, RotateCcw } from 'lucide-react'
import type { ApprovalDecision } from '@/lib/types'

interface ApprovalConfirmationProps {
  decision: ApprovalDecision
}

export function ApprovalConfirmation({ decision }: ApprovalConfirmationProps) {
  const isApproval = decision === 'approved'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 340, damping: 24 }}
      className={`rounded-xl p-5 text-center border ${
        isApproval
          ? 'bg-green-50 border-green-200'
          : 'bg-amber-50 border-amber-200'
      }`}
    >
      <motion.div
        className="flex justify-center mb-2"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', stiffness: 500, damping: 18, delay: 0.1 }}
      >
        {isApproval
          ? <CheckCircle className="w-8 h-8 text-green-600" />
          : <RotateCcw className="w-8 h-8 text-amber-500" />
        }
      </motion.div>
      <p className={`font-bold text-base ${isApproval ? 'text-green-700' : 'text-amber-700'}`}>
        {isApproval ? 'Aprovado!' : 'Revisão solicitada!'}
      </p>
      <p className={`text-sm mt-1 ${isApproval ? 'text-green-600' : 'text-amber-600'}`}>
        A agência foi notificada.
      </p>
      <p className="text-xs text-slate-500 mt-2">Você ainda pode deixar comentários.</p>
    </motion.div>
  )
}
