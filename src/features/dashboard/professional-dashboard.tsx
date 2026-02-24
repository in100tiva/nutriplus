import { Link } from 'react-router-dom'
import {
  Users,
  Calendar,
  CalendarCheck,
  Star,
  Clock,
  MessageSquare,
  CheckSquare,
  Plus,
  UserPlus,
  ArrowRight,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'

// ─── Mock Data ──────────────────────────────────────────────────

const STATS = [
  {
    label: 'Total Pacientes',
    value: '47',
    icon: Users,
    color: 'text-blue-600 bg-blue-50',
  },
  {
    label: 'Consultas Hoje',
    value: '6',
    icon: Calendar,
    color: 'text-green-600 bg-green-50',
  },
  {
    label: 'Consultas Semana',
    value: '23',
    icon: CalendarCheck,
    color: 'text-purple-600 bg-purple-50',
  },
  {
    label: 'Avaliação Média',
    value: '4.8',
    icon: Star,
    color: 'text-yellow-600 bg-yellow-50',
  },
]

const TODAY_APPOINTMENTS = [
  {
    id: '1',
    patientName: 'Ana Carolina Silva',
    time: '08:00',
    endTime: '08:50',
    type: 'Retorno',
    status: 'confirmed' as const,
  },
  {
    id: '2',
    patientName: 'Bruno Oliveira Santos',
    time: '09:00',
    endTime: '09:50',
    type: 'Primeira consulta',
    status: 'confirmed' as const,
  },
  {
    id: '3',
    patientName: 'Carla Mendes Ferreira',
    time: '10:00',
    endTime: '10:50',
    type: 'Retorno',
    status: 'scheduled' as const,
  },
  {
    id: '4',
    patientName: 'Diego Almeida Costa',
    time: '11:00',
    endTime: '11:50',
    type: 'Acompanhamento',
    status: 'scheduled' as const,
  },
  {
    id: '5',
    patientName: 'Fernanda Rodrigues Lima',
    time: '14:00',
    endTime: '14:50',
    type: 'Primeira consulta',
    status: 'scheduled' as const,
  },
  {
    id: '6',
    patientName: 'Gabriel Pereira Souza',
    time: '15:00',
    endTime: '15:50',
    type: 'Retorno',
    status: 'scheduled' as const,
  },
]

const RECENT_MESSAGES = [
  {
    id: '1',
    senderName: 'Ana Carolina Silva',
    preview: 'Bom dia! Gostaria de saber se posso trocar o horário...',
    time: '10 min atrás',
    unread: true,
  },
  {
    id: '2',
    senderName: 'Pedro Henrique Cardoso',
    preview: 'Segue em anexo os exames solicitados',
    time: '1h atrás',
    unread: true,
  },
  {
    id: '3',
    senderName: 'Juliana Araujo Campos',
    preview: 'Obrigada pela orientação!',
    time: '3h atrás',
    unread: false,
  },
]

const STATUS_MAP: Record<string, { label: string; variant: 'success' | 'info' }> = {
  confirmed: { label: 'Confirmado', variant: 'success' },
  scheduled: { label: 'Agendado', variant: 'info' },
}

// ─── Component ──────────────────────────────────────────────────

export function ProfessionalDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Stats cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {STATS.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-4 p-5">
                <div
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${stat.color}`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-500">{stat.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick actions */}
      <div className="flex flex-wrap gap-3">
        <Link to="/pro/appointments">
          <Button>
            <Plus className="h-4 w-4" />
            Nova Consulta
          </Button>
        </Link>
        <Link to="/pro/patients">
          <Button variant="outline">
            <UserPlus className="h-4 w-4" />
            Novo Paciente
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Today's appointments */}
        <div className="lg:col-span-3">
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-gray-400" />
                Consultas de hoje
              </CardTitle>
              <Link to="/pro/appointments">
                <Button variant="ghost" size="sm">
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y divide-gray-100">
                {TODAY_APPOINTMENTS.map((apt) => {
                  const statusInfo = STATUS_MAP[apt.status]
                  return (
                    <div
                      key={apt.id}
                      className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-sm font-semibold text-gray-900">
                          {apt.time}
                        </span>
                        <span className="text-xs text-gray-400">{apt.endTime}</span>
                      </div>

                      <div className="h-8 w-px bg-gray-200" />

                      <Avatar name={apt.patientName} size="sm" />

                      <div className="flex-1 min-w-0">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {apt.patientName}
                        </p>
                        <p className="text-xs text-gray-500">{apt.type}</p>
                      </div>

                      <Badge variant={statusInfo.variant} size="sm">
                        {statusInfo.label}
                      </Badge>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Messages preview */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                Mensagens recentes
              </CardTitle>
              <Link to="/pro/messages">
                <Button variant="ghost" size="sm">
                  Ver todas
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y divide-gray-100">
                {RECENT_MESSAGES.map((msg) => (
                  <div
                    key={msg.id}
                    className="flex items-start gap-3 py-3 first:pt-0 last:pb-0"
                  >
                    <Avatar name={msg.senderName} size="sm" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {msg.senderName}
                        </p>
                        <span className="shrink-0 text-xs text-gray-400">
                          {msg.time}
                        </span>
                      </div>
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {msg.preview}
                      </p>
                    </div>
                    {msg.unread && (
                      <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-sky-500" />
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Pending tasks */}
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                <CheckSquare className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Tarefas pendentes
                </p>
                <p className="text-xs text-gray-500">
                  3 tarefas aguardando resposta dos pacientes
                </p>
              </div>
              <Link to="/pro/tasks">
                <Button variant="ghost" size="sm">
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
