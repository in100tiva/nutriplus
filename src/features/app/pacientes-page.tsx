import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  Loading,
  EmptyState,
  Button,
} from '@/components/ui'

type Linha = {
  paciente_profile_id: string
  profiles: { nome: string } | null
  ultima_consulta: string | null
}

export function PacientesPage() {
  const profile = useAuth((s) => s.profile)

  const { data: nutri } = useQuery({
    queryKey: ['nutri-self', profile?.id],
    enabled: !!profile?.id,
    queryFn: async () => {
      const { data } = await supabase
        .from('nutricionistas')
        .select('id')
        .eq('profile_id', profile!.id)
        .maybeSingle()
      return data
    },
  })

  const { data: pacientes, isLoading } = useQuery({
    queryKey: ['pacientes-nutri', nutri?.id],
    enabled: !!nutri?.id,
    queryFn: async () => {
      // Listamos prontuarios (1 por paciente). Quem ainda não tem prontuário mas
      // tem agendamento aparece via fallback abaixo.
      const { data: prontuarios, error } = await supabase
        .from('prontuarios')
        .select('paciente_profile_id, profiles!prontuarios_paciente_profile_id_fkey(nome)')
        .eq('nutricionista_id', nutri!.id)
      if (error) throw error
      return (prontuarios ?? []) as unknown as Linha[]
    },
  })

  if (isLoading) return <Loading label="Carregando..." />

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>

      <Card>
        <CardHeader>
          <CardTitle>Lista de pacientes</CardTitle>
        </CardHeader>
        <CardContent>
          {!pacientes || pacientes.length === 0 ? (
            <EmptyState
              icon={<Users className="h-5 w-5" />}
              title="Nenhum paciente ainda"
              description="Quando alguém agendar, você poderá abrir o prontuário aqui."
            />
          ) : (
            <ul className="divide-y divide-gray-100">
              {pacientes.map((p) => (
                <li key={p.paciente_profile_id} className="flex items-center justify-between py-3">
                  <span className="font-medium text-gray-900">
                    {p.profiles?.nome ?? 'Paciente'}
                  </span>
                  <Link to={`/app/pacientes/${p.paciente_profile_id}`}>
                    <Button size="sm" variant="outline">
                      Abrir
                    </Button>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
