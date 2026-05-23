import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent, Loading, EmptyState } from '@/components/ui'
import { LineChart } from '@/components/charts'
import { IconChart } from '@/components/icons'
import { formatData } from '@/lib/format'

interface Aval {
  id: string
  data: string
  peso_kg: number | null
  altura_cm: number | null
  percentual_gordura: number | null
  circunferencias: { cintura?: number | null; quadril?: number | null } | null
}

export function PacienteEvolucaoPage() {
  const profile = useAuth((s) => s.profile)

  const { data, isLoading } = useQuery({
    queryKey: ['paciente-evolucao', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data: pron } = await supabase
        .from('prontuarios')
        .select('id')
        .eq('paciente_profile_id', profile!.id)
      const ids = (pron ?? []).map((p) => p.id)
      if (ids.length === 0) return [] as Aval[]
      const { data: avals, error } = await supabase
        .from('avaliacoes_antropometricas')
        .select('id, data, peso_kg, altura_cm, percentual_gordura, circunferencias')
        .in('prontuario_id', ids)
        .order('data', { ascending: true })
      if (error) throw error
      return (avals ?? []) as unknown as Aval[]
    },
  })

  if (isLoading) return <Loading label="Carregando…" />
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<IconChart />}
        title="Sem avaliações"
        description="Quando seu nutricionista registrar pesagens e medidas, sua evolução aparece aqui."
      />
    )
  }

  const labels = data.map((d) => formatData(d.data).slice(0, 5))
  const pesos = data.map((d) => d.peso_kg ?? 0)
  const gorduras = data.map((d) => d.percentual_gordura ?? 0)
  const cinturas = data.map((d) => d.circunferencias?.cintura ?? 0)

  const lastPeso = [...data].reverse().find((d) => d.peso_kg !== null)?.peso_kg
  const firstPeso = data.find((d) => d.peso_kg !== null)?.peso_kg
  const deltaPeso = lastPeso && firstPeso ? lastPeso - firstPeso : null

  return (
    <div className="fade-up" data-screen-label="paciente-evolucao">
      <div className="page-head">
        <div>
          <div className="eyebrow">Minha evolução</div>
          <h1>O caminho até aqui</h1>
          <p className="sub">{data.length} avaliação(ões) registrada(s).</p>
        </div>
      </div>

      <Card style={{ marginBottom: 14 }}>
        <CardHeader>
          <CardTitle>Peso (kg)</CardTitle>
          {deltaPeso !== null && (
            <span
              className="meta"
              style={{
                color:
                  deltaPeso < 0
                    ? 'color-mix(in oklch, var(--accent) 70%, black)'
                    : 'var(--clay)',
              }}
            >
              {deltaPeso > 0 ? '+' : ''}
              {deltaPeso.toFixed(1)} kg desde o início
            </span>
          )}
        </CardHeader>
        <CardContent>
          <LineChart
            series={[{ color: 'var(--accent)', points: pesos }]}
            labels={labels}
            yLabel="kg"
          />
        </CardContent>
      </Card>

      {gorduras.some((v) => v > 0) && (
        <Card style={{ marginBottom: 14 }}>
          <CardHeader>
            <CardTitle>% gordura</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              series={[{ color: 'var(--info)', points: gorduras }]}
              labels={labels}
              yLabel="%"
            />
          </CardContent>
        </Card>
      )}

      {cinturas.some((v) => v > 0) && (
        <Card style={{ marginBottom: 14 }}>
          <CardHeader>
            <CardTitle>Cintura (cm)</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart
              series={[{ color: 'var(--clay)', points: cinturas }]}
              labels={labels}
              yLabel="cm"
            />
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <ul style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {[...data].reverse().map((a) => (
              <li
                key={a.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  padding: '6px 0',
                  borderBottom: '0.5px solid var(--line-2)',
                  fontSize: 13,
                }}
              >
                <span className="tnum">{formatData(a.data)}</span>
                <span className="muted tnum">
                  {a.peso_kg ? `${a.peso_kg} kg` : '—'}
                  {a.percentual_gordura ? ` · ${a.percentual_gordura}%` : ''}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
