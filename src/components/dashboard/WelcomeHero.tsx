'use client'

interface WelcomeHeroProps {
  onCreateProject: () => void
}

const STEPS = [
  {
    number: '1',
    icon: '📂',
    title: 'Crie um projeto',
    description: 'Organize as peças por cliente e campanha. Dê um nome, escolha o setor responsável e pronto.',
  },
  {
    number: '2',
    icon: '🎨',
    title: 'Suba as peças',
    description: 'Faça upload de imagens (JPG, PNG) ou PDFs. Cada peça ganha um link único de revisão.',
  },
  {
    number: '3',
    icon: '🔗',
    title: 'Envie para o cliente',
    description: 'O cliente recebe um email com o link. Sem app, sem cadastro — ele abre e revisa direto.',
  },
  {
    number: '4',
    icon: '✅',
    title: 'Receba a aprovação',
    description: 'O cliente aprova ou pede revisão com comentários. Você recebe aviso no WhatsApp em tempo real.',
  },
]

export function WelcomeHero({ onCreateProject }: WelcomeHeroProps) {
  return (
    <div className="mb-8">
      {/* Hero banner */}
      <div className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-700 rounded-2xl p-8 text-white mb-8">
        <div className="max-w-2xl">
          <h1 className="text-3xl font-bold mb-3">
            Aprovação de peças criativas sem WhatsApp, sem confusão.
          </h1>
          <p className="text-indigo-100 text-lg mb-6">
            O <strong>Crivo</strong> organiza todo o fluxo de aprovação entre agência e cliente em um só lugar.
            Crie projetos, suba peças, envie links e receba aprovações com feedback — tudo rastreável e profissional.
          </p>
          <button
            onClick={onCreateProject}
            className="bg-white text-indigo-700 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-50 transition-colors shadow-lg"
          >
            Criar meu primeiro projeto
          </button>
        </div>
      </div>

      {/* How it works — 4 steps */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-1">Como funciona?</h2>
        <p className="text-sm text-slate-500 mb-4">Em 4 passos simples, sua agência sai do caos do WhatsApp para um fluxo limpo e rastreável.</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STEPS.map(step => (
          <div key={step.number} className="bg-white border border-slate-200 rounded-xl p-5 relative">
            <div className="flex items-center gap-3 mb-3">
              <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold">
                {step.number}
              </span>
              <span className="text-2xl">{step.icon}</span>
            </div>
            <h3 className="font-semibold text-slate-900 mb-1">{step.title}</h3>
            <p className="text-sm text-slate-500">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Demo callout */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0">💡</span>
        <div>
          <p className="text-sm text-amber-800 font-medium">Quer ver como funciona antes de criar?</p>
          <p className="text-sm text-amber-700 mt-0.5">
            Clique em <strong>&quot;Criar meu primeiro projeto&quot;</strong> acima, dê um nome qualquer e suba uma imagem.
            Em segundos você terá um link de revisão para testar a experiência completa do cliente.
          </p>
        </div>
      </div>
    </div>
  )
}
