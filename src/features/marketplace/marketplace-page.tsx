import { useState, useMemo } from 'react'
import {
  Search,
  SlidersHorizontal,
  MapPin,
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Input,
  Select,
  Badge,
  Avatar,
  StarRating,
  EmptyState,
} from '@/components/ui'
import { truncate } from '@/lib/utils'

/* ─── Types ───────────────────────────────────────────────────── */

interface Professional {
  id: string
  name: string
  avatar: string | null
  specialty: string
  verified: boolean
  description: string
  rating: number
  reviewCount: number
  priceInCents: number
  city: string
  state: string
}

type SortOption = 'rating' | 'price_asc' | 'price_desc'

/* ─── Mock Data ───────────────────────────────────────────────── */

const SPECIALTIES = [
  'Todas',
  'Nutricionista',
  'Nutrólogo',
  'Endocrinologista',
  'Nutricionista Esportivo',
  'Nutricionista Clínico',
  'Nutricionista Materno-Infantil',
]

const MOCK_PROFESSIONALS: Professional[] = [
  {
    id: '1',
    name: 'Dra. Ana Carolina Mendes',
    avatar: null,
    specialty: 'Nutricionista Clínico',
    verified: true,
    description:
      'Especialista em nutrição clínica com foco em doenças crônicas, reeducação alimentar e emagrecimento saudável. Atendimento humanizado e baseado em evidências científicas.',
    rating: 4.9,
    reviewCount: 127,
    priceInCents: 25000,
    city: 'São Paulo',
    state: 'SP',
  },
  {
    id: '2',
    name: 'Dr. Rafael Oliveira Santos',
    avatar: null,
    specialty: 'Nutrólogo',
    verified: true,
    description:
      'Médico nutrólogo com 12 anos de experiência. Especialista em metabolismo, suplementação e tratamento de obesidade. Abordagem integrativa.',
    rating: 4.8,
    reviewCount: 89,
    priceInCents: 35000,
    city: 'Rio de Janeiro',
    state: 'RJ',
  },
  {
    id: '3',
    name: 'Dra. Juliana Costa Ferreira',
    avatar: null,
    specialty: 'Nutricionista Esportivo',
    verified: true,
    description:
      'Nutricionista esportiva com experiência em atletas de alta performance. Trabalho com periodização nutricional, suplementação e composição corporal.',
    rating: 4.7,
    reviewCount: 65,
    priceInCents: 20000,
    city: 'Belo Horizonte',
    state: 'MG',
  },
  {
    id: '4',
    name: 'Dr. Pedro Henrique Lima',
    avatar: null,
    specialty: 'Endocrinologista',
    verified: false,
    description:
      'Endocrinologista focado em distúrbios metabólicos, tireoide e diabetes. Atendimento completo com acompanhamento contínuo.',
    rating: 4.5,
    reviewCount: 42,
    priceInCents: 40000,
    city: 'Curitiba',
    state: 'PR',
  },
  {
    id: '5',
    name: 'Dra. Mariana Souza Alves',
    avatar: null,
    specialty: 'Nutricionista Materno-Infantil',
    verified: true,
    description:
      'Nutricionista especializada em gestantes, lactantes e introdução alimentar. Acompanhamento nutricional desde a gestação até os primeiros anos de vida.',
    rating: 4.9,
    reviewCount: 156,
    priceInCents: 22000,
    city: 'Brasília',
    state: 'DF',
  },
  {
    id: '6',
    name: 'Dr. Lucas Gabriel Ribeiro',
    avatar: null,
    specialty: 'Nutricionista Esportivo',
    verified: true,
    description:
      'Especialista em nutrição para esportes de endurance e musculação. Trabalho com atletas amadores e profissionais em todo o Brasil.',
    rating: 4.6,
    reviewCount: 78,
    priceInCents: 18000,
    city: 'Florianópolis',
    state: 'SC',
  },
  {
    id: '7',
    name: 'Dra. Camila Rodrigues Pinto',
    avatar: null,
    specialty: 'Nutricionista Clínico',
    verified: true,
    description:
      'Nutricionista com foco em transtornos alimentares e saúde mental. Abordagem comportamental e acolhedora para reeducação alimentar.',
    rating: 4.8,
    reviewCount: 93,
    priceInCents: 28000,
    city: 'Porto Alegre',
    state: 'RS',
  },
  {
    id: '8',
    name: 'Dr. Thiago Nascimento',
    avatar: null,
    specialty: 'Nutrólogo',
    verified: false,
    description:
      'Médico nutrólogo com foco em longevidade e medicina preventiva. Protocolos personalizados para otimização de saúde e performance.',
    rating: 4.4,
    reviewCount: 31,
    priceInCents: 45000,
    city: 'Salvador',
    state: 'BA',
  },
  {
    id: '9',
    name: 'Dra. Isabela Martins',
    avatar: null,
    specialty: 'Nutricionista',
    verified: true,
    description:
      'Nutricionista generalista com experiência em emagrecimento, ganho de massa e alimentação funcional. Atendimento online e presencial.',
    rating: 4.3,
    reviewCount: 55,
    priceInCents: 15000,
    city: 'Goiânia',
    state: 'GO',
  },
  {
    id: '10',
    name: 'Dr. Fernando Barros Costa',
    avatar: null,
    specialty: 'Endocrinologista',
    verified: true,
    description:
      'Endocrinologista com expertise em síndrome metabólica, resistência à insulina e reposição hormonal. Atendimento baseado em evidências.',
    rating: 4.7,
    reviewCount: 112,
    priceInCents: 38000,
    city: 'Recife',
    state: 'PE',
  },
  {
    id: '11',
    name: 'Dra. Beatriz Fonseca',
    avatar: null,
    specialty: 'Nutricionista Clínico',
    verified: true,
    description:
      'Especialista em nutrição oncológica e doenças autoimunes. Trabalho integrado com equipes multidisciplinares para melhor resultado do paciente.',
    rating: 4.9,
    reviewCount: 67,
    priceInCents: 30000,
    city: 'Campinas',
    state: 'SP',
  },
  {
    id: '12',
    name: 'Dr. Gustavo Almeida',
    avatar: null,
    specialty: 'Nutricionista Esportivo',
    verified: false,
    description:
      'Nutricionista esportivo especializado em crossfit e artes marciais. Protocolos de cutting e bulking personalizados.',
    rating: 4.2,
    reviewCount: 28,
    priceInCents: 17000,
    city: 'Fortaleza',
    state: 'CE',
  },
]

const ITEMS_PER_PAGE = 6

/* ─── Helpers ─────────────────────────────────────────────────── */

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/* ─── Component ───────────────────────────────────────────────── */

export function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [specialty, setSpecialty] = useState('Todas')
  const [minRating, setMinRating] = useState(0)
  const [priceRange, setPriceRange] = useState<'all' | 'low' | 'mid' | 'high'>('all')
  const [sortBy, setSortBy] = useState<SortOption>('rating')
  const [currentPage, setCurrentPage] = useState(1)
  const [showFilters, setShowFilters] = useState(false)

  const filtered = useMemo(() => {
    let results = [...MOCK_PROFESSIONALS]

    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.specialty.toLowerCase().includes(q) ||
          p.city.toLowerCase().includes(q),
      )
    }

    // Specialty
    if (specialty !== 'Todas') {
      results = results.filter((p) => p.specialty === specialty)
    }

    // Min rating
    if (minRating > 0) {
      results = results.filter((p) => p.rating >= minRating)
    }

    // Price range
    if (priceRange === 'low') {
      results = results.filter((p) => p.priceInCents <= 20000)
    } else if (priceRange === 'mid') {
      results = results.filter((p) => p.priceInCents > 20000 && p.priceInCents <= 35000)
    } else if (priceRange === 'high') {
      results = results.filter((p) => p.priceInCents > 35000)
    }

    // Sort
    if (sortBy === 'rating') {
      results.sort((a, b) => b.rating - a.rating)
    } else if (sortBy === 'price_asc') {
      results.sort((a, b) => a.priceInCents - b.priceInCents)
    } else if (sortBy === 'price_desc') {
      results.sort((a, b) => b.priceInCents - a.priceInCents)
    }

    return results
  }, [searchQuery, specialty, minRating, priceRange, sortBy])

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE))
  const paginatedResults = filtered.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  function handleSearchChange(value: string) {
    setSearchQuery(value)
    setCurrentPage(1)
  }

  function handleFilterChange() {
    setCurrentPage(1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Hero Section ─────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-700 px-4 py-16 text-white sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            Encontre o profissional ideal para voce
          </h1>
          <p className="mt-4 text-lg text-blue-100">
            Nutricionistas, nutrologos e especialistas verificados prontos para te atender
          </p>

          <div className="mt-8 flex items-center gap-2">
            <Input
              placeholder="Buscar por nome, especialidade ou cidade..."
              value={searchQuery}
              onChange={(e) => handleSearchChange(e.target.value)}
              leftIcon={<Search className="h-5 w-5" />}
              className="h-12 border-0 bg-white text-gray-900 shadow-lg"
              wrapperClassName="flex-1"
            />
            <Button
              size="lg"
              variant="secondary"
              className="h-12 shrink-0 lg:hidden"
              onClick={() => setShowFilters(!showFilters)}
            >
              <SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* ─── Main Content ─────────────────────────────────────── */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-8 lg:flex-row">
          {/* ─── Filter Sidebar ───────────────────────────────── */}
          <aside
            className={`w-full shrink-0 lg:block lg:w-64 ${showFilters ? 'block' : 'hidden'}`}
          >
            <Card>
              <CardContent className="space-y-6 p-6">
                <div>
                  <Select
                    label="Especialidade"
                    value={specialty}
                    onChange={(e) => {
                      setSpecialty(e.target.value)
                      handleFilterChange()
                    }}
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </Select>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    Avaliacao minima
                  </label>
                  <StarRating
                    value={minRating}
                    onChange={(val) => {
                      setMinRating(val === minRating ? 0 : val)
                      handleFilterChange()
                    }}
                    size="md"
                  />
                  {minRating > 0 && (
                    <p className="mt-1 text-xs text-gray-500">
                      {minRating}+ estrelas
                    </p>
                  )}
                </div>

                <div>
                  <Select
                    label="Faixa de preco"
                    value={priceRange}
                    onChange={(e) => {
                      setPriceRange(e.target.value as typeof priceRange)
                      handleFilterChange()
                    }}
                  >
                    <option value="all">Qualquer preco</option>
                    <option value="low">Ate R$ 200</option>
                    <option value="mid">R$ 200 - R$ 350</option>
                    <option value="high">Acima de R$ 350</option>
                  </Select>
                </div>

                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    setSpecialty('Todas')
                    setMinRating(0)
                    setPriceRange('all')
                    setSearchQuery('')
                    setCurrentPage(1)
                  }}
                >
                  Limpar filtros
                </Button>
              </CardContent>
            </Card>
          </aside>

          {/* ─── Results ──────────────────────────────────────── */}
          <div className="flex-1">
            {/* Sort bar */}
            <div className="mb-6 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
              <p className="text-sm text-gray-600">
                {filtered.length} profissional{filtered.length !== 1 ? 'is' : ''} encontrado
                {filtered.length !== 1 ? 's' : ''}
              </p>

              <div className="flex items-center gap-2">
                <ArrowUpDown className="h-4 w-4 text-gray-400" />
                <Select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                >
                  <option value="rating">Melhor avaliacao</option>
                  <option value="price_asc">Menor preco</option>
                  <option value="price_desc">Maior preco</option>
                </Select>
              </div>
            </div>

            {/* Results grid */}
            {paginatedResults.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {paginatedResults.map((prof) => (
                  <ProfessionalCard key={prof.id} professional={prof} />
                ))}
              </div>
            ) : (
              <EmptyState
                icon={<Search className="h-6 w-6" />}
                title="Nenhum profissional encontrado"
                description="Tente ajustar seus filtros ou buscar por outro termo."
                action={
                  <Button
                    variant="outline"
                    onClick={() => {
                      setSpecialty('Todas')
                      setMinRating(0)
                      setPriceRange('all')
                      setSearchQuery('')
                      setCurrentPage(1)
                    }}
                  >
                    Limpar filtros
                  </Button>
                }
              />
            )}

            {/* Pagination */}
            {filtered.length > ITEMS_PER_PAGE && (
              <div className="mt-8 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <Button
                    key={page}
                    variant={page === currentPage ? 'primary' : 'ghost'}
                    size="sm"
                    onClick={() => setCurrentPage(page)}
                    className="min-w-[36px]"
                  >
                    {page}
                  </Button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Proximo
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Professional Card ───────────────────────────────────────── */

function ProfessionalCard({ professional }: { professional: Professional }) {
  const { name, avatar, specialty, verified, description, rating, reviewCount, priceInCents, city, state } =
    professional

  return (
    <Card className="flex flex-col transition-shadow hover:shadow-md">
      <CardContent className="flex flex-1 flex-col gap-4 p-6">
        {/* Header */}
        <div className="flex items-start gap-3">
          <Avatar name={name} src={avatar} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-sm font-semibold text-gray-900">{name}</h3>
              {verified && <BadgeCheck className="h-4 w-4 shrink-0 text-blue-500" />}
            </div>
            <Badge variant="info" size="sm" className="mt-1">
              {specialty}
            </Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-gray-600">
          {truncate(description, 120)}
        </p>

        {/* Rating & Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <StarRating value={rating} size="sm" readOnly />
            <span className="text-sm font-medium text-gray-700">{rating.toFixed(1)}</span>
            <span className="text-xs text-gray-400">({reviewCount})</span>
          </div>
          <span className="text-sm font-bold text-green-600">{formatPrice(priceInCents)}</span>
        </div>

        {/* Location */}
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <MapPin className="h-3.5 w-3.5" />
          <span>
            {city}, {state}
          </span>
        </div>

        {/* Actions */}
        <div className="mt-auto flex gap-2 pt-2">
          <Button variant="outline" size="sm" className="flex-1">
            Ver Perfil
          </Button>
          <Button variant="primary" size="sm" className="flex-1">
            Agendar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
