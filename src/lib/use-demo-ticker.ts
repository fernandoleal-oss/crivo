'use client'

import { useEffect, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { DEMO_POOL, type DemoCampaign } from './demo-campaigns'

const INTERVAL_MS = 20 * 60 * 1000 // 20 minutes
const STORAGE_KEY = 'crivo_demo_inserted'

function getInserted(): string[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}
function markInserted(id: string) {
  const list = getInserted()
  list.push(id)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

function resolveDeadline(offset: string): string {
  const days = parseInt(offset.replace(/[^0-9-]/g, ''), 10) || 7
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

async function insertCampaign(campaign: DemoCampaign) {
  const supabase = createClient()
  const now = new Date()

  // 1. Project
  const { error: pErr } = await supabase.from('projects').upsert({
    id: campaign.project.id,
    name: campaign.project.name,
    client_name: campaign.project.client_name,
    sector: campaign.project.sector,
    briefing_score: campaign.project.briefing_score,
    briefing_data: campaign.project.briefing_data,
    created_at: now.toISOString(),
  }, { onConflict: 'id' })
  if (pErr) { console.error('Demo ticker: project insert error', pErr); return false }

  // 2. Pieces
  for (const piece of campaign.pieces) {
    await supabase.from('pieces').upsert({
      id: piece.id,
      project_id: campaign.project.id,
      title: piece.title,
      description: piece.description,
      status: piece.status,
      public_token: piece.public_token,
      deadline: resolveDeadline(piece.deadline),
      ai_score: piece.ai_score,
      ai_issues: piece.ai_issues,
      internal_status: piece.internal_status,
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
    }, { onConflict: 'id' })
  }

  // 3. Versions
  for (const v of campaign.versions) {
    await supabase.from('piece_versions').upsert({
      id: v.id,
      piece_id: v.piece_id,
      version_number: v.version_number,
      file_url: v.file_url,
      file_type: v.file_type,
      uploaded_at: now.toISOString(),
    }, { onConflict: 'id' })
  }

  // 4. Approvals
  for (const a of campaign.approvals) {
    const decidedAt = new Date(now.getTime() - a.offset_hours * 3600000)
    await supabase.from('approvals').upsert({
      id: a.id,
      piece_id: a.piece_id,
      version_id: a.version_id,
      decision: a.decision,
      feedback: a.feedback,
      decided_by: a.decided_by,
      decided_at: decidedAt.toISOString(),
      role: a.role,
      step_order: a.step_order,
    }, { onConflict: 'id' })
  }

  // 5. Comments
  for (const c of campaign.comments) {
    const createdAt = new Date(now.getTime() - c.offset_hours * 3600000)
    await supabase.from('comments').upsert({
      id: c.id,
      piece_id: c.piece_id,
      version_id: c.version_id,
      author_name: c.author_name,
      content: c.content,
      comment_type: c.comment_type,
      pin_x: c.pin_x,
      pin_y: c.pin_y,
      is_internal: c.is_internal,
      resolved: c.resolved,
      created_at: createdAt.toISOString(),
    }, { onConflict: 'id' })
  }

  return true
}

export function useDemoTicker() {
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    async function tick() {
      const inserted = getInserted()
      const next = DEMO_POOL.find(c => !inserted.includes(c.project.id))
      if (!next) return // pool exhausted

      const ok = await insertCampaign(next)
      if (ok) {
        markInserted(next.project.id)
        console.log(`[Crivo Demo] Nova campanha: ${next.project.name}`)
      }
    }

    // Insert first one immediately if pool is fresh
    const inserted = getInserted()
    if (inserted.length === 0) {
      tick()
    }

    timerRef.current = setInterval(tick, INTERVAL_MS)
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])
}
