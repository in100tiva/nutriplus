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
      log({ tipo: 'auth.login_fail', severidade: 'erro', request_id: requestId, payload: { mensagem: error.message } })
      toastError('Não foi possível entrar', error.message)
      return
    }
    log({ tipo: 'auth.login_ok', request_id: requestId, duracao_ms: Math.round(performance.now() - t0) })
    toastSuccess('Bem-vindo de volta!')
    navigate('/')
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <h2 className="text-2xl font-bold text-gray-900">Entrar</h2>
        <p className="text-sm text-gray-600">
          Acesse seu consultório digital.{' '}
          <Link to="/cadastro" className="font-medium text-emerald-700 hover:underline">
            Criar conta
          </Link>
        </p>
      </header>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
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
          placeholder="••••••••"
          autoComplete="current-password"
          {...register('senha')}
          error={errors.senha?.message}
        />
        <Button type="submit" loading={loading} className="w-full">
          Entrar
        </Button>
      </form>
    </div>
  )
}
