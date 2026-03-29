// Pool de campanhas demo que entram automaticamente a cada 20min
// Cada campanha tem dados realistas de agência brasileira

export interface DemoCampaign {
  project: {
    id: string
    name: string
    client_name: string
    sector: string
    briefing_score: number
    briefing_data: Record<string, any> | null
  }
  pieces: {
    id: string
    title: string
    description: string
    status: string
    public_token: string
    deadline: string // ISO offset like '+7 days'
    ai_score: number | null
    ai_issues: string[] | null
    internal_status: string
  }[]
  versions: {
    id: string
    piece_id: string
    version_number: number
    file_url: string
    file_type: string
  }[]
  approvals: {
    id: string
    piece_id: string
    version_id: string
    decision: string
    feedback: string
    decided_by: string
    role: string
    step_order: number
    offset_hours: number // hours before now
  }[]
  comments: {
    id: string
    piece_id: string
    version_id: string
    author_name: string
    content: string
    comment_type: string
    pin_x: number | null
    pin_y: number | null
    is_internal: boolean
    resolved: boolean
    offset_hours: number
  }[]
}

export const DEMO_POOL: DemoCampaign[] = [
  // ── 1. Natura — Dia dos Namorados ──
  {
    project: {
      id: 'dd000001-0000-0000-0000-000000000001',
      name: 'Dia dos Namorados 2026 — Natura',
      client_name: 'Natura',
      sector: 'criacao',
      briefing_score: 89,
      briefing_data: {
        produto: 'Linha Essencial — presente para casal',
        verba: 'R$ 95.000',
        prazo: '12/06/2026',
        aprovador: 'Juliana Faria (Head de Branding)',
        assets_necessarios: ['fotos de casal', 'embalagem mockup', 'paleta Natura'],
        observacoes: 'Tom sensorial, sofisticado. Evitar clichê de coração.',
        informacoes_faltando: [],
        resumo_executivo: 'Campanha sensorial para Dia dos Namorados com foco na linha Essencial.',
        confianca_analise: 89,
        transcription_summary: 'Call 28/03 — Juliana Faria (Natura) com Desirre. Linha Essencial Dia dos Namorados, tom sofisticado. Verba R$95k. Prazo 12/06.',
      },
    },
    pieces: [
      {
        id: 'dd100001-0000-0000-0000-000000000001',
        title: 'Key Visual — Campanha Essencial',
        description: 'Imagem principal: casal em momento íntimo com produtos Natura.',
        status: 'pending',
        public_token: 'tok_natura_kv01',
        deadline: '+14 days',
        ai_score: 85,
        ai_issues: null,
        internal_status: 'in_review',
      },
      {
        id: 'dd100002-0000-0000-0000-000000000001',
        title: 'Carrossel Instagram — 5 slides',
        description: 'Carrossel com 5 fotos dos produtos + dica de presente.',
        status: 'pending',
        public_token: 'tok_natura_carrossel01',
        deadline: '+10 days',
        ai_score: 72,
        ai_issues: ['Texto pequeno no slide 3', 'CTA pouco visível no último slide'],
        internal_status: 'draft',
      },
    ],
    versions: [
      { id: 'dd200001-0000-0000-0000-000000000001', piece_id: 'dd100001-0000-0000-0000-000000000001', version_number: 1, file_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=1200&q=80', file_type: 'image/jpeg' },
      { id: 'dd200002-0000-0000-0000-000000000001', piece_id: 'dd100002-0000-0000-0000-000000000001', version_number: 1, file_url: 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1080&q=80', file_type: 'image/jpeg' },
    ],
    approvals: [
      { id: 'dd300001-0000-0000-0000-000000000001', piece_id: 'dd100001-0000-0000-0000-000000000001', version_id: 'dd200001-0000-0000-0000-000000000001', decision: 'approved', feedback: 'Composição e iluminação excelentes. Seguir.', decided_by: 'Bruno', role: 'da', step_order: 1, offset_hours: 2 },
    ],
    comments: [
      { id: 'dd400001-0000-0000-0000-000000000001', piece_id: 'dd100001-0000-0000-0000-000000000001', version_id: 'dd200001-0000-0000-0000-000000000001', author_name: 'Bruno (Criação)', content: 'Foto linda. Sugiro crop mais fechado no rosto para story.', comment_type: 'general', pin_x: null, pin_y: null, is_internal: true, resolved: false, offset_hours: 2 },
    ],
  },

  // ── 2. Havaianas — Coleção Verão 2027 ──
  {
    project: {
      id: 'dd000002-0000-0000-0000-000000000002',
      name: 'Coleção Verão 2027 — Havaianas',
      client_name: 'Havaianas',
      sector: 'criacao',
      briefing_score: 76,
      briefing_data: {
        produto: 'Havaianas Slim Tropical — lançamento coleção verão',
        verba: 'R$ 200.000',
        prazo: '01/09/2026',
        aprovador: 'Ricardo Mendes (Dir. Marketing)',
        assets_necessarios: ['fotos produto', 'modelos na praia', 'paleta tropical'],
        observacoes: 'Mood: tropical, jovem, alegre. Pode usar humor leve.',
        informacoes_faltando: ['modelos confirmadas', 'locação definida'],
        resumo_executivo: 'Lançamento coleção Slim Tropical, campanha 360 com foco em digital e OOH praias.',
        confianca_analise: 76,
        transcription_summary: 'Call 27/03 — Ricardo Mendes (Havaianas) com Desirre e Fabiana. Coleção Slim Tropical, lançamento verão. Verba R$200k. Prazo set/26. Modelos e locação pendentes.',
      },
    },
    pieces: [
      {
        id: 'dd100001-0000-0000-0000-000000000002',
        title: 'Vídeo Manifesto 30s — Digital + TV',
        description: 'Filme principal: modelos na praia com sandálias Slim Tropical.',
        status: 'pending',
        public_token: 'tok_havaianas_video01',
        deadline: '+21 days',
        ai_score: null,
        ai_issues: null,
        internal_status: 'draft',
      },
      {
        id: 'dd100002-0000-0000-0000-000000000002',
        title: 'OOH Praia — Outdoor 3x9m',
        description: 'Outdoor para praias do litoral de SP e RJ.',
        status: 'pending',
        public_token: 'tok_havaianas_ooh01',
        deadline: '+28 days',
        ai_score: 88,
        ai_issues: null,
        internal_status: 'in_review',
      },
      {
        id: 'dd100003-0000-0000-0000-000000000002',
        title: 'Feed Instagram — Grid 3x3',
        description: 'Nove peças formando mosaico no feed.',
        status: 'pending',
        public_token: 'tok_havaianas_grid01',
        deadline: '+18 days',
        ai_score: 64,
        ai_issues: ['Mosaico quebra no grid se post intermediário for compartilhado'],
        internal_status: 'draft',
      },
    ],
    versions: [
      { id: 'dd200001-0000-0000-0000-000000000002', piece_id: 'dd100001-0000-0000-0000-000000000002', version_number: 1, file_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1280&q=80', file_type: 'image/jpeg' },
      { id: 'dd200002-0000-0000-0000-000000000002', piece_id: 'dd100002-0000-0000-0000-000000000002', version_number: 1, file_url: 'https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=1200&q=80', file_type: 'image/jpeg' },
      { id: 'dd200003-0000-0000-0000-000000000002', piece_id: 'dd100003-0000-0000-0000-000000000002', version_number: 1, file_url: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?w=1080&q=80', file_type: 'image/jpeg' },
    ],
    approvals: [
      { id: 'dd300001-0000-0000-0000-000000000002', piece_id: 'dd100002-0000-0000-0000-000000000002', version_id: 'dd200002-0000-0000-0000-000000000002', decision: 'approved', feedback: 'Proporções OOH perfeitas. Seguir.', decided_by: 'Bruno', role: 'da', step_order: 1, offset_hours: 1 },
    ],
    comments: [],
  },

  // ── 3. Bradesco — Conta Digital Jovem ──
  {
    project: {
      id: 'dd000003-0000-0000-0000-000000000003',
      name: 'Conta Digital Next — Gen Z',
      client_name: 'Bradesco / Next',
      sector: 'atendimento',
      briefing_score: 82,
      briefing_data: {
        produto: 'Conta Next Gen Z — abertura 100% digital',
        verba: 'R$ 150.000',
        prazo: '15/05/2026',
        aprovador: 'Amanda Luz (Gerente de Produto Digital)',
        assets_necessarios: ['mockup app Next', 'fotos jovens diversos', 'ícones do app'],
        observacoes: 'Linguagem jovem, sem ser forçada. Diversidade é obrigatória nos castings.',
        informacoes_faltando: [],
        resumo_executivo: 'Campanha digital para aquisição de correntistas Gen Z via conta Next.',
        confianca_analise: 82,
        transcription_summary: 'Call 26/03 — Amanda Luz (Bradesco) com Desirre. Conta Next Gen Z, abertura digital. Verba R$150k. Prazo 15/05. Diversidade obrigatória.',
      },
    },
    pieces: [
      {
        id: 'dd100001-0000-0000-0000-000000000003',
        title: 'Vídeo TikTok 15s — "Sua vida, seu banco"',
        description: 'Vídeo vertical estilo UGC com creators.',
        status: 'pending',
        public_token: 'tok_next_tiktok01',
        deadline: '+12 days',
        ai_score: 91,
        ai_issues: null,
        internal_status: 'in_review',
      },
      {
        id: 'dd100002-0000-0000-0000-000000000003',
        title: 'Banner Google Display 300x250',
        description: 'Display para campanha de performance.',
        status: 'pending',
        public_token: 'tok_next_display01',
        deadline: '+10 days',
        ai_score: 68,
        ai_issues: ['CTA "Abra sua conta" pouco contrastado', 'Logo Next muito pequeno'],
        internal_status: 'draft',
      },
    ],
    versions: [
      { id: 'dd200001-0000-0000-0000-000000000003', piece_id: 'dd100001-0000-0000-0000-000000000003', version_number: 1, file_url: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1080&q=80', file_type: 'image/jpeg' },
      { id: 'dd200002-0000-0000-0000-000000000003', piece_id: 'dd100002-0000-0000-0000-000000000003', version_number: 1, file_url: 'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=300&q=80', file_type: 'image/jpeg' },
    ],
    approvals: [
      { id: 'dd300001-0000-0000-0000-000000000003', piece_id: 'dd100001-0000-0000-0000-000000000003', version_id: 'dd200001-0000-0000-0000-000000000003', decision: 'approved', feedback: 'Pegada UGC muito boa. Seguir.', decided_by: 'Bruno', role: 'da', step_order: 1, offset_hours: 3 },
      { id: 'dd300002-0000-0000-0000-000000000003', piece_id: 'dd100001-0000-0000-0000-000000000003', version_id: 'dd200001-0000-0000-0000-000000000003', decision: 'approved', feedback: 'Copy jovem sem forçar. Ótimo.', decided_by: 'Carla', role: 'redator', step_order: 2, offset_hours: 1 },
    ],
    comments: [
      { id: 'dd400001-0000-0000-0000-000000000003', piece_id: 'dd100001-0000-0000-0000-000000000003', version_id: 'dd200001-0000-0000-0000-000000000003', author_name: 'Desirre (Atendimento)', content: 'Amanda adorou o conceito no call. Disse pra seguir nessa linha.', comment_type: 'general', pin_x: null, pin_y: null, is_internal: true, resolved: false, offset_hours: 2 },
    ],
  },

  // ── 4. 99 — Carnaval 2027 ──
  {
    project: {
      id: 'dd000004-0000-0000-0000-000000000004',
      name: 'Carnaval 2027 — #VaiDe99',
      client_name: '99',
      sector: 'midia',
      briefing_score: 0,
      briefing_data: null,
    },
    pieces: [
      {
        id: 'dd100001-0000-0000-0000-000000000004',
        title: 'Stories Animados — Contagem Regressiva',
        description: 'Série de 5 stories com contagem regressiva pro Carnaval.',
        status: 'pending',
        public_token: 'tok_99_stories01',
        deadline: '+30 days',
        ai_score: null,
        ai_issues: null,
        internal_status: 'draft',
      },
    ],
    versions: [
      { id: 'dd200001-0000-0000-0000-000000000004', piece_id: 'dd100001-0000-0000-0000-000000000004', version_number: 1, file_url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=1080&q=80', file_type: 'image/jpeg' },
    ],
    approvals: [],
    comments: [],
  },

  // ── 5. Nestlé — KitKat Gold ──
  {
    project: {
      id: 'dd000005-0000-0000-0000-000000000005',
      name: 'Lançamento KitKat Gold',
      client_name: 'Nestlé',
      sector: 'criacao',
      briefing_score: 95,
      briefing_data: {
        produto: 'KitKat Gold — edição limitada sabor caramelo',
        verba: 'R$ 180.000',
        prazo: '20/05/2026',
        aprovador: 'Fernanda Rocha (Brand Manager Chocolates)',
        assets_necessarios: ['foto produto Gold', 'embalagem 3D render', 'paleta dourada'],
        observacoes: 'Premium, indulgente. Destaque para o dourado. Campanha 360.',
        informacoes_faltando: [],
        resumo_executivo: 'Lançamento edição limitada KitKat Gold com campanha digital + PDV.',
        confianca_analise: 95,
        transcription_summary: 'Call 27/03 — Fernanda Rocha (Nestlé) com Desirre. KitKat Gold edição limitada, sabor caramelo. Verba R$180k. Prazo 20/05. Premium e indulgente.',
      },
    },
    pieces: [
      {
        id: 'dd100001-0000-0000-0000-000000000005',
        title: 'Key Visual — Embalagem Gold',
        description: 'Imagem hero com embalagem dourada em fundo premium.',
        status: 'approved',
        public_token: 'tok_kitkat_kv01',
        deadline: '+7 days',
        ai_score: 96,
        ai_issues: null,
        internal_status: 'sent_to_client',
      },
      {
        id: 'dd100002-0000-0000-0000-000000000005',
        title: 'Reels 15s — Unboxing Gold',
        description: 'Vídeo vertical de unboxing sensorial.',
        status: 'pending',
        public_token: 'tok_kitkat_reels01',
        deadline: '+10 days',
        ai_score: 78,
        ai_issues: ['Marca d\'água visível no canto'],
        internal_status: 'in_review',
      },
      {
        id: 'dd100003-0000-0000-0000-000000000005',
        title: 'Display PDV — Totem Dourado',
        description: 'Totem para ponto de venda em supermercados.',
        status: 'pending',
        public_token: 'tok_kitkat_pdv01',
        deadline: '+14 days',
        ai_score: 82,
        ai_issues: null,
        internal_status: 'draft',
      },
    ],
    versions: [
      { id: 'dd200001-0000-0000-0000-000000000005', piece_id: 'dd100001-0000-0000-0000-000000000005', version_number: 1, file_url: 'https://images.unsplash.com/photo-1548907040-4baa42d10919?w=1200&q=80', file_type: 'image/jpeg' },
      { id: 'dd200002-0000-0000-0000-000000000005', piece_id: 'dd100002-0000-0000-0000-000000000005', version_number: 1, file_url: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=1080&q=80', file_type: 'image/jpeg' },
      { id: 'dd200003-0000-0000-0000-000000000005', piece_id: 'dd100003-0000-0000-0000-000000000005', version_number: 1, file_url: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=1080&q=80', file_type: 'image/jpeg' },
    ],
    approvals: [
      { id: 'dd300001-0000-0000-0000-000000000005', piece_id: 'dd100001-0000-0000-0000-000000000005', version_id: 'dd200001-0000-0000-0000-000000000005', decision: 'approved', feedback: 'Dourado impecável.', decided_by: 'Bruno', role: 'da', step_order: 1, offset_hours: 8 },
      { id: 'dd300002-0000-0000-0000-000000000005', piece_id: 'dd100001-0000-0000-0000-000000000005', version_id: 'dd200001-0000-0000-0000-000000000005', decision: 'approved', feedback: 'Copy premium e direto.', decided_by: 'Carla', role: 'redator', step_order: 2, offset_hours: 6 },
      { id: 'dd300003-0000-0000-0000-000000000005', piece_id: 'dd100001-0000-0000-0000-000000000005', version_id: 'dd200001-0000-0000-0000-000000000005', decision: 'approved', feedback: 'Alinhado com brand Nestlé. Aprovado.', decided_by: 'Rodrigo', role: 'dc', step_order: 3, offset_hours: 4 },
      { id: 'dd300004-0000-0000-0000-000000000005', piece_id: 'dd100001-0000-0000-0000-000000000005', version_id: 'dd200001-0000-0000-0000-000000000005', decision: 'approved', feedback: 'Perfeito! Pode produzir.', decided_by: 'Patricia', role: 'ecd', step_order: 4, offset_hours: 2 },
    ],
    comments: [
      { id: 'dd400001-0000-0000-0000-000000000005', piece_id: 'dd100001-0000-0000-0000-000000000005', version_id: 'dd200001-0000-0000-0000-000000000005', author_name: 'Fernanda Rocha', content: 'O dourado ficou exatamente como imaginei. Aprovado!', comment_type: 'general', pin_x: null, pin_y: null, is_internal: false, resolved: true, offset_hours: 1 },
    ],
  },

  // ── 6. Vivo — 5G para Todos ──
  {
    project: {
      id: 'dd000006-0000-0000-0000-000000000006',
      name: 'Campanha 5G para Todos',
      client_name: 'Vivo',
      sector: 'atendimento',
      briefing_score: 67,
      briefing_data: {
        produto: 'Plano Vivo 5G — democratização do acesso',
        verba: 'R$ 250.000',
        prazo: '10/06/2026',
        aprovador: 'Lucas Diniz (Dir. de Comunicação)',
        assets_necessarios: ['logo 5G', 'mockup celular 5G', 'ícones velocidade'],
        observacoes: 'Foco em acessibilidade e inclusão digital. Evitar linguagem técnica.',
        informacoes_faltando: ['planos e preços finais', 'praças de lançamento'],
        resumo_executivo: 'Campanha de democratização do 5G com foco em inclusão. Verba aprovada mas praças indefinidas.',
        confianca_analise: 67,
        transcription_summary: 'Call 25/03 — Lucas Diniz (Vivo) com Desirre. 5G para Todos, inclusão digital. Verba R$250k. Prazo 10/06. Praças e preços pendentes.',
      },
    },
    pieces: [
      {
        id: 'dd100001-0000-0000-0000-000000000006',
        title: 'Filme 30s — "Conecta Todo Mundo"',
        description: 'Filme emocional com famílias de diferentes regiões usando 5G.',
        status: 'revision_requested',
        public_token: 'tok_vivo_filme01',
        deadline: '+16 days',
        ai_score: 74,
        ai_issues: ['Legendas ausentes (acessibilidade)', 'Transição brusca no segundo 18'],
        internal_status: 'in_review',
      },
      {
        id: 'dd100002-0000-0000-0000-000000000006',
        title: 'Banner LinkedIn 1200x628',
        description: 'Campanha de awareness corporativa.',
        status: 'pending',
        public_token: 'tok_vivo_linkedin01',
        deadline: '+12 days',
        ai_score: 81,
        ai_issues: null,
        internal_status: 'in_review',
      },
    ],
    versions: [
      { id: 'dd200001-0000-0000-0000-000000000006', piece_id: 'dd100001-0000-0000-0000-000000000006', version_number: 1, file_url: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=1280&q=80', file_type: 'image/jpeg' },
      { id: 'dd200002-0000-0000-0000-000000000006', piece_id: 'dd100002-0000-0000-0000-000000000006', version_number: 1, file_url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1200&q=80', file_type: 'image/jpeg' },
    ],
    approvals: [
      { id: 'dd300001-0000-0000-0000-000000000006', piece_id: 'dd100001-0000-0000-0000-000000000006', version_id: 'dd200001-0000-0000-0000-000000000006', decision: 'approved', feedback: 'Storyboard ok. Seguir.', decided_by: 'Bruno', role: 'da', step_order: 1, offset_hours: 4 },
      { id: 'dd300002-0000-0000-0000-000000000006', piece_id: 'dd100001-0000-0000-0000-000000000006', version_id: 'dd200001-0000-0000-0000-000000000006', decision: 'revision_requested', feedback: 'Precisa legendas e ajustar transição no 18s. Fora isso, ótimo.', decided_by: 'Carla', role: 'redator', step_order: 2, offset_hours: 2 },
      { id: 'dd300003-0000-0000-0000-000000000006', piece_id: 'dd100002-0000-0000-0000-000000000006', version_id: 'dd200002-0000-0000-0000-000000000006', decision: 'approved', feedback: 'Layout LinkedIn dentro do padrão corporativo.', decided_by: 'Bruno', role: 'da', step_order: 1, offset_hours: 1 },
    ],
    comments: [
      { id: 'dd400001-0000-0000-0000-000000000006', piece_id: 'dd100001-0000-0000-0000-000000000006', version_id: 'dd200001-0000-0000-0000-000000000006', author_name: 'Lucas Diniz', content: 'Gostei do conceito mas precisa legenda em tudo. Nosso público é diverso.', comment_type: 'general', pin_x: null, pin_y: null, is_internal: false, resolved: false, offset_hours: 1 },
    ],
  },
]
