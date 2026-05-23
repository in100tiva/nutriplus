import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button, Input, Loading, EmptyState, Badge, Avatar } from '@/components/ui'
import { Sparkline, Bar } from '@/components/charts'
import { IconUsers, IconSearch, IconPlus, IconDownload } from '@/components/icons'
import { formatDataHora } from '@/lib/format'

interface Paciente {
  id: string
  nome: string
  ultima_aval: { peso_kg: number | null; data: string } | null
  serie: number[]
  proxima: string | null
  total_consultas: number
}

export function PacientesPage() {
  const profile = useAuth((s) => s.profile)
  const [filter, setFilter] = useState('')

  const { data: nutri } = useQuery({
    queryKey: ['nutri-self', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('nutricionistas')
        .select('id')
        .eq('profile_id', profile!.id)
        .maybeSingle()
      return data
    },
  })

  const { data, isLoading } = useQuery({
    queryKey: ['pacientes-rich', nutri?.id],
    enabled: !!nutri?.id,
    queryFn: async () => {
      // Lista prontuários com paciente, ultima avaliação e série de pesos
      const { data: pron, error } = await supabase
        .from('prontuarios')
        .select(
          'id, paciente_profile_id, profiles!prontuarios_paciente_profile_id_fkey(nome), avaliacoes_antropometricas(data, peso_kg)',
        )
        .eq('nutricionista_id', nutri!.id)
      if (error) throw error
      const pacientes: Paciente[] = (pron ?? []).map((row) => {
        const avals = (row.avaliacoes_antropometricas ?? []) as unknown as Array<{
          data: string
          peso_kg: number | null
        }>
        const ordered = avals
          .filter((a) => a.peso_kg !== null)
          .sort((a, b) => a.data.localeCompare(b.data))
        const ultima = ordered.length > 0 ? ordered[ordered.length - 1] : null
        return {
          id: row.paciente_profile_id,
          nome: (row.profiles as { nome?: string } | null)?.nome ?? 'Paciente',
          ultima_aval: ultima ? { peso_kg: ultima.peso_kg, data: ultima.data } : null,
          serie: ordered.map((a) => a.peso_kg as number),
          proxima: null,
          total_consultas: 0,
        }
      })
      // próxima consulta por paciente
      const ids = pacientes.map((p) => p.id)
      if (ids.length > 0) {
        const { data: ags } = await supabase
          .from('agendamentos')
          .select('paciente_profile_id, inicio, status')
          .eq('nutricionista_id', nutri!.id)
          .in('paciente_profile_id', ids)
          .gte('inicio', new Date().toISOString())
          .eq('status', 'confirmado')
          .order('inicio')
        for (const ag of ags ?? []) {
          const p = pacientes.find((x) => x.id === ag.paciente_profile_id)
          if (p && !p.proxima) p.proxima = ag.inicio
        }
      }
      return pacientes
    },
  })

  const filtered = useMemo(() => {
    if (!data) return []
    if (!filter) return data
    const q = filter.toLowerCase()
    return data.filter((p) => p.nome.toLowerCase().includes(q))
  }, [data, filter])

  const ativos = data?.length ?? 0

  return (
    <div className="fade-up" data-screen-label="pacientes">
      <div className="page-head">
        <div>
          <div className="eyebrow">Pacientes</div>
          <div className="title">
            <h1>
              {ativos} pessoa{ativos === 1 ? '' : 's'} em acompanhamento
            </h1>
          </div>
          <p className="sub">
            Cada paciente abre um prontuário próprio, protegido por RLS — só o
            nutricionista responsável e o próprio paciente acessam os dados clínicos.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button>
            <IconDownload />
            Exportar
          </Button>
          <Button variant="accent">
            <IconPlus />
            Novo paciente
          </Button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {/* Filter bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 18px',
            borderBottom: '0.5px solid var(--line)',
          }}
        >
          <div style={{ width: 320 }}>
            <Input
              placeholder="Buscar por nome…"
              leftIcon={<IconSearch />}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="muted" style={{ marginLeft: 'auto', fontSize: 12 }}>
            {filtered.length} {filtered.length === 1 ? 'paciente' : 'pacientes'}
          </div>
        </div>

        {/* Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.8fr) 110px 140px 110px 130px',
            gap: 16,
            padding: '10px 20px',
            fontSize: 11,
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600,
            borderBottom: '0.5px solid var(--line-2)',
          }}
        >
          <div>Paciente</div>
          <div>Último peso</div>
          <div>Evolução</div>
          <div>Aderência</div>
          <div style={{ textAlign: 'right' }}>Próxima</div>
        </div>

        {/* Rows */}
        {isLoading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<IconUsers />}
            title="Nenhum paciente"
            description="Quando alguém agendar pelo seu link público, será listado aqui."
          />
        ) : (
          filtered.map((p) => {
            const delta =
              p.serie.length >= 2 ? p.serie[p.serie.length - 1] - p.serie[0] : null
            const loss = delta !== null && delta < 0
            return (
              <Link
                key={p.id}
                to={`/app/pacientes/${p.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(0, 1.8fr) 110px 140px 110px 130px',
                  gap: 16,
                  padding: '12px 20px',
                  alignItems: 'center',
                  borderBottom: '0.5px solid var(--line-2)',
                  color: 'inherit',
                }}
                className="hover:bg-[color:var(--paper-2)]"
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0 }}>
                  <Avatar nome={p.nome} tone="accent" />
                  <div style={{ minWidth: 0 }}>
                    <div className="truncate" style={{ fontWeight: 500 }}>
                      {p.nome}
                    </div>
                    <div className="muted" style={{ fontSize: 11.5 }}>
                      {p.serie.length} avaliações
                    </div>
                  </div>
                </div>
                <div className="tnum" style={{ fontSize: 13 }}>
                  {p.ultima_aval?.peso_kg ? (
                    <>
                      <div style={{ fontWeight: 500 }}>
                        {p.ultima_aval.peso_kg.toFixed(1)}{' '}
                        <span className="muted" style={{ fontSize: 11 }}>
                          kg
                        </span>
                      </div>
                      {delta !== null && (
                        <div
                          style={{
                            fontSize: 11.5,
                            color: loss
                              ? 'color-mix(in oklch, var(--accent) 70%, black)'
                              : 'var(--clay)',
                          }}
                        >
                          {loss ? '−' : '+'}
                          {Math.abs(delta).toFixed(1)} kg
                        </div>
                      )}
                    </>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </div>
                <div>
                  {p.serie.length >= 2 ? (
                    <Sparkline
                      points={p.serie}
                      w={120}
                      h={32}
                      color={loss ? 'var(--accent)' : 'var(--clay)'}
                      dot
                    />
                  ) : (
                    <span className="muted">—</span>
                  )}
                </div>
                <div>
                  <Bar value={Math.min(p.serie.length / 5, 1)} max={1} h={5} />
                  <div
                    className="muted"
                    style={{ fontSize: 11, marginTop: 4 }}
                  >
                    {p.serie.length}/5 baseline
                  </div>
                </div>
                <div className="tnum" style={{ fontSize: 12, textAlign: 'right' }}>
                  {p.proxima ? (
                    <Badge variant="accent" size="sm">
                      {formatDataHora(p.proxima)}
                    </Badge>
                  ) : (
                    <span className="muted">—</span>
                  )}
                </div>
              </Link>
            )
          })
        )}
      </div>
    </div>
  )
}
