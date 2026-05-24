import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import {
  Button,
  Input,
  Textarea,
  Badge,
  Avatar,
  Loading,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '@/components/ui'
import { LineChart } from '@/components/charts'
import { IconChevL, IconNotes, IconPlus } from '@/components/icons'
import {
  anamneseSchema,
  avaliacaoSchema,
  type AnamneseInput,
  type AvaliacaoInput,
} from '@/lib/validators'
import { toastError, toastSuccess } from '@/hooks/use-toast'
import { formatData } from '@/lib/format'

type Tab = 'visao' | 'prontuario' | 'antropo' | 'planos'

export function PacienteDetalhePage() {
  const { id: pacienteProfileId } = useParams<{ id: string }>()
  const profile = useAuth((s) => s.profile)
  const [tab, setTab] = useState<Tab>('visao')

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

  const { data: paciente } = useQuery({
    queryKey: ['paciente-profile', pacienteProfileId],
    enabled: !!pacienteProfileId,
    queryFn: async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, nome, telefone')
        .eq('id', pacienteProfileId!)
        .maybeSingle()
      return data
    },
  })

  const { data: prontuario, refetch: refetchPront } = useQuery({
    queryKey: ['prontuario', nutri?.id, pacienteProfileId],
    enabled: !!nutri?.id && !!pacienteProfileId,
    queryFn: async () => {
      const { data } = await supabase
        .from('prontuarios')
        .select('*')
        .eq('nutricionista_id', nutri!.id)
        .eq('paciente_profile_id', pacienteProfileId!)
        .maybeSingle()
      return data
    },
  })

  const criarProntuario = useMutation({
    mutationFn: async () => {
      if (!nutri || !pacienteProfileId) throw new Error('Sessão inválida')
      const { error } = await supabase.from('prontuarios').insert({
        nutricionista_id: nutri.id,
        paciente_profile_id: pacienteProfileId,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toastSuccess('Prontuário criado')
      void refetchPront()
    },
    onError: (err: Error) => toastError('Erro', err.message),
  })

  if (!paciente) {
    return <Loading label="Carregando paciente…" />
  }

  return (
    <div className="fade-up" data-screen-label="paciente-detalhe">
      <Link
        to="/app/pacientes"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 4,
          fontSize: 12.5,
          color: 'var(--ink-3)',
          marginBottom: 14,
        }}
      >
        <IconChevL />
        Pacientes
      </Link>

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, marginBottom: 22 }}>
        <Avatar nome={paciente.nome} size="xl" tone="accent" />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="eyebrow">Paciente</div>
          <h1 style={{ marginTop: 2 }}>{paciente.nome}</h1>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <Badge>{prontuario ? 'prontuário aberto' : 'sem prontuário'}</Badge>
            {paciente.telefone && <Badge>{paciente.telefone}</Badge>}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {!prontuario && (
            <Button
              variant="primary"
              loading={criarProntuario.isPending}
              onClick={() => criarProntuario.mutate()}
            >
              Criar prontuário
            </Button>
          )}
          <Button>
            <IconNotes />
            Nota de evolução
          </Button>
        </div>
      </div>

      {!prontuario ? (
        <Card>
          <CardHeader>
            <CardTitle>Sem prontuário</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="muted" style={{ fontSize: 13.5 }}>
              Crie o prontuário para registrar anamnese, evoluções, antropometria e planos.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="tabs">
            {(
              [
                ['visao', 'Visão geral'],
                ['prontuario', 'Prontuário'],
                ['antropo', 'Antropometria'],
                ['planos', 'Planos'],
              ] as const
            ).map(([k, l]) => (
              <button
                key={k}
                className={`tab ${tab === k ? 'active' : ''}`}
                onClick={() => setTab(k)}
                type="button"
              >
                {l}
              </button>
            ))}
          </div>

          {tab === 'visao' && (
            <VisaoTab prontuarioId={prontuario.id} pacienteId={pacienteProfileId!} />
          )}
          {tab === 'prontuario' && (
            <ProntuarioTab
              prontuarioId={prontuario.id}
              anamnese={(prontuario.anamnese ?? {}) as Record<string, string>}
            />
          )}
          {tab === 'antropo' && <AntropoTab prontuarioId={prontuario.id} />}
          {tab === 'planos' && <PlanosTab prontuarioId={prontuario.id} />}
        </>
      )}
    </div>
  )
}

// ─── Visão geral ────────────────────────────────────────────────
function VisaoTab({ prontuarioId, pacienteId }: { prontuarioId: string; pacienteId: string }) {
  const { data: avals } = useQuery({
    queryKey: ['avaliacoes', prontuarioId],
    queryFn: async () => {
      const { data } = await supabase
        .from('avaliacoes_antropometricas')
        .select('id, data, peso_kg, altura_cm, percentual_gordura, circunferencias')
        .eq('prontuario_id', prontuarioId)
        .order('data')
      return data ?? []
    },
  })

  const { data: planos } = useQuery({
    queryKey: ['planos-mini', prontuarioId],
    queryFn: async () => {
      const { data } = await supabase
        .from('planos_alimentares')
        .select('id, titulo, data_inicio, publicado')
        .eq('prontuario_id', prontuarioId)
        .order('created_at', { ascending: false })
        .limit(3)
      return data ?? []
    },
  })

  const { data: proximas } = useQuery({
    queryKey: ['proximas-paciente', pacienteId],
    queryFn: async () => {
      const { data } = await supabase
        .from('agendamentos')
        .select('id, inicio, status')
        .eq('paciente_profile_id', pacienteId)
        .gte('inicio', new Date().toISOString())
        .eq('status', 'confirmado')
        .order('inicio')
        .limit(5)
      return data ?? []
    },
  })

  const series = (avals ?? []).filter((a) => a.peso_kg !== null)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 16 }}>
      <Card>
        <CardHeader>
          <CardTitle>Evolução de peso</CardTitle>
          <span className="meta">{series.length} avaliações</span>
        </CardHeader>
        <CardContent>
          {series.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Sem avaliações registradas ainda.
            </p>
          ) : (
            <LineChart
              series={[
                {
                  name: 'Peso',
                  color: 'var(--accent)',
                  points: series.map((a) => a.peso_kg as number),
                },
              ]}
              labels={series.map((a) => formatData(a.data).slice(0, 5))}
              yLabel="kg"
            />
          )}
        </CardContent>
      </Card>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <Card>
          <CardHeader>
            <CardTitle>Próximas consultas</CardTitle>
          </CardHeader>
          <CardContent>
            {(proximas ?? []).length === 0 ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Sem consultas agendadas.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(proximas ?? []).map((c) => (
                  <div
                    key={c.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <span className="mono tnum" style={{ fontSize: 12.5, fontWeight: 600 }}>
                      {formatData(c.inicio)}
                    </span>
                    <Badge variant="accent" size="sm">
                      {c.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Planos recentes</CardTitle>
          </CardHeader>
          <CardContent>
            {(planos ?? []).length === 0 ? (
              <p className="muted" style={{ fontSize: 13 }}>
                Sem planos. <Link to="/app/planos" style={{ color: 'var(--accent)' }}>Criar plano</Link>.
              </p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {(planos ?? []).map((p) => (
                  <div
                    key={p.id}
                    style={{ display: 'flex', alignItems: 'center', gap: 10 }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 500 }}>{p.titulo}</div>
                      <div className="muted" style={{ fontSize: 11.5 }}>
                        {formatData(p.data_inicio)}
                      </div>
                    </div>
                    <Badge variant={p.publicado ? 'accent' : 'default'}>
                      {p.publicado ? 'publicado' : 'rascunho'}
                    </Badge>
                    <Link to={`/app/planos/${p.id}`} className="btn sm">
                      Abrir
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ─── Prontuário (anamnese + evoluções) ──────────────────────────
function ProntuarioTab({
  prontuarioId,
  anamnese,
}: {
  prontuarioId: string
  anamnese: Record<string, string>
}) {
  const queryClient = useQueryClient()

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AnamneseInput>({
    resolver: zodResolver(anamneseSchema),
    defaultValues: {
      historico: anamnese.historico ?? '',
      rotina: anamnese.rotina ?? '',
      restricoes: anamnese.restricoes ?? '',
      alergias: anamnese.alergias ?? '',
      medicamentos: anamnese.medicamentos ?? '',
    },
  })

  const salvar = useMutation({
    mutationFn: async (input: AnamneseInput) => {
      const { error } = await supabase
        .from('prontuarios')
        .update({ anamnese: input })
        .eq('id', prontuarioId)
      if (error) throw error
    },
    onSuccess: () => {
      toastSuccess('Anamnese salva')
      queryClient.invalidateQueries({ queryKey: ['prontuario'] })
    },
    onError: (err: Error) => toastError('Erro', err.message),
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.5fr) minmax(0, 1fr)', gap: 16 }}>
      <Card>
        <CardHeader>
          <CardTitle>Anamnese</CardTitle>
          <Badge>jsonb · Zod</Badge>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSubmit((d) => salvar.mutate(d))}
            style={{ display: 'grid', gap: 14 }}
          >
            <Textarea label="Histórico clínico" rows={3} {...register('historico')} error={errors.historico?.message} />
            <Textarea label="Rotina" rows={3} {...register('rotina')} error={errors.rotina?.message} />
            <Textarea label="Restrições e preferências" rows={2} {...register('restricoes')} error={errors.restricoes?.message} />
            <Textarea label="Alergias" rows={2} {...register('alergias')} error={errors.alergias?.message} />
            <Textarea label="Medicamentos" rows={2} {...register('medicamentos')} error={errors.medicamentos?.message} />
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button type="submit" variant="primary" loading={isSubmitting}>
                Salvar anamnese
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <EvolucoesCard prontuarioId={prontuarioId} />
    </div>
  )
}

function EvolucoesCard({ prontuarioId }: { prontuarioId: string }) {
  const queryClient = useQueryClient()
  const { data: evolucoes } = useQuery({
    queryKey: ['evolucoes', prontuarioId],
    queryFn: async () => {
      const { data } = await supabase
        .from('prontuario_evolucoes')
        .select('id, data, texto')
        .eq('prontuario_id', prontuarioId)
        .order('data', { ascending: false })
      return data ?? []
    },
  })

  const { register, handleSubmit, reset } = useForm<{ texto: string }>({
    defaultValues: { texto: '' },
  })

  const adicionar = useMutation({
    mutationFn: async (input: { texto: string }) => {
      if (!input.texto.trim()) throw new Error('Escreva algo')
      const { error } = await supabase.from('prontuario_evolucoes').insert({
        prontuario_id: prontuarioId,
        texto: input.texto.trim(),
      })
      if (error) throw error
    },
    onSuccess: () => {
      reset()
      toastSuccess('Evolução registrada')
      queryClient.invalidateQueries({ queryKey: ['evolucoes', prontuarioId] })
    },
    onError: (err: Error) => toastError('Erro', err.message),
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Evoluções</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit((d) => adicionar.mutate(d))}
          style={{ display: 'flex', flexDirection: 'column', gap: 8 }}
        >
          <Textarea label="Nova evolução" rows={3} {...register('texto')} />
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" size="sm" variant="primary" loading={adicionar.isPending}>
              Registrar
            </Button>
          </div>
        </form>
        <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {(evolucoes ?? []).map((e, i) => (
            <div key={e.id} style={{ position: 'relative', paddingLeft: 14 }}>
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 4,
                  bottom: 4,
                  width: 2,
                  background: i === 0 ? 'var(--accent)' : 'var(--line)',
                  borderRadius: 1,
                }}
              />
              <div className="mono tnum" style={{ fontSize: 11, color: 'var(--ink-3)', fontWeight: 500 }}>
                {formatData(e.data)}
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-2)', marginTop: 2, lineHeight: 1.45 }}>
                {e.texto}
              </p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

// ─── Antropometria ─────────────────────────────────────────────
function AntropoTab({ prontuarioId }: { prontuarioId: string }) {
  const queryClient = useQueryClient()

  const { data: avals } = useQuery({
    queryKey: ['avaliacoes', prontuarioId],
    queryFn: async () => {
      const { data } = await supabase
        .from('avaliacoes_antropometricas')
        .select('id, data, peso_kg, altura_cm, percentual_gordura, circunferencias')
        .eq('prontuario_id', prontuarioId)
        .order('data', { ascending: false })
      return data ?? []
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AvaliacaoInput>({
    resolver: zodResolver(avaliacaoSchema),
    defaultValues: {
      data: new Date().toISOString().slice(0, 10),
      peso_kg: null,
      altura_cm: null,
      percentual_gordura: null,
      circunferencias: { cintura: null, quadril: null, braco: null, coxa: null },
      observacoes: '',
    },
  })

  const adicionar = useMutation({
    mutationFn: async (input: AvaliacaoInput) => {
      const { error } = await supabase.from('avaliacoes_antropometricas').insert({
        prontuario_id: prontuarioId,
        data: input.data,
        peso_kg: input.peso_kg ?? null,
        altura_cm: input.altura_cm ?? null,
        percentual_gordura: input.percentual_gordura ?? null,
        circunferencias: input.circunferencias ?? {},
        observacoes: input.observacoes || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      reset()
      toastSuccess('Avaliação registrada')
      queryClient.invalidateQueries({ queryKey: ['avaliacoes', prontuarioId] })
    },
    onError: (err: Error) => toastError('Erro', err.message),
  })

  const ordered = (avals ?? []).slice().reverse().filter((a) => a.peso_kg !== null)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr)', gap: 16 }}>
      <Card>
        <CardHeader>
          <CardTitle>Série temporal</CardTitle>
          <span className="meta mono">índice (prontuario_id, data)</span>
        </CardHeader>
        <CardContent>
          {ordered.length === 0 ? (
            <p className="muted" style={{ fontSize: 13 }}>
              Sem dados ainda.
            </p>
          ) : (
            <LineChart
              series={[
                {
                  color: 'var(--accent)',
                  points: ordered.map((a) => a.peso_kg as number),
                },
              ]}
              labels={ordered.map((a) => formatData(a.data).slice(0, 5))}
              yLabel="kg"
            />
          )}
        </CardContent>
      </Card>

      <Card variant="flush">
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '0.5px solid var(--line)',
            display: 'flex',
            justifyContent: 'space-between',
          }}
        >
          <h3 className="serif" style={{ fontSize: 18, fontWeight: 500 }}>
            Nova avaliação
          </h3>
        </div>
        <form
          onSubmit={handleSubmit((d) => adicionar.mutate(d))}
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 10,
            padding: 20,
          }}
        >
          <Input type="date" label="Data" {...register('data')} error={errors.data?.message} />
          <Input
            type="number"
            step="0.1"
            label="Peso (kg)"
            {...register('peso_kg', { valueAsNumber: true })}
          />
          <Input
            type="number"
            step="0.1"
            label="Altura (cm)"
            {...register('altura_cm', { valueAsNumber: true })}
          />
          <Input
            type="number"
            step="0.1"
            label="% gordura"
            {...register('percentual_gordura', { valueAsNumber: true })}
          />
          <Input
            type="number"
            step="0.1"
            label="Cintura (cm)"
            {...register('circunferencias.cintura' as const, { valueAsNumber: true })}
          />
          <Input
            type="number"
            step="0.1"
            label="Quadril (cm)"
            {...register('circunferencias.quadril' as const, { valueAsNumber: true })}
          />
          <div style={{ gridColumn: '1/-1', display: 'flex', justifyContent: 'flex-end' }}>
            <Button type="submit" size="sm" variant="primary" loading={isSubmitting}>
              <IconPlus />
              Registrar
            </Button>
          </div>
        </form>

        <div
          style={{
            borderTop: '0.5px solid var(--line-2)',
            padding: '8px 20px',
            fontSize: 10.5,
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600,
          }}
        >
          Histórico
        </div>
        {(avals ?? []).length === 0 && (
          <div style={{ padding: 16, color: 'var(--ink-3)', fontSize: 13 }}>
            Sem avaliações.
          </div>
        )}
        {(avals ?? []).map((a, i) => (
          <div
            key={a.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '70px 1fr 1fr 1fr',
              padding: '10px 20px',
              borderBottom: i < (avals?.length ?? 0) - 1 ? '0.5px solid var(--line-2)' : 0,
              alignItems: 'center',
            }}
          >
            <div className="mono tnum" style={{ fontSize: 12, color: 'var(--ink-3)' }}>
              {formatData(a.data).slice(0, 5)}
            </div>
            <div className="tnum" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              {a.peso_kg ?? '—'} <span className="muted" style={{ fontSize: 11 }}>kg</span>
            </div>
            <div className="tnum" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              {a.altura_cm ?? '—'} <span className="muted" style={{ fontSize: 11 }}>cm</span>
            </div>
            <div className="tnum" style={{ fontSize: 13, color: 'var(--ink-2)' }}>
              {a.percentual_gordura ? `${a.percentual_gordura}%` : '—'}
            </div>
          </div>
        ))}
      </Card>
    </div>
  )
}

// ─── Planos ────────────────────────────────────────────────────
function PlanosTab({ prontuarioId }: { prontuarioId: string }) {
  const { data: planos } = useQuery({
    queryKey: ['planos', prontuarioId],
    queryFn: async () => {
      const { data } = await supabase
        .from('planos_alimentares')
        .select('id, titulo, data_inicio, data_fim, publicado')
        .eq('prontuario_id', prontuarioId)
        .order('data_inicio', { ascending: false })
      return data ?? []
    },
  })

  return (
    <Card variant="flush">
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '0.5px solid var(--line)',
          display: 'flex',
          justifyContent: 'space-between',
        }}
      >
        <h3 className="serif" style={{ fontSize: 18, fontWeight: 500 }}>
          Histórico de planos
        </h3>
        <Link to="/app/planos" className="btn sm accent">
          <IconPlus /> Novo plano
        </Link>
      </div>
      {(planos ?? []).length === 0 ? (
        <div style={{ padding: 28, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
          Nenhum plano. Crie em <Link to="/app/planos" style={{ color: 'var(--accent)' }}>Planos</Link>.
        </div>
      ) : (
        (planos ?? []).map((p, i) => (
          <div
            key={p.id}
            className="row"
            style={{
              paddingInline: 20,
              borderBottom: i < (planos ?? []).length - 1 ? '0.5px solid var(--line-2)' : 0,
            }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 500 }}>{p.titulo}</div>
              <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                {formatData(p.data_inicio)}
                {p.data_fim ? ` — ${formatData(p.data_fim)}` : ''}
              </div>
            </div>
            <Badge variant={p.publicado ? 'accent' : 'default'}>
              {p.publicado ? 'publicado' : 'rascunho'}
            </Badge>
            <Link to={`/app/planos/${p.id}`} className="btn sm">
              Abrir
            </Link>
          </div>
        ))
      )}
    </Card>
  )
}
