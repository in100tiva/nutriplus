import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Avatar, Loading, EmptyState, Badge } from '@/components/ui'
import { IconSearch, IconChevR, IconUsers } from '@/components/icons'
import { centavosParaBRL } from '@/lib/utils'

interface NutriCard {
  id: string
  slug: string
  crn: string
  bio: string | null
  valor_consulta_centavos: number
  duracao_consulta_min: number
  profiles: { nome: string; avatar_url: string | null } | null
  nutricionista_especialidades: Array<{
    especialidades: { id: string; nome: string; slug: string } | null
  }> | null
}

export interface CatalogoProps {
  /** Limita o número de cards renderizados (útil na landing) */
  limit?: number
  /** Esconde a busca e o filtro (útil em previews) */
  compact?: boolean
  /** Como o card monta o link "Ver agenda". `(nutri) => string` */
  hrefBuilder?: (nutri: NutriCard) => string
  /** Texto opcional para o botão de cada card */
  ctaLabel?: string
}

export function Catalogo({
  limit,
  compact = false,
  hrefBuilder,
  ctaLabel = 'Ver agenda',
}: CatalogoProps) {
  const [busca, setBusca] = useState('')
  const [espSlug, setEspSlug] = useState<string>('todos')

  const { data: especialidades } = useQuery({
    queryKey: ['marketplace-especialidades'],
    queryFn: async () => {
      const { data } = await supabase
        .from('especialidades')
        .select('id, nome, slug')
        .order('nome')
      return data ?? []
    },
  })

  const { data: nutris, isLoading } = useQuery({
    queryKey: ['marketplace-nutris'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nutricionistas')
        .select(
          'id, slug, crn, bio, valor_consulta_centavos, duracao_consulta_min, profiles!nutricionistas_profile_id_fkey(nome, avatar_url), nutricionista_especialidades(especialidades(id, nome, slug))',
        )
        .eq('ativo', true)
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as NutriCard[]
    },
  })

  const filtrados = useMemo(() => {
    let arr = nutris ?? []
    if (espSlug !== 'todos') {
      arr = arr.filter((n) =>
        (n.nutricionista_especialidades ?? []).some(
          (e) => e.especialidades?.slug === espSlug,
        ),
      )
    }
    if (busca.trim()) {
      const q = busca.toLowerCase()
      arr = arr.filter(
        (n) =>
          n.profiles?.nome.toLowerCase().includes(q) ||
          n.bio?.toLowerCase().includes(q) ||
          (n.nutricionista_especialidades ?? []).some((e) =>
            e.especialidades?.nome.toLowerCase().includes(q),
          ),
      )
    }
    if (limit) arr = arr.slice(0, limit)
    return arr
  }, [nutris, busca, espSlug, limit])

  const buildHref = (n: NutriCard) => (hrefBuilder ? hrefBuilder(n) : `/nutri/${n.slug}`)

  return (
    <div>
      {!compact && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            alignItems: 'center',
            marginBottom: 16,
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: 'var(--paper-3)',
              border: '0.5px solid var(--line)',
              borderRadius: 999,
              padding: '8px 14px',
              flex: '1 1 280px',
              minWidth: 240,
            }}
          >
            <IconSearch />
            <input
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, especialidade ou bio…"
              style={{
                flex: 1,
                border: 0,
                background: 'transparent',
                outline: 0,
                font: 'inherit',
                color: 'var(--ink)',
                fontSize: 13.5,
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            <FilterPill
              active={espSlug === 'todos'}
              onClick={() => setEspSlug('todos')}
            >
              Todos
            </FilterPill>
            {(especialidades ?? []).map((e) => (
              <FilterPill
                key={e.slug}
                active={espSlug === e.slug}
                onClick={() => setEspSlug(e.slug)}
              >
                {e.nome}
              </FilterPill>
            ))}
          </div>
        </div>
      )}

      {isLoading ? (
        <Loading label="Carregando profissionais…" />
      ) : filtrados.length === 0 ? (
        <EmptyState
          icon={<IconUsers />}
          title="Nenhum nutricionista encontrado"
          description={
            busca || espSlug !== 'todos'
              ? 'Tente outro termo ou especialidade.'
              : 'Em breve teremos profissionais disponíveis.'
          }
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
            gap: 14,
          }}
        >
          {filtrados.map((n) => (
            <NutriCardView
              key={n.id}
              nutri={n}
              href={buildHref(n)}
              ctaLabel={ctaLabel}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function FilterPill({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        appearance: 'none',
        font: 'inherit',
        padding: '6px 12px',
        borderRadius: 999,
        fontSize: 12,
        fontWeight: 500,
        cursor: 'default',
        border: active ? 0 : '0.5px solid var(--line)',
        background: active ? 'var(--ink)' : 'var(--paper-3)',
        color: active ? 'var(--paper)' : 'var(--ink-2)',
      }}
    >
      {children}
    </button>
  )
}

function NutriCardView({
  nutri,
  href,
  ctaLabel,
}: {
  nutri: NutriCard
  href: string
  ctaLabel: string
}) {
  const nome = nutri.profiles?.nome ?? 'Nutricionista'
  const especs =
    (nutri.nutricionista_especialidades ?? [])
      .map((e) => e.especialidades?.nome)
      .filter((x): x is string => !!x)
      .slice(0, 3) ?? []

  return (
    <Link
      to={href}
      className="card"
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 12,
        padding: 18,
        transition: 'transform .15s, box-shadow .15s, border-color .15s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--accent)'
        e.currentTarget.style.boxShadow = 'var(--shadow-2)'
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = 'var(--line)'
        e.currentTarget.style.boxShadow = 'none'
      }}
    >
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <Avatar
          nome={nome}
          url={nutri.profiles?.avatar_url ?? undefined}
          size="lg"
          tone="accent"
        />
        <div style={{ minWidth: 0, flex: 1 }}>
          <div className="serif" style={{ fontSize: 18, fontWeight: 500 }}>
            {nome}
          </div>
          <div className="muted mono" style={{ fontSize: 11.5 }}>
            CRN {nutri.crn}
          </div>
        </div>
      </div>

      {nutri.bio ? (
        <p
          style={{
            fontSize: 12.5,
            color: 'var(--ink-2)',
            lineHeight: 1.5,
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {nutri.bio}
        </p>
      ) : (
        <p style={{ fontSize: 12, color: 'var(--ink-4)' }}>Sem bio cadastrada.</p>
      )}

      {especs.length > 0 && (
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {especs.map((e) => (
            <Badge key={e} variant="accent">
              {e}
            </Badge>
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: 'auto',
          paddingTop: 12,
          borderTop: '0.5px solid var(--line-2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 8,
        }}
      >
        <div>
          <div className="serif tnum" style={{ fontSize: 22, fontWeight: 500, lineHeight: 1 }}>
            {centavosParaBRL(nutri.valor_consulta_centavos)}
          </div>
          <div className="muted" style={{ fontSize: 11, marginTop: 2 }}>
            {nutri.duracao_consulta_min} min · teleconsulta
          </div>
        </div>
        <span
          className="btn accent sm"
          style={{ pointerEvents: 'none' }}
        >
          {ctaLabel}
          <IconChevR />
        </span>
      </div>
    </Link>
  )
}
