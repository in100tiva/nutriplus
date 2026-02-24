import { useState } from 'react'
import {
  Calendar,
  Clock,
  Video,
  X,
  Star,
  Search,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  Badge,
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  EmptyState,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
  Textarea,
  StarRating,
} from '@/components/ui'
import { formatDate, formatTime } from '@/lib/utils'

/* ─── Types ───────────────────────────────────────────────────── */

type AppointmentStatus = 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'

interface Appointment {
  id: string
  professional: {
    name: string
    avatar: string | null
    specialty: string
  }
  date: string
  time: string
  durationMinutes: number
  status: AppointmentStatus
  meetingLink?: string
  priceInCents: number
  hasReview: boolean
}

/* ─── Mock Data ───────────────────────────────────────────────── */

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: '1',
    professional: {
      name: 'Dra. Ana Carolina Mendes',
      avatar: null,
      specialty: 'Nutricionista Clinico',
    },
    date: '2026-03-05',
    time: '14:00',
    durationMinutes: 50,
    status: 'confirmed',
    meetingLink: 'https://meet.google.com/abc-defg-hij',
    priceInCents: 25000,
    hasReview: false,
  },
  {
    id: '2',
    professional: {
      name: 'Dr. Rafael Oliveira Santos',
      avatar: null,
      specialty: 'Nutrologo',
    },
    date: '2026-03-12',
    time: '10:00',
    durationMinutes: 60,
    status: 'scheduled',
    priceInCents: 35000,
    hasReview: false,
  },
  {
    id: '3',
    professional: {
      name: 'Dra. Juliana Costa Ferreira',
      avatar: null,
      specialty: 'Nutricionista Esportivo',
    },
    date: '2026-02-20',
    time: '09:00',
    durationMinutes: 50,
    status: 'completed',
    priceInCents: 20000,
    hasReview: false,
  },
  {
    id: '4',
    professional: {
      name: 'Dra. Ana Carolina Mendes',
      avatar: null,
      specialty: 'Nutricionista Clinico',
    },
    date: '2026-02-10',
    time: '14:00',
    durationMinutes: 50,
    status: 'completed',
    priceInCents: 25000,
    hasReview: true,
  },
  {
    id: '5',
    professional: {
      name: 'Dr. Pedro Henrique Lima',
      avatar: null,
      specialty: 'Endocrinologista',
    },
    date: '2026-01-28',
    time: '16:00',
    durationMinutes: 40,
    status: 'completed',
    priceInCents: 40000,
    hasReview: true,
  },
  {
    id: '6',
    professional: {
      name: 'Dr. Rafael Oliveira Santos',
      avatar: null,
      specialty: 'Nutrologo',
    },
    date: '2026-02-15',
    time: '10:00',
    durationMinutes: 60,
    status: 'cancelled',
    priceInCents: 35000,
    hasReview: false,
  },
  {
    id: '7',
    professional: {
      name: 'Dra. Mariana Souza Alves',
      avatar: null,
      specialty: 'Nutricionista Materno-Infantil',
    },
    date: '2026-01-15',
    time: '11:00',
    durationMinutes: 50,
    status: 'cancelled',
    priceInCents: 22000,
    hasReview: false,
  },
]

/* ─── Helpers ─────────────────────────────────────────────────── */

const STATUS_CONFIG: Record<AppointmentStatus, { label: string; variant: 'success' | 'info' | 'default' | 'danger' | 'warning' }> = {
  scheduled: { label: 'Agendado', variant: 'info' },
  confirmed: { label: 'Confirmado', variant: 'success' },
  completed: { label: 'Concluido', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'danger' },
  no_show: { label: 'Nao compareceu', variant: 'warning' },
}

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

/* ─── Component ───────────────────────────────────────────────── */

export function MyAppointmentsPage() {
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [reviewModalOpen, setReviewModalOpen] = useState(false)
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [reviewRating, setReviewRating] = useState(0)
  const [reviewComment, setReviewComment] = useState('')

  const upcoming = MOCK_APPOINTMENTS.filter(
    (a) => a.status === 'scheduled' || a.status === 'confirmed',
  )
  const past = MOCK_APPOINTMENTS.filter(
    (a) => a.status === 'completed' || a.status === 'no_show',
  )
  const cancelled = MOCK_APPOINTMENTS.filter((a) => a.status === 'cancelled')

  function handleCancelClick(appointment: Appointment) {
    setSelectedAppointment(appointment)
    setCancelModalOpen(true)
  }

  function handleReviewClick(appointment: Appointment) {
    setSelectedAppointment(appointment)
    setReviewRating(0)
    setReviewComment('')
    setReviewModalOpen(true)
  }

  function renderAppointmentList(appointments: Appointment[], tab: 'upcoming' | 'past' | 'cancelled') {
    if (appointments.length === 0) {
      return (
        <EmptyState
          icon={<Calendar className="h-6 w-6" />}
          title={
            tab === 'upcoming'
              ? 'Voce ainda nao tem consultas agendadas'
              : tab === 'past'
                ? 'Nenhuma consulta passada'
                : 'Nenhuma consulta cancelada'
          }
          description={
            tab === 'upcoming'
              ? 'Busque um profissional e agende sua primeira consulta.'
              : undefined
          }
          action={
            tab === 'upcoming' ? (
              <Button>
                <Search className="h-4 w-4" />
                Buscar Profissional
              </Button>
            ) : undefined
          }
        />
      )
    }

    return (
      <div className="space-y-4">
        {appointments.map((appointment) => (
          <AppointmentCard
            key={appointment.id}
            appointment={appointment}
            onCancel={tab === 'upcoming' ? () => handleCancelClick(appointment) : undefined}
            onReview={
              tab === 'past' && appointment.status === 'completed' && !appointment.hasReview
                ? () => handleReviewClick(appointment)
                : undefined
            }
          />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Minhas Consultas</h1>

        <Tabs defaultValue="upcoming">
          <TabsList>
            <TabsTrigger value="upcoming">
              Proximas ({upcoming.length})
            </TabsTrigger>
            <TabsTrigger value="past">
              Passadas ({past.length})
            </TabsTrigger>
            <TabsTrigger value="cancelled">
              Canceladas ({cancelled.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upcoming">
            {renderAppointmentList(upcoming, 'upcoming')}
          </TabsContent>

          <TabsContent value="past">
            {renderAppointmentList(past, 'past')}
          </TabsContent>

          <TabsContent value="cancelled">
            {renderAppointmentList(cancelled, 'cancelled')}
          </TabsContent>
        </Tabs>
      </div>

      {/* ─── Cancel Modal ─────────────────────────────────────── */}
      <Modal open={cancelModalOpen} onClose={() => setCancelModalOpen(false)} size="sm">
        <ModalHeader onClose={() => setCancelModalOpen(false)}>
          <ModalTitle>Cancelar consulta</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-600">
            Tem certeza que deseja cancelar a consulta com{' '}
            <strong>{selectedAppointment?.professional.name}</strong> em{' '}
            <strong>
              {selectedAppointment ? formatDate(selectedAppointment.date) : ''}
            </strong>{' '}
            as <strong>{selectedAppointment?.time}</strong>?
          </p>
          <div className="mt-3 rounded-lg bg-yellow-50 p-3">
            <p className="text-xs text-yellow-800">
              Cancelamentos com menos de 24 horas de antecedencia podem estar sujeitos a cobranca.
            </p>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setCancelModalOpen(false)}>
            Manter consulta
          </Button>
          <Button variant="danger" onClick={() => setCancelModalOpen(false)}>
            Cancelar consulta
          </Button>
        </ModalFooter>
      </Modal>

      {/* ─── Review Modal ─────────────────────────────────────── */}
      <Modal open={reviewModalOpen} onClose={() => setReviewModalOpen(false)} size="md">
        <ModalHeader onClose={() => setReviewModalOpen(false)}>
          <ModalTitle>Avaliar consulta</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-4">
          {selectedAppointment && (
            <div className="flex items-center gap-3">
              <Avatar name={selectedAppointment.professional.name} size="md" />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {selectedAppointment.professional.name}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(selectedAppointment.date)} as {selectedAppointment.time}
                </p>
              </div>
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Como voce avalia esta consulta?
            </label>
            <StarRating value={reviewRating} onChange={setReviewRating} size="lg" />
          </div>

          <Textarea
            label="Comentario (opcional)"
            value={reviewComment}
            onChange={(e) => setReviewComment(e.target.value)}
            placeholder="Conte como foi sua experiencia..."
            rows={4}
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setReviewModalOpen(false)}>
            Cancelar
          </Button>
          <Button disabled={reviewRating === 0} onClick={() => setReviewModalOpen(false)}>
            Enviar avaliacao
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

/* ─── Appointment Card ────────────────────────────────────────── */

function AppointmentCard({
  appointment,
  onCancel,
  onReview,
}: {
  appointment: Appointment
  onCancel?: () => void
  onReview?: () => void
}) {
  const { professional, date, time, durationMinutes, status, meetingLink } = appointment
  const config = STATUS_CONFIG[status]

  return (
    <Card className="transition-shadow hover:shadow-md">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          {/* Professional info */}
          <div className="flex items-center gap-4">
            <Avatar name={professional.name} src={professional.avatar} size="lg" />
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{professional.name}</h3>
              <Badge variant="info" size="sm" className="mt-1">
                {professional.specialty}
              </Badge>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                <span className="flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(date)}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatTime(time)} ({durationMinutes} min)
                </span>
              </div>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={config.variant} size="md">
              {config.label}
            </Badge>

            {meetingLink && (status === 'confirmed' || status === 'scheduled') && (
              <Button
                variant="success"
                size="sm"
                onClick={() => window.open(meetingLink, '_blank')}
              >
                <Video className="h-4 w-4" />
                Entrar
              </Button>
            )}

            {onCancel && (
              <Button variant="outline" size="sm" onClick={onCancel}>
                <X className="h-4 w-4" />
                Cancelar
              </Button>
            )}

            {onReview && (
              <Button variant="outline" size="sm" onClick={onReview}>
                <Star className="h-4 w-4" />
                Avaliar
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
