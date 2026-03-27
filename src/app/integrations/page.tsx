'use client'
import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'
import { IntegrationCard } from '@/components/integrations/IntegrationCard'

const ACTIVE_INTEGRATIONS = [
  {
    name: 'WhatsApp',
    description: 'Notificações automáticas de aprovação e revisão para a equipe via WhatsApp Business. Quando o cliente aprova ou pede revisão, a agência recebe um aviso instantâneo.',
    icon: '💬',
    howItWorks: 'Configurado via n8n → Evolução API. A mensagem é enviada automaticamente quando o cliente toma uma decisão na tela de revisão.',
  },
  {
    name: 'Gmail',
    description: 'Envio de email formal para o cliente com link de revisão e instruções. O cliente clica no link e revisa direto no navegador, sem precisar de app ou cadastro.',
    icon: '✉️',
    howItWorks: 'Acionado pelo botão "Enviar para cliente" no dashboard. O email inclui o link exclusivo da peça.',
  },
]

const COMING_INTEGRATIONS = [
  { name: 'Taskrow', description: 'Atualiza o status da tarefa automaticamente quando uma peça é aprovada no Crivo.', icon: '✅' },
  { name: 'Monday.com', description: 'Sincroniza aprovações com cards e atualiza status de projetos automaticamente.', icon: '📋' },
  { name: 'Asana', description: 'Marca tarefas como concluídas ao receber aprovação do cliente.', icon: '🗂' },
  { name: 'Slack', description: 'Notifica o canal do projeto quando cliente aprova ou pede revisão.', icon: '💼' },
  { name: 'Google Drive', description: 'Salva automaticamente as peças aprovadas em pastas organizadas por cliente.', icon: '📁' },
  { name: 'Adobe Creative Cloud', description: 'Acessa ativos diretamente do Creative Cloud para upload de novas versões.', icon: '🎨' },
  { name: 'Notion', description: 'Registra aprovações e feedbacks em databases do Notion para histórico completo.', icon: '📝' },
  { name: 'Zapier', description: 'Conecta o Crivo a qualquer ferramenta via automações personalizadas.', icon: '⚡' },
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
          <Link href="/" className="hover:text-indigo-600">← Dashboard</Link>
          <span>/</span>
          <span>Integrações</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900">Integrações</h1>
        <p className="text-slate-500 mt-1">Conecte o Crivo às ferramentas que sua agência já usa. As integrações ativas funcionam automaticamente.</p>
      </div>

      {/* How integrations work */}
      <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-200 rounded-xl p-5 mb-8">
        <h2 className="font-semibold text-indigo-900 mb-2">Como as integrações funcionam?</h2>
        <p className="text-sm text-indigo-800 mb-3">
          As integrações ativas são acionadas automaticamente durante o fluxo de aprovação.
          Você não precisa configurar nada — elas já estão conectadas ao seu Crivo.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
          <div className="bg-white/70 rounded-lg p-3">
            <p className="font-medium text-indigo-800">1. Envio ao cliente</p>
            <p className="text-indigo-600 text-xs mt-0.5">Gmail envia o email com link de revisão</p>
          </div>
          <div className="bg-white/70 rounded-lg p-3">
            <p className="font-medium text-indigo-800">2. Cliente decide</p>
            <p className="text-indigo-600 text-xs mt-0.5">O cliente aprova ou pede revisão</p>
          </div>
          <div className="bg-white/70 rounded-lg p-3">
            <p className="font-medium text-indigo-800">3. Agência recebe</p>
            <p className="text-indigo-600 text-xs mt-0.5">WhatsApp notifica a equipe em tempo real</p>
          </div>
        </div>
      </div>

      <section className="mb-8">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Ativas <span className="text-green-600">({ACTIVE_INTEGRATIONS.length})</span>
        </h2>
        <div className="space-y-3">
          {ACTIVE_INTEGRATIONS.map(i => (
            <IntegrationCard key={i.name} {...i} status="active" />
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">
          Em breve <span className="text-slate-400">({COMING_INTEGRATIONS.length})</span>
        </h2>
        <p className="text-sm text-slate-500 mb-3">
          Solicite acesso antecipado e seremos os primeiros a avisar quando estiverem disponíveis.
        </p>
        <div className="space-y-3">
          {COMING_INTEGRATIONS.map(i => (
            <IntegrationCard
              key={i.name}
              {...i}
              status="coming_soon"
              onRequest={() => handleRequest(i.name)}
              requested={requested.has(i.name)}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
