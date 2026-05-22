import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Button,
  Input,
  Textarea,
  Badge,
} from '@/components/ui'
import { anamneseSchema, avaliacaoSchema, type AnamneseInput, type AvaliacaoInput } from '@/lib/validators'
import { toastError, toastSuccess } from '@/hooks/use-toast'
import { formatData } from '@/lib/format'

export function PacienteDetalhePage() {
  const { id: pacienteProfileId } = useParams<{ id: string }>()
  const profile = useAuth((s) => s.profile)

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

  const { data: prontuario, refetch: refetchProntuario } = useQuery({
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
      void refetchProntuario()
    },
    onError: (err: Error) => toastError('Erro ao criar prontuário', err.message),
  })

  return (
    <div className="space-y-6">
      <div>
        <Link to="/app/pacientes" className="text-sm text-emerald-700 hover:underline">
          ← Voltar
        </Link>
        <h2 className="mt-2 text-2xl font-bold text-gray-900">
          {paciente?.nome ?? 'Paciente'}
        </h2>
      </div>

      {!prontuario ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-gray-600">
              Este paciente ainda não tem prontuário com você.
            </p>
            <Button className="mt-3" onClick={() => criarProntuario.mutate()} loading={criarProntuario.isPending}>
              Criar prontuário
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <AnamneseSection prontuarioId={prontuario.id} anamneseAtual={(prontuario.anamnese ?? {}) as Record<string, string>} />
          <EvolucoesSection prontuarioId={prontuario.id} />
          <AvaliacoesSection prontuarioId={prontuario.id} />
          <PlanosSection prontuarioId={prontuario.id} />
        </>
      )}
    </div>
  )
}

function AnamneseSection({ prontuarioId, anamneseAtual }: { prontuarioId: string; anamneseAtual: Record<string, string> }) {
  const queryClient = useQueryClient()
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<AnamneseInput>({
    resolver: zodResolver(anamneseSchema),
    defaultValues: {
      historico: anamneseAtual.historico ?? '',
      rotina: anamneseAtual.rotina ?? '',
      restricoes: anamneseAtual.restricoes ?? '',
      alergias: anamneseAtual.alergias ?? '',
      medicamentos: anamneseAtual.medicamentos ?? '',
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
    <Card>
      <CardHeader>
        <CardTitle>Anamnese</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit((d) => salvar.mutate(d))} className="space-y-4">
          <Textarea label="Histórico" rows={3} {...register('historico')} error={errors.historico?.message} />
          <Textarea label="Rotina" rows={3} {...register('rotina')} error={errors.rotina?.message} />
          <Textarea label="Restrições alimentares" rows={2} {...register('restricoes')} error={errors.restricoes?.message} />
          <Textarea label="Alergias" rows={2} {...register('alergias')} error={errors.alergias?.message} />
          <Textarea label="Medicamentos" rows={2} {...register('medicamentos')} error={errors.medicamentos?.message} />
          <div className="flex justify-end">
            <Button type="submit" loading={isSubmitting}>Salvar anamnese</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}

function EvolucoesSection({ prontuarioId }: { prontuarioId: string }) {
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
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit((d) => adicionar.mutate(d))} className="space-y-2">
          <Textarea label="Nova evolução" rows={3} {...register('texto')} />
          <div className="flex justify-end">
            <Button type="submit" size="sm" loading={adicionar.isPending}>Registrar</Button>
          </div>
        </form>
        <ul className="divide-y divide-gray-100">
          {(evolucoes ?? []).map((e) => (
            <li key={e.id} className="py-3">
              <p className="text-xs text-gray-500">{formatData(e.data)}</p>
              <p className="mt-1 text-sm text-gray-800 whitespace-pre-wrap">{e.texto}</p>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function AvaliacoesSection({ prontuarioId }: { prontuarioId: string }) {
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

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<AvaliacaoInput>({
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Antropometria</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit((d) => adicionar.mutate(d))} className="grid gap-3 sm:grid-cols-2">
          <Input type="date" label="Data" {...register('data')} error={errors.data?.message} />
          <Input type="number" step="0.1" label="Peso (kg)" {...register('peso_kg')} />
          <Input type="number" step="0.1" label="Altura (cm)" {...register('altura_cm')} />
          <Input type="number" step="0.1" label="% gordura" {...register('percentual_gordura')} />
          <Input type="number" step="0.1" label="Cintura (cm)" {...register('circunferencias.cintura' as const)} />
          <Input type="number" step="0.1" label="Quadril (cm)" {...register('circunferencias.quadril' as const)} />
          <div className="sm:col-span-2 flex justify-end">
            <Button type="submit" size="sm" loading={isSubmitting}>Registrar avaliação</Button>
          </div>
        </form>
        <ul className="divide-y divide-gray-100">
          {(avals ?? []).map((a) => (
            <li key={a.id} className="flex justify-between py-2 text-sm">
              <span>{formatData(a.data)}</span>
              <span className="text-gray-600">
                {a.peso_kg ? `${a.peso_kg} kg ` : ''}
                {a.percentual_gordura ? `· ${a.percentual_gordura}% ` : ''}
              </span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  )
}

function PlanosSection({ prontuarioId }: { prontuarioId: string }) {
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
    <Card>
      <CardHeader>
        <CardTitle>Planos alimentares</CardTitle>
      </CardHeader>
      <CardContent>
        {(planos ?? []).length === 0 ? (
          <p className="text-sm text-gray-500">
            Nenhum plano. Crie um em <Link to="/app/planos" className="text-emerald-700 hover:underline">Planos</Link>.
          </p>
        ) : (
          <ul className="divide-y divide-gray-100">
            {planos!.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2 text-sm">
                <div>
                  <p className="font-medium text-gray-900">{p.titulo}</p>
                  <p className="text-xs text-gray-500">{formatData(p.data_inicio)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={p.publicado ? 'success' : 'default'}>
                    {p.publicado ? 'publicado' : 'rascunho'}
                  </Badge>
                  <Link to={`/app/planos/${p.id}`}>
                    <Button size="sm" variant="outline">Abrir</Button>
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
