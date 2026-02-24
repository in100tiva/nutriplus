import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link } from 'react-router-dom'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'
import { z } from 'zod'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
})

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  })

  async function onSubmit(data: ForgotPasswordInput) {
    setLoading(true)
    setError(null)

    try {
      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        data.email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      )

      if (resetError) {
        setError(resetError.message)
        return
      }

      setSent(true)
    } catch {
      setError('Erro ao enviar link de recuperação. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      {sent ? (
        /* Success state */
        <>
          <CardHeader className="items-center text-center">
            <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-full bg-green-50">
              <CheckCircle className="h-7 w-7 text-green-600" />
            </div>
            <CardTitle>E-mail enviado</CardTitle>
            <CardDescription>
              Se o e-mail informado estiver cadastrado, você receberá um link
              para redefinir sua senha. Verifique também a pasta de spam.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4" />
                Voltar para o login
              </Button>
            </Link>
          </CardContent>
        </>
      ) : (
        /* Form state */
        <>
          <CardHeader className="text-center">
            <CardTitle>Recuperar senha</CardTitle>
            <CardDescription>
              Informe seu e-mail e enviaremos um link para redefinir sua senha
            </CardDescription>
          </CardHeader>

          <CardContent className="flex flex-col gap-6">
            {/* Error message */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Button type="submit" loading={loading} className="w-full">
                Enviar link de recuperação
              </Button>
            </form>

            <Link
              to="/login"
              className="flex items-center justify-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para o login
            </Link>
          </CardContent>
        </>
      )}
    </Card>
  )
}
