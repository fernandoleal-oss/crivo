// POST /api/ai/review-piece
// Input: { image_url: string, channel: string, piece_id: string }
// Estimativa de tokens: ~1.500 input (prompt+imagem) + ~600 output = ~2.100 tokens/req

import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest } from 'next/server'
import { z } from 'zod'

const ReviewResponseSchema = z.object({
  score: z.number().min(0).max(100).describe('Score de prontidão 0-100'),
  approved_for_review: z.boolean().describe('true se score >= 70 e nenhum issue crítico'),
  issues: z.array(z.object({
    severity: z.enum(['critico', 'atencao', 'sugestao']),
    message: z.string(),
  })),
  suggestions: z.array(z.string()),
  channel_fit: z.object({
    compatible: z.boolean(),
    notes: z.string(),
  }),
  summary: z.string().describe('Resumo em PT-BR, 2-3 frases'),
})

export type PieceReview = z.infer<typeof ReviewResponseSchema>

const CHANNEL_SPECS: Record<string, string> = {
  instagram_feed: 'Feed Instagram: proporção 1:1 (1080x1080) ou 4:5 (1080x1350). Texto não deve ultrapassar 20% da área. Resolução mínima 72dpi.',
  instagram_stories: 'Stories Instagram: proporção 9:16 (1080x1920). Zona segura: manter elementos a 250px das bordas superior e inferior.',
  instagram_reels: 'Reels: proporção 9:16, duração ideal 15-30s. Cover deve funcionar em 1:1 no feed.',
  facebook_feed: 'Facebook Feed: 1200x630px (1.91:1). Texto mínimo recomendado.',
  ooh: 'OOH/Outdoor: alta resolução (300dpi+), leitura a 30m de distância, texto grande, poucos elementos.',
  banner_digital: 'Banner digital: formatos IAB (300x250, 728x90, 160x600, 970x90). Arquivo leve (<150KB).',
  youtube: 'YouTube: thumbnail 1280x720 (16:9), texto legível em miniatura. Anúncio: 16:9, 1920x1080.',
  linkedin: 'LinkedIn: feed 1200x627 (1.91:1), stories 1080x1920. Tom profissional.',
}

function buildReviewPrompt(channel: string): string {
  const spec = CHANNEL_SPECS[channel] || `Canal: ${channel}. Aplique boas práticas gerais de design para comunicação visual.`
  return `Você é um diretor de arte sênior especializado em revisão de peças publicitárias para agências brasileiras.

Analise a imagem fornecida considerando as especificações do canal: ${spec}

CRITÉRIOS DE ANÁLISE:
1. Adequação técnica ao canal (proporção, resolução, zonas seguras)
2. Hierarquia visual e legibilidade (contraste texto/fundo, tamanho de fonte)
3. Qualidade de produção (pixelação, cortes, sangria)
4. Adequação mobile (elementos legíveis em tela pequena)
5. Boas práticas criativas (call-to-action claro, foco visual)

SEVERIDADES:
- "critico": impede aprovação (ex: proporção errada, texto ilegível, logo cortado)
- "atencao": pode ser aprovado mas cliente pode rejeitar (ex: contraste baixo, CTA fraco)
- "sugestao": melhoria opcional (ex: mais espaço em branco, ajuste de cor)

Retorne APENAS JSON válido seguindo o schema.`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { image_url, channel = 'instagram_feed', piece_id } = body

    if (!image_url) {
      return Response.json({ error: 'image_url obrigatório' }, { status: 400 })
    }

    // Valida que é URL do Supabase Storage (segurança)
    const allowedHosts = [
      process.env.NEXT_PUBLIC_SUPABASE_URL?.replace('https://', ''),
      'supabase.co',
      'supabase.in',
    ].filter(Boolean)

    const url = new URL(image_url)
    const isAllowed = allowedHosts.some(host => url.hostname.includes(host!))
    if (!isAllowed && process.env.NODE_ENV === 'production') {
      return Response.json({ error: 'image_url deve ser do Supabase Storage' }, { status: 403 })
    }

    const { object } = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      schema: ReviewResponseSchema,
      messages: [
        {
          role: 'user',
          content: [
            { type: 'text', text: buildReviewPrompt(channel) },
            { type: 'image', image: new URL(image_url) },
          ],
        },
      ],
      temperature: 0.3,
    })

    // Garante lógica de approved_for_review consistente
    const hasCritical = object.issues.some(i => i.severity === 'critico')
    const result = {
      ...object,
      approved_for_review: !hasCritical && object.score >= 70,
      piece_id,
      analyzed_at: new Date().toISOString(),
      disclaimer: 'Análise automática por IA — não substitui aprovação do cliente nem revisão humana.',
    }

    return Response.json(result)
  } catch (err) {
    console.error('[review-piece] Error:', err)
    return Response.json({ error: 'Erro ao analisar peça.' }, { status: 500 })
  }
}
