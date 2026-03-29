'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { SupplierCard, type Supplier } from '@/components/fornecedores/SupplierCard'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { cn } from '@/lib/utils'

const MOCK_SUPPLIERS: Supplier[] = [
  { id: '1', name: 'Studio 81', specialty: 'Fotografia', categories: ['Fotografia'], rating: 4.9, verified: true, crivo_partner: true },
  { id: '2', name: 'Frame Motion', specialty: 'Motion Design / Vídeo', categories: ['Motion', 'Vídeo'], rating: 4.7, verified: true, crivo_partner: false },
  { id: '3', name: 'Voxa Audio', specialty: 'Áudio / Locução', categories: ['Áudio'], rating: 4.5, verified: false, crivo_partner: false },
  { id: '4', name: 'Pixel Makers', specialty: 'Fotografia / Retoque', categories: ['Fotografia'], rating: 4.3, verified: false, crivo_partner: false },
  { id: '5', name: 'TeleArte Produções', specialty: 'RTV / Produção', categories: ['Vídeo'], rating: 4.8, verified: true, crivo_partner: false },
  { id: '6', name: 'Gráfica Premium', specialty: 'Impressão / Acabamento', categories: ['Impressão'], rating: 4.2, verified: false, crivo_partner: false },
]

const FILTER_TABS = ['Todos', 'Fotografia', 'Vídeo', 'Motion', 'Áudio', 'Impressão']

export default function FornecedoresPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('Todos')
  const [search, setSearch] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase
        .from('suppliers')
        .select('*')
        .order('crivo_partner', { ascending: false })
        .order('rating', { ascending: false })
      setSuppliers(data && data.length > 0 ? (data as Supplier[]) : MOCK_SUPPLIERS)
      setLoading(false)
    }
    load()
  }, [])

  const visible = suppliers.filter(s => {
    const matchFilter = filter === 'Todos' || s.categories.some(c => c === filter)
    const matchSearch = !search.trim() || s.name.toLowerCase().includes(search.toLowerCase())
    return matchFilter && matchSearch
  })

  return (
    <div className="px-6 py-8 min-h-screen">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-slate-900">Fornecedores</h1>
        <p className="text-sm text-slate-400 mt-1">Parceiros e prestadores homologados</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <div className="flex items-center gap-1 bg-slate-100 rounded-xl p-1 w-fit flex-wrap">
          {FILTER_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                filter === tab ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              )}
            >
              {tab}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nome..."
            className="pl-8 w-64"
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-36 bg-slate-100 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : visible.length === 0 ? (
        <div className="text-sm text-slate-400 text-center py-16">Nenhum fornecedor encontrado</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {visible.map((s, i) => <SupplierCard key={s.id ?? i} s={s} />)}
        </div>
      )}
    </div>
  )
}
