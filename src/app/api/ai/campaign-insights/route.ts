// POST /api/ai/campaign-insights
// Analisa histórico de aprovações do cliente e gera insights de timing + draft de email
// Input: { project_id: string, client_name: string }
// Estimativa de tokens: ~1.200 input + ~700 output = ~1.900 tokens/req

import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const InsightsSchema = z.object({
  timing: z.object({
    media_dias_aprovacao: z.number().nullable(),
    melhor_dia_semana: z.string().nullable().describe('Ex: "terça-feira"'),
    melhor_horario: z.string().nullable().describe('Ex: "manhã (9h-12h)"'),
    taxa_aprovacao_primeira_versao: z.number().min(0).max(100).nullable(),
    alerta: z.string().nullable().describe('Alerta urgente se prazo apertado'),
  }),
  recomendacao: z.object({
    enviar_hoje: z.boolean(),
    motivo: z.string(),
    data_ideal_envio: z.string().nullable().describe('YYYY-MM-DD'),
    prazo_seguro: z.boolean().describe('true se há margem confortável para aprovação'),
  }),
  padroes_cliente: z.array(z.object({
    observacao: z.string(),
    impacto: z.enum(['positivo', 'neutro', 'negativo']),
  })),
  email_draft: z.object({
    assunto: z.string(),
    corpo: z.string().describe('Email completo em PT-BR, tom profissional-amigável'),
    cta: z.string().describe('Call-to-action do email'),
  }),
  confianca: z.number().min(0).max(100).describe('Confiança da análise baseada no volume de dados históricos'),
})

export type CampaignInsights = z.infer<typeof InsightsSchema>

// Query histórico de aprovações do cliente no Supabase
async function fetchClientHistory(supabase: Awaited<ReturnType<typeof createClient>>, clientName: string) {
  const { data } = await supabase
    .from('approvals')
    .select(`
      id,
      status,
      created_at,
      updated_at,
      round,
      projects!inner(client_name, name, due_date)
    `)
    .eq('projects.client_name', clientName)
    .in('status', ['approved', 'rejected', 'revision'])
    .order('created_at', { ascending: false })
    .limit(50)

  return data || []
}

function buildInsightsPrompt(
  clientName: string,
  projectName: string,
  projectDeadline: string | null,
  history: Record<string, unknown>[]
): string {
  const hoje = new Date().toISOString().split('T')[0]

  const historyText = history.length === 0
    ? 'Nenhum histórico encontrado para este cliente.'
    : history.map(h => {
        const proj = h.projects as Record<string, unknown>
        const created = new Date(h.created_at as string)
        const updated = new Date(h.updated_at as string)
        const diasParaAprovar = Math.round((updated.getTime() - created.getTime()) / (1000 * 60 * 60 * 24))
        return `- Projeto: ${proj?.name} | Status: ${h.status} | Round: ${h.round} | Dias até resposta: ${diasParaAprovar} | Dia da semana do envio: ${created.toLocaleDateString('pt-BR', { weekday: 'long' })}`
      }).join('\n')

  return `Você é um especialista em gestão de campanhas publicitárias com foco em timing de aprovações.

DATA DE HOJE: ${hoje}
CLIENTE: ${clientName}
PROJETO ATUAL: ${projectName}
DEADLINE DO PROJETO: ${projectDeadline || 'Não definido'}

HISTÓRICO DE APROVAÇÕES:
${historyText}

Com base nesse histórico, gere insights de timing e um rascunho de email para envio da campanha.

DIRETRIZES PARA O EMAIL:
- Tom: profissional mas próximo, sem formalidade excessiva
- Mencione o projeto pelo nome
- Inclua prazo de resposta sugerido (baseado na média histórica)
- CTA claro para aprovação
- Máximo 5 parágrafos

Se não houver histórico suficiente (< 3 registros), indique baixa confiança e forneça recomendações genéricas de boas práticas.`
}

export async function POST(req: NextRequest) {
  try {
    const { project_id, client_name } = await req.json()

    if (!project_id || !client_name) {
      return Response.json({ error: 'project_id e client_name são obrigatórios' }, { status: 400 })
    }

    const supabase = await createClient()

    // Busca dados do projeto atual
    const { data: project } = await supabase
      .from('projects')
      .select('name, due_date, client_name')
      .eq('id', project_id)
      .single()

    if (!project) {
      return Response.json({ error: 'Projeto não encontrado' }, { status: 404 })
    }

    const history = await fetchClientHistory(supabase, client_name)

    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      schema: InsightsSchema,
      prompt: buildInsightsPrompt(client_name, project.name, project.due_date, history),
      temperature: 0.4,
    })

    return Response.json({
      ...object,
      meta: {
        client_name,
        project_id,
        historico_analisado: history.length,
        gerado_em: new Date().toISOString(),
        disclaimer: 'Insights gerados por IA com base no histórico disponível. Valide com o time de atendimento antes de usar.',
      },
    })
  } catch (err) {
    console.error('[campaign-insights] Error:', err)
    return Response.json({ error: 'Erro ao gerar insights.' }, { status: 500 })
  }
}
