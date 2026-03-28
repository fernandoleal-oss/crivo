// POST /api/ai/generate-claquete
// Gera claquete de produção audiovisual (estilo Zarpa/Peach) em PDF
// Input: dados do projeto RTV
// Output: PDF buffer (application/pdf)
// Estimativa de tokens: ~800 input + ~400 output = ~1.200 tokens/req (geração de campos)

import { generateObject } from 'ai'
import { anthropic } from '@ai-sdk/anthropic'
import { NextRequest } from 'next/server'
import { z } from 'zod'
import { renderToBuffer } from '@react-pdf/renderer'
import { ClaqueteDocument } from '@/components/ai/ClaqueteDocument'
import React from 'react'

// ---------------------------------------------------------------------------
// Schema dos dados da claquete
// ---------------------------------------------------------------------------
export const ClaqueteSchema = z.object({
  producao: z.object({
    produtora: z.string(),
    cliente: z.string(),
    produto: z.string(),
    titulo: z.string().describe('Título do filme/peça'),
    agencia: z.string().nullable(),
    job_number: z.string().nullable(),
  }),
  equipe: z.object({
    diretor: z.string(),
    dop: z.string().describe('Director of Photography'),
    produtor_executivo: z.string().nullable(),
    diretor_arte: z.string().nullable(),
    som_direto: z.string().nullable(),
  }),
  producao_info: z.object({
    data_filmagem: z.string().describe('YYYY-MM-DD'),
    local: z.string(),
    cidade_estado: z.string(),
    duracao_estimada: z.string().describe('Ex: 30s, 1min'),
    formato_entrega: z.string().describe('Ex: MP4 H.264 1920x1080'),
    plataformas: z.array(z.string()),
  }),
  cenas: z.array(z.object({
    numero: z.number().int(),
    descricao: z.string(),
    locacao: z.string(),
    personagens: z.array(z.string()),
    takes_previstos: z.number().int().default(3),
    observacoes: z.string().nullable(),
  })),
  notas_gerais: z.string().nullable(),
})

export type ClaqueteData = z.infer<typeof ClaqueteSchema>

// ---------------------------------------------------------------------------
// Input schema da requisição
// ---------------------------------------------------------------------------
const RequestSchema = z.object({
  project_id: z.string(),
  titulo: z.string(),
  cliente: z.string(),
  diretor: z.string(),
  data_filmagem: z.string(),
  local: z.string(),
  descricao_projeto: z.string().describe('Texto livre com informações do roteiro/storyboard'),
  equipe: z.object({
    dop: z.string().optional(),
    produtor_executivo: z.string().optional(),
  }).optional(),
  cenas_raw: z.array(z.object({
    numero: z.number(),
    descricao: z.string(),
    locacao: z.string().optional(),
  })).optional(),
})

function buildClaquetePrompt(input: z.infer<typeof RequestSchema>): string {
  return `Você é assistente de produção audiovisual. Preencha os campos da claquete de produção com base nas informações fornecidas.

Para campos não informados, use valores plausíveis baseados no contexto (ex: se não há DOP, use "A definir").
Infira o número de takes previstos com base na complexidade da cena (cenas simples: 3, complexas: 5-8).
Formate datas como YYYY-MM-DD.

INFORMAÇÕES DO PROJETO:
- Título: ${input.titulo}
- Cliente: ${input.cliente}
- Diretor: ${input.diretor}
- Data de filmagem: ${input.data_filmagem}
- Local: ${input.local}
- Descrição/Roteiro: ${input.descricao_projeto}
- Equipe adicional: ${JSON.stringify(input.equipe || {})}
- Cenas: ${JSON.stringify(input.cenas_raw || [])}

Preencha a claquete completa no formato JSON especificado.`
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const input = RequestSchema.parse(body)

    // Gera dados estruturados com IA
    const { object: claqueteData } = await generateObject({
      model: anthropic('claude-sonnet-4-6'),
      schema: ClaqueteSchema,
      prompt: buildClaquetePrompt(input),
      temperature: 0.1,
    })

    // Gera PDF com react-pdf
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const element = React.createElement(ClaqueteDocument as any, { data: claqueteData, gerado_em: new Date().toISOString() }) as any
    const pdfBuffer = await renderToBuffer(element)

    const filename = `claquete_${input.titulo.replace(/\s+/g, '_')}_${input.data_filmagem}.pdf`

    return new Response(Buffer.from(pdfBuffer), {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Content-Length': pdfBuffer.length.toString(),
        'X-Claquete-Project-Id': input.project_id,
      },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return Response.json({ error: 'Dados inválidos', details: err.issues }, { status: 400 })
    }
    console.error('[generate-claquete] Error:', err)
    return Response.json({ error: 'Erro ao gerar claquete.' }, { status: 500 })
  }
}
