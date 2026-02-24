import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Link, useNavigate } from 'react-router-dom'
import { Mail, Lock, Eye, EyeOff, User, Stethoscope, UserRound, ArrowLeft } from 'lucide-react'
import { registerSchema } from '@/lib/validators'
import type { RegisterInput } from '@/lib/validators'
import { useAuth } from '@/hooks/use-auth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type Role = 'patient' | 'professional'

export function RegisterPage() {
  const navigate = useNavigate()
  const { signUp, loading, error, clearError } = useAuth()
  const [step, setStep] = useState<1 | 2>(1)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  })

  const selectedRole = watch('role')

  function handleRoleSelect(role: Role) {
    clearError()
    setValue('role', role, { shouldValidate: true })
    setStep(2)
  }

  async function onSubmit(data: RegisterInput) {
    try {
      clearError()
      await signUp(data.email, data.password, data.fullName, data.role)
      navigate('/login', { replace: true })
    } catch {
      // Error is handled by the store
    }
  }

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle>
          {step === 1 ? 'Criar sua conta' : 'Dados de acesso'}
        </CardTitle>
        <CardDescription>
          {step === 1
            ? 'Selecione o tipo de conta que deseja criar'
            : 'Preencha seus dados para finalizar o cadastro'}
        </CardDescription>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* Error message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {step === 1 ? (
          /* Step 1: Role selection */
          <div className="flex flex-col gap-4">
            <button
              type="button"
              onClick={() => handleRoleSelect('patient')}
              className={cn(
                'flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:border-sky-300 hover:bg-sky-50/50',
                selectedRole === 'patient'
                  ? 'border-sky-500 bg-sky-50'
                  : 'border-gray-200 bg-white'
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                  selectedRole === 'patient'
                    ? 'bg-sky-100 text-sky-600'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                <UserRound className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">Sou Paciente</p>
                <p className="mt-0.5 text-sm text-gray-500">
                  Busco profissionais de saúde, agendo consultas e acompanho meu tratamento
                </p>
              </div>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('professional')}
              className={cn(
                'flex items-center gap-4 rounded-xl border-2 p-4 text-left transition-all hover:border-sky-300 hover:bg-sky-50/50',
                selectedRole === 'professional'
                  ? 'border-sky-500 bg-sky-50'
                  : 'border-gray-200 bg-white'
              )}
            >
              <div
                className={cn(
                  'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl',
                  selectedRole === 'professional'
                    ? 'bg-sky-100 text-sky-600'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                <Stethoscope className="h-6 w-6" />
              </div>
              <div>
                <p className="font-semibold text-gray-900">
                  Sou Profissional de Saúde
                </p>
                <p className="mt-0.5 text-sm text-gray-500">
                  Gerencio pacientes, consultas, prontuários e minha presença no marketplace
                </p>
              </div>
            </button>
          </div>
        ) : (
          /* Step 2: Registration form */
          <>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar
            </button>

            <form
              onSubmit={handleSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Input
                label="Nome completo"
                type="text"
                placeholder="Seu nome completo"
                autoComplete="name"
                leftIcon={<User className="h-4 w-4" />}
                error={errors.fullName?.message}
                {...register('fullName')}
              />

              <Input
                label="E-mail"
                type="email"
                placeholder="seu@email.com"
                autoComplete="email"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email?.message}
                {...register('email')}
              />

              <Input
                label="Senha"
                type={showPassword ? 'text' : 'password'}
                placeholder="Mínimo 8 caracteres"
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="pointer-events-auto cursor-pointer text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                helperText="Deve conter letra maiúscula, minúscula e número"
                error={errors.password?.message}
                {...register('password')}
              />

              <Input
                label="Confirmar senha"
                type={showConfirmPassword ? 'text' : 'password'}
                placeholder="Repita sua senha"
                autoComplete="new-password"
                leftIcon={<Lock className="h-4 w-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() =>
                      setShowConfirmPassword(!showConfirmPassword)
                    }
                    className="pointer-events-auto cursor-pointer text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                }
                error={errors.confirmPassword?.message}
                {...register('confirmPassword')}
              />

              {errors.role && (
                <p className="text-sm text-red-500">{errors.role.message}</p>
              )}

              <Button type="submit" loading={loading} className="mt-2 w-full">
                Criar conta
              </Button>
            </form>
          </>
        )}

        {/* Login link */}
        <p className="text-center text-sm text-gray-500">
          Já tem uma conta?{' '}
          <Link
            to="/login"
            className="font-medium text-sky-600 hover:text-sky-700"
          >
            Entrar
          </Link>
        </p>
      </CardContent>
    </Card>
  )
}
