import type { ClapperboardData } from '@/components/ui/ClapperboardDigital'

export function exportVeiculacaoCSV(data: ClapperboardData): void {
  const headers = ['Produto', 'Título', 'Cena', 'Take', 'Diretor', 'D.O.P.', 'Prod. Exec.', 'Data', 'Local', 'Observações']
  const values = [
    data.produto, data.titulo, data.cena, data.take,
    data.diretor, data.dop, data.producaoExec,
    data.data, data.local, data.obs.replace(/\n/g, ' '),
  ]
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`
  const csv = [headers.map(escape).join(','), values.map(escape).join(',')].join('\n')
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `veiculacao_${data.produto.replace(/\s+/g, '_')}_${data.data.replace(/\//g, '-')}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function exportTVSpec(data: ClapperboardData): void {
  const lines = [
    'ESPECIFICAÇÃO TÉCNICA DE PRODUÇÃO',
    '='.repeat(40), '',
    `PRODUÇÃO:         ${data.producao}`,
    `CLIENTE:          ${data.cliente}`,
    `PRODUTO:          ${data.produto}`,
    `TÍTULO:           ${data.titulo}`, '',
    `DIRETOR:          ${data.diretor}`,
    `D.O.P.:           ${data.dop}`,
    `PRODUÇÃO EXEC.:   ${data.producaoExec}`, '',
    `DATA:             ${data.data}`,
    `LOCAL:            ${data.local}`,
    `CENA:             ${data.cena}`,
    `TAKE:             ${data.take}`, '',
    'OBSERVAÇÕES:', data.obs, '',
    '='.repeat(40),
    `Gerado por Crivo · ${new Date().toLocaleDateString('pt-BR')}`,
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `spec_tv_${data.produto.replace(/\s+/g, '_')}.txt`
  link.click()
  URL.revokeObjectURL(url)
}
