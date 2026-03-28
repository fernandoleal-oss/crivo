import { anthropic } from '@ai-sdk/anthropic'
import { generateText } from 'ai'
import { NextRequest } from 'next/server'
import type { BriefingData } from '@/lib/types'

function buildPrompt(text: string): string {
  return `Você é especialista em gestão de projetos para agências de publicidade brasileiras.

Analise o texto abaixo (pode ser um e-mail, mensagem de WhatsApp ou resumo de call) e extraia as informações do briefing.

Responda APENAS com JSON válido, sem texto antes ou depois. Se uma informação não estiver no texto, use null ou array vazio.

SCHEMA:
{
  "produto": string | null,
  "verba": string | null,
  "prazo": "YYYY-MM-DD" | null,
  "assets_necessarios": string[],
  "aprovador": string | null,
  "observacoes": string | null,
  "informacoes_faltando": string[],
  "resumo_executivo": string,
  "confianca_analise": number
}

Regras:
- "confianca_analise": 0-100, onde 100 = brief completo para começar produção
- "informacoes_faltando": liste o que impede a produção de começar agora
- "resumo_executivo": 2-3 frases em PT-BR resumindo o que foi solicitado

TEXTO DO BRIEFING:
---
${text.slice(0, 8000)}
---`
}

export async function POST(req: NextRequest) {
  try {
    const { text } = await req.json()
    if (!text || typeof text !== 'string' || text.trim().length < 20) {
      return Response.json({ error: 'Texto muito curto para análise.' }, { status: 400 })
    }
    const { text: raw } = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      prompt: buildPrompt(text),
      maxOutputTokens: 1024,
      temperature: 0.1,
    })
    const jsonMatch = raw.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return Response.json({ error: 'IA não retornou JSON válido.' }, { status: 422 })
    }
    const data: BriefingData = JSON.parse(jsonMatch[0])
    return Response.json(data)
  } catch (err) {
    console.error('[analyze-brief-text]', err)
    return Response.json({ error: 'Erro ao processar briefing.' }, { status: 500 })
  }
}
