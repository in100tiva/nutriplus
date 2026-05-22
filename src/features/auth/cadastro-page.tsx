import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { cadastroSchema, slugify, type CadastroInput } from '@/lib/validators'
import { toastError, toastSuccess } from '@/hooks/use-toast'
import { newRequestId, log } from '@/lib/observability'

export function CadastroPage() {
  const navigate = useNavigate()
  const [papel, setPapel] = useState<'nutricionista' | 'paciente'>('nutricionista')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
  } = useForm<CadastroInput>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      papel: 'nutricionista',
      nome: '',
      email: '',
      senha: '',
      crn: '',
      consentimentoLgpd: false as unknown as true,
    },
  })

  const trocarPapel = (p: 'nutricionista' | 'paciente') => {
    setPapel(p)
    setValue('papel', p)
  }

  const onSubmit = async (data: CadastroInput) => {
    const requestId = newRequestId()
    setLoading(true)
    const t0 = performance.now()

    const { data: signupData, error: signupErr } = await supabase.auth.signUp({
      email: data.email,
      password: data.senha,
      options: {
        data: { nome: data.nome, role: data.papel },
      },
    })

    if (signupErr) {
      setLoading(false)
      log({ tipo: 'auth.cadastro_fail', severidade: 'erro', request_id: requestId, payload: { mensagem: signupErr.message } })
      toastError('Não foi possível criar a conta', signupErr.message)
      return
    }

    // Se é nutricionista, cria o registro em nutricionistas com slug derivado.
    if (data.papel === 'nutricionista' && signupData.user) {
      const slugBase = slugify(data.nome || data.email.split('@')[0])
      const slug = `${slugBase}-${signupData.user.id.slice(0, 6)}`

      // Atualiza o profile com nome (caso o trigger não tenha capturado).
      await supabase
        .from('profiles')
        .update({ nome: data.nome, consentimento_lgpd_em: new Date().toISOString() })
        .eq('id', signupData.user.id)

      const { error: nutriErr } = await supabase.from('nutricionistas').insert({
        profile_id: signupData.user.id,
        crn: data.crn,
        slug,
        valor_consulta_centavos: 0,
        duracao_consulta_min: 60,
        ativo: true,
      })

      if (nutriErr) {
        log({ tipo: 'cadastro.nutri_insert_fail', severidade: 'erro', request_id: requestId, payload: { mensagem: nutriErr.message } })
        toastError('Conta criada, mas houve um erro ao salvar o CRN. Edite o perfil em seguida.', nutriErr.message)
      }
    } else if (signupData.user) {
      await supabase
        .from('profiles')
        .update({ nome: data.nome, consentimento_lgpd_em: new Date().toISOString() })
        .eq('id', signupData.user.id)
    }

    log({ tipo: 'auth.cadastro_ok', request_id: requestId, duracao_ms: Math.round(performance.now() - t0), payload: { papel: data.papel } })

    setLoading(false)
    toastSuccess('Conta criada! Confira seu e-mail se a confirmação estiver habilitada.')
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Criar conta</h2>
        <p className="text-sm text-gray-600">
          Já tem cadastro?{' '}
          <Link to="/login" className="font-medium text-emerald-700 hover:underline">
            Entrar
          </Link>
        </p>
      </header>

      <div className="grid grid-cols-2 gap-2 rounded-lg bg-gray-100 p-1">
        <button
          type="button"
          onClick={() => trocarPapel('nutricionista')}
          className={`rounded-md py-2 text-sm font-medium transition ${
            papel === 'nutricionista'
              ? 'bg-white text-emerald-700 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sou nutricionista
        </button>
        <button
          type="button"
          onClick={() => trocarPapel('paciente')}
          className={`rounded-md py-2 text-sm font-medium transition ${
            papel === 'paciente'
              ? 'bg-white text-emerald-700 shadow'
              : 'text-gray-600 hover:text-gray-900'
          }`}
        >
          Sou paciente
        </button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <input type="hidden" {...register('papel')} value={papel} />

        <Input
          label="Nome completo"
          placeholder="Como deve aparecer no seu perfil"
          autoComplete="name"
          {...register('nome')}
          error={errors.nome?.message}
        />
        <Input
          type="email"
          label="E-mail"
          placeholder="voce@email.com"
          autoComplete="email"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          type="password"
          label="Senha"
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          {...register('senha')}
          error={errors.senha?.message}
        />

        {papel === 'nutricionista' && (
          <Input
            label="CRN"
            placeholder="Ex.: CRN-3 12345"
            {...register('crn' as never)}
            error={(errors as { crn?: { message?: string } }).crn?.message}
          />
        )}

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            {...register('consentimentoLgpd')}
          />
          <span>
            Aceito o tratamento dos meus dados conforme a{' '}
            <a className="text-emerald-700 hover:underline" href="#">
              política de privacidade
            </a>{' '}
            (LGPD).
          </span>
        </label>
        {watch('consentimentoLgpd') !== true && errors.consentimentoLgpd && (
          <p className="-mt-2 text-xs text-red-500">{errors.consentimentoLgpd.message}</p>
        )}

        <Button type="submit" loading={loading} className="w-full">
          Criar conta
        </Button>
      </form>
    </div>
  )
}
