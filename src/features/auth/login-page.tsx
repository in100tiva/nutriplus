import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button, Input } from '@/components/ui'
import { supabase } from '@/lib/supabase'
import { loginSchema, type LoginInput } from '@/lib/validators'
import { toastError, toastSuccess } from '@/hooks/use-toast'
import { newRequestId, log } from '@/lib/observability'

export function LoginPage() {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', senha: '' },
  })

  const onSubmit = async (data: LoginInput) => {
    const requestId = newRequestId()
    setLoading(true)
    const t0 = performance.now()
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.senha,
    })
    setLoading(false)

    if (error) {
      log({
        tipo: 'auth.login_fail',
        severidade: 'erro',
        request_id: requestId,
        payload: { mensagem: error.message },
      })
      toastError('Não foi possível entrar', error.message)
      return
    }
    log({
      tipo: 'auth.login_ok',
      request_id: requestId,
      duracao_ms: Math.round(performance.now() - t0),
    })
    toastSuccess('Bem-vindo de volta!')
    navigate('/')
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

      <p style={{ fontSize: 12, color: 'var(--ink-3)', marginTop: 18 }}>
        Esqueceu a senha? Por enquanto, peça reset para o admin do projeto.
      </p>
    </div>
  )
}
