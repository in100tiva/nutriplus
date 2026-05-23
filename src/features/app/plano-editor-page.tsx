import { useState, useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { Button, Input, Loading, Badge, EmptyState } from '@/components/ui'
import { Bar } from '@/components/charts'
import {
  IconChevL,
  IconPlus,
  IconTrash,
  IconSearch,
  IconCopy,
  IconDownload,
  IconCheck,
  IconDrag,
  IconMore,
  IconX,
} from '@/components/icons'
import { toastError, toastSuccess } from '@/hooks/use-toast'
import type { Alimento } from '@/types'

interface Item {
  id: string
  quantidade_g: number
  medida_caseira: string | null
  ordem: number
  alimentos: {
    id: string
    nome: string
    categoria: string | null
    kcal_por_100g: number
    carboidrato_g: number
    proteina_g: number
    lipidio_g: number
    fibra_g: number
  } | null
}

interface Refeicao {
  id: string
  nome: string
  horario: string | null
  ordem: number
  plano_itens: Item[]
}

interface Plano {
  id: string
  titulo: string
  publicado: boolean
  data_inicio: string
  data_fim: string | null
  prontuarios: { profiles: { nome: string } | null } | null
  plano_refeicoes: Refeicao[]
}

// Metas diárias-base para o macro dashboard (referenciais)
const METAS = { kcal: 2100, carb: 240, prot: 140, lip: 70 }

function macrosDoItem(it: Item) {
  const a = it.alimentos
  if (!a) return { kcal: 0, c: 0, p: 0, l: 0, fib: 0 }
  const f = it.quantidade_g / 100
  return {
    kcal: a.kcal_por_100g * f,
    c: a.carboidrato_g * f,
    p: a.proteina_g * f,
    l: a.lipidio_g * f,
    fib: a.fibra_g * f,
  }
}

function macrosDaRefeicao(r: Refeicao) {
  const total = { kcal: 0, c: 0, p: 0, l: 0, fib: 0 }
  for (const it of r.plano_itens) {
    const m = macrosDoItem(it)
    total.kcal += m.kcal
    total.c += m.c
    total.p += m.p
    total.l += m.l
    total.fib += m.fib
  }
  return total
}

function macrosDoPlano(refs: Refeicao[]) {
  const total = { kcal: 0, c: 0, p: 0, l: 0, fib: 0 }
  for (const r of refs) {
    const m = macrosDaRefeicao(r)
    total.kcal += m.kcal
    total.c += m.c
    total.p += m.p
    total.l += m.l
    total.fib += m.fib
  }
  return total
}

export function PlanoEditorPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()
  const [activeRefeicao, setActiveRefeicao] = useState<string | null>(null)

  const { data: plano, isLoading } = useQuery({
    queryKey: ['plano', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select(
          'id, titulo, publicado, data_inicio, data_fim, prontuarios!planos_alimentares_prontuario_id_fkey(profiles!prontuarios_paciente_profile_id_fkey(nome)), plano_refeicoes(id, nome, horario, ordem, plano_itens(id, quantidade_g, medida_caseira, ordem, alimentos(id, nome, categoria, kcal_por_100g, carboidrato_g, proteina_g, lipidio_g, fibra_g)))',
        )
        .eq('id', id!)
        .maybeSingle()
      if (error) throw error
      return data as unknown as Plano | null
    },
  })

  const refeicoes = useMemo(
    () => [...(plano?.plano_refeicoes ?? [])].sort((a, b) => a.ordem - b.ordem),
    [plano],
  )

  if (!activeRefeicao && refeicoes.length > 0) {
    setActiveRefeicao(refeicoes[0].id)
  }

  const total = macrosDoPlano(refeicoes)

  const togglePub = useMutation({
    mutationFn: async () => {
      if (!plano) return
      const { error } = await supabase
        .from('planos_alimentares')
        .update({ publicado: !plano.publicado })
        .eq('id', plano.id)
      if (error) throw error
    },
    onSuccess: () => {
      toastSuccess('Status atualizado')
      queryClient.invalidateQueries({ queryKey: ['plano', id] })
    },
    onError: (err: Error) => toastError('Erro', err.message),
  })

  const addRefeicao = useMutation({
    mutationFn: async () => {
      if (!plano) return
      const ordem = refeicoes.length
      const { error } = await supabase.from('plano_refeicoes').insert({
        plano_id: plano.id,
        nome: `Refeição ${ordem + 1}`,
        ordem,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plano', id] }),
  })

  if (isLoading) return <Loading label="Carregando plano…" />
  if (!plano) return <p>Plano não encontrado.</p>

  const pacienteNome = plano.prontuarios?.profiles?.nome ?? 'Paciente'

  return (
    <div className="fade-up" data-screen-label="plano-editor">
      {/* Page head */}
      <div className="page-head">
        <div style={{ minWidth: 0, flex: 1 }}>
          <Link
            to="/app/planos"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 4,
              fontSize: 12.5,
              color: 'var(--ink-3)',
              marginBottom: 6,
            }}
          >
            <IconChevL />
            Planos
          </Link>
          <div className="eyebrow">Plano alimentar · Paciente: {pacienteNome}</div>
          <h1 style={{ marginTop: 4 }}>{plano.titulo}</h1>
          <p className="sub">
            Adicione alimentos da base TACO. Os macros são calculados em tempo real via{' '}
            <span className="mono">fn_refeicao_totais</span> /{' '}
            <span className="mono">fn_plano_totais</span>.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button>
            <IconCopy />
            Duplicar
          </Button>
          <Button>
            <IconDownload />
            Exportar
          </Button>
          {plano.publicado ? (
            <Button variant="accent" onClick={() => togglePub.mutate()} loading={togglePub.isPending}>
              <IconCheck />
              Publicado
            </Button>
          ) : (
            <Button variant="primary" onClick={() => togglePub.mutate()} loading={togglePub.isPending}>
              Publicar para paciente
            </Button>
          )}
        </div>
      </div>

      {/* Macros dashboard */}
      <MacrosDashboard total={total} />

      {/* Editor body */}
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) 340px', gap: 16 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {refeicoes.length === 0 ? (
            <EmptyState title="Sem refeições" description="Adicione a primeira refeição com o botão abaixo." />
          ) : (
            refeicoes.map((r) => (
              <RefeicaoCard
                key={r.id}
                refeicao={r}
                active={r.id === activeRefeicao}
                onActivate={() => setActiveRefeicao(r.id)}
                planoId={plano.id}
              />
            ))
          )}
          <Button
            variant="ghost"
            onClick={() => addRefeicao.mutate()}
            style={{ alignSelf: 'flex-start' }}
          >
            <IconPlus />
            Adicionar refeição
          </Button>
        </div>

        <TacoPanel
          activeRefeicao={activeRefeicao}
          activeNome={refeicoes.find((r) => r.id === activeRefeicao)?.nome ?? ''}
          onAdded={() => queryClient.invalidateQueries({ queryKey: ['plano', id] })}
        />
      </div>
    </div>
  )
}

function MacrosDashboard({ total }: { total: { kcal: number; c: number; p: number; l: number; fib: number } }) {
  const cells = [
    { label: 'Energia', value: Math.round(total.kcal), unit: 'kcal', meta: METAS.kcal, color: 'var(--ink)', emphasis: true },
    { label: 'Carboidrato', value: Math.round(total.c), unit: 'g', meta: METAS.carb, color: 'var(--clay)' },
    { label: 'Proteína', value: Math.round(total.p), unit: 'g', meta: METAS.prot, color: 'var(--accent)' },
    { label: 'Lipídio', value: Math.round(total.l), unit: 'g', meta: METAS.lip, color: 'var(--info)' },
    { label: 'Fibra', value: Number(total.fib.toFixed(1)), unit: 'g', meta: 30, color: 'var(--ink-2)' },
  ]
  return (
    <div className="card" style={{ marginBottom: 18, padding: 0, overflow: 'hidden' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 0 }}>
        {cells.map((c, i) => {
          const pct = Math.min(1, c.value / c.meta)
          return (
            <div
              key={c.label}
              style={{
                padding: '18px 20px',
                borderRight: i < cells.length - 1 ? '0.5px solid var(--line-2)' : 0,
                background: c.emphasis ? 'var(--paper-2)' : 'var(--paper-3)',
              }}
            >
              <div className="lbl" style={{ fontSize: 10.5, color: 'var(--ink-3)', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600 }}>
                {c.label}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 4, marginTop: 4 }}>
                <div className="serif tnum" style={{ fontSize: 26, fontWeight: 400, lineHeight: 1 }}>
                  {c.value}
                </div>
                <div className="muted" style={{ fontSize: 12 }}>{c.unit}</div>
                <div className="muted" style={{ fontSize: 11.5, marginLeft: 'auto' }}>/ {c.meta}</div>
              </div>
              <div style={{ marginTop: 10 }}>
                <Bar value={c.value} max={c.meta} color={c.color} h={5} />
                <div className="muted" style={{ fontSize: 11, marginTop: 4 }}>
                  {Math.round(pct * 100)}% da meta
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function RefeicaoCard({
  refeicao,
  active,
  onActivate,
  planoId,
}: {
  refeicao: Refeicao
  active: boolean
  onActivate: () => void
  planoId: string
}) {
  const queryClient = useQueryClient()
  const m = macrosDaRefeicao(refeicao)

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('plano_itens').delete().eq('id', itemId)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plano'] }),
  })

  const removeRefeicao = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('plano_refeicoes').delete().eq('id', refeicao.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plano', planoId] }),
  })

  const updateQty = useMutation({
    mutationFn: async (input: { id: string; q: number }) => {
      const { error } = await supabase
        .from('plano_itens')
        .update({ quantidade_g: input.q })
        .eq('id', input.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plano'] }),
  })

  return (
    <div
      onClick={onActivate}
      className="card"
      style={{
        padding: 0,
        borderColor: active ? 'var(--accent)' : 'var(--line)',
        boxShadow: active ? '0 0 0 3px color-mix(in oklch, var(--accent) 14%, transparent)' : 'none',
        cursor: 'default',
        transition: 'border-color .15s, box-shadow .15s',
      }}
    >
      <div
        style={{
          padding: '14px 20px',
          borderBottom: refeicao.plano_itens.length ? '0.5px solid var(--line)' : 0,
          display: 'flex',
          alignItems: 'center',
          gap: 12,
        }}
      >
        <div style={{ color: 'var(--ink-4)' }}>
          <IconDrag />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
            <h3 className="serif" style={{ fontSize: 19, fontWeight: 500 }}>
              {refeicao.nome}
            </h3>
            {refeicao.horario && (
              <span className="mono tnum muted" style={{ fontSize: 12 }}>
                {refeicao.horario.slice(0, 5)}
              </span>
            )}
            {active && <Badge variant="accent">editando</Badge>}
          </div>
          <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
            {refeicao.plano_itens.length} {refeicao.plano_itens.length === 1 ? 'item' : 'itens'}
          </div>
        </div>
        <div className="tnum" style={{ display: 'flex', gap: 16, fontSize: 12, color: 'var(--ink-2)' }}>
          <MacroCell lbl="kcal" v={Math.round(m.kcal)} emphasis />
          <MacroCell lbl="C" v={Math.round(m.c)} />
          <MacroCell lbl="P" v={Math.round(m.p)} />
          <MacroCell lbl="L" v={Math.round(m.l)} />
        </div>
        <button
          type="button"
          className="icon-btn"
          onClick={(e) => {
            e.stopPropagation()
            removeRefeicao.mutate()
          }}
        >
          <IconMore />
        </button>
      </div>

      {refeicao.plano_itens.map((it, idx) => {
        const m = macrosDoItem(it)
        return (
          <div
            key={it.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '16px minmax(0, 1.6fr) 80px 110px 60px 60px 24px',
              gap: 12,
              padding: '10px 20px',
              alignItems: 'center',
              borderBottom: idx < refeicao.plano_itens.length - 1 ? '0.5px solid var(--line-2)' : 0,
              fontSize: 13,
            }}
          >
            <div style={{ color: 'var(--ink-4)' }}>
              <IconDrag />
            </div>
            <div style={{ minWidth: 0 }}>
              <div
                style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
              >
                {it.alimentos?.nome ?? '—'}
              </div>
              <div className="muted" style={{ fontSize: 11, marginTop: 1 }}>
                {it.alimentos?.categoria ?? '—'} · TACO
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <input
                type="number"
                defaultValue={it.quantidade_g}
                onBlur={(e) => {
                  const v = Math.max(0, Number(e.target.value) || 0)
                  if (v !== it.quantidade_g) updateQty.mutate({ id: it.id, q: v })
                }}
                className="input"
                style={{ height: 28, padding: '0 6px', width: 60, textAlign: 'right' }}
              />
              <span className="muted" style={{ fontSize: 11.5 }}>g</span>
            </div>
            <div className="muted tnum" style={{ fontSize: 12 }}>
              {it.medida_caseira ?? '—'}
            </div>
            <div className="tnum" style={{ textAlign: 'right', color: 'var(--ink-2)', fontWeight: 500 }}>
              {Math.round(m.kcal)}
            </div>
            <div className="tnum" style={{ textAlign: 'right', color: 'var(--ink-3)' }}>
              {m.p.toFixed(1)}
            </div>
            <button
              type="button"
              className="icon-btn"
              onClick={() => removeItem.mutate(it.id)}
              style={{ width: 24, height: 24 }}
            >
              <IconTrash />
            </button>
          </div>
        )
      })}
      {refeicao.plano_itens.length === 0 && (
        <div style={{ padding: 20, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
          Nenhum alimento — use a busca à direita.
        </div>
      )}
    </div>
  )
}

function MacroCell({ lbl, v, emphasis }: { lbl: string; v: number; emphasis?: boolean }) {
  return (
    <div style={{ textAlign: 'right' }}>
      <div
        className="muted"
        style={{ fontSize: 10.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}
      >
        {lbl}
      </div>
      <div className={emphasis ? 'serif' : ''} style={{ fontSize: emphasis ? 16 : 13, fontWeight: emphasis ? 500 : 400 }}>
        {v}
      </div>
    </div>
  )
}

function TacoPanel({
  activeRefeicao,
  activeNome,
  onAdded,
}: {
  activeRefeicao: string | null
  activeNome: string
  onAdded: () => void
}) {
  const [search, setSearch] = useState('')

  const { data: results } = useQuery({
    queryKey: ['alimentos', search],
    queryFn: async () => {
      const q = supabase.from('alimentos').select('*').order('nome').limit(14)
      const { data } = search.length >= 2 ? await q.ilike('nome', `%${search}%`) : await q
      return (data ?? []) as Alimento[]
    },
  })

  const addItem = useMutation({
    mutationFn: async (alimento: Alimento) => {
      if (!activeRefeicao) throw new Error('Selecione uma refeição')
      const { error } = await supabase.from('plano_itens').insert({
        refeicao_id: activeRefeicao,
        alimento_id: alimento.id,
        quantidade_g: 100,
      })
      if (error) throw error
    },
    onSuccess: () => {
      onAdded()
    },
    onError: (err: Error) => toastError('Erro', err.message),
  })

  return (
    <div style={{ position: 'sticky', top: 0, alignSelf: 'start' }}>
      <div className="card" style={{ padding: 0, display: 'flex', flexDirection: 'column' }}>
        <div style={{ padding: '16px 16px 14px', borderBottom: '0.5px solid var(--line)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <h3 className="serif" style={{ fontSize: 17, fontWeight: 500 }}>
              Banco TACO
            </h3>
            <Badge>{results?.length ?? 0} no resultado</Badge>
          </div>
          <Input
            placeholder="ex: feijão, frango…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<IconSearch />}
            rightIcon={
              search ? (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  style={{ color: 'var(--ink-3)' }}
                >
                  <IconX />
                </button>
              ) : undefined
            }
          />
          <div className="muted" style={{ fontSize: 11, marginTop: 8 }}>
            <span className="mono">alimentos.nome ilike $1 || '%'</span> · adicionar à{' '}
            <strong style={{ color: 'var(--ink-2)' }}>{activeNome || '—'}</strong>
          </div>
        </div>

        <div style={{ maxHeight: 540, overflowY: 'auto' }}>
          {(results ?? []).length === 0 && (
            <div style={{ padding: 24, textAlign: 'center', color: 'var(--ink-3)', fontSize: 13 }}>
              {search ? `Sem resultado para "${search}".` : 'Sem alimentos.'}
            </div>
          )}
          {(results ?? []).map((a) => (
            <button
              key={a.id}
              type="button"
              onClick={() => addItem.mutate(a)}
              style={{
                appearance: 'none',
                border: 0,
                background: 'transparent',
                font: 'inherit',
                textAlign: 'left',
                width: '100%',
                padding: '10px 16px',
                borderBottom: '0.5px solid var(--line-2)',
                cursor: 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
              }}
              className="hover:bg-[color:var(--paper-2)]"
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  style={{ fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}
                >
                  {a.nome}
                </div>
                <div
                  className="tnum"
                  style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--ink-3)', marginTop: 2 }}
                >
                  <span>{a.categoria ?? '—'}</span>
                  <span>·</span>
                  <span>{Number(a.kcal_por_100g).toFixed(0)} kcal</span>
                  <span className="muted-2">
                    P{Number(a.proteina_g).toFixed(0)} C{Number(a.carboidrato_g).toFixed(0)} L
                    {Number(a.lipidio_g).toFixed(0)}
                  </span>
                </div>
              </div>
              <span className="icon-btn" style={{ width: 26, height: 26, border: 0, background: 'transparent' }}>
                <IconPlus />
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
