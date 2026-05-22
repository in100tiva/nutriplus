import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Plus, UtensilsCrossed } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Select,
  Button,
  Loading,
  EmptyState,
  Badge,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui'
import { planoSchema, type PlanoInput } from '@/lib/validators'
import { toastError, toastSuccess } from '@/hooks/use-toast'
import { formatData } from '@/lib/format'

type LinhaPlano = {
  id: string
  titulo: string
  data_inicio: string
  publicado: boolean
  prontuarios: { paciente_profile_id: string; profiles: { nome: string } | null } | null
}

export function PlanosPage() {
  const profile = useAuth((s) => s.profile)
  const [modalOpen, setModalOpen] = useState(false)
  const queryClient = useQueryClient()

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

  const { data: prontuarios } = useQuery({
    queryKey: ['prontuarios-nutri', nutri?.id],
    enabled: !!nutri?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('prontuarios')
        .select('id, paciente_profile_id, profiles!prontuarios_paciente_profile_id_fkey(nome)')
        .eq('nutricionista_id', nutri!.id)
      return data ?? []
    },
  })

  const { data: planos, isLoading } = useQuery({
    queryKey: ['planos-nutri', nutri?.id],
    enabled: !!nutri?.id,
    queryFn: async () => {
      // RLS já filtra. Lista todos os planos de prontuários do nutri.
      const { data, error } = await supabase
        .from('planos_alimentares')
        .select(
          'id, titulo, data_inicio, publicado, prontuarios!planos_alimentares_prontuario_id_fkey(paciente_profile_id, profiles!prontuarios_paciente_profile_id_fkey(nome))',
        )
        .order('created_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as LinhaPlano[]
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PlanoInput & { prontuario_id: string }>({
    resolver: zodResolver(planoSchema.extend({} as never)) as never,
    defaultValues: {
      titulo: '',
      data_inicio: new Date().toISOString().slice(0, 10),
      data_fim: '',
      observacoes: '',
      prontuario_id: '',
    },
  })

  const criar = useMutation({
    mutationFn: async (input: PlanoInput & { prontuario_id: string }) => {
      if (!input.prontuario_id) throw new Error('Escolha o paciente')
      const { error } = await supabase.from('planos_alimentares').insert({
        prontuario_id: input.prontuario_id,
        titulo: input.titulo,
        data_inicio: input.data_inicio,
        data_fim: input.data_fim || null,
        observacoes: input.observacoes || null,
        publicado: false,
      })
      if (error) throw error
    },
    onSuccess: () => {
      toastSuccess('Plano criado em rascunho')
      setModalOpen(false)
      reset()
      queryClient.invalidateQueries({ queryKey: ['planos-nutri'] })
    },
    onError: (err: Error) => toastError('Erro', err.message),
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Planos alimentares</h2>
          <p className="text-sm text-gray-600">Crie, edite e publique planos para seus pacientes.</p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" /> Novo plano
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todos os planos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading />
          ) : !planos || planos.length === 0 ? (
            <EmptyState
              icon={<UtensilsCrossed className="h-5 w-5" />}
              title="Sem planos"
              description="Comece criando um plano para um paciente."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {planos.map((p) => (
                <li key={p.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{p.titulo}</p>
                    <p className="text-xs text-gray-500">
                      {p.prontuarios?.profiles?.nome ?? 'Paciente'} · {formatData(p.data_inicio)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={p.publicado ? 'success' : 'default'}>
                      {p.publicado ? 'publicado' : 'rascunho'}
                    </Badge>
                    <Link to={`/app/planos/${p.id}`}>
                      <Button size="sm" variant="outline">
                        Abrir
                      </Button>
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <ModalHeader>
          <ModalTitle>Novo plano alimentar</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit((d) => criar.mutate(d))}>
          <ModalBody className="space-y-4">
            <Select label="Paciente" {...register('prontuario_id')}>
              <option value="">Selecione...</option>
              {(prontuarios ?? []).map((p) => {
                const nome = (p.profiles as { nome?: string } | null)?.nome ?? 'Paciente'
                return (
                  <option key={p.id} value={p.id}>
                    {nome}
                  </option>
                )
              })}
            </Select>
            <Input label="Título" {...register('titulo')} error={errors.titulo?.message} />
            <div className="grid grid-cols-2 gap-3">
              <Input type="date" label="Início" {...register('data_inicio')} error={errors.data_inicio?.message} />
              <Input type="date" label="Fim (opcional)" {...register('data_fim')} error={errors.data_fim?.message} />
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" onClick={() => setModalOpen(false)} type="button">
              Cancelar
            </Button>
            <Button type="submit" loading={isSubmitting}>
              Criar rascunho
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
