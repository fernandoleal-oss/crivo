import Anthropic from '@anthropic-ai/sdk'

const client = new Anthropic()

export async function POST(req: Request) {
  const { text, projectName, clientName } = await req.json()

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: `Você é um assistente de agência criativa. Extraia dados estruturados de briefing a partir da transcrição de uma reunião. Retorne APENAS JSON válido com os campos: produto (string), verba (string ou null), prazo (string ou null), aprovador (string ou null), assets_necessarios (array de strings), observacoes (string ou null), informacoes_faltando (array de strings), resumo_executivo (string), confianca_analise (number 0-100), transcription_summary (string com resumo de 2-3 frases da call). Todos os campos em português.`,
    messages: [
      {
        role: 'user',
        content: `Projeto: ${projectName}\nCliente: ${clientName}\n\nTranscrição da reunião:\n${text}`,
      },
    ],
  })

  const content = message.content[0]
  if (content.type === 'text') {
    const jsonStr = content.text
      .replace(/```json?\n?/g, '')
      .replace(/```/g, '')
      .trim()
    const json = JSON.parse(jsonStr)
    return Response.json(json)
  }
  return Response.json({ error: 'Failed to parse' }, { status: 500 })
}
