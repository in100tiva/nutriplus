import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button, Input, Loading, EmptyState, Badge, Avatar } from '@/components/ui'
import { Sparkline, Bar } from '@/components/charts'
import { IconUsers, IconSearch, IconDownload } from '@/components/icons'
import { formatDataHora } from '@/lib/format'

interface Paciente {
  id: string
  nome: string
  proxima: string | null
  ultima: string | null
  total: number
  ultima_aval: { peso_kg: number | null; data: string } | null
  serie: number[]
  tem_prontuario: boolean
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
      // 1. Pega TODOS os agendamentos do nutri (não só os que têm prontuário)
      //    — paciente_profile_id distintos via JOIN com profiles.
      const { data: agRows, error: agErr } = await supabase
        .from('agendamentos')
        .select(
          'paciente_profile_id, inicio, status, profiles!agendamentos_paciente_profile_id_fkey(nome)',
        )
        .eq('nutricionista_id', nutri!.id)
        .order('inicio', { ascending: true })
      if (agErr) throw agErr

      // 2. Pega prontuários (se existirem) — pra saber quem já tem.
      interface ProntuarioRich {
        id: string
        paciente_profile_id: string
        profiles: { nome: string } | null
        avaliacoes_antropometricas: Array<{ data: string; peso_kg: number | null }>
      }
      const { data: pronRowsRaw } = await supabase
        .from('prontuarios')
        .select(
          'id, paciente_profile_id, profiles!prontuarios_paciente_profile_id_fkey(nome), avaliacoes_antropometricas(data, peso_kg)',
        )
        .eq('nutricionista_id', nutri!.id)
      const pronRows = (pronRowsRaw ?? []) as unknown as ProntuarioRich[]
      const pronByPaciente = new Map<string, ProntuarioRich>()
      for (const p of pronRows) {
        pronByPaciente.set(p.paciente_profile_id, p)
      }

      // 3. Agrupa por paciente.
      const agora = new Date()
      const acc = new Map<string, Paciente>()
      for (const a of agRows ?? []) {
        const id = a.paciente_profile_id
        const nome =
          (a.profiles as { nome?: string } | null)?.nome ??
          pronByPaciente.get(id)?.profiles?.nome ??
          'Paciente'
        const isFuturo = new Date(a.inicio) > agora
        const isPassado = new Date(a.inicio) <= agora && a.status !== 'cancelado'
        let p = acc.get(id)
        if (!p) {
          const pron = pronByPaciente.get(id)
          const avals = (pron?.avaliacoes_antropometricas ?? [])
            .filter((x) => x.peso_kg !== null)
            .sort((x, y) => x.data.localeCompare(y.data))
          const ultimaAval = avals.length > 0 ? avals[avals.length - 1] : null
          p = {
            id,
            nome,
            proxima: null,
            ultima: null,
            total: 0,
            tem_prontuario: !!pron,
            ultima_aval: ultimaAval ? { peso_kg: ultimaAval.peso_kg, data: ultimaAval.data } : null,
            serie: avals.map((a) => a.peso_kg as number),
          }
          acc.set(id, p)
        }
        p.total += 1
        if (isFuturo && (!p.proxima || a.inicio < p.proxima)) p.proxima = a.inicio
        if (isPassado && (!p.ultima || a.inicio > p.ultima)) p.ultima = a.inicio
      }

      // 4. Inclui também pacientes que só têm prontuário (sem agendamento).
      for (const pron of pronRows) {
        if (acc.has(pron.paciente_profile_id)) continue
        const nome = pron.profiles?.nome ?? 'Paciente'
        const avals = (pron.avaliacoes_antropometricas ?? [])
          .filter((x) => x.peso_kg !== null)
          .sort((x, y) => x.data.localeCompare(y.data))
        const ultimaAval = avals.length > 0 ? avals[avals.length - 1] : null
        acc.set(pron.paciente_profile_id, {
          id: pron.paciente_profile_id,
          nome,
          proxima: null,
          ultima: null,
          total: 0,
          tem_prontuario: true,
          ultima_aval: ultimaAval ? { peso_kg: ultimaAval.peso_kg, data: ultimaAval.data } : null,
          serie: avals.map((a) => a.peso_kg as number),
        })
      }

      return Array.from(acc.values()).sort((a, b) => {
        // ordena: próximas consultas primeiro (mais cedo), depois últimas
        const aKey = a.proxima ?? '9999'
        const bKey = b.proxima ?? '9999'
        return aKey.localeCompare(bKey)
      })
    },
  })

  const filtered = useMemo(() => {
    if (!data) return []
    if (!filter) return data
    const q = filter.toLowerCase()
    return data.filter((p) => p.nome.toLowerCase().includes(q))
  }, [data, filter])

  const ativos = data?.length ?? 0
  const semProntuario = data?.filter((p) => !p.tem_prontuario).length ?? 0

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
            Inclui quem já marcou consulta com você — o prontuário é criado quando
            você abre o paciente pela primeira vez.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button>
            <IconDownload />
            Exportar
          </Button>
        </div>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '14px 18px',
            borderBottom: '0.5px solid var(--line)',
            flexWrap: 'wrap',
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
          {semProntuario > 0 && (
            <Badge variant="warn">
              {semProntuario} sem prontuário aberto
            </Badge>
          )}
          <div className="muted" style={{ marginLeft: 'auto', fontSize: 12 }}>
            {filtered.length} {filtered.length === 1 ? 'paciente' : 'pacientes'}
          </div>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.8fr) 110px 140px 110px 150px',
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
          <div>Consultas</div>
          <div style={{ textAlign: 'right' }}>Próxima</div>
        </div>

        {isLoading ? (
          <Loading />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={<IconUsers />}
            title="Nenhum paciente"
            description="Quando alguém agendar pelo seu link público, vai aparecer aqui."
            action={
              <Link to="/app/perfil" className="btn">
                Ver meu perfil público
              </Link>
            }
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
                  gridTemplateColumns: 'minmax(0, 1.8fr) 110px 140px 110px 150px',
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
                    <div className="muted" style={{ fontSize: 11.5, display: 'flex', gap: 6 }}>
                      {p.tem_prontuario ? (
                        <span>{p.serie.length} avaliações</span>
                      ) : (
                        <Badge variant="warn">sem prontuário</Badge>
                      )}
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
                  <div className="tnum" style={{ fontSize: 13, fontWeight: 500 }}>
                    {p.total}
                  </div>
                  <Bar value={Math.min(p.total / 5, 1)} max={1} h={4} />
                </div>
                <div className="tnum" style={{ fontSize: 12, textAlign: 'right' }}>
                  {p.proxima ? (
                    <Badge variant="accent">{formatDataHora(p.proxima)}</Badge>
                  ) : p.ultima ? (
                    <span className="muted">
                      última: {formatDataHora(p.ultima)}
                    </span>
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
