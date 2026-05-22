import { useParams, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Video } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Button, Card, CardContent, Loading } from '@/components/ui'
import { formatDataHora } from '@/lib/format'
import { toastError } from '@/hooks/use-toast'

interface Props {
  perspectiva: 'nutricionista' | 'paciente'
}

export function ConsultaPage({ perspectiva }: Props) {
  const { id } = useParams<{ id: string }>()
  const profile = useAuth((s) => s.profile)
  const queryClient = useQueryClient()

  const { data: agendamento, isLoading } = useQuery({
    queryKey: ['consulta', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('agendamentos')
        .select('id, inicio, fim, status, daily_room_url, nutricionista_id, paciente_profile_id')
        .eq('id', id!)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })

  const criarSala = useMutation({
    mutationFn: async () => {
      if (!agendamento) throw new Error('Agendamento ausente')
      // Chama a Edge Function para provisionar a sala no Daily e salvar a URL.
      const { error } = await supabase.functions.invoke('criar-sala-daily', {
        body: { agendamento_id: agendamento.id },
      })
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consulta', id] })
    },
    onError: (err: Error) => toastError('Erro ao criar sala', err.message),
  })

  const concluir = useMutation({
    mutationFn: async () => {
      if (!agendamento) throw new Error('Agendamento ausente')
      const { error } = await supabase
        .from('agendamentos')
        .update({ status: 'realizado' })
        .eq('id', agendamento.id)
      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['consulta', id] })
    },
  })

  if (isLoading) return <Loading label="Carregando consulta..." />
  if (!agendamento || !profile) return <p>Consulta não encontrada.</p>

  const voltar = perspectiva === 'nutricionista' ? '/app/agenda' : '/paciente/agendamentos'
  const podeEntrar = jaPodeEntrar(agendamento.inicio)
  const expirou = new Date(agendamento.fim).getTime() < Date.now()

  return (
    <div className="space-y-4">
      <Link to={voltar} className="inline-flex items-center text-sm text-emerald-700 hover:underline">
        <ArrowLeft className="mr-1 h-4 w-4" /> Voltar
      </Link>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-500">
            {formatDataHora(agendamento.inicio)} — status: <strong>{agendamento.status}</strong>
          </p>

          {!agendamento.daily_room_url && perspectiva === 'nutricionista' && (
            <div className="mt-4">
              <Button onClick={() => criarSala.mutate()} loading={criarSala.isPending}>
                <Video className="h-4 w-4" /> Criar sala de vídeo
              </Button>
              <p className="mt-2 text-xs text-gray-500">
                A sala é provisionada via Edge Function `criar-sala-daily`.
              </p>
            </div>
          )}

          {agendamento.daily_room_url && podeEntrar && (
            <div className="mt-4 aspect-video w-full overflow-hidden rounded-lg border border-gray-200">
              <iframe
                src={agendamento.daily_room_url}
                allow="camera; microphone; fullscreen; speaker; display-capture"
                className="h-full w-full"
                title="Teleconsulta"
              />
            </div>
          )}

          {agendamento.daily_room_url && !podeEntrar && (
            <p className="mt-4 text-sm text-gray-600">
              A sala abre 10 minutos antes do horário marcado.
            </p>
          )}

          {perspectiva === 'nutricionista' &&
            agendamento.status === 'confirmado' &&
            expirou && (
              <Button className="mt-4" variant="outline" onClick={() => concluir.mutate()}>
                Marcar como realizada
              </Button>
            )}
        </CardContent>
      </Card>
    </div>
  )
}

function jaPodeEntrar(inicioIso: string): boolean {
  return new Date(inicioIso).getTime() - Date.now() <= 10 * 60 * 1000
}
