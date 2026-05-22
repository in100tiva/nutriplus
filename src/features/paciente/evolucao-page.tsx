import { useQuery } from '@tanstack/react-query'
import { LineChart as LineIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Loading,
  EmptyState,
} from '@/components/ui'
import { formatData } from '@/lib/format'

type Aval = {
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
      // RLS já filtra pelo paciente_profile_id; basta listar avaliações
      // de prontuários onde ele é o paciente.
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

  if (isLoading) return <Loading label="Carregando..." />
  if (!data || data.length === 0) {
    return (
      <EmptyState
        icon={<LineIcon className="h-5 w-5" />}
        title="Sem avaliações"
        description="Quando seu nutricionista registrar pesagens e medidas, sua evolução aparece aqui."
      />
    )
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Minha evolução</h2>
      <SparkChart
        titulo="Peso (kg)"
        pontos={data.map((d) => ({ data: d.data, valor: d.peso_kg ?? null }))}
      />
      <SparkChart
        titulo="% Gordura"
        pontos={data.map((d) => ({ data: d.data, valor: d.percentual_gordura ?? null }))}
      />
      <SparkChart
        titulo="Cintura (cm)"
        pontos={data.map((d) => ({ data: d.data, valor: d.circunferencias?.cintura ?? null }))}
      />

      <Card>
        <CardHeader>
          <CardTitle>Histórico</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="divide-y divide-gray-100">
            {[...data].reverse().map((a) => (
              <li key={a.id} className="flex justify-between py-2 text-sm">
                <span>{formatData(a.data)}</span>
                <span className="text-gray-600">
                  {a.peso_kg ? `${a.peso_kg} kg ` : ''}
                  {a.percentual_gordura ? `· ${a.percentual_gordura}% gordura` : ''}
                </span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}

interface Ponto {
  data: string
  valor: number | null
}

/**
 * Sparkline SVG mínimo — evita dependência de chart lib enquanto o volume é baixo.
 * Quando passar de ~50 pontos por gráfico, vale trocar por recharts.
 */
function SparkChart({ titulo, pontos }: { titulo: string; pontos: Ponto[] }) {
  const validos = pontos.filter((p): p is { data: string; valor: number } => p.valor !== null)
  if (validos.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{titulo}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">Sem dados registrados.</p>
        </CardContent>
      </Card>
    )
  }
  const min = Math.min(...validos.map((p) => p.valor))
  const max = Math.max(...validos.map((p) => p.valor))
  const range = max - min || 1
  const w = 600
  const h = 120
  const px = (i: number) => (validos.length === 1 ? w / 2 : (i / (validos.length - 1)) * w)
  const py = (v: number) => h - ((v - min) / range) * h
  const d = validos
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${px(i).toFixed(1)} ${py(p.valor).toFixed(1)}`)
    .join(' ')

  return (
    <Card>
      <CardHeader>
        <CardTitle>{titulo}</CardTitle>
      </CardHeader>
      <CardContent>
        <svg viewBox={`0 0 ${w} ${h + 20}`} className="w-full">
          <path d={d} fill="none" stroke="#059669" strokeWidth="2" />
          {validos.map((p, i) => (
            <g key={p.data}>
              <circle cx={px(i)} cy={py(p.valor)} r="3" fill="#059669" />
              {(i === 0 || i === validos.length - 1) && (
                <text
                  x={px(i)}
                  y={h + 15}
                  textAnchor={i === 0 ? 'start' : 'end'}
                  className="fill-gray-500 text-[10px]"
                >
                  {formatData(p.data)}
                </text>
              )}
            </g>
          ))}
        </svg>
        <p className="mt-2 text-xs text-gray-500">
          Mín: {min} · Máx: {max} · Último: {validos[validos.length - 1].valor}
        </p>
      </CardContent>
    </Card>
  )
}
