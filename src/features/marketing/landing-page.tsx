import { Link } from 'react-router-dom'
import { HeartPulse, CalendarCheck, ShieldCheck, LineChart, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui'

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 via-white to-white">
      <header className="border-b border-emerald-100 bg-white/80 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500 text-white">
              <HeartPulse className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold text-gray-900">NutriPlus</span>
          </Link>
          <div className="flex gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Entrar
              </Button>
            </Link>
            <Link to="/cadastro">
              <Button size="sm">Cadastre-se</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-20">
        <section className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-medium text-emerald-700">
              MVP — versão inicial
            </span>
            <h1 className="mt-4 text-4xl font-bold leading-tight text-gray-900 lg:text-5xl">
              O consultório digital para nutricionistas
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Receba pacientes, atenda online, mantenha planos alimentares e acompanhe
              evolução — sem precisar de planilha, WhatsApp ou ferramenta extra.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/cadastro">
                <Button size="lg">
                  Começar agora <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button size="lg" variant="outline">
                  Já tenho conta
                </Button>
              </Link>
            </div>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-lg">
            <div className="space-y-4">
              <Feature icon={CalendarCheck} title="Agenda + autoagendamento">
                Defina sua disponibilidade semanal; o paciente escolhe o horário e a
                consulta já vira <strong>confirmada</strong>.
              </Feature>
              <Feature icon={ShieldCheck} title="Prontuário com LGPD">
                Cada nutricionista enxerga só seus pacientes — isolamento garantido por
                Row Level Security no banco.
              </Feature>
              <Feature icon={LineChart} title="Evolução visível">
                Antropometria datada vira gráfico para você e para o paciente — reforço
                de progresso por si só.
              </Feature>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6">
        <p className="mx-auto max-w-6xl px-4 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} NutriPlus
        </p>
      </footer>
    </div>
  )
}

function Feature({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof CalendarCheck
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-100">
        <Icon className="h-5 w-5 text-emerald-700" />
      </div>
      <div>
        <h3 className="font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600">{children}</p>
      </div>
    </div>
  )
}
