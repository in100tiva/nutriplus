import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Heart, ShieldCheck, CalendarCheck, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────

export interface AuthLayoutProps {
  children: ReactNode
  className?: string
}

// ─── Feature highlights for the branding panel ──────────────────

const features = [
  {
    icon: CalendarCheck,
    title: 'Agendamento inteligente',
    description: 'Gerencie consultas e horários de forma eficiente.',
  },
  {
    icon: ShieldCheck,
    title: 'Prontuários seguros',
    description: 'Dados clínicos protegidos com criptografia.',
  },
  {
    icon: Users,
    title: 'Conexão profissional-paciente',
    description: 'Comunicação integrada entre profissionais e pacientes.',
  },
  {
    icon: Heart,
    title: 'Acompanhamento contínuo',
    description: 'Tarefas, documentos e avaliações em um só lugar.',
  },
]

// ─── Component ──────────────────────────────────────────────────

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen">
      {/* Left branding panel - hidden on mobile */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-slate-900 p-10 text-white lg:flex xl:w-[55%]">
        {/* Background gradient decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-sky-600/20 via-transparent to-indigo-600/20" />
        <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sky-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-indigo-500/10 blur-3xl" />

        {/* Logo */}
        <div className="relative z-10">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-lg font-bold text-white">
              M
            </div>
            <span className="text-2xl font-bold tracking-tight">MedHub</span>
          </Link>
        </div>

        {/* Main content */}
        <div className="relative z-10 space-y-8">
          <div className="max-w-md space-y-3">
            <h1 className="text-3xl font-bold leading-tight xl:text-4xl">
              A plataforma completa para profissionais de saúde
            </h1>
            <p className="text-lg text-slate-300">
              Simplifique sua rotina clínica, conecte-se com seus pacientes e
              ofereça um atendimento de excelência.
            </p>
          </div>

          {/* Feature list */}
          <div className="grid max-w-lg gap-4">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="flex items-start gap-3">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white/10">
                    <Icon className="h-5 w-5 text-sky-400" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-400">
                      {feature.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-sm text-slate-500">
            &copy; {new Date().getFullYear()} MedHub. Todos os direitos
            reservados.
          </p>
        </div>
      </div>

      {/* Right form panel */}
      <div
        className={cn(
          'flex w-full flex-col items-center justify-center px-4 py-8 sm:px-8 lg:w-1/2 xl:w-[45%]',
          className
        )}
      >
        {/* Mobile logo - visible only on small screens */}
        <div className="mb-8 lg:hidden">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500 text-lg font-bold text-white">
              M
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">
              MedHub
            </span>
          </Link>
          <p className="mt-2 text-center text-sm text-gray-500">
            A plataforma completa para profissionais de saúde
          </p>
        </div>

        {/* Form content area */}
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  )
}
