import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { customAlphabet } from 'nanoid'
import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const VALID_FILE_TYPES = ['image/jpeg', 'image/png', 'application/pdf']
const MAX_FILE_SIZE = 10 * 1024 * 1024

const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10)

export function generateToken(): string {
  return nanoid()
}

export function formatRelativeTime(isoString: string): string {
  const date = new Date(isoString)
  const diffMs = Date.now() - date.getTime()
  if (diffMs < 60_000) return 'agora'
  return formatDistanceToNow(date, { locale: ptBR, addSuffix: true })
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function isValidFileType(mimeType: string): boolean {
  return VALID_FILE_TYPES.includes(mimeType)
}

export function isValidFileSize(bytes: number): boolean {
  return bytes <= MAX_FILE_SIZE
}

export function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    approved: 'Aprovado',
    revision_requested: 'Revisão',
  }
  return labels[status] ?? status
}

export function isPdf(fileType: string): boolean {
  return fileType === 'application/pdf'
}
