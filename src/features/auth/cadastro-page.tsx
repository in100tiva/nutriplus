import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { cadastroSchema, slugify, type CadastroInput } from '@/lib/validators'
import { toastError, toastSuccess } from '@/hooks/use-toast'
import { newRequestId, log } from '@/lib/observability'
import { useAuth } from '@/hooks/use-auth'
import type { Profile } from '@/types/database'

export function CadastroPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('return')
  const papelQuery = searchParams.get('papel') as 'nutricionista' | 'paciente' | null
  const [papel, setPapel] = useState<'nutricionista' | 'paciente'>(
    papelQuery === 'paciente' || papelQuery === 'nutricionista'
      ? papelQuery
      : 'nutricionista',
  )
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<CadastroInput>({
    resolver: zodResolver(cadastroSchema),
    defaultValues: {
      papel: papel,
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
      options: { data: { nome: data.nome, role: data.papel } },
    })

    if (signupErr) {
      setLoading(false)
      log({
        tipo: 'auth.cadastro_fail',
        severidade: 'erro',
        request_id: requestId,
        payload: { mensagem: signupErr.message },
      })
      toastError('Não foi possível criar a conta', signupErr.message)
      return
    }

    if (data.papel === 'nutricionista' && signupData.user) {
      const slugBase = slugify(data.nome || data.email.split('@')[0])
      const slug = `${slugBase}-${signupData.user.id.slice(0, 6)}`
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
        log({
          tipo: 'cadastro.nutri_insert_fail',
          severidade: 'erro',
          request_id: requestId,
          payload: { mensagem: nutriErr.message },
        })
        toastError(
          'Conta criada, mas o CRN não foi salvo. Edite o perfil em seguida.',
          nutriErr.message,
        )
      }
    } else if (signupData.user) {
      await supabase
        .from('profiles')
        .update({ nome: data.nome, consentimento_lgpd_em: new Date().toISOString() })
        .eq('id', signupData.user.id)
    }

    log({
      tipo: 'auth.cadastro_ok',
      request_id: requestId,
      duracao_ms: Math.round(performance.now() - t0),
      payload: { papel: data.papel },
    })

    // Se o supabase já criou a sessão (e-mail confirm desligado),
    // hidratamos o store para evitar a race no redirect.
    if (signupData.session) {
      const userId = signupData.user?.id
      let profileRow: Profile | null = null
      if (userId) {
        const { data: prof } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .maybeSingle()
        profileRow = prof
      }
      useAuth.setState({
        session: signupData.session,
        profile: profileRow,
        initialized: true,
        loading: false,
      })
    }

    setLoading(false)
    toastSuccess('Conta criada!', 'Confira seu e-mail se a confirmação estiver habilitada.')

    if (signupData.session) {
      // Logado automaticamente — respeita ?return= se compatível.
      const podeRespeitar =
        returnTo &&
        (data.papel === 'paciente' ||
          (!returnTo.startsWith('/paciente') &&
            !returnTo.startsWith('/app') &&
            !returnTo.startsWith('/admin')))
      const destino = podeRespeitar
        ? returnTo!
        : data.papel === 'nutricionista'
          ? '/app'
          : '/paciente/agendamentos'
      navigate(destino, { replace: true })
    } else {
      // E-mail confirm ligado: precisa confirmar antes; manda para login.
      navigate(
        returnTo
          ? `/login?return=${encodeURIComponent(returnTo)}`
          : '/login',
        { replace: true },
      )
    }
  }

  return (
    <div className="fade-up">
      <div className="eyebrow" style={{ marginBottom: 4 }}>
        Criar conta
      </div>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Vamos começar</h1>
      <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 22 }}>
        Já tem conta?{' '}
        <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 500 }}>
          Entrar
        </Link>
        .
      </p>

      {/* Segmented control */}
      <div
        style={{
          display: 'flex',
          background: 'var(--paper-2)',
          border: '0.5px solid var(--line)',
          borderRadius: 10,
          padding: 3,
          marginBottom: 18,
        }}
      >
        {[
          { v: 'nutricionista', l: 'Sou nutricionista' },
          { v: 'paciente', l: 'Sou paciente' },
        ].map((opt) => {
          const active = papel === opt.v
          return (
            <button
              key={opt.v}
              type="button"
              onClick={() => trocarPapel(opt.v as 'nutricionista' | 'paciente')}
              style={{
                appearance: 'none',
                border: 0,
                flex: 1,
                padding: '8px 0',
                borderRadius: 7,
                background: active ? 'var(--paper-3)' : 'transparent',
                color: active ? 'var(--ink)' : 'var(--ink-3)',
                font: 'inherit',
                fontSize: 13,
                fontWeight: 500,
                cursor: 'default',
                boxShadow: active ? 'var(--shadow-1)' : 'none',
              }}
            >
              {opt.l}
            </button>
          )
        })}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 14 }}>
        <input type="hidden" {...register('papel')} value={papel} />
        <Input
          label="Nome completo"
          placeholder="Como deve aparecer no perfil"
          autoComplete="name"
          inputSize="lg"
          {...register('nome')}
          error={errors.nome?.message}
        />
        <Input
          type="email"
          label="E-mail"
          placeholder="voce@email.com"
          autoComplete="email"
          inputSize="lg"
          {...register('email')}
          error={errors.email?.message}
        />
        <Input
          type="password"
          label="Senha"
          placeholder="Mínimo 6 caracteres"
          autoComplete="new-password"
          inputSize="lg"
          {...register('senha')}
          error={errors.senha?.message}
        />
        {papel === 'nutricionista' && (
          <Input
            label="CRN"
            placeholder="Ex.: CRN-3 12345"
            inputSize="lg"
            {...register('crn' as never)}
            error={(errors as { crn?: { message?: string } }).crn?.message}
          />
        )}

        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 10,
            fontSize: 12.5,
            color: 'var(--ink-2)',
            lineHeight: 1.5,
            marginTop: 4,
          }}
        >
          <input
            type="checkbox"
            {...register('consentimentoLgpd')}
            style={{ marginTop: 2 }}
          />
          <span>
            Aceito o tratamento dos meus dados conforme a política de privacidade (LGPD).
          </span>
        </label>
        {errors.consentimentoLgpd && (
          <p className="err" style={{ marginTop: -8 }}>
            {errors.consentimentoLgpd.message as string}
          </p>
        )}

        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%' }}>
          Criar conta
        </Button>
      </form>
    </div>
  )
}
