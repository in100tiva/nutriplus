import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar as CalendarIcon, Plus, Trash2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Loading,
  EmptyState,
} from '@/components/ui'
import { disponibilidadeSchema, type DisponibilidadeInput } from '@/lib/validators'
import { toastSuccess, toastError } from '@/hooks/use-toast'
import { formatDataHora } from '@/lib/format'
import { DIAS_SEMANA } from '@/lib/format'
import { newRequestId, log } from '@/lib/observability'

type AgendamentoListado = {
  id: string
  inicio: string
  fim: string
  status: string
  paciente_profile_id: string
  profiles: { nome: string } | null
}

export function AgendaPage() {
  const profile = useAuth((s) => s.profile)
  const queryClient = useQueryClient()

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

  const { data: disponibilidades, isLoading: loadingDisp } = useQuery({
    queryKey: ['disponibilidades', nutri?.id],
    enabled: !!nutri?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('disponibilidades')
        .select('*')
        .eq('nutricionista_id', nutri!.id)
        .order('dia_semana', { ascending: true })
      return data ?? []
    },
  })

  const { data: agendamentos, isLoading: loadingAg } = useQuery({
    queryKey: ['agendamentos', nutri?.id],
    enabled: !!nutri?.id,
    queryFn: async () => {
      const inicio = new Date()
      inicio.setHours(0, 0, 0, 0)
      const fim = new Date(inicio)
      fim.setDate(fim.getDate() + 14)
      const { data } = await supabase
        .from('agendamentos')
        .select('id, inicio, fim, status, paciente_profile_id, profiles!agendamentos_paciente_profile_id_fkey(nome)')
        .eq('nutricionista_id', nutri!.id)
        .gte('inicio', inicio.toISOString())
        .lte('inicio', fim.toISOString())
        .order('inicio', { ascending: true })
      return (data ?? []) as unknown as AgendamentoListado[]
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DisponibilidadeInput>({
    resolver: zodResolver(disponibilidadeSchema),
    defaultValues: { dia_semana: 1, hora_inicio: '08:00', hora_fim: '18:00' },
  })

  const addMutation = useMutation({
    mutationFn: async (input: DisponibilidadeInput) => {
      if (!nutri) throw new Error('Nutri não encontrado')
      const rid = newRequestId()
      const t0 = performance.now()
      const { error } = await supabase.from('disponibilidades').insert({
        nutricionista_id: nutri.id,
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
        entidade_id: nutri.id,
      })
    },
    onSuccess: () => {
      toastSuccess('Disponibilidade adicionada')
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] })
      reset({ dia_semana: 1, hora_inicio: '08:00', hora_fim: '18:00' })
    },
    onError: (err: Error) => toastError('Erro ao adicionar', err.message),
  })

  const removeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('disponibilidades').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disponibilidades'] })
    },
    onError: (err: Error) => toastError('Erro ao remover', err.message),
  })

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'cancelado' })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      toastSuccess('Consulta cancelada')
      queryClient.invalidateQueries({ queryKey: ['agendamentos'] })
    },
    onError: (err: Error) => toastError('Erro ao cancelar', err.message),
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Agenda</h2>
        <p className="text-sm text-gray-600">
          Defina sua disponibilidade semanal e acompanhe as próximas consultas.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Adicionar janela</CardTitle>
          </CardHeader>
          <CardContent>
            <form
              onSubmit={handleSubmit((d) => addMutation.mutate(d))}
              className="space-y-4"
            >
              <Select
                label="Dia da semana"
                {...register('dia_semana', { valueAsNumber: true })}
                error={errors.dia_semana?.message}
              >
                {DIAS_SEMANA.map((nome, idx) => (
                  <option key={idx} value={idx}>
                    {nome}
                  </option>
                ))}
              </Select>
              <div className="grid grid-cols-2 gap-3">
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
              </div>
              <Button type="submit" loading={isSubmitting} className="w-full">
                <Plus className="h-4 w-4" />
                Adicionar
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Janelas cadastradas</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingDisp ? (
              <Loading label="Carregando..." />
            ) : !disponibilidades || disponibilidades.length === 0 ? (
              <EmptyState
                icon={<CalendarIcon className="h-5 w-5" />}
                title="Nenhuma disponibilidade"
                description="Adicione janelas para que pacientes possam agendar."
              />
            ) : (
              <ul className="divide-y divide-gray-100">
                {disponibilidades.map((d) => (
                  <li key={d.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {DIAS_SEMANA[d.dia_semana]}
                      </p>
                      <p className="text-xs text-gray-500">
                        {d.hora_inicio.slice(0, 5)} – {d.hora_fim.slice(0, 5)}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeMutation.mutate(d.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas consultas (14 dias)</CardTitle>
        </CardHeader>
        <CardContent>
          {loadingAg ? (
            <Loading label="Carregando..." />
          ) : !agendamentos || agendamentos.length === 0 ? (
            <EmptyState
              icon={<CalendarIcon className="h-5 w-5" />}
              title="Nenhuma consulta agendada"
              description="Quando um paciente reservar pelo seu link público, ela aparecerá aqui."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {agendamentos.map((a) => (
                <li key={a.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {a.profiles?.nome ?? 'Paciente'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDataHora(a.inicio)} · {a.status}
                    </p>
                  </div>
                  {a.status === 'confirmado' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => cancelMutation.mutate(a.id)}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
