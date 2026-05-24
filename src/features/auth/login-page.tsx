import { useState } from 'react'
import { useNavigate, Link, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@/components/ui'
import { supabase, supabaseUrlConfigured, withTimeout } from '@/lib/supabase'
import { loginSchema, type LoginInput } from '@/lib/validators'
import { toastError, toastSuccess } from '@/hooks/use-toast'
import { newRequestId, log } from '@/lib/observability'
import { useAuth } from '@/hooks/use-auth'
import type { Profile } from '@/types/database'

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const returnTo = searchParams.get('return')
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  })

  const preencherTeste = (perfil: 'nutri' | 'paciente') => {
    if (perfil === 'nutri') {
      setValue('email', 'nutri.teste@nutriplus.app')
      setValue('senha', 'NutriTeste123!')
    } else {
      setValue('email', 'paciente.teste@nutriplus.app')
      setValue('senha', 'PacienteTeste123!')
    }
  }

  const onSubmit = async (data: LoginInput) => {
    const requestId = newRequestId()
    setLoading(true)
    const t0 = performance.now()
    try {
      const { data: signInData, error } = await withTimeout(
        supabase.auth.signInWithPassword({
          email: data.email,
          password: data.senha,
        }),
        10000,
        'signInWithPassword',
      )
      if (error) {
        log({
          tipo: 'auth.login_fail',
          severidade: 'erro',
          request_id: requestId,
          payload: { mensagem: error.message },
        })
        toastError('Não foi possível entrar', error.message)
        setLoading(false)
        return
      }
      log({
        tipo: 'auth.login_ok',
        request_id: requestId,
        duracao_ms: Math.round(performance.now() - t0),
      })

      // Busca o profile completo direto do banco — não depende do
      // onAuthStateChange ter propagado o session/profile no store.
      const userId = signInData.user?.id
      let profileRow: Profile | null = null
      if (userId) {
        const { data } = await withTimeout(
          Promise.resolve(
            supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
          ),
          4000,
          'login.fetchProfile',
        ).catch(() => ({ data: null as Profile | null }))
        profileRow = data
      }

      // **HIDRATA o store Zustand com session+profile antes do navigate.**
      // Sem isso, o RoleGate da rota destino renderiza com session=null
      // (race com o listener async do supabase) → bate em "if (!session)
      // navigate('/login')" e volta pra cá. Atualizar o store de forma
      // síncrona aqui fecha a race — quando o React processar o navigate,
      // os componentes que leem useAuth já enxergam a sessão.
      useAuth.setState({
        session: signInData.session,
        profile: profileRow,
        initialized: true,
        loading: false,
      })

      const role = profileRow?.role ?? 'paciente'
      // Se veio com ?return=/foo, respeitamos esse destino — exceto se o
      // usuário for nutri/admin tentando voltar para área de paciente.
      const podeRespeitar =
        returnTo &&
        (role === 'paciente' ||
          (!returnTo.startsWith('/paciente') &&
            !returnTo.startsWith('/app') &&
            !returnTo.startsWith('/admin')))
      const destino = podeRespeitar
        ? returnTo!
        : role === 'nutricionista'
          ? '/app'
          : role === 'admin'
            ? '/admin/saude'
            : '/paciente/agendamentos'
      toastSuccess('Bem-vindo de volta!')
      navigate(destino, { replace: true })
    } catch (err) {
      log({
        tipo: 'auth.login_timeout',
        severidade: 'erro',
        request_id: requestId,
        payload: { mensagem: (err as Error).message },
      })
      toastError(
        'Timeout no login',
        'Limpando cache e recarregando — abra o console e rode nutriReset() se persistir.',
      )
      setLoading(false)
    }
  }

  return (
    <div className="fade-up">
      <div className="eyebrow" style={{ marginBottom: 4 }}>
        Acessar consultório
      </div>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Entrar</h1>
      <p style={{ color: 'var(--ink-3)', fontSize: 14, marginBottom: 24 }}>
        Ainda não tem conta?{' '}
        <Link
          to="/cadastro"
          style={{ color: 'var(--accent)', fontWeight: 500 }}
        >
          Crie agora
        </Link>
        .
      </p>

      <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'grid', gap: 14 }}>
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
          placeholder="••••••••"
          autoComplete="current-password"
          inputSize="lg"
          {...register('senha')}
          error={errors.senha?.message}
        />
        <Button type="submit" variant="primary" size="lg" loading={loading} style={{ width: '100%' }}>
          Entrar
        </Button>
      </form>

      <div
        style={{
          marginTop: 24,
          padding: 14,
          background: 'var(--paper-2)',
          borderRadius: 10,
          border: '0.5px solid var(--line)',
        }}
      >
        <div
          className="lbl"
          style={{
            fontSize: 10.5,
            color: 'var(--ink-3)',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            fontWeight: 600,
            marginBottom: 8,
          }}
        >
          Credenciais de teste
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button
            type="button"
            size="sm"
            onClick={() => preencherTeste('nutri')}
            style={{ flex: 1 }}
          >
            Como nutri
          </Button>
          <Button
            type="button"
            size="sm"
            onClick={() => preencherTeste('paciente')}
            style={{ flex: 1 }}
          >
            Como paciente
          </Button>
        </div>
      </div>

      <p
        className="mono"
        style={{ fontSize: 10.5, color: 'var(--ink-4)', marginTop: 14 }}
      >
        endpoint: {supabaseUrlConfigured}
      </p>
    </div>
  )
}
