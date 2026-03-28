'use client'
import { motion } from 'motion/react'
import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import type { ProjectWithCounts } from '@/lib/types'
import { SECTORS } from './SectorTabs'

interface ProjectCardProps { project: ProjectWithCounts }

export function ProjectCard({ project }: ProjectCardProps) {
  const pieces = project.pieces ?? []
  const approved = pieces.filter(p => p.status === 'approved').length
  const revision = pieces.filter(p => p.status === 'revision_requested').length
  const pending = pieces.filter(p => p.status === 'pending').length
  const sectorInfo = SECTORS.find(s => s.value === project.sector)
  const briefingIncompleto = project.briefing_score !== null && project.briefing_score !== undefined && project.briefing_score < 80

  return (
    <Link href={`/project/${project.id}`}>
      <motion.div
        whileHover={{ y: -3, boxShadow: '0 12px 32px rgba(0,0,0,0.08)' }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="bg-white border border-stone-100 rounded-2xl p-5 cursor-pointer shadow-sm"
      >
        <div className="flex items-start justify-between gap-2 mb-1">
          <h3 className="font-semibold text-slate-900 leading-tight">{project.name}</h3>
          {briefingIncompleto && (
            <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
              ⚠ Briefing {project.briefing_score}%
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500 mb-1">{project.client_name}</p>
        {sectorInfo && sectorInfo.value !== 'all' && (
          <span className="text-xs text-slate-500 flex items-center gap-1 mb-2"><sectorInfo.Icon size={12} /> {sectorInfo.label}</span>
        )}
        <div className="flex gap-2 flex-wrap">
          {approved > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{approved} aprovada{approved > 1 ? 's' : ''}</span>}
          {revision > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{revision} revisão</span>}
          {pending > 0 && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{pending} pendente{pending > 1 ? 's' : ''}</span>}
          {pieces.length === 0 && <span className="text-xs text-slate-500">Sem peças</span>}
        </div>
        <p className="text-xs text-slate-500 mt-3">{formatRelativeTime(project.created_at)}</p>
      </motion.div>
    </Link>
  )
}
