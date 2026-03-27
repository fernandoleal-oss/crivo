import Link from 'next/link'
import { formatRelativeTime } from '@/lib/utils'
import type { ProjectWithCounts } from '@/lib/types'

interface ProjectCardProps { project: ProjectWithCounts }

export function ProjectCard({ project }: ProjectCardProps) {
  const pieces = project.pieces ?? []
  const approved = pieces.filter(p => p.status === 'approved').length
  const revision = pieces.filter(p => p.status === 'revision_requested').length
  const pending = pieces.filter(p => p.status === 'pending').length

  return (
    <Link href={`/project/${project.id}`}>
      <div className="bg-white border border-slate-200 rounded-lg p-4 hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer">
        <h3 className="font-semibold text-slate-900 leading-tight mb-1">{project.name}</h3>
        <p className="text-sm text-slate-500 mb-3">{project.client_name}</p>
        <div className="flex gap-2 flex-wrap">
          {approved > 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{approved} aprovada{approved > 1 ? 's' : ''}</span>}
          {revision > 0 && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">{revision} revisão</span>}
          {pending > 0 && <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full">{pending} pendente{pending > 1 ? 's' : ''}</span>}
          {pieces.length === 0 && <span className="text-xs text-slate-400">Sem peças</span>}
        </div>
        <p className="text-xs text-slate-400 mt-3">{formatRelativeTime(project.created_at)}</p>
      </div>
    </Link>
  )
}
