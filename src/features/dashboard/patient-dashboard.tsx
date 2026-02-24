import { Link } from 'react-router-dom'
import {
  Calendar,
  Clock,
  MessageSquare,
  CheckSquare,
  Search,
  ArrowRight,
  MapPin,
  Video,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/avatar'

// ─── Mock Data ──────────────────────────────────────────────────

const NEXT_APPOINTMENT = {
  id: '1',
  professionalName: 'Dra. Maria Santos',
  specialty: 'Nutricionista',
  date: '26 de fevereiro de 2026',
  time: '14:00',
  endTime: '14:50',
  modality: 'telemedicine' as const,
  status: 'confirmed' as const,
}

const ACTIVE_TASKS = [
  {
    id: '1',
    title: 'Preencher diário alimentar',
    professionalName: 'Dra. Maria Santos',
    dueDate: '28/02/2026',
    priority: 'high' as const,
  },
  {
    id: '2',
    title: 'Realizar exercícios de respiração',
    professionalName: 'Dr. João Lima',
    dueDate: '01/03/2026',
    priority: 'medium' as const,
  },
  {
    id: '3',
    title: 'Enviar resultado dos exames',
    professionalName: 'Dra. Maria Santos',
    dueDate: '05/03/2026',
    priority: 'low' as const,
  },
]

const RECENT_MESSAGES = [
  {
    id: '1',
    senderName: 'Dra. Maria Santos',
    preview: 'Olá! Vi seus registros e gostei do progresso...',
    time: '2h atrás',
    unread: true,
  },
  {
    id: '2',
    senderName: 'Dr. João Lima',
    preview: 'Lembre-se de fazer os exercícios antes de dormir',
    time: '1 dia atrás',
    unread: false,
  },
]

const PRIORITY_STYLES = {
  high: 'bg-red-50 text-red-700 border-red-200',
  medium: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  low: 'bg-gray-100 text-gray-600',
}

const PRIORITY_LABELS = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
}

// ─── Component ──────────────────────────────────────────────────

export function PatientDashboard() {
  return (
    <div className="flex flex-col gap-6">
      {/* Quick action */}
      <div className="flex flex-wrap gap-3">
        <Link to="/app/search">
          <Button>
            <Search className="h-4 w-4" />
            Buscar Profissional
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-5">
        {/* Main content */}
        <div className="flex flex-col gap-6 lg:col-span-3">
          {/* Next appointment */}
          <Card className="border-sky-200 bg-gradient-to-r from-sky-50 to-white">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-sky-500" />
                Próxima consulta
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <Avatar name={NEXT_APPOINTMENT.professionalName} size="lg" />
                  <div>
                    <p className="font-semibold text-gray-900">
                      {NEXT_APPOINTMENT.professionalName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {NEXT_APPOINTMENT.specialty}
                    </p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        {NEXT_APPOINTMENT.date} - {NEXT_APPOINTMENT.time}
                      </span>
                      <Badge variant="info" size="sm">
                        {NEXT_APPOINTMENT.modality === 'telemedicine' ? (
                          <span className="flex items-center gap-1">
                            <Video className="h-3 w-3" />
                            Online
                          </span>
                        ) : (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            Presencial
                          </span>
                        )}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Badge variant="success" size="md">
                    Confirmado
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active tasks */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-gray-400" />
                Tarefas ativas
              </CardTitle>
              <Link to="/app/tasks">
                <Button variant="ghost" size="sm">
                  Ver todas
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col divide-y divide-gray-100">
                {ACTIVE_TASKS.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center gap-4 py-3 first:pt-0 last:pb-0"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">
                        {task.title}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-500">
                        {task.professionalName} - Prazo: {task.dueDate}
                      </p>
                    </div>
                    <Badge
                      size="sm"
                      className={PRIORITY_STYLES[task.priority]}
                    >
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right sidebar */}
        <div className="flex flex-col gap-6 lg:col-span-2">
          {/* Recent messages */}
          <Card>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2 text-base">
                <MessageSquare className="h-5 w-5 text-gray-400" />
                Mensagens
              </CardTitle>
              <Link to="/app/messages">
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

          {/* Upcoming appointments summary */}
          <Card>
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-purple-50 text-purple-600">
                <Calendar className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Próximas consultas
                </p>
                <p className="text-xs text-gray-500">
                  2 consultas agendadas esta semana
                </p>
              </div>
              <Link to="/app/appointments">
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
