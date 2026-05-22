import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Plus, Trash2, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Loading,
  Badge,
  EmptyState,
} from '@/components/ui'
import { toastError, toastSuccess } from '@/hooks/use-toast'

type Refeicao = {
  id: string
  nome: string
  horario: string | null
  ordem: number
  plano_itens: Array<{
    id: string
    quantidade_g: number
    medida_caseira: string | null
    alimentos: { id: string; nome: string; kcal_por_100g: number } | null
  }>
}

type Plano = {
  id: string
  titulo: string
  publicado: boolean
  plano_refeicoes: Refeicao[]
}

export function PlanoEditorPage() {
  const { id } = useParams<{ id: string }>()
  const queryClient = useQueryClient()

  const { data: plano, isLoading } = useQuery({
    queryKey: ['plano', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select(
          'id, titulo, publicado, plano_refeicoes(id, nome, horario, ordem, plano_itens(id, quantidade_g, medida_caseira, alimentos(id, nome, kcal_por_100g)))',
        )
        .eq('id', id!)
        .maybeSingle()
      if (error) throw error
      return data as unknown as Plano | null
    },
  })

  const togglePublicar = useMutation({
    mutationFn: async () => {
      if (!plano) return
      const { error } = await supabase
        .from('planos_alimentares')
        .update({ publicado: !plano.publicado })
        .eq('id', plano.id)
      if (error) throw error
    },
    onSuccess: () => {
      toastSuccess('Status do plano atualizado')
      queryClient.invalidateQueries({ queryKey: ['plano', id] })
    },
    onError: (err: Error) => toastError('Erro', err.message),
  })

  const addRefeicao = useMutation({
    mutationFn: async () => {
      if (!plano) return
      const ordem = (plano.plano_refeicoes?.length ?? 0)
      const { error } = await supabase.from('plano_refeicoes').insert({
        plano_id: plano.id,
        nome: `Refeição ${ordem + 1}`,
        ordem,
      })
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plano', id] }),
  })

  if (isLoading) return <Loading />
  if (!plano) return <p>Plano não encontrado.</p>

  const refeicoes = [...(plano.plano_refeicoes ?? [])].sort((a, b) => a.ordem - b.ordem)

  return (
    <div className="space-y-4">
      <Link to="/app/planos" className="inline-flex items-center text-sm text-emerald-700 hover:underline">
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
      </Link>

      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <CardTitle>{plano.titulo}</CardTitle>
              <Badge variant={plano.publicado ? 'success' : 'default'}>
                {plano.publicado ? 'publicado' : 'rascunho'}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => togglePublicar.mutate()} loading={togglePublicar.isPending}>
                {plano.publicado ? 'Despublicar' : 'Publicar'}
              </Button>
              <Button onClick={() => addRefeicao.mutate()} loading={addRefeicao.isPending}>
                <Plus className="h-4 w-4" /> Refeição
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {refeicoes.length === 0 ? (
        <EmptyState
          title="Sem refeições"
          description="Adicione a primeira refeição com o botão acima."
        />
      ) : (
        refeicoes.map((r) => <RefeicaoCard key={r.id} refeicao={r} planoId={plano.id} />)
      )}
    </div>
  )
}

function RefeicaoCard({ refeicao, planoId }: { refeicao: Refeicao; planoId: string }) {
  const queryClient = useQueryClient()
  const [busca, setBusca] = useState('')

  const { data: alimentos } = useQuery({
    queryKey: ['alimentos', busca],
    enabled: busca.length >= 2,
    queryFn: async () => {
      const { data } = await supabase
        .from('alimentos')
        .select('id, nome, kcal_por_100g')
        .ilike('nome', `%${busca}%`)
        .order('nome')
        .limit(10)
      return data ?? []
    },
  })

  const { data: totais } = useQuery({
    queryKey: ['totais-refeicao', refeicao.id],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('fn_refeicao_totais', { p_refeicao_id: refeicao.id })
      if (error) throw error
      return data?.[0]
    },
  })

  const addItem = useMutation({
    mutationFn: async (input: { alimento_id: string; quantidade_g: number }) => {
      const { error } = await supabase.from('plano_itens').insert({
        refeicao_id: refeicao.id,
        alimento_id: input.alimento_id,
        quantidade_g: input.quantidade_g,
      })
      if (error) throw error
    },
    onSuccess: () => {
      setBusca('')
      queryClient.invalidateQueries({ queryKey: ['plano'] })
      queryClient.invalidateQueries({ queryKey: ['totais-refeicao', refeicao.id] })
    },
    onError: (err: Error) => toastError('Erro', err.message),
  })

  const removeItem = useMutation({
    mutationFn: async (itemId: string) => {
      const { error } = await supabase.from('plano_itens').delete().eq('id', itemId)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['plano'] })
      queryClient.invalidateQueries({ queryKey: ['totais-refeicao', refeicao.id] })
    },
  })

  const removeRefeicao = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from('plano_refeicoes').delete().eq('id', refeicao.id)
      if (error) throw error
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['plano', planoId] }),
  })

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>{refeicao.nome}</CardTitle>
          <div className="flex items-center gap-3 text-xs text-gray-600">
            {totais && (
              <span>
                <strong>{Number(totais.kcal).toFixed(0)} kcal</strong> ·{' '}
                {Number(totais.carboidrato_g).toFixed(0)}c /{' '}
                {Number(totais.proteina_g).toFixed(0)}p /{' '}
                {Number(totais.lipidio_g).toFixed(0)}g
              </span>
            )}
            <Button variant="ghost" size="sm" onClick={() => removeRefeicao.mutate()}>
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <ul className="divide-y divide-gray-100">
          {refeicao.plano_itens.map((i) => (
            <li key={i.id} className="flex items-center justify-between py-2 text-sm">
              <span>
                <strong>{i.alimentos?.nome ?? '—'}</strong> · {i.quantidade_g}g
              </span>
              <Button variant="ghost" size="sm" onClick={() => removeItem.mutate(i.id)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </li>
          ))}
        </ul>

        <div className="flex gap-2">
          <Input
            placeholder="Buscar alimento (mín. 2 letras)"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            leftIcon={<Search className="h-4 w-4" />}
            wrapperClassName="flex-1"
          />
        </div>

        {alimentos && alimentos.length > 0 && (
          <ul className="rounded-lg border border-gray-200 divide-y">
            {alimentos.map((a) => (
              <li key={a.id} className="flex items-center justify-between p-2 text-sm">
                <span>
                  {a.nome} <span className="text-xs text-gray-500">({Number(a.kcal_por_100g).toFixed(0)} kcal/100g)</span>
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => addItem.mutate({ alimento_id: a.id, quantidade_g: 100 })}
                >
                  + 100g
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
