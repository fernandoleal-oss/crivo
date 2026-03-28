'use server'

import type { NotifyDecisionPayload, SendToClientPayload } from './types'

async function postWebhook(path: string, payload: unknown): Promise<void> {
  const base = process.env.N8N_WEBHOOK_BASE ?? process.env.N8N_WEBHOOK_URL ?? ''
  if (!base) {
    console.warn('[postWebhook] webhook URL not configured, skipping')
    return
  }
  const cleanBase = base.replace(/\/+$/, '').replace(/\/crivo-notify$/, '')
  const url = path ? `${cleanBase}/${path}` : cleanBase
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
  } catch (err) {
    console.error('[postWebhook] failed to deliver webhook:', err)
    throw err
  }
}

export async function notifyDecision(payload: NotifyDecisionPayload): Promise<void> {
  await postWebhook('crivo-notify', payload)
}

export async function notifySendClient(payload: SendToClientPayload): Promise<void> {
  await postWebhook('crivo-send-client', payload)
}
