import { useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useAuth } from '@/hooks/use-auth'
import { supabase } from '@/lib/supabase'
import {
  Button,
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Input,
  Textarea,
  Loading,
} from '@/components/ui'
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

      // Sincronizar especialidades (delete + insert simples para MVP)
      await supabase.from('nutricionista_especialidades').delete().eq('nutricionista_id', nutri.id)
      if (input.especialidades.length > 0) {
        const rows = input.especialidades.map((eid) => ({
          nutricionista_id: nutri.id,
          especialidade_id: eid,
        }))
        const { error: espErr } = await supabase.from('nutricionista_especialidades').insert(rows)
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

  if (isLoading) return <Loading label="Carregando perfil..." />
  if (!nutri) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-gray-600">
            Seu cadastro profissional ainda não foi criado. Saia e crie a conta como
            nutricionista.
          </p>
        </CardContent>
      </Card>
    )
  }

  const selecionadas = new Set(watch('especialidades') ?? [])

  return (
    <form
      onSubmit={handleSubmit((d) => salvarMutation.mutate(d))}
      className="mx-auto max-w-3xl space-y-6"
    >
      <Card>
        <CardHeader>
          <CardTitle>Perfil profissional</CardTitle>
          <p className="text-sm text-gray-500">
            Essas informações sustentam a sua página pública futura ({' '}
            <code className="rounded bg-gray-100 px-1 py-0.5 text-xs">/nutri/{watch('slug')}</code> ).
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input label="Nome" {...register('nome')} error={errors.nome?.message} />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="CRN" {...register('crn')} error={errors.crn?.message} />
            <Input
              label="Slug (URL pública)"
              {...register('slug')}
              onBlur={(e) => setValue('slug', slugify(e.target.value), { shouldDirty: true })}
              error={errors.slug?.message}
              helperText="Use só letras minúsculas, números e hífens"
            />
          </div>

          <Textarea
            label="Bio"
            rows={4}
            {...register('bio')}
            error={errors.bio?.message}
            helperText="Como você se apresenta para o paciente"
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label={`Valor da consulta (${centavosParaBRL(watch('valor_consulta_centavos'))})`}
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
              label="Duração da consulta (min)"
              {...register('duracao_consulta_min', { valueAsNumber: true })}
              error={errors.duracao_consulta_min?.message}
            />
          </div>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
              {...register('ativo')}
            />
            Cadastro ativo (visível para pacientes)
          </label>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Especialidades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
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
                  className={`rounded-full border px-3 py-1 text-sm transition ${
                    ativa
                      ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  {e.nome}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={isSubmitting}>
          Salvar alterações
        </Button>
      </div>
    </form>
  )
}
