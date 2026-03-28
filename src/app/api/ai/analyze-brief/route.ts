// POST /api/ai/analyze-brief
// Aceita: multipart/form-data com campo "file" (PDF, XLSX, DOCX)
// Retorna: streaming JSON com análise estruturada do briefing
//
// Estimativa de tokens: ~2.000 input (prompt+texto) + ~800 output = ~2.800 tokens/req
// Custo estimado: ~$0.009 por análise (claude-sonnet-4-6 pricing)

import { streamText } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest } from 'next/server'
import { z } from 'zod'

// ---------------------------------------------------------------------------
// Schema Zod — valida o JSON extraído antes de retornar ao cliente
// ---------------------------------------------------------------------------
export const BriefAnalysisSchema = z.object({
  projeto: z.object({
    nome: z.string().describe('Nome do projeto ou campanha'),
    cliente: z.string().describe('Nome do cliente/anunciante'),
    budget_estimado: z.string().nullable().describe('Budget em BRL, ex: "R$ 50.000"'),
    deadline: z.string().nullable().describe('Data limite no formato YYYY-MM-DD'),
    kpis: z.array(z.string()).describe('Lista de KPIs mencionados no brief'),
  }),
  formatos_necessarios: z.array(
    z.object({
      formato: z.string().describe('Ex: "Post Instagram 1080x1080", "Banner Google 970x90"'),
      setor_sugerido: z.enum(['design', 'video', 'midia', 'rtv', 'social']),
      quantidade: z.number().int().positive().default(1),
      prioridade: z.enum(['alta', 'media', 'baixa']).default('media'),
    })
  ),
  checklist_pecas: z.array(
    z.object({
      descricao: z.string(),
      setor: z.enum(['design', 'video', 'midia', 'rtv', 'social']),
      estimativa_horas: z.number().nullable(),
    })
  ),
  riscos: z.array(
    z.object({
      tipo: z.enum(['prazo', 'escopo', 'informacao_faltando', 'orcamento']),
      descricao: z.string(),
      severidade: z.enum(['alta', 'media', 'baixa']),
    })
  ),
  informacoes_faltando: z.array(z.string()),
  resumo_executivo: z.string().describe('Resumo em PT-BR, 3-5 frases'),
  confianca_analise: z.number().min(0).max(100).describe('Score 0-100 de completude do brief'),
})

export type BriefAnalysis = z.infer<typeof BriefAnalysisSchema>

// ---------------------------------------------------------------------------
// Extratores de texto por tipo de arquivo
// ---------------------------------------------------------------------------
async function extractText(file: File): Promise<string> {
  const buffer = Buffer.from(await file.arrayBuffer())
  const ext = file.name.split('.').pop()?.toLowerCase()

  if (ext === 'pdf') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const pdfParse = require('pdf-parse')
    const data = await pdfParse(buffer)
    return data.text.slice(0, 15000) // limita para não explodir o contexto
  }

  if (ext === 'xlsx' || ext === 'xls') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const XLSX = require('xlsx')
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheets = workbook.SheetNames.map((name: string) => {
      const sheet = XLSX.utils.sheet_to_json(workbook.Sheets[name], { header: 1 })
      return `=== Planilha: ${name} ===\n${(sheet as string[][]).map(r => r.join('\t')).join('\n')}`
    })
    return sheets.join('\n\n').slice(0, 15000)
  }

  if (ext === 'docx' || ext === 'doc') {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const mammoth = require('mammoth')
    const result = await mammoth.extractRawText({ buffer })
    return result.value.slice(0, 15000)
  }

  // Fallback: texto puro
  return buffer.toString('utf-8').slice(0, 15000)
}

// ---------------------------------------------------------------------------
// Prompt para Claude
// ---------------------------------------------------------------------------
function buildPrompt(text: string, fileName: string): string {
  return `Você é um especialista em produção criativa e gestão de projetos para agências de publicidade brasileiras.

Analise o briefing abaixo extraído do arquivo "${fileName}" e retorne um JSON estruturado seguindo EXATAMENTE o schema especificado.

REGRAS IMPORTANTES:
1. Responda APENAS com JSON válido, sem texto antes ou depois
2. Se uma informação não estiver clara no brief, use null ou array vazio
3. Para formatos/peças, infira os setores: design (estático), video (motion/vídeo), midia (compra/planejamento), rtv (produção audiovisual), social (gestão de redes)
4. Identifique TODOS os riscos de prazo: prazos apertados (<5 dias úteis), feriados próximos, dependências externas
5. Seja específico em "informacoes_faltando" — o que impede a produção começar hoje?
6. "confianca_analise" reflete o quanto o brief está completo (100 = tudo presente, 0 = inviável produzir)

SCHEMA ESPERADO:
{
  "projeto": {
    "nome": string,
    "cliente": string,
    "budget_estimado": string | null,
    "deadline": "YYYY-MM-DD" | null,
    "kpis": string[]
  },
  "formatos_necessarios": [{
    "formato": string,
    "setor_sugerido": "design" | "video" | "midia" | "rtv" | "social",
    "quantidade": number,
    "prioridade": "alta" | "media" | "baixa"
  }],
  "checklist_pecas": [{
    "descricao": string,
    "setor": "design" | "video" | "midia" | "rtv" | "social",
    "estimativa_horas": number | null
  }],
  "riscos": [{
    "tipo": "prazo" | "escopo" | "informacao_faltando" | "orcamento",
    "descricao": string,
    "severidade": "alta" | "media" | "baixa"
  }],
  "informacoes_faltando": string[],
  "resumo_executivo": string,
  "confianca_analise": number
}

BRIEFING PARA ANÁLISE:
---
${text}
---`
}

// ---------------------------------------------------------------------------
// Handler
// ---------------------------------------------------------------------------
export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return Response.json({ error: 'Arquivo não enviado. Use o campo "file" no FormData.' }, { status: 400 })
    }

    const MAX_SIZE_MB = 10
    if (file.size > MAX_SIZE_MB * 1024 * 1024) {
      return Response.json({ error: `Arquivo muito grande. Máximo: ${MAX_SIZE_MB}MB` }, { status: 413 })
    }

    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword', 'text/plain']

    if (!allowedTypes.includes(file.type) && !file.name.match(/\.(pdf|xlsx?|docx?)$/i)) {
      return Response.json({ error: 'Formato não suportado. Use PDF, XLSX ou DOCX.' }, { status: 415 })
    }

    const text = await extractText(file)

    if (text.trim().length < 50) {
      return Response.json({ error: 'Arquivo sem conteúdo legível suficiente para análise.' }, { status: 422 })
    }

    const result = await streamText({
      model: anthropic('claude-sonnet-4-6'),
      prompt: buildPrompt(text, file.name),
      maxOutputTokens: 2048,
      temperature: 0.2, // baixo para resposta mais determinística
    })

    return result.toTextStreamResponse()
  } catch (err) {
    console.error('[analyze-brief] Error:', err)
    return Response.json({ error: 'Erro interno ao processar o brief.' }, { status: 500 })
  }
}
