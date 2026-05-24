import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button, Loading, Badge } from '@/components/ui'
import { Sparkline } from '@/components/charts'
import {
  IconChevL,
  IconVideo,
  IconMic,
  IconCamera,
  IconEnd,
  IconShare,
  IconExternal,
  IconPlus,
  IconNotes,
} from '@/components/icons'
import { formatDataHora } from '@/lib/format'
import { toastError } from '@/hooks/use-toast'
import { getInitials } from '@/lib/utils'

interface Props {
  perspectiva: 'nutricionista' | 'paciente'
}

interface Agendamento {
  id: string
  inicio: string
  fim: string
  status: string
  daily_room_url: string | null
  nutricionista_id: string
  paciente_profile_id: string
  paciente?: { nome: string } | null
}

export function ConsultaPage({ perspectiva }: Props) {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [muted, setMuted] = useState(false)
  const [cam, setCam] = useState(true)
  const [tick, setTick] = useState(0)
  const [notes, setNotes] = useState('')

  const { data: ag, isLoading } = useQuery({
    queryKey: ['consulta', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select(
          'id, inicio, fim, status, daily_room_url, nutricionista_id, paciente_profile_id, profiles!agendamentos_paciente_profile_id_fkey(nome)',
        )
        .eq('id', id!)
        .maybeSingle()
      if (error) throw error
      return data
        ? ({
            ...data,
            paciente: (data.profiles as unknown as { nome: string } | null) ?? null,
          } as unknown as Agendamento)
        : null
    },
  })

  useEffect(() => {
    const t = setInterval(() => setTick((x) => x + 1), 1000)
    return () => clearInterval(t)
  }, [])

  const criarSala = useMutation({
    mutationFn: async () => {
      if (!ag) throw new Error('Agendamento ausente')
      const { error } = await supabase.functions.invoke('criar-sala-daily', {
        body: { agendamento_id: ag.id },
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consulta', id] }),
    onError: (err: Error) => toastError('Erro ao criar sala', err.message),
  })

  const concluir = useMutation({
    mutationFn: async () => {
      if (!ag) throw new Error('Sem agendamento')
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'realizado' })
        .eq('id', ag.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['consulta', id] }),
  })

  if (isLoading) return <Loading label="Carregando consulta…" />
  if (!ag) return <p>Consulta não encontrada.</p>

  const back = perspectiva === 'nutricionista' ? '/app' : '/paciente/agendamentos'
  const podeEntrar = new Date(ag.inicio).getTime() - Date.now() <= 10 * 60 * 1000
  const expirou = new Date(ag.fim).getTime() < Date.now()
  const mins = Math.floor(tick / 60)
  const secs = tick % 60

  return (
    <div
      data-screen-label="teleconsulta"
      style={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        margin: 'calc(-1 * var(--pad))',
      }}
    >
      {/* Top bar */}
      <div
        style={{
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          borderBottom: '0.5px solid var(--line)',
          background: 'var(--paper-2)',
        }}
      >
        <Link to={back} className="btn sm">
          <IconChevL />
          Sair
        </Link>
        <div className="vr" style={{ height: 24 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span
            style={{
              width: 7,
              height: 7,
              borderRadius: 999,
              background: 'var(--clay)',
              boxShadow: '0 0 0 3px color-mix(in oklch, var(--clay) 22%, transparent)',
              animation: 'pulseDot 1.4s ease-in-out infinite',
            }}
          />
          <span style={{ fontWeight: 500, fontSize: 13 }}>Em consulta</span>
          <span className="mono tnum muted" style={{ fontSize: 12 }}>
            {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}
          </span>
        </div>
        <div className="vr" style={{ height: 24 }} />
        <div style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
          <strong style={{ fontWeight: 500 }}>{ag.paciente?.nome ?? 'Paciente'}</strong> ·{' '}
          {formatDataHora(ag.inicio)}
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
          {!ag.daily_room_url && perspectiva === 'nutricionista' && (
            <Button onClick={() => criarSala.mutate()} loading={criarSala.isPending} variant="primary" size="sm">
              <IconVideo />
              Provisionar sala
            </Button>
          )}
          {perspectiva === 'nutricionista' && expirou && ag.status === 'confirmado' && (
            <Button size="sm" onClick={() => concluir.mutate()}>
              Marcar como realizada
            </Button>
          )}
          <span className="mono" style={{ fontSize: 11, color: 'var(--ink-3)' }}>
            daily.co · {ag.id.slice(0, 6)}
          </span>
        </div>
      </div>

      {/* Body */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1.4fr 360px', minHeight: 0 }}>
        {/* Vídeo */}
        <div
          style={{
            background: '#15120c',
            position: 'relative',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            padding: 18,
            gap: 12,
          }}
        >
          <div
            style={{
              flex: 1,
              position: 'relative',
              borderRadius: 14,
              overflow: 'hidden',
              background:
                'linear-gradient(135deg, oklch(0.32 0.04 70) 0%, oklch(0.22 0.03 70) 100%)',
            }}
          >
            {ag.daily_room_url && podeEntrar ? (
              <iframe
                src={ag.daily_room_url}
                allow="camera; microphone; fullscreen; speaker; display-capture"
                title="Teleconsulta"
                style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', border: 0 }}
              />
            ) : (
              <>
                <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}>
                  <div
                    style={{
                      width: 140,
                      height: 140,
                      borderRadius: 999,
                      background: 'color-mix(in oklch, var(--accent) 30%, oklch(0.4 0.04 70))',
                      color: 'rgba(255,255,255,0.92)',
                      display: 'grid',
                      placeItems: 'center',
                      fontFamily: 'var(--font-display)',
                      fontSize: 56,
                      fontWeight: 500,
                      boxShadow: '0 8px 40px rgba(0,0,0,.35)',
                    }}
                  >
                    {getInitials(ag.paciente?.nome ?? 'P')}
                  </div>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    background: 'rgba(0,0,0,0.42)',
                    backdropFilter: 'blur(10px)',
                    padding: '6px 12px',
                    borderRadius: 999,
                    color: 'white',
                    fontSize: 12.5,
                  }}
                >
                  {ag.daily_room_url
                    ? 'Aguardando entrada (10 min antes)'
                    : perspectiva === 'nutricionista'
                      ? 'Provisione a sala para começar'
                      : 'A nutri precisa provisionar a sala'}
                </div>
              </>
            )}
          </div>

          {/* Controles */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
            <CtrlBtn active={!muted} onClick={() => setMuted(!muted)} title="Microfone">
              <IconMic />
            </CtrlBtn>
            <CtrlBtn active={cam} onClick={() => setCam(!cam)} title="Câmera">
              <IconCamera />
            </CtrlBtn>
            <CtrlBtn variant="neutral" title="Compartilhar tela">
              <IconShare />
            </CtrlBtn>
            <div style={{ width: 1, alignSelf: 'stretch', background: 'rgba(255,255,255,.1)' }} />
            <Link
              to={back}
              style={{
                padding: '0 18px',
                height: 44,
                borderRadius: 22,
                background: 'oklch(0.55 0.18 28)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontWeight: 500,
                fontSize: 13,
              }}
            >
              <IconEnd />
              Encerrar
            </Link>
          </div>
        </div>

        {/* Side panel */}
        <SidePanel
          ag={ag}
          notes={notes}
          setNotes={setNotes}
          perspectiva={perspectiva}
        />
      </div>
    </div>
  )
}

function CtrlBtn({
  children,
  active = true,
  variant = 'tonal',
  onClick,
  title,
}: {
  children: React.ReactNode
  active?: boolean
  variant?: 'tonal' | 'neutral'
  onClick?: () => void
  title?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={title}
      style={{
        appearance: 'none',
        border: 0,
        font: 'inherit',
        width: 44,
        height: 44,
        borderRadius: 22,
        display: 'grid',
        placeItems: 'center',
        cursor: 'default',
        background:
          variant === 'neutral'
            ? 'rgba(255,255,255,.10)'
            : active
              ? 'rgba(255,255,255,.16)'
              : 'rgba(255,255,255,.06)',
        color: active ? 'white' : 'rgba(255,255,255,.55)',
      }}
    >
      {children}
    </button>
  )
}

function SidePanel({
  ag,
  notes,
  setNotes,
  perspectiva,
}: {
  ag: Agendamento
  notes: string
  setNotes: (v: string) => void
  perspectiva: 'nutricionista' | 'paciente'
}) {
  // Para nutri: mostra mini prontuário do paciente (avaliações).
  const { data: avals } = useQuery({
    queryKey: ['consulta-side-avals', ag.paciente_profile_id, ag.nutricionista_id],
    enabled: perspectiva === 'nutricionista',
    queryFn: async () => {
      const { data: pron } = await supabase
        .from('prontuarios')
        .select('id')
        .eq('nutricionista_id', ag.nutricionista_id)
        .eq('paciente_profile_id', ag.paciente_profile_id)
        .maybeSingle()
      if (!pron) return [] as Array<{ data: string; peso_kg: number | null }>
      const { data } = await supabase
        .from('avaliacoes_antropometricas')
        .select('data, peso_kg, percentual_gordura')
        .eq('prontuario_id', pron.id)
        .order('data')
      return (data ?? []) as Array<{ data: string; peso_kg: number | null }>
    },
  })
  const serie = (avals ?? []).filter((a) => a.peso_kg !== null).map((a) => a.peso_kg as number)

  return (
    <div
      style={{
        borderLeft: '0.5px solid var(--line)',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--line)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div className="ava lg">{getInitials(ag.paciente?.nome ?? 'P')}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontWeight: 500 }}>{ag.paciente?.nome ?? 'Paciente'}</div>
            <div className="muted" style={{ fontSize: 12 }}>
              {formatDataHora(ag.inicio)}
            </div>
          </div>
          <Link
            to={`/app/pacientes/${ag.paciente_profile_id}`}
            className="btn sm ghost"
            title="Abrir prontuário"
          >
            <IconExternal />
          </Link>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 8 }}>
          <Badge>{ag.status}</Badge>
        </div>
      </div>

      {perspectiva === 'nutricionista' && (
        <div style={{ padding: '14px 20px', borderBottom: '0.5px solid var(--line)' }}>
          <div
            className="lbl"
            style={{
              fontSize: 10.5,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
              marginBottom: 6,
            }}
          >
            Evolução de peso
          </div>
          {serie.length >= 2 ? (
            <Sparkline points={serie} w={300} h={44} color="var(--accent)" dot />
          ) : (
            <p className="muted" style={{ fontSize: 12 }}>
              Sem série suficiente para gráfico.
            </p>
          )}
        </div>
      )}

      <div style={{ flex: 1, padding: '14px 20px', display: 'flex', flexDirection: 'column', minHeight: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div
            className="lbl"
            style={{
              fontSize: 10.5,
              color: 'var(--ink-3)',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              fontWeight: 600,
            }}
          >
            {perspectiva === 'nutricionista' ? 'Nota desta consulta' : 'Suas anotações'}
          </div>
          <Badge variant="accent">auto-salvo</Badge>
        </div>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder={
            perspectiva === 'nutricionista'
              ? 'Registre observações, alterações de prescrição, próximos passos…'
              : 'Anote dúvidas e sintomas que quer levantar agora.'
          }
          style={{
            flex: 1,
            minHeight: 100,
            resize: 'none',
            border: '0.5px solid var(--line)',
            background: 'var(--paper-2)',
            borderRadius: 8,
            padding: 10,
            font: 'inherit',
            fontSize: 13,
            lineHeight: 1.55,
            color: 'var(--ink)',
            outline: 'none',
          }}
        />
        {perspectiva === 'nutricionista' && (
          <div style={{ display: 'flex', gap: 6, marginTop: 8 }}>
            <Button size="sm">
              <IconNotes />
              Salvar evolução
            </Button>
            <Button size="sm" variant="ghost">
              <IconPlus />
              Plano
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
