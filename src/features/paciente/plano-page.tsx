import { useQuery } from '@tanstack/react-query'
import { UtensilsCrossed } from 'lucide-react'
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

type Plano = {
  id: string
  titulo: string
  data_inicio: string
  data_fim: string | null
  observacoes: string | null
  plano_refeicoes: Array<{
    id: string
    nome: string
    horario: string | null
    ordem: number
    plano_itens: Array<{
      id: string
      quantidade_g: number
      medida_caseira: string | null
      alimentos: { nome: string; kcal_por_100g: number } | null
    }>
  }>
}

export function PacientePlanoPage() {
  const profile = useAuth((s) => s.profile)

  const { data: plano, isLoading } = useQuery({
    queryKey: ['paciente-plano', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      // Pega o último plano publicado de qualquer um dos prontuários do paciente.
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select(
          'id, titulo, data_inicio, data_fim, observacoes, plano_refeicoes(id, nome, horario, ordem, plano_itens(id, quantidade_g, medida_caseira, alimentos(nome, kcal_por_100g)))',
        )
        .eq('publicado', true)
        .order('data_inicio', { ascending: false })
        .limit(1)
        .maybeSingle()
      if (error) throw error
      return data as unknown as Plano | null
    },
  })

  if (isLoading) return <Loading label="Carregando..." />

  if (!plano) {
    return (
      <EmptyState
        icon={<UtensilsCrossed className="h-5 w-5" />}
        title="Sem plano disponível"
        description="Assim que seu nutricionista publicar um plano, ele aparece aqui."
      />
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{plano.titulo}</CardTitle>
          <p className="text-sm text-gray-500">
            {formatData(plano.data_inicio)}
            {plano.data_fim ? ` — ${formatData(plano.data_fim)}` : ' — em vigor'}
          </p>
        </CardHeader>
        {plano.observacoes && (
          <CardContent>
            <p className="text-sm text-gray-700">{plano.observacoes}</p>
          </CardContent>
        )}
      </Card>

      {(plano.plano_refeicoes ?? [])
        .sort((a, b) => a.ordem - b.ordem)
        .map((r) => (
          <Card key={r.id}>
            <CardHeader>
              <CardTitle>
                {r.nome} {r.horario ? `· ${r.horario.slice(0, 5)}` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {r.plano_itens.length === 0 ? (
                <p className="text-sm text-gray-500">Sem itens nesta refeição.</p>
              ) : (
                <ul className="divide-y divide-gray-100">
                  {r.plano_itens.map((i) => (
                    <li key={i.id} className="py-2 text-sm text-gray-800">
                      <span className="font-medium">{i.alimentos?.nome ?? '—'}</span> ·{' '}
                      {i.quantidade_g}g
                      {i.medida_caseira ? ` (${i.medida_caseira})` : ''}
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>
        ))}
    </div>
  )
}
