import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Card, Loading, EmptyState, Badge, Button } from '@/components/ui'
import { Donut, Bar } from '@/components/charts'
import { IconPlate, IconCheck, IconDownload } from '@/components/icons'
import { formatData } from '@/lib/format'
import { baixarPlanoPdf } from '@/lib/pdf/plano-pdf'

const METAS = { kcal: 2100, carb: 240, prot: 140, lip: 70 }

interface Item {
  id: string
  quantidade_g: number
  medida_caseira: string | null
  alimentos: {
    nome: string
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
  data_inicio: string
  data_fim: string | null
  observacoes: string | null
  prontuarios: {
    nutricionistas: { crn: string; profiles: { nome: string } | null } | null
  } | null
  plano_refeicoes: Refeicao[]
}

function macrosItem(i: Item) {
  const a = i.alimentos
  if (!a) return { kcal: 0, c: 0, p: 0, l: 0, fib: 0 }
  const f = i.quantidade_g / 100
  return {
    kcal: a.kcal_por_100g * f,
    c: a.carboidrato_g * f,
    p: a.proteina_g * f,
    l: a.lipidio_g * f,
    fib: a.fibra_g * f,
  }
}

function macrosRef(r: Refeicao) {
  const t = { kcal: 0, c: 0, p: 0, l: 0, fib: 0 }
  for (const i of r.plano_itens) {
    const m = macrosItem(i)
    t.kcal += m.kcal
    t.c += m.c
    t.p += m.p
    t.l += m.l
    t.fib += m.fib
  }
  return t
}

function macrosTotal(refs: Refeicao[]) {
  const t = { kcal: 0, c: 0, p: 0, l: 0, fib: 0 }
  for (const r of refs) {
    const m = macrosRef(r)
    t.kcal += m.kcal
    t.c += m.c
    t.p += m.p
    t.l += m.l
    t.fib += m.fib
  }
  return t
}

export function PacientePlanoPage() {
  const profile = useAuth((s) => s.profile)

  const { data: plano, isLoading } = useQuery({
    queryKey: ['paciente-plano', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select(
          'id, titulo, data_inicio, data_fim, observacoes, prontuarios!planos_alimentares_prontuario_id_fkey(nutricionistas!prontuarios_nutricionista_id_fkey(crn, profiles!nutricionistas_profile_id_fkey(nome))), plano_refeicoes(id, nome, horario, ordem, plano_itens(id, quantidade_g, medida_caseira, alimentos(nome, kcal_por_100g, carboidrato_g, proteina_g, lipidio_g, fibra_g)))',
        )
        .eq('publicado', true)
        .order('data_inicio', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as unknown as Plano | null
    },
  })

  if (isLoading) return <Loading label="Carregando plano…" />
  if (!plano) {
    return (
      <EmptyState
        icon={<IconPlate />}
        title="Sem plano disponível"
        description="Assim que seu nutricionista publicar um plano, ele aparece aqui."
      />
    )
  }

  const refeicoes = [...(plano.plano_refeicoes ?? [])].sort((a, b) => a.ordem - b.ordem)
  const total = macrosTotal(refeicoes)

  return (
    <div className="fade-up" data-screen-label="paciente-plano">
      <div className="page-head">
        <div>
          <div className="eyebrow">Plano alimentar</div>
          <h1>{plano.titulo}</h1>
          <p className="sub">
            Período: {formatData(plano.data_inicio)}
            {plano.data_fim ? ` — ${formatData(plano.data_fim)}` : ' — em vigor'}.
            {plano.prontuarios?.nutricionistas?.profiles?.nome && (
              <>
                {' '}Prescrito por{' '}
                <em style={{ color: 'var(--ink-2)' }}>
                  {plano.prontuarios.nutricionistas.profiles.nome}
                </em>.
              </>
            )}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <Badge variant="accent">
            <IconCheck /> publicado
          </Badge>
          <Button
            variant="primary"
            onClick={() =>
              baixarPlanoPdf({
                plano: {
                  titulo: plano.titulo,
                  data_inicio: plano.data_inicio,
                  data_fim: plano.data_fim,
                  observacoes: plano.observacoes,
                  plano_refeicoes: refeicoes,
                },
                nutri: {
                  nome:
                    plano.prontuarios?.nutricionistas?.profiles?.nome ?? 'Nutricionista',
                  crn: plano.prontuarios?.nutricionistas?.crn ?? '—',
                },
                paciente: { nome: profile?.nome ?? 'Paciente' },
              })
            }
          >
            <IconDownload />
            Baixar PDF
          </Button>
        </div>
      </div>

      {/* Macros dashboard */}
      <Card style={{ marginBottom: 16, padding: 0 }}>
        <div
          style={{
            padding: 22,
            display: 'flex',
            gap: 22,
            alignItems: 'center',
          }}
        >
          <Donut
            size={86}
            stroke={9}
            pct={total.kcal / METAS.kcal}
            label="Energia"
            sub={`${Math.round(total.kcal)} kcal`}
          />
          <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
            <Macro label="Carbo" v={total.c} meta={METAS.carb} color="var(--clay)" />
            <Macro label="Proteína" v={total.p} meta={METAS.prot} color="var(--accent)" />
            <Macro label="Lipídio" v={total.l} meta={METAS.lip} color="var(--info)" />
          </div>
        </div>
      </Card>

      {refeicoes.map((r) => {
        const m = macrosRef(r)
        return (
          <Card key={r.id} style={{ marginBottom: 12, padding: '14px 22px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                className="mono tnum"
                style={{ fontSize: 12, color: 'var(--ink-3)', width: 44, fontWeight: 500 }}
              >
                {r.horario?.slice(0, 5) ?? '—'}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                  <h3 className="serif" style={{ fontSize: 17, fontWeight: 500 }}>
                    {r.nome}
                  </h3>
                  <span className="muted" style={{ fontSize: 12 }}>
                    {Math.round(m.kcal)} kcal
                  </span>
                </div>
                <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {r.plano_itens.map((it) => (
                    <div
                      key={it.id}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13 }}
                    >
                      <span
                        style={{
                          width: 4,
                          height: 4,
                          borderRadius: 999,
                          background: 'var(--accent)',
                          flex: 'none',
                        }}
                      />
                      <span>{it.alimentos?.nome ?? '—'}</span>
                      <span className="muted" style={{ fontSize: 11.5 }}>
                        — {it.medida_caseira ?? `${it.quantidade_g}g`} ({it.quantidade_g}g)
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </Card>
        )
      })}

      {plano.observacoes && (
        <Card variant="warm" style={{ padding: '14px 22px' }}>
          <div className="muted" style={{ fontSize: 12.5, lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--ink-2)' }}>Observação da nutri:</strong>{' '}
            {plano.observacoes}
          </div>
        </Card>
      )}
    </div>
  )
}

function Macro({ label, v, meta, color }: { label: string; v: number; meta: number; color: string }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11.5 }}>
        <span style={{ color: 'var(--ink-2)' }}>{label}</span>
        <span className="tnum muted">
          {v.toFixed(0)} / {meta} g
        </span>
      </div>
      <Bar value={v} max={meta} color={color} h={4} />
    </div>
  )
}
