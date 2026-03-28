import { avatarUrl } from '@/lib/avatar'
import { cn } from '@/lib/utils'

interface PersonAvatarProps {
  name: string
  size?: number
  className?: string
  title?: string
}

export function PersonAvatar({ name, size = 32, className, title }: PersonAvatarProps) {
  return (
    <img
      src={avatarUrl(name, size * 2)}
      alt={name}
      title={title ?? name}
      width={size}
      height={size}
      className={cn('rounded-full flex-shrink-0', className)}
      style={{ width: size, height: size }}
    />
  )
}

/** Stack of overlapping avatars (up to 4 + overflow count) */
export function AvatarStack({ names, size = 28 }: { names: string[]; size?: number }) {
  const visible = names.slice(0, 4)
  const overflow = names.length - visible.length
  return (
    <div className="flex items-center">
      {visible.map((name, i) => (
        <div key={name + i} style={{ marginLeft: i === 0 ? 0 : -6, zIndex: visible.length - i, position: 'relative' }}>
          <PersonAvatar name={name} size={size} className="ring-2 ring-white" />
        </div>
      ))}
      {overflow > 0 && (
        <div
          className="rounded-full bg-slate-200 text-slate-600 flex items-center justify-center text-[10px] font-bold ring-2 ring-white"
          style={{ width: size, height: size, marginLeft: -6, zIndex: 0, position: 'relative' }}
        >
          +{overflow}
        </div>
      )}
    </div>
  )
}
