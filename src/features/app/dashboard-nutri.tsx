import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Calendar, Users, UtensilsCrossed, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { Card, CardHeader, CardTitle, CardContent, Loading, Button } from '@/components/ui'
import { formatDataHora } from '@/lib/format'

export function NutriDashboard() {
  const profile = useAuth((s) => s.profile)

  const { data: nutri } = useQuery({
    queryKey: ['nutri-self', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('nutricionistas')
        .select('*')
        .eq('profile_id', profile!.id)
        .maybeSingle()
      return data
    },
  })

  const { data: proximos, isLoading } = useQuery({
    queryKey: ['proximos-agendamentos', nutri?.id],
    enabled: !!nutri?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('agendamentos')
        .select('id, inicio, fim, status, paciente_profile_id, profiles!agendamentos_paciente_profile_id_fkey(nome)')
        .eq('nutricionista_id', nutri!.id)
        .gte('inicio', new Date().toISOString())
        .eq('status', 'confirmado')
        .order('inicio', { ascending: true })
        .limit(5)
      return data ?? []
    },
  })

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Olá, {profile?.nome || 'nutricionista'}</h2>
        <p className="mt-1 text-sm text-gray-600">
          Aqui está o panorama do seu consultório hoje.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <QuickLink href="/app/agenda" icon={Calendar} title="Agenda" subtitle="Configurar e ver" />
        <QuickLink href="/app/pacientes" icon={Users} title="Pacientes" subtitle="Prontuários" />
        <QuickLink href="/app/planos" icon={UtensilsCrossed} title="Planos" subtitle="Alimentação" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Próximas consultas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Loading label="Carregando..." />
          ) : !proximos || proximos.length === 0 ? (
            <p className="text-sm text-gray-500">
              Nenhuma consulta confirmada para os próximos dias.
            </p>
          ) : (
            <ul className="divide-y divide-gray-100">
              {proximos.map((a) => {
                const paciente = (a.profiles as { nome?: string } | null)?.nome ?? 'Paciente'
                return (
                  <li key={a.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{paciente}</p>
                      <p className="text-xs text-gray-500">{formatDataHora(a.inicio)}</p>
                    </div>
                    <Link to="/app/agenda">
                      <Button size="sm" variant="outline">
                        Ver
                      </Button>
                    </Link>
                  </li>
                )
              })}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function QuickLink({
  href,
  icon: Icon,
  title,
  subtitle,
}: {
  href: string
  icon: typeof Calendar
  title: string
  subtitle: string
}) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow"
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        <p className="text-xs text-gray-500">{subtitle}</p>
      </div>
      <ArrowRight className="h-4 w-4 text-gray-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-600" />
    </Link>
  )
}
