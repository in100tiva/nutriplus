import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import { Button, Input, Textarea, Loading, Badge } from '@/components/ui'
import { perfilNutriSchema, type PerfilNutriInput, slugify } from '@/lib/validators'
import { toastSuccess, toastError } from '@/hooks/use-toast'
import { brlParaCentavos, centavosParaBRL } from '@/lib/utils'
import { newRequestId, log } from '@/lib/observability'

export function PerfilNutriPage() {
  const profile = useAuth((s) => s.profile)
  const queryClient = useQueryClient()

  const { data: nutri, isLoading } = useQuery({
    queryKey: ['nutri-self', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('nutricionistas')
        .select('*, nutricionista_especialidades(especialidade_id)')
        .eq('profile_id', profile!.id)
        .maybeSingle()
      if (error) throw error
      return data
    },
  })

  const { data: especialidades } = useQuery({
    queryKey: ['especialidades'],
    queryFn: async () => {
      const { data } = await supabase
        .from('especialidades')
        .select('id, nome')
        .order('nome', { ascending: true })
      return data ?? []
    },
  })

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PerfilNutriInput>({
    resolver: zodResolver(perfilNutriSchema),
    defaultValues: {
      nome: '',
      bio: '',
      crn: '',
      slug: '',
      valor_consulta_centavos: 0,
      duracao_consulta_min: 60,
      ativo: true,
      especialidades: [],
    },
  })

  useEffect(() => {
    if (nutri && profile) {
      const esp =
        (nutri.nutricionista_especialidades as unknown as
          | Array<{ especialidade_id: string }>
          | undefined) ?? []
      reset({
        nome: profile.nome,
        bio: nutri.bio ?? '',
        crn: nutri.crn,
        slug: nutri.slug,
        valor_consulta_centavos: nutri.valor_consulta_centavos,
        duracao_consulta_min: nutri.duracao_consulta_min,
        ativo: nutri.ativo,
        especialidades: esp.map((e) => e.especialidade_id),
      })
    }
  }, [nutri, profile, reset])

  const salvarMutation = useMutation({
    mutationFn: async (input: PerfilNutriInput) => {
      if (!profile || !nutri) throw new Error('Sessão inválida')
      const requestId = newRequestId()
      const t0 = performance.now()

      const { error: profErr } = await supabase
        .from('profiles')
        .update({ nome: input.nome })
        .eq('id', profile.id)
      if (profErr) throw profErr

      const { error: nutriErr } = await supabase
        .from('nutricionistas')
        .update({
          bio: input.bio || null,
          crn: input.crn,
          slug: input.slug,
          valor_consulta_centavos: input.valor_consulta_centavos,
          duracao_consulta_min: input.duracao_consulta_min,
          ativo: input.ativo,
        })
        .eq('id', nutri.id)
      if (nutriErr) throw nutriErr

      await supabase
        .from('nutricionista_especialidades')
        .delete()
        .eq('nutricionista_id', nutri.id)
      if (input.especialidades.length > 0) {
        const rows = input.especialidades.map((eid) => ({
          nutricionista_id: nutri.id,
          especialidade_id: eid,
        }))
        const { error: espErr } = await supabase
          .from('nutricionista_especialidades')
          .insert(rows)
        if (espErr) throw espErr
      }

      log({
        tipo: 'perfil.salvo',
        request_id: requestId,
        duracao_ms: Math.round(performance.now() - t0),
        entidade: 'nutricionista',
        entidade_id: nutri.id,
      })
    },
    onSuccess: () => {
      toastSuccess('Perfil atualizado')
      queryClient.invalidateQueries({ queryKey: ['nutri-self'] })
    },
    onError: (err: Error) => toastError('Erro ao salvar', err.message),
  })

  if (isLoading) return <Loading label="Carregando perfil…" />
  if (!nutri) {
    return (
      <div className="card">
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)' }}>
          Seu cadastro profissional ainda não foi criado. Saia e crie a conta como
          nutricionista.
        </p>
      </div>
    )
  }

  const selecionadas = new Set(watch('especialidades') ?? [])

  return (
    <form
      onSubmit={handleSubmit((d) => salvarMutation.mutate(d))}
      className="fade-up"
      style={{ display: 'grid', gap: 18, maxWidth: 880, margin: '0 auto' }}
    >
      <div className="page-head">
        <div>
          <div className="eyebrow">Perfil profissional</div>
          <h1>Como você aparece</h1>
          <p className="sub">
            Essas informações sustentam sua página pública futura.{' '}
            <span className="mono" style={{ fontSize: 12 }}>
              /nutri/{watch('slug') || '…'}
            </span>
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Badge variant={watch('ativo') ? 'accent' : 'default'}>
            {watch('ativo') ? 'ativo' : 'inativo'}
          </Badge>
        </div>
      </div>

      <div className="card">
        <div className="sec">
          <h3>Identidade</h3>
          <span className="meta">públicas após "Publicar"</span>
        </div>
        <div style={{ display: 'grid', gap: 14 }}>
          <Input label="Nome" {...register('nome')} error={errors.nome?.message} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <Input label="CRN" {...register('crn')} error={errors.crn?.message} />
            <Input
              label="Slug (URL pública)"
              {...register('slug')}
              onBlur={(e) => setValue('slug', slugify(e.target.value), { shouldDirty: true })}
              helperText="apenas letras minúsculas, números e hífen"
              error={errors.slug?.message}
            />
          </div>
          <Textarea
            label="Bio"
            rows={4}
            {...register('bio')}
            helperText="Como você se apresenta para o paciente"
            error={errors.bio?.message}
          />
        </div>
      </div>

      <div className="card">
        <div className="sec">
          <h3>Consulta</h3>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <Input
            label={`Valor — ${centavosParaBRL(watch('valor_consulta_centavos'))}`}
            placeholder="R$ 150,00"
            onChange={(e) =>
              setValue('valor_consulta_centavos', brlParaCentavos(e.target.value), {
                shouldDirty: true,
              })
            }
            error={errors.valor_consulta_centavos?.message}
          />
          <Input
            type="number"
            min={15}
            max={240}
            label="Duração (min)"
            {...register('duracao_consulta_min', { valueAsNumber: true })}
            error={errors.duracao_consulta_min?.message}
          />
        </div>
        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            fontSize: 13,
            color: 'var(--ink-2)',
            marginTop: 14,
          }}
        >
          <input type="checkbox" {...register('ativo')} />
          Cadastro ativo — visível para pacientes
        </label>
      </div>

      <div className="card">
        <div className="sec">
          <h3>Especialidades</h3>
          <span className="meta">{selecionadas.size} selecionadas</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {(especialidades ?? []).map((e) => {
            const ativa = selecionadas.has(e.id)
            return (
              <button
                key={e.id}
                type="button"
                onClick={() => {
                  const novas = new Set(selecionadas)
                  if (ativa) novas.delete(e.id)
                  else novas.add(e.id)
                  setValue('especialidades', Array.from(novas), { shouldDirty: true })
                }}
                className={ativa ? 'chip accent' : 'chip'}
                style={{ cursor: 'default', padding: '5px 12px' }}
              >
                {e.nome}
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button type="submit" variant="primary" loading={isSubmitting}>
          Salvar alterações
        </Button>
      </div>
    </form>
  )
}
