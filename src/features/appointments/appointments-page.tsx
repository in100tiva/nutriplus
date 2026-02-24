import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  Calendar,
  List,
  Clock,
  CheckCircle2,
  XCircle,
  Check,
  CalendarDays,
} from 'lucide-react'
import {
  Button,
  Card,
  Badge,
  Avatar,
  Input,
  Select,
  EmptyState,
} from '@/components/ui'
import { formatDate } from '@/lib/utils'
import NewAppointmentModal from './new-appointment-modal'

// ─── Types ────────────────────────────────────────────────────────────────────

interface AppointmentItem {
  id: string
  date: string
  time: string
  duration: number
  patientName: string
  patientAvatarUrl: string | null
  type: 'first' | 'follow_up' | 'return'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  notes: string
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_APPOINTMENTS: AppointmentItem[] = [
  {
    id: 'a1',
    date: '2026-02-24',
    time: '08:00',
    duration: 60,
    patientName: 'Ana Carolina Silva',
    patientAvatarUrl: null,
    type: 'follow_up',
    status: 'confirmed',
    notes: 'Trazer exames recentes',
  },
  {
    id: 'a2',
    date: '2026-02-24',
    time: '09:00',
    duration: 30,
    patientName: 'Bruno Oliveira Santos',
    patientAvatarUrl: null,
    type: 'return',
    status: 'scheduled',
    notes: 'Retorno pós exames',
  },
  {
    id: 'a3',
    date: '2026-02-24',
    time: '10:00',
    duration: 60,
    patientName: 'Carla Mendes Ferreira',
    patientAvatarUrl: null,
    type: 'first',
    status: 'confirmed',
    notes: 'Primeira consulta - encaminhamento endócrino',
  },
  {
    id: 'a4',
    date: '2026-02-24',
    time: '14:00',
    duration: 30,
    patientName: 'Fernanda Rodrigues Lima',
    patientAvatarUrl: null,
    type: 'follow_up',
    status: 'scheduled',
    notes: '',
  },
  {
    id: 'a5',
    date: '2026-02-25',
    time: '08:30',
    duration: 60,
    patientName: 'Gabriel Pereira Souza',
    patientAvatarUrl: null,
    type: 'first',
    status: 'confirmed',
    notes: 'Avaliação nutricional completa',
  },
  {
    id: 'a6',
    date: '2026-02-25',
    time: '10:00',
    duration: 30,
    patientName: 'Igor Martins Barbosa',
    patientAvatarUrl: null,
    type: 'return',
    status: 'scheduled',
    notes: '',
  },
  {
    id: 'a7',
    date: '2026-02-25',
    time: '11:00',
    duration: 45,
    patientName: 'Juliana Araujo Campos',
    patientAvatarUrl: null,
    type: 'follow_up',
    status: 'scheduled',
    notes: 'Revisão do plano alimentar',
  },
  {
    id: 'a8',
    date: '2026-02-26',
    time: '09:00',
    duration: 30,
    patientName: 'Lucas Nascimento Dias',
    patientAvatarUrl: null,
    type: 'follow_up',
    status: 'confirmed',
    notes: '',
  },
  {
    id: 'a9',
    date: '2026-02-21',
    time: '09:00',
    duration: 30,
    patientName: 'Pedro Henrique Cardoso',
    patientAvatarUrl: null,
    type: 'return',
    status: 'completed',
    notes: 'Retorno pós dieta',
  },
  {
    id: 'a10',
    date: '2026-02-21',
    time: '10:30',
    duration: 60,
    patientName: 'Mariana Teixeira Gomes',
    patientAvatarUrl: null,
    type: 'first',
    status: 'cancelled',
    notes: 'Paciente cancelou',
  },
  {
    id: 'a11',
    date: '2026-02-20',
    time: '14:00',
    duration: 45,
    patientName: 'Ana Carolina Silva',
    patientAvatarUrl: null,
    type: 'follow_up',
    status: 'completed',
    notes: 'Acompanhamento mensal',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const typeLabel: Record<AppointmentItem['type'], string> = {
  first: 'Primeira consulta',
  follow_up: 'Acompanhamento',
  return: 'Retorno',
}

const typeBadgeVariant: Record<AppointmentItem['type'], 'info' | 'default' | 'warning'> = {
  first: 'info',
  follow_up: 'default',
  return: 'warning',
}

const statusBadge: Record<AppointmentItem['status'], { label: string; variant: 'info' | 'success' | 'default' | 'danger' }> = {
  scheduled: { label: 'Agendada', variant: 'info' },
  confirmed: { label: 'Confirmada', variant: 'success' },
  completed: { label: 'Concluída', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
}

function groupByDate(appointments: AppointmentItem[]): Map<string, AppointmentItem[]> {
  const map = new Map<string, AppointmentItem[]>()
  for (const apt of appointments) {
    const existing = map.get(apt.date) ?? []
    existing.push(apt)
    map.set(apt.date, existing)
  }
  return map
}

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  const today = new Date()
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  const dateOnly = (d: Date) => d.toISOString().split('T')[0]

  if (dateOnly(date) === dateOnly(today)) return `Hoje - ${formatDate(dateStr)}`
  if (dateOnly(date) === dateOnly(tomorrow)) return `Amanhã - ${formatDate(dateStr)}`

  const weekdays = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado']
  return `${weekdays[date.getDay()]} - ${formatDate(dateStr)}`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AppointmentsPage() {
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [modalOpen, setModalOpen] = useState(false)

  const filtered = useMemo(() => {
    let result = MOCK_APPOINTMENTS

    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter((a) => a.patientName.toLowerCase().includes(query))
    }

    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter)
    }

    return result.sort((a, b) => {
      const dateCompare = a.date.localeCompare(b.date)
      if (dateCompare !== 0) return dateCompare
      return a.time.localeCompare(b.time)
    })
  }, [search, statusFilter])

  const grouped = groupByDate(filtered)
  const sortedDates = Array.from(grouped.keys()).sort()

  const handleConfirm = (id: string) => {
    console.log(`Confirmar consulta: ${id}`)
  }

  const handleCancel = (id: string) => {
    console.log(`Cancelar consulta: ${id}`)
  }

  const handleComplete = (id: string) => {
    console.log(`Marcar como concluída: ${id}`)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Agenda</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie suas consultas e horários de atendimento.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)}>
          <Plus className="h-4 w-4" />
          Nova Consulta
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <Input
              placeholder="Buscar por paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              wrapperClassName="min-w-[160px]"
            >
              <option value="all">Todos</option>
              <option value="scheduled">Agendada</option>
              <option value="confirmed">Confirmada</option>
              <option value="completed">Concluída</option>
              <option value="cancelled">Cancelada</option>
            </Select>

            {/* View Toggle */}
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              <button
                type="button"
                onClick={() => setView('list')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  view === 'list'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <List className="h-4 w-4" />
                Lista
              </button>
              <button
                type="button"
                onClick={() => setView('calendar')}
                className={`inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors ${
                  view === 'calendar'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Calendário
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Content */}
      {view === 'list' ? (
        filtered.length === 0 ? (
          <EmptyState
            icon={<CalendarDays className="h-6 w-6" />}
            title="Nenhuma consulta encontrada"
            description="Tente ajustar os filtros ou agende uma nova consulta."
            action={
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4" />
                Nova Consulta
              </Button>
            }
          />
        ) : (
          <div className="flex flex-col gap-6">
            {sortedDates.map((date) => {
              const appointments = grouped.get(date)!
              return (
                <div key={date} className="flex flex-col gap-3">
                  <h2 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <CalendarDays className="h-4 w-4 text-gray-400" />
                    {formatDateLabel(date)}
                    <Badge size="sm">{appointments.length} consulta{appointments.length > 1 ? 's' : ''}</Badge>
                  </h2>

                  <div className="flex flex-col gap-2">
                    {appointments.map((apt) => {
                      const sInfo = statusBadge[apt.status]
                      return (
                        <Card key={apt.id} className="p-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-3">
                              {/* Time */}
                              <div className="text-center shrink-0 w-14">
                                <p className="text-lg font-bold text-gray-900">{apt.time}</p>
                                <p className="text-xs text-gray-500 flex items-center justify-center gap-0.5">
                                  <Clock className="h-3 w-3" />
                                  {apt.duration}min
                                </p>
                              </div>

                              <div className="h-10 w-px bg-gray-200 hidden sm:block" />

                              {/* Patient Info */}
                              <div className="flex items-center gap-3">
                                <Avatar
                                  name={apt.patientName}
                                  src={apt.patientAvatarUrl}
                                  size="md"
                                />
                                <div>
                                  <p className="text-sm font-medium text-gray-900">{apt.patientName}</p>
                                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                    <Badge variant={typeBadgeVariant[apt.type]} size="sm">
                                      {typeLabel[apt.type]}
                                    </Badge>
                                    <Badge variant={sInfo.variant} size="sm">
                                      {sInfo.label}
                                    </Badge>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Quick Actions */}
                            {(apt.status === 'scheduled' || apt.status === 'confirmed') && (
                              <div className="flex items-center gap-2 sm:shrink-0">
                                {apt.status === 'scheduled' && (
                                  <Button
                                    variant="success"
                                    size="sm"
                                    onClick={() => handleConfirm(apt.id)}
                                  >
                                    <Check className="h-3.5 w-3.5" />
                                    Confirmar
                                  </Button>
                                )}
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleComplete(apt.id)}
                                >
                                  <CheckCircle2 className="h-3.5 w-3.5" />
                                  Concluir
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleCancel(apt.id)}
                                  className="text-red-500 hover:text-red-600 hover:bg-red-50"
                                >
                                  <XCircle className="h-3.5 w-3.5" />
                                  Cancelar
                                </Button>
                              </div>
                            )}
                          </div>
                        </Card>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )
      ) : (
        /* Calendar View Placeholder */
        <EmptyState
          icon={<Calendar className="h-6 w-6" />}
          title="Visualização de calendário"
          description="A visualização em formato de calendário estará disponível em breve."
        />
      )}

      {/* New Appointment Modal */}
      <NewAppointmentModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  )
}
