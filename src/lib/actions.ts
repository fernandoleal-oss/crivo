'use server'
import type { NotifyDecisionPayload, SendToClientPayload } from './types'

async function postWebhook(path: string, payload: unknown): Promise<void> {
  const base = process.env.N8N_WEBHOOK_BASE ?? process.env.N8N_WEBHOOK_URL ?? ''
  const url = path ? `${base.replace(/\/crivo-notify$/, '')}/${path}` : base
  if (!url) return
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch {}
}

export async function notifyDecision(payload: NotifyDecisionPayload): Promise<void> {
  await postWebhook('crivo-notify', payload)
}

export async function notifySendClient(payload: SendToClientPayload): Promise<void> {
  await postWebhook('crivo-send-client', payload)
}
