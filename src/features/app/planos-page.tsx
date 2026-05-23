import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
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
import { IconPlus, IconPlate } from '@/components/icons'
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
    <div className="fade-up" data-screen-label="planos">
      <div className="page-head">
        <div>
          <div className="eyebrow">Planos alimentares</div>
          <h1>Crie, edite e publique</h1>
          <p className="sub">
            Cada plano tem refeições ordenadas com itens da base TACO. kcal e macros
            recalculados a cada item — visíveis para o paciente quando publicado.
          </p>
        </div>
        <Button variant="accent" onClick={() => setModalOpen(true)}>
          <IconPlus />
          Novo plano
        </Button>
      </div>

      <Card variant="flush">
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '0.5px solid var(--line)',
            display: 'flex',
            alignItems: 'baseline',
            justifyContent: 'space-between',
          }}
        >
          <h3 className="serif" style={{ fontSize: 18, fontWeight: 500 }}>
            Todos os planos
          </h3>
          <div className="muted" style={{ fontSize: 12 }}>
            {planos?.length ?? 0} {planos?.length === 1 ? 'plano' : 'planos'}
          </div>
        </div>
        {isLoading ? (
          <Loading />
        ) : !planos || planos.length === 0 ? (
          <EmptyState
            icon={<IconPlate />}
            title="Sem planos"
            description="Crie um plano para um paciente para começar."
          />
        ) : (
          planos.map((p, i) => (
            <div
              key={p.id}
              className="row"
              style={{
                paddingInline: 20,
                borderBottom: i < planos.length - 1 ? '0.5px solid var(--line-2)' : 0,
              }}
            >
              <div
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 8,
                  background: p.publicado ? 'var(--accent)' : 'var(--paper-2)',
                  color: p.publicado ? 'var(--on-accent)' : 'var(--ink-3)',
                  display: 'grid',
                  placeItems: 'center',
                  border: p.publicado ? 0 : '0.5px solid var(--line)',
                  flex: 'none',
                }}
              >
                <IconPlate />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 500 }}>{p.titulo}</div>
                <div className="muted" style={{ fontSize: 12, marginTop: 2 }}>
                  {p.prontuarios?.profiles?.nome ?? 'Paciente'} ·{' '}
                  {formatData(p.data_inicio)}
                </div>
              </div>
              <Badge variant={p.publicado ? 'accent' : 'default'}>
                {p.publicado ? 'publicado' : 'rascunho'}
              </Badge>
              <Link to={`/app/planos/${p.id}`} className="btn sm">
                Abrir
              </Link>
            </div>
          ))
        )}
      </Card>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} size="md">
        <ModalHeader onClose={() => setModalOpen(false)}>
          <ModalTitle>Novo plano alimentar</ModalTitle>
        </ModalHeader>
        <form onSubmit={handleSubmit((d) => criar.mutate(d))} style={{ display: 'contents' }}>
          <ModalBody>
            <div style={{ display: 'grid', gap: 12 }}>
              <Select label="Paciente" {...register('prontuario_id')}>
                <option value="">Selecione…</option>
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
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <Input type="date" label="Início" {...register('data_inicio')} error={errors.data_inicio?.message} />
                <Input type="date" label="Fim (opcional)" {...register('data_fim')} error={errors.data_fim?.message} />
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onClick={() => setModalOpen(false)} type="button" variant="ghost">
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={isSubmitting}>
              Criar rascunho
            </Button>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
