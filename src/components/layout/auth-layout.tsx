import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { HeartPulse, CalendarCheck, ShieldCheck, Users, LineChart } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface AuthLayoutProps {
  children: ReactNode
  className?: string
}

const FEATURES = [
  {
    icon: CalendarCheck,
    title: 'Agenda online',
    description: 'Pacientes agendam direto na sua disponibilidade.',
  },
  {
    icon: ShieldCheck,
    title: 'Prontuário com LGPD',
    description: 'Dados clínicos isolados por nutricionista via RLS.',
  },
  {
    icon: Users,
    title: 'Teleconsulta integrada',
    description: 'Sala de vídeo embutida — sem redirecionar para fora.',
  },
  {
    icon: LineChart,
    title: 'Evolução visível',
    description: 'Antropometria com gráfico de progresso para o paciente.',
  },
]

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex xl:w-[55%]">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/20 via-transparent to-sky-600/20" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />

        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <HeartPulse className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight">NutriPlus</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-8">
          <div className="max-w-md space-y-3">
            <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
              O consultório digital do nutricionista
            </h1>
            <p className="text-lg text-slate-300">
              Receba pacientes, atenda online, mantenha planos e evolução em um só lugar.
            </p>
          </div>

          <div className="grid max-w-lg gap-4">
            {FEATURES.map((f) => {
              const Icon = f.icon
              return (
                <div key={f.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-5 w-5 text-emerald-300" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">{f.title}</h3>
                    <p className="text-sm text-slate-400">{f.description}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative z-10">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} NutriPlus
          </p>
        </div>
      </div>

      <div
        className={cn(
          'flex w-full flex-col items-center justify-center px-4 py-8 sm:px-8 lg:w-1/2 xl:w-[45%]',
          className,
        )}
      >
        <div className="mb-8 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 text-white">
              <HeartPulse className="h-6 w-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">NutriPlus</span>
          </Link>
        </div>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
