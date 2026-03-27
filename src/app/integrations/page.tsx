'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { IntegrationCard } from '@/components/integrations/IntegrationCard'

const ACTIVE_INTEGRATIONS = [
  {
    name: 'WhatsApp',
    description: 'Notificações automáticas de aprovação e revisão para a equipe via WhatsApp Business.',
    icon: '💬',
  },
  {
    name: 'Gmail',
    description: 'Envio de email formal para o cliente com link de revisão e instruções.',
    icon: '✉️',
  },
]

const COMING_INTEGRATIONS = [
  { name: 'Taskrow', description: 'Atualiza o status da tarefa automaticamente quando uma peça é aprovada.', icon: '✅' },
  { name: 'Monday.com', description: 'Sincroniza aprovações com cards e atualiza status de projetos.', icon: '📋' },
  { name: 'Asana', description: 'Marca tarefas como concluídas ao receber aprovação do cliente.', icon: '🗂' },
  { name: 'Slack', description: 'Notifica o canal do projeto quando cliente aprova ou pede revisão.', icon: '💼' },
  { name: 'Google Drive', description: 'Salva automaticamente as peças aprovadas em pastas organizadas.', icon: '📁' },
  { name: 'Adobe Creative Cloud', description: 'Acessa ativos diretamente do Creative Cloud para upload de versões.', icon: '🎨' },
  { name: 'Notion', description: 'Registra aprovações e feedbacks em databases do Notion.', icon: '📝' },
  { name: 'Zapier', description: 'Conecta o Crivo a qualquer ferramenta via automações Zapier.', icon: '⚡' },
]

export default function IntegrationsPage() {
  const [requested, setRequested] = useState<Set<string>>(new Set())

  async function handleRequest(name: string) {
    if (requested.has(name)) return
    const webhookBase = process.env.NEXT_PUBLIC_N8N_WEBHOOK_BASE ?? ''
    if (webhookBase) {
      fetch(`${webhookBase}/crivo-integration-request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ integration: name, requestedAt: new Date().toISOString() }),
      }).catch(() => {})
    }
    setRequested(prev => new Set([...prev, name]))
    toast.success(`Solicitação para ${name} registrada! Entraremos em contato.`)
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
          <Link href="/" className="hover:text-indigo-600">Dashboard</Link>
          <span>/</span>
          <span>Integrações</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Integrações</h1>
        <p className="text-slate-500 mt-1">Conecte o Crivo às ferramentas que sua agência já usa.</p>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Ativas</h2>
        <div className="space-y-3">
          {ACTIVE_INTEGRATIONS.map(i => (
            <IntegrationCard key={i.name} {...i} status="active" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Em breve</h2>
        <div className="space-y-3">
          {COMING_INTEGRATIONS.map(i => (
            <IntegrationCard
              key={i.name}
              {...i}
              status="coming_soon"
              onRequest={() => handleRequest(i.name)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
