import { createBrowserClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://wturfdjywbpzassyuwun.supabase.co'
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind0dXJmZGp5d2JwemFzc3l1d3VuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwODk0MTYsImV4cCI6MjA3NDY2NTQxNn0.cAKbRbNUGcH-gbUSfMXzf6BIDNKsRhuWrenUd2ojguk'

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY)
}
