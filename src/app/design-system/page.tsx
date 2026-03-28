'use client'

import { useState } from 'react'
import { RoleSwitcher, ViewAsBanner, type AppRole } from '@/components/ui/RoleSwitcher'
import { AISuggestionCard } from '@/components/ui/AISuggestionCard'
import { AIReviewScoreBadge } from '@/components/ui/AIReviewScore'
import { ClapperboardDigital } from '@/components/ui/ClapperboardDigital'
import { NewsWidget, type NewsItem } from '@/components/ui/NewsWidget'
import { LearningCard } from '@/components/ui/LearningCard'
import { SupplierCard, type Supplier } from '@/components/ui/SupplierCard'

/* ── Demo data ──────────────────────────────────────────────────── */

const DEMO_NEWS: NewsItem[] = [
  {
    id: '1',
    source: 'M&M',
    headline: 'Cannes Lions 2026 abre inscrições com foco em IA generativa na criatividade',
    aiSummary: 'Festival amplia categorias para incluir obras geradas ou assistidas por IA.',
    category: 'Prêmios',
    hoursAgo: 2,
    url: '#',
  },
  {
    id: '2',
    source: 'CC',
    headline: 'Meta anuncia novo formato de anúncio em realidade aumentada para Instagram',
    aiSummary: 'AR Ads prometem CTR 3x maior que formatos convencionais.',
    category: 'Mídia',
    hoursAgo: 5,
    url: '#',
  },
  {
    id: '3',
    source: 'AdAge',
    headline: 'Tendências de branding 2026: minimalismo radical e identidades fluidas dominam',
    aiSummary: 'Grandes marcas adotam sistemas visuais adaptáveis em vez de logos fixos.',
    category: 'Criação',
    hoursAgo: 8,
    url: '#',
  },
  {
    id: '4',
    source: 'Propmark',
    headline: 'Investimento em mídia programática cresce 38% no Brasil no primeiro trimestre',
    aiSummary: 'CTV e DOOH lideraram expansão segundo relatório do IAB Brasil.',
    category: 'Mídia',
    hoursAgo: 12,
    url: '#',
  },
  {
    id: '5',
    source: 'Meio',
    headline: 'CONAR atualiza regras para publicidade de criptoativos e finanças descentralizadas',
    aiSummary: 'Novas diretrizes exigem disclaimers mais visíveis em peças digitais.',
    category: 'Tecnologia',
    hoursAgo: 18,
    url: '#',
  },
  {
    id: '6',
    source: 'M&M',
    headline: 'Globo lança plataforma de branded content integrado com streaming',
    aiSummary: 'Marcas poderão co-produzir séries e documentários distribuídos no Globoplay.',
    category: 'Mídia',
    hoursAgo: 24,
    url: '#',
  },
]

const DEMO_SUPPLIER: Supplier = {
  id: '1',
  name: 'Produtora Zoom',
  specialty: 'Produção audiovisual e VT comercial',
  categories: ['Filmagem', 'Edição', 'Motion', 'Color Grading'],
  rating: 4.7,
  verified: true,
  crivoParter: true,
  website: 'https://produtorazoom.com.br',
  email: 'orcamento@produtorazoom.com.br',
  phone: '+55 11 4002-8922',
  avatarColor: 'bg-indigo-500',
}

/* ── Section wrapper ────────────────────────────────────────────── */
function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4">
      <div className="border-b border-slate-200 pb-2">
        <h2 className="text-lg font-bold text-slate-800">{title}</h2>
      </div>
      {children}
    </section>
  )
}

/* ── Page ───────────────────────────────────────────────────────── */
export default function DesignSystemPage() {
  const [originalRole] = useState<AppRole>('ceo')
  const [currentRole, setCurrentRole] = useState<AppRole>('ceo')
  const isViewingAs = currentRole !== originalRole

  return (
    <>
      {/* View-as banner */}
      {isViewingAs && (
        <ViewAsBanner
          viewingAs={currentRole}
          originalRole={originalRole}
          onReset={() => setCurrentRole(originalRole)}
        />
      )}

      <div className={`min-h-screen bg-slate-50 ${isViewingAs ? 'pt-10' : ''}`}>
        {/* Navbar stub */}
        <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-3 backdrop-blur">
          <span className="font-mono text-lg font-black tracking-widest text-slate-900">CRIVO</span>
          <RoleSwitcher
            originalRole={originalRole}
            currentRole={currentRole}
            userName="Fernando"
            userInitial="F"
            onRoleChange={setCurrentRole}
          />
        </header>

        <main className="mx-auto max-w-5xl space-y-16 px-4 py-12">

          {/* 1. Role Switcher */}
          <Section title="1 — Role Switcher">
            <p className="text-sm text-slate-500">
              Clique no pill no canto superior direito para alternar entre roles.
              Quando o role ativo diferir do original, o banner amarelo aparece no topo.
            </p>
            <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500">
              Role atual: <strong className="text-slate-800">{currentRole}</strong>
            </div>
          </Section>

          {/* 2. AI Suggestion Cards */}
          <Section title="2 — AI Suggestion Cards">
            <div className="grid gap-4 md:grid-cols-3">
              <AISuggestionCard
                variant="info"
                title="Padrão de briefings detectado"
                body="Nos últimos 30 dias, 80% dos briefings de Mídia chegam na quinta-feira. Considere ajustar o fluxo de aprovações."
                actionLabel="Ver análise"
                onAction={() => {}}
              />
              <AISuggestionCard
                variant="warning"
                title="Prazo em risco — Campanha Verão"
                body="Com base no histórico de revisões, esta peça provavelmente não será aprovada até sexta-feira."
                actionLabel="Escalar para gestor"
                onAction={() => {}}
              />
              <AISuggestionCard
                variant="action"
                title="Sugestão de título para VT"
                body="Com base no briefing, 3 opções de título foram geradas. Clique para revisar e aplicar ao documento."
                actionLabel="Ver sugestões"
                onAction={() => {}}
              />
            </div>
          </Section>

          {/* 3. AI Review Score */}
          <Section title="3 — Score de Prontidão da Peça">
            <div className="flex flex-wrap items-end gap-8 rounded-xl border border-slate-200 bg-white p-8">
              <div className="flex flex-col items-center gap-1">
                <p className="mb-2 text-xs text-slate-400">Score 92</p>
                <AIReviewScoreBadge
                  score={92}
                  issues={[]}
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="mb-2 text-xs text-slate-400">Score 65</p>
                <AIReviewScoreBadge
                  score={65}
                  issues={[
                    'Logotipo abaixo do tamanho mínimo (20px)',
                    'Contraste de texto insuficiente no rodapé',
                    'Versão mobile não enviada',
                  ]}
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="mb-2 text-xs text-slate-400">Score 28</p>
                <AIReviewScoreBadge
                  score={28}
                  issues={[
                    'Briefing não seguido — produto errado destacado',
                    'Fonte não aprovada pela marca',
                    'Resolução abaixo do exigido para impressão',
                    'Claim não aprovado pelo jurídico',
                  ]}
                />
              </div>
              <div className="flex flex-col items-center gap-1">
                <p className="mb-2 text-xs text-slate-400">sm — Score 78</p>
                <AIReviewScoreBadge score={78} size="sm" issues={['Verificar paleta de cores']} />
              </div>
            </div>
          </Section>

          {/* 4. Claquete Digital */}
          <Section title="4 — Claquete Digital">
            <ClapperboardDigital />
          </Section>

          {/* 5. News Widget */}
          <Section title="5 — News Widget">
            <div className="max-w-sm">
              <NewsWidget items={DEMO_NEWS} newCount={3} />
            </div>
          </Section>

          {/* 6. Learning Cards */}
          <Section title="6 — Learning Center Cards">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <LearningCard
                type="internal"
                sector="criacao"
                title="Como estruturar um briefing criativo perfeito"
                description="Aprenda a extrair todas as informações essenciais do cliente antes de iniciar qualquer produção criativa."
                level="Iniciante"
                duration="5 min leitura"
                targetRole="Criação"
                href="#"
              />
              <LearningCard
                type="internal"
                sector="midia"
                title="Métricas de mídia que realmente importam"
                description="CPM, CTR, ROAS — entenda quais KPIs usar em cada tipo de campanha e como apresentá-los para o cliente."
                level="Intermediário"
                duration="8 min leitura"
                targetRole="Mídia"
                href="#"
              />
              <LearningCard
                type="external"
                sector="rtv"
                title="Produção de VT para TV aberta — fundamentos"
                description="Curso completo cobrindo pré-produção, filmagem, pós-produção e entrega de materiais para emissoras."
                level="Avançado"
                duration="2h curso"
                targetRole="Mídia"
                source="Coursera"
                href="#"
              />
            </div>
          </Section>

          {/* 7. Supplier Card */}
          <Section title="7 — Supplier Card">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <SupplierCard supplier={DEMO_SUPPLIER} />
              <SupplierCard
                supplier={{
                  id: '2',
                  name: 'Studio Pixel',
                  specialty: 'Design gráfico e identidade visual',
                  categories: ['Branding', 'Tipografia', 'Packaging'],
                  rating: 4.2,
                  verified: true,
                  crivoParter: false,
                  email: 'hello@studiopixel.com.br',
                  phone: '+55 11 9999-8888',
                  avatarColor: 'bg-violet-500',
                }}
              />
              <SupplierCard
                supplier={{
                  id: '3',
                  name: 'Locadora Equip',
                  specialty: 'Aluguel de equipamentos fotográficos',
                  categories: ['Câmeras', 'Iluminação', 'Acessórios'],
                  rating: 3.8,
                  verified: false,
                  crivoParter: false,
                  website: 'https://locadoraequip.com.br',
                  email: 'locacao@locadoraequip.com.br',
                  avatarColor: 'bg-orange-500',
                }}
              />
            </div>
          </Section>

        </main>
      </div>
    </>
  )
}
