import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { addDays, format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button, Input, Select, Loading, Modal, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@/components/ui'
import { Donut } from '@/components/charts'
import {
  IconPlus,
  IconChevL,
  IconChevR,
  IconVideo,
  IconSettings,
  IconTrash,
  IconCheck,
} from '@/components/icons'
import { disponibilidadeSchema, type DisponibilidadeInput } from '@/lib/validators'
import { toastSuccess, toastError } from '@/hooks/use-toast'
import { semanaAtual, DIAS_LBL, fmtHora, minDoDia } from '@/lib/agenda-helpers'
import { newRequestId, log } from '@/lib/observability'

interface Agendamento {
  id: string
  inicio: string
  fim: string
  status: string
  paciente_profile_id: string
  profiles: { nome: string } | null
}

interface Disp {
  id: string
  dia_semana: number
  hora_inicio: string
  hora_fim: string
}

export function AgendaPage() {
  const profile = useAuth((s) => s.profile)
  const queryClient = useQueryClient()
  const [weekOffset, setWeekOffset] = useState(0)

  const semana = useMemo(() => semanaAtual(addDays(new Date(), weekOffset * 7)), [weekOffset])

  const { data: nutri } = useQuery({
    queryKey: ['nutri-self', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('nutricionistas')
        .select('id, duracao_consulta_min')
        .eq('profile_id', profile!.id)
        .maybeSingle()
      return data
    },
  })

  const { data: disponibilidades, isLoading: lDisp } = useQuery({
    queryKey: ['disponibilidades', nutri?.id],
    enabled: !!nutri?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('disponibilidades')
        .select('id, dia_semana, hora_inicio, hora_fim')
        .eq('nutricionista_id', nutri!.id)
        .order('dia_semana')
      return (data ?? []) as Disp[]
    },
  })

  const { data: agendamentos, isLoading: lAg } = useQuery({
    queryKey: ['agendamentos-semana', nutri?.id, semana.inicio.toISOString()],
    enabled: !!nutri?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('agendamentos')
        .select(
          'id, inicio, fim, status, paciente_profile_id, profiles!agendamentos_paciente_profile_id_fkey(nome)',
        )
        .eq('nutricionista_id', nutri!.id)
        .gte('inicio', semana.inicio.toISOString())
        .lte('inicio', addDays(semana.fim, 1).toISOString())
        .order('inicio')
      return (data ?? []) as unknown as Agendamento[]
    },
  })

  const byDay = useMemo(() => {
    const m: Agendamento[][] = Array.from({ length: 7 }, () => [])
    for (const a of agendamentos ?? []) {
      const d = new Date(a.inicio).getDay()
      m[d].push(a)
    }
    for (const day of m) day.sort((a, b) => +new Date(a.inicio) - +new Date(b.inicio))
    return m
  }, [agendamentos])

  const totalSemana = agendamentos?.length ?? 0
  const horasSemana = useMemo(() => {
    let mins = 0
    for (const a of agendamentos ?? []) {
      mins += (new Date(a.fim).getTime() - new Date(a.inicio).getTime()) / 60000
    }
    return mins / 60
  }, [agendamentos])
  const ocupacao = Math.min(horasSemana / 40, 1)
  const novosPacientes = useMemo(() => {
    // contagem aproximada: paciente_profile_id distintos sem agendamentos passados
    const ids = new Set((agendamentos ?? []).map((a) => a.paciente_profile_id))
    return ids.size
  }, [agendamentos])

  const proximaConsultaTxt = useMemo(() => {
    const futuras = (agendamentos ?? []).filter((a) => new Date(a.inicio) > new Date())
    if (futuras.length === 0) return '—'
    const mins = Math.round((new Date(futuras[0].inicio).getTime() - Date.now()) / 60000)
    if (mins < 60) return `em ${mins} min`
    const h = Math.floor(mins / 60)
    const m = mins % 60
    return `em ${h}h ${String(m).padStart(2, '0')}min`
  }, [agendamentos])

  return (
    <div className="fade-up" data-screen-label="agenda">
      <div className="page-head">
        <div>
          <div className="eyebrow">Agenda</div>
          <div className="title">
            <h1>{semana.rotulo}</h1>
            <span className="muted" style={{ fontSize: 14 }}>
              · {format(semana.inicio, 'EEEE', { locale: ptBR })} a {format(semana.fim, 'EEEE', { locale: ptBR })}
            </span>
          </div>
          <p className="sub">
            Os slots disponíveis na sua página pública são derivados das janelas de
            disponibilidade pela função{' '}
            <span
              className="mono"
              style={{ fontSize: 12, background: 'var(--paper-2)', padding: '1px 5px', borderRadius: 4 }}
            >
              fn_slots_disponiveis
            </span>
            .
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button onClick={() => setWeekOffset(0)}>Hoje</Button>
          <div style={{ display: 'flex' }}>
            <button
              type="button"
              className="btn"
              onClick={() => setWeekOffset((w) => w - 1)}
              style={{ borderRadius: '8px 0 0 8px' }}
            >
              <IconChevL />
            </button>
            <button
              type="button"
              className="btn"
              onClick={() => setWeekOffset((w) => w + 1)}
              style={{ borderRadius: '0 8px 8px 0', borderLeftWidth: 0 }}
            >
              <IconChevR />
            </button>
          </div>
        </div>
      </div>

      {/* Stat strip */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 12,
          marginBottom: 18,
        }}
      >
        <div className="card" style={{ padding: 16 }}>
          <div className="stat">
            <div className="lbl">Consultas semana</div>
            <div className="val tnum">{totalSemana}</div>
            <div className="delta muted">{disponibilidades?.length ?? 0} janelas configuradas</div>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="stat">
            <div className="lbl">Horas atendendo</div>
            <div className="val tnum">
              {horasSemana.toFixed(1)}
              <span style={{ fontSize: 14, color: 'var(--ink-3)', marginLeft: 4 }}>h</span>
            </div>
            <div className="delta">Ocupação {Math.round(ocupacao * 100)}%</div>
          </div>
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="stat">
            <div className="lbl">Pacientes atendidos</div>
            <div className="val tnum">{novosPacientes}</div>
            <div className="delta muted">na semana</div>
          </div>
        </div>
        <div className="card" style={{ padding: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <Donut size={60} stroke={7} pct={ocupacao} label="Ocupação" />
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: 4,
              fontSize: 11.5,
              color: 'var(--ink-3)',
            }}
          >
            <div>Próxima consulta: <strong style={{ color: 'var(--ink-2)' }}>{proximaConsultaTxt}</strong></div>
            <div>Capacidade-base: 40h / semana</div>
          </div>
        </div>
      </div>

      {/* Week grid */}
      <WeekGrid
        byDay={byDay}
        diasDoMes={semana.dias}
        hojeIdx={semana.hojeIdx}
        loading={lAg}
      />

      {/* Bottom split: hoje + disponibilidades */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.6fr) minmax(0, 1fr)',
          gap: 16,
          marginTop: 20,
        }}
      >
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '0.5px solid var(--line)' }}>
            <div className="sec" style={{ marginBottom: 0 }}>
              <h3>
                {semana.hojeIdx >= 0
                  ? `Hoje · ${format(semana.dias[semana.hojeIdx], "EEEE, d 'de' MMMM", { locale: ptBR })}`
                  : 'Sem dia "hoje" nesta semana'}
              </h3>
              <div className="meta">
                {semana.hojeIdx >= 0 ? byDay[semana.hojeIdx].length : 0} consulta(s)
              </div>
            </div>
          </div>
          {(semana.hojeIdx >= 0 ? byDay[semana.hojeIdx] : []).map((a) => {
            const nome = a.profiles?.nome ?? 'Paciente'
            return (
              <div className="row" key={a.id} style={{ paddingLeft: 20, paddingRight: 20 }}>
                <div
                  className="mono tnum"
                  style={{ width: 56, fontSize: 13, color: 'var(--ink-2)', fontWeight: 500 }}
                >
                  {format(new Date(a.inicio), 'HH:mm')}
                </div>
                <div style={{ width: 0.5, alignSelf: 'stretch', background: 'var(--line)' }} />
                <div className="ava">{nome.slice(0, 2).toUpperCase()}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 500 }}>{nome}</div>
                  <div className="muted" style={{ fontSize: 12.5, marginTop: 2 }}>
                    {a.status === 'realizado' ? 'consulta realizada' : 'confirmada'}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Link to={`/app/consulta/${a.id}`} className="btn sm accent">
                    <IconVideo /> Entrar
                  </Link>
                  <Link
                    to={`/app/pacientes/${a.paciente_profile_id}`}
                    className="btn sm"
                  >
                    Prontuário
                  </Link>
                </div>
              </div>
            )
          })}
          {semana.hojeIdx >= 0 && byDay[semana.hojeIdx].length === 0 && (
            <div style={{ padding: 28, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              Nada para hoje.
            </div>
          )}
        </div>

        <DisponibilidadesCard
          disponibilidades={disponibilidades ?? []}
          loading={lDisp}
          nutriId={nutri?.id}
          onChange={() => queryClient.invalidateQueries({ queryKey: ['disponibilidades'] })}
        />
      </div>
    </div>
  )
}

interface WeekGridProps {
  byDay: Agendamento[][]
  diasDoMes: Date[]
  hojeIdx: number
  loading: boolean
}

function WeekGrid({ byDay, diasDoMes, hojeIdx, loading }: WeekGridProps) {
  const startH = 7
  const endH = 21
  const hours = Array.from({ length: endH - startH + 1 }, (_, i) => startH + i)
  const slotH = 28
  const pxPerMin = slotH / 30
  const dayHeight = (endH - startH) * 60 * pxPerMin

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden', position: 'relative' }}>
      {loading && (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'color-mix(in oklch, var(--paper) 60%, transparent)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 2,
          }}
        >
          <Loading />
        </div>
      )}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '52px repeat(7, 1fr)',
          borderBottom: '0.5px solid var(--line)',
        }}
      >
        <div />
        {DIAS_LBL.map((d, i) => {
          const isToday = i === hojeIdx
          return (
            <div
              key={i}
              style={{
                padding: '14px 12px',
                borderLeft: '0.5px solid var(--line-2)',
              }}
            >
              <div
                style={{
                  fontSize: 11.5,
                  color: 'var(--ink-3)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.06em',
                  fontWeight: 600,
                }}
              >
                {d}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 2 }}>
                <span
                  className="serif tnum"
                  style={{
                    fontSize: 22,
                    fontWeight: 400,
                    color: isToday ? 'var(--accent)' : 'var(--ink)',
                  }}
                >
                  {diasDoMes[i].getDate()}
                </span>
                {isToday && (
                  <span style={{ fontSize: 11, color: 'var(--accent)', fontWeight: 600 }}>hoje</span>
                )}
                <span style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--ink-4)' }}>
                  {byDay[i].length}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '52px repeat(7, 1fr)',
          position: 'relative',
        }}
      >
        <div style={{ height: dayHeight, position: 'relative' }}>
          {hours.map((h, i) => (
            <div
              key={h}
              className="mono tnum"
              style={{
                position: 'absolute',
                left: 0,
                right: 4,
                top: i * 60 * pxPerMin - 6,
                fontSize: 10.5,
                color: 'var(--ink-3)',
                textAlign: 'right',
                paddingRight: 6,
              }}
            >
              {String(h).padStart(2, '0')}:00
            </div>
          ))}
        </div>

        {byDay.map((apts, di) => (
          <div
            key={di}
            style={{
              position: 'relative',
              height: dayHeight,
              borderLeft: '0.5px solid var(--line-2)',
              background:
                di === hojeIdx
                  ? 'color-mix(in oklch, var(--accent-soft) 30%, transparent)'
                  : 'transparent',
            }}
          >
            {hours.map((h, i) => (
              <div
                key={h}
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: i * 60 * pxPerMin,
                  height: 0.5,
                  background: 'var(--line-2)',
                }}
              />
            ))}

            {di === hojeIdx && (() => {
              const now = new Date()
              const nowMin = now.getHours() * 60 + now.getMinutes()
              if (nowMin < startH * 60 || nowMin > endH * 60) return null
              const y = (nowMin - startH * 60) * pxPerMin
              return (
                <div
                  style={{
                    position: 'absolute',
                    left: -4,
                    right: 0,
                    top: y,
                    zIndex: 3,
                  }}
                >
                  <div
                    style={{
                      width: 7,
                      height: 7,
                      borderRadius: 999,
                      background: 'var(--clay)',
                      position: 'absolute',
                      left: 0,
                      top: -3,
                    }}
                  />
                  <div style={{ height: 1.5, background: 'var(--clay)', marginLeft: 6 }} />
                </div>
              )
            })()}

            {apts.map((a) => {
              const mini = minDoDia(a.inicio)
              const dur =
                (new Date(a.fim).getTime() - new Date(a.inicio).getTime()) / 60000
              const top = (mini - startH * 60) * pxPerMin
              const height = dur * pxPerMin - 2
              const realized = a.status === 'realizado'
              return (
                <Link
                  to={`/app/pacientes/${a.paciente_profile_id}`}
                  key={a.id}
                  style={{
                    position: 'absolute',
                    left: 3,
                    right: 3,
                    top: top + 1,
                    height,
                    background: realized ? 'var(--paper-2)' : 'var(--paper-3)',
                    border: '0.5px solid var(--line)',
                    borderLeft: `2.5px solid ${realized ? 'var(--paper-4)' : 'var(--accent)'}`,
                    borderRadius: 7,
                    padding: '5px 7px 4px 8px',
                    overflow: 'hidden',
                    color: 'var(--ink)',
                    opacity: realized ? 0.75 : 1,
                    display: 'block',
                  }}
                >
                  <div
                    className="mono tnum"
                    style={{ fontSize: 11.5, color: 'var(--ink-3)', fontWeight: 500 }}
                  >
                    {fmtHora(mini)}
                  </div>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 500,
                      lineHeight: 1.2,
                      marginTop: 1,
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {a.profiles?.nome ?? 'Paciente'}
                  </div>
                </Link>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

interface DispCardProps {
  disponibilidades: Disp[]
  loading: boolean
  nutriId?: string
  onChange: () => void
}

function DisponibilidadesCard({ disponibilidades, loading, nutriId, onChange }: DispCardProps) {
  const [modalOpen, setModalOpen] = useState(false)
  return (
    <div className="card" style={{ padding: 0 }}>
      <div
        style={{
          padding: '16px 20px',
          borderBottom: '0.5px solid var(--line)',
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
        }}
      >
        <div className="sec" style={{ marginBottom: 0 }}>
          <h3>Disponibilidade</h3>
        </div>
        <Button size="sm" variant="ghost" onClick={() => setModalOpen(true)}>
          <IconSettings />
          Editar
        </Button>
      </div>
      <div style={{ padding: 20 }}>
        {loading ? (
          <Loading />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
            {[0, 1, 2, 3, 4, 5, 6].map((d) => {
              const janelas = disponibilidades.filter((x) => x.dia_semana === d)
              return (
                <div
                  key={d}
                  style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13 }}
                >
                  <div style={{ width: 40, color: 'var(--ink-3)', fontWeight: 500 }}>
                    {DIAS_LBL[d]}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1 }}>
                    {janelas.length === 0 ? (
                      <span className="muted-2" style={{ fontSize: 12.5 }}>
                        —
                      </span>
                    ) : (
                      janelas.map((j) => (
                        <span
                          key={j.id}
                          className="mono tnum"
                          style={{
                            background: 'var(--paper-2)',
                            padding: '1px 7px',
                            borderRadius: 5,
                            fontSize: 11.5,
                            color: 'var(--ink-2)',
                          }}
                        >
                          {j.hora_inicio.slice(0, 5)} – {j.hora_fim.slice(0, 5)}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <DispModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        nutriId={nutriId}
        disponibilidades={disponibilidades}
        onChange={onChange}
      />
    </div>
  )
}

interface DispModalProps {
  open: boolean
  onClose: () => void
  nutriId?: string
  disponibilidades: Disp[]
  onChange: () => void
}

function DispModal({ open, onClose, nutriId, disponibilidades, onChange }: DispModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DisponibilidadeInput>({
    resolver: zodResolver(disponibilidadeSchema),
    defaultValues: { dia_semana: 1, hora_inicio: '08:00', hora_fim: '18:00' },
  })

  const add = useMutation({
    mutationFn: async (input: DisponibilidadeInput) => {
      if (!nutriId) throw new Error('Nutri ausente')
      const rid = newRequestId()
      const t0 = performance.now()
      const { error } = await supabase.from('disponibilidades').insert({
        nutricionista_id: nutriId,
        dia_semana: input.dia_semana,
        hora_inicio: input.hora_inicio,
        hora_fim: input.hora_fim,
      })
      if (error) throw error
      log({
        tipo: 'disponibilidade.criada',
        request_id: rid,
        duracao_ms: Math.round(performance.now() - t0),
        entidade: 'nutricionista',
        entidade_id: nutriId,
      })
    },
    onSuccess: () => {
      reset({ dia_semana: 1, hora_inicio: '08:00', hora_fim: '18:00' })
      toastSuccess('Janela adicionada')
      onChange()
    },
    onError: (err: Error) => toastError('Erro', err.message),
  })

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('disponibilidades').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => onChange(),
  })

  return (
    <Modal open={open} onClose={onClose} size="md">
      <ModalHeader onClose={onClose}>
        <ModalTitle>Disponibilidade semanal</ModalTitle>
        <p className="muted" style={{ fontSize: 12 }}>
          Adicione janelas por dia da semana — viram slots no <span className="mono">fn_slots_disponiveis</span>.
        </p>
      </ModalHeader>
      <ModalBody>
        <form
          onSubmit={handleSubmit((d) => add.mutate(d))}
          style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr auto', gap: 10, alignItems: 'end' }}
        >
          <Select label="Dia" {...register('dia_semana', { valueAsNumber: true })}>
            {DIAS_LBL.map((nome, idx) => (
              <option key={idx} value={idx}>
                {nome}
              </option>
            ))}
          </Select>
          <Input
            type="time"
            label="Início"
            {...register('hora_inicio')}
            error={errors.hora_inicio?.message}
          />
          <Input
            type="time"
            label="Fim"
            {...register('hora_fim')}
            error={errors.hora_fim?.message}
          />
          <Button type="submit" variant="primary" loading={isSubmitting}>
            <IconPlus />
            Adicionar
          </Button>
        </form>

        <h4 style={{ marginTop: 18, marginBottom: 8 }}>Janelas atuais</h4>
        {disponibilidades.length === 0 ? (
          <p className="muted" style={{ fontSize: 13 }}>
            Nenhuma janela cadastrada.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {disponibilidades.map((d) => (
              <div
                key={d.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 10px',
                  background: 'var(--paper-2)',
                  borderRadius: 8,
                }}
              >
                <div style={{ width: 50, fontWeight: 500, fontSize: 13 }}>
                  {DIAS_LBL[d.dia_semana]}
                </div>
                <div className="mono tnum" style={{ fontSize: 12.5, color: 'var(--ink-2)' }}>
                  {d.hora_inicio.slice(0, 5)} – {d.hora_fim.slice(0, 5)}
                </div>
                <button
                  type="button"
                  onClick={() => remove.mutate(d.id)}
                  className="icon-btn"
                  style={{ marginLeft: 'auto', width: 26, height: 26 }}
                >
                  <IconTrash />
                </button>
              </div>
            ))}
          </div>
        )}
      </ModalBody>
      <ModalFooter>
        <Button variant="primary" onClick={onClose}>
          <IconCheck />
          Concluir
        </Button>
      </ModalFooter>
    </Modal>
  )
}
