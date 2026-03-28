import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import type { ClaqueteData } from '@/app/api/ai/generate-claquete/route'

const styles = StyleSheet.create({
  page: { backgroundColor: '#0a0a0a', padding: 32, fontFamily: 'Courier', color: '#f5f5f5' },
  header: { borderBottom: '2px solid #4f46e5', paddingBottom: 12, marginBottom: 16 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#a5b4fc', letterSpacing: 4 },
  subtitle: { fontSize: 10, color: '#94a3b8', marginTop: 4 },
  section: { marginBottom: 12 },
  sectionTitle: { fontSize: 8, color: '#6366f1', letterSpacing: 2, marginBottom: 6, textTransform: 'uppercase' },
  row: { flexDirection: 'row', marginBottom: 3 },
  label: { fontSize: 8, color: '#94a3b8', width: 140 },
  value: { fontSize: 9, color: '#f5f5f5', flex: 1 },
  sceneBox: { border: '1px solid #1e1b4b', backgroundColor: '#0f0f1a', padding: 8, marginBottom: 6 },
  sceneHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  sceneNum: { fontSize: 11, color: '#6366f1', fontWeight: 'bold' },
  sceneDesc: { fontSize: 8, color: '#e2e8f0' },
  footer: { position: 'absolute', bottom: 16, left: 32, right: 32, borderTop: '1px solid #1e293b', paddingTop: 8 },
  footerText: { fontSize: 7, color: '#475569', textAlign: 'center' },
})

interface Props {
  data: ClaqueteData
  gerado_em: string
}

export function ClaqueteDocument({ data, gerado_em }: Props) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>CLAQUETE DE PRODUÇÃO</Text>
          <Text style={styles.subtitle}>{data.producao.produtora} · {data.producao.cliente}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Produção</Text>
          <View style={styles.row}><Text style={styles.label}>Título:</Text><Text style={styles.value}>{data.producao.titulo}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Produto:</Text><Text style={styles.value}>{data.producao.produto}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Agência:</Text><Text style={styles.value}>{data.producao.agencia ?? '—'}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Job #:</Text><Text style={styles.value}>{data.producao.job_number ?? '—'}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Equipe</Text>
          <View style={styles.row}><Text style={styles.label}>Diretor:</Text><Text style={styles.value}>{data.equipe.diretor}</Text></View>
          <View style={styles.row}><Text style={styles.label}>DOP:</Text><Text style={styles.value}>{data.equipe.dop}</Text></View>
          {data.equipe.produtor_executivo && <View style={styles.row}><Text style={styles.label}>Prod. Executivo:</Text><Text style={styles.value}>{data.equipe.produtor_executivo}</Text></View>}
          {data.equipe.diretor_arte && <View style={styles.row}><Text style={styles.label}>Dir. de Arte:</Text><Text style={styles.value}>{data.equipe.diretor_arte}</Text></View>}
          {data.equipe.som_direto && <View style={styles.row}><Text style={styles.label}>Som Direto:</Text><Text style={styles.value}>{data.equipe.som_direto}</Text></View>}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filmagem</Text>
          <View style={styles.row}><Text style={styles.label}>Data:</Text><Text style={styles.value}>{data.producao_info.data_filmagem}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Local:</Text><Text style={styles.value}>{data.producao_info.local} — {data.producao_info.cidade_estado}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Duração estimada:</Text><Text style={styles.value}>{data.producao_info.duracao_estimada}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Formato:</Text><Text style={styles.value}>{data.producao_info.formato_entrega}</Text></View>
          <View style={styles.row}><Text style={styles.label}>Plataformas:</Text><Text style={styles.value}>{data.producao_info.plataformas.join(', ')}</Text></View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cenas ({data.cenas.length})</Text>
          {data.cenas.map((cena) => (
            <View key={cena.numero} style={styles.sceneBox}>
              <View style={styles.sceneHeader}>
                <Text style={styles.sceneNum}>CENA {cena.numero}</Text>
                <Text style={styles.label}>{cena.takes_previstos} takes · {cena.locacao}</Text>
              </View>
              <Text style={styles.sceneDesc}>{cena.descricao}</Text>
              {cena.personagens.length > 0 && <Text style={[styles.label, { marginTop: 2 }]}>Cast: {cena.personagens.join(', ')}</Text>}
              {cena.observacoes && <Text style={[styles.label, { marginTop: 2 }]}>Obs: {cena.observacoes}</Text>}
            </View>
          ))}
        </View>

        {data.notas_gerais && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Notas Gerais</Text>
            <Text style={[styles.value, { fontSize: 8 }]}>{data.notas_gerais}</Text>
          </View>
        )}

        <View style={styles.footer}>
          <Text style={styles.footerText}>Gerado pelo Crivo em {new Date(gerado_em).toLocaleString('pt-BR')} · Este documento não substitui o julgamento humano da equipe de produção.</Text>
        </View>
      </Page>
    </Document>
  )
}
