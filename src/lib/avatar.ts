/**
 * Returns a DiceBear avatar URL for a given name.
 * Uses "initials" style — consistent, professional, no external image needed.
 */
export function avatarUrl(name: string, size = 32): string {
  const encoded = encodeURIComponent(name.trim())
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encoded}&size=${size}&backgroundColor=6366f1,8b5cf6,f43f5e,16a34a,0ea5e9,f59e0b&fontFamily=Inter&bold=true`
}
