import { describe, it, expect } from 'vitest'
import { formatRelativeTime, generateToken, formatFileSize, isValidFileType } from '@/lib/utils'

describe('formatRelativeTime', () => {
  it('returns "agora" for recent dates', () => {
    const now = new Date()
    expect(formatRelativeTime(now.toISOString())).toBe('agora')
  })
  it('returns relative time for older dates', () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000)
    const result = formatRelativeTime(twoHoursAgo.toISOString())
    expect(result).toContain('hora')
  })
})
describe('generateToken', () => {
  it('generates a 10-char alphanumeric token', () => {
    const token = generateToken()
    expect(token).toHaveLength(10)
    expect(token).toMatch(/^[a-zA-Z0-9]+$/)
  })
  it('generates unique tokens', () => {
    const tokens = Array.from({ length: 100 }, () => generateToken())
    expect(new Set(tokens).size).toBe(100)
  })
})
describe('formatFileSize', () => {
  it('formats bytes correctly', () => {
    expect(formatFileSize(1024)).toBe('1.0 KB')
    expect(formatFileSize(1048576)).toBe('1.0 MB')
    expect(formatFileSize(500)).toBe('500 B')
  })
})
describe('isValidFileType', () => {
  it('accepts valid file types', () => {
    expect(isValidFileType('image/jpeg')).toBe(true)
    expect(isValidFileType('image/png')).toBe(true)
    expect(isValidFileType('application/pdf')).toBe(true)
  })
  it('rejects invalid file types', () => {
    expect(isValidFileType('video/mp4')).toBe(false)
    expect(isValidFileType('text/plain')).toBe(false)
  })
})
