import { useState, useMemo } from 'react'
import {
  BadgeCheck,
  MapPin,
  Clock,
  DollarSign,
  Shield,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  StarRating,
} from '@/components/ui'
import { formatDate } from '@/lib/utils'

/* ─── Types ───────────────────────────────────────────────────── */

interface Review {
  id: string
  patientName: string
  rating: number
  comment: string
  date: string
  professionalReply?: string
}

interface TimeSlot {
  time: string
  available: boolean
}

interface DaySchedule {
  date: Date
  slots: TimeSlot[]
}

/* ─── Mock Data ───────────────────────────────────────────────── */

const PROFESSIONAL = {
  id: '1',
  name: 'Dra. Ana Carolina Mendes',
  avatar: null as string | null,
  specialty: 'Nutricionista Clinico',
  verified: true,
  rating: 4.9,
  reviewCount: 127,
  bio: 'Sou nutricionista clinica formada pela USP com mestrado em Ciencias da Nutricao pela UNIFESP. Tenho mais de 10 anos de experiencia em atendimento clinico, com foco em doencas cronicas, reeducacao alimentar e emagrecimento saudavel. Minha abordagem e humanizada e baseada em evidencias cientificas, sempre buscando o melhor resultado para cada paciente de forma individualizada. Acredito que a nutricao vai alem de uma dieta - e um caminho para qualidade de vida.',
  priceInCents: 25000,
  durationMinutes: 50,
  insurances: ['Unimed', 'Bradesco Saude', 'SulAmerica', 'Amil'],
  city: 'Sao Paulo',
  state: 'SP',
  address: 'Av. Paulista, 1578 - Sala 1204, Bela Vista',
  crn: 'CRN-3 12345',
}

const MOCK_REVIEWS: Review[] = [
  {
    id: '1',
    patientName: 'Maria Silva',
    rating: 5,
    comment:
      'Excelente profissional! Muito atenciosa e dedicada. Consegui resultados incriveis com o acompanhamento dela. Recomendo muito!',
    date: '2025-12-15',
    professionalReply:
      'Obrigada, Maria! Foi um prazer acompanhar sua evolucao. Continue firme no seu plano!',
  },
  {
    id: '2',
    patientName: 'Joao Pedro Almeida',
    rating: 5,
    comment:
      'Atendimento humanizado e muito profissional. A Dra. Ana Carolina explicou tudo com muita paciencia e montou um plano alimentar que se encaixou perfeitamente na minha rotina.',
    date: '2025-11-28',
  },
  {
    id: '3',
    patientName: 'Fernanda Costa',
    rating: 4,
    comment:
      'Muito boa profissional. O unico ponto e que as vezes demora um pouco para responder as mensagens, mas o atendimento presencial e impecavel.',
    date: '2025-11-10',
    professionalReply:
      'Obrigada pelo feedback, Fernanda! Estou trabalhando para melhorar meu tempo de resposta.',
  },
  {
    id: '4',
    patientName: 'Carlos Eduardo',
    rating: 5,
    comment:
      'Perdi 15kg em 6 meses com o acompanhamento da Dra. Ana. Sem dietas malucas, sem passar fome. Melhor investimento que fiz na minha saude.',
    date: '2025-10-22',
  },
  {
    id: '5',
    patientName: 'Luciana Barbosa',
    rating: 5,
    comment:
      'Profissional incrivel! Me ajudou a entender minha relacao com a comida e hoje tenho uma alimentacao muito mais saudavel e equilibrada.',
    date: '2025-10-05',
  },
]

function generateSchedule(): DaySchedule[] {
  const schedule: DaySchedule[] = []
  const today = new Date()

  for (let i = 1; i <= 14; i++) {
    const date = new Date(today)
    date.setDate(today.getDate() + i)

    // Skip Sundays
    if (date.getDay() === 0) continue

    const slots: TimeSlot[] = []
    const startHour = 8
    const endHour = date.getDay() === 6 ? 13 : 18

    for (let h = startHour; h < endHour; h++) {
      slots.push({
        time: `${String(h).padStart(2, '0')}:00`,
        available: Math.random() > 0.35,
      })
      if (h < endHour - 1 || date.getDay() !== 6) {
        slots.push({
          time: `${String(h).padStart(2, '0')}:30`,
          available: Math.random() > 0.4,
        })
      }
    }

    schedule.push({ date, slots })
  }

  return schedule
}

const MOCK_SCHEDULE = generateSchedule()

/* ─── Helpers ─────────────────────────────────────────────────── */

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const WEEKDAYS_SHORT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sab']
const MONTHS_SHORT = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

/* ─── Component ───────────────────────────────────────────────── */

export function ProfessionalPublicProfile() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [dateScrollStart, setDateScrollStart] = useState(0)
  const visibleDates = 7

  const prof = PROFESSIONAL

  const selectedDaySchedule = useMemo(() => {
    if (!selectedDate) return null
    return MOCK_SCHEDULE.find(
      (d) => d.date.toDateString() === selectedDate.toDateString(),
    )
  }, [selectedDate])

  const visibleSchedule = MOCK_SCHEDULE.slice(
    dateScrollStart,
    dateScrollStart + visibleDates,
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ─── Profile Header ───────────────────────────────────── */}
      <section className="border-b bg-white px-4 py-8 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col items-start gap-6 sm:flex-row">
            <Avatar name={prof.name} src={prof.avatar} size="xl" className="h-24 w-24 text-2xl [&>div]:h-24 [&>div]:w-24" />

            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold text-gray-900">{prof.name}</h1>
                {prof.verified && (
                  <BadgeCheck className="h-6 w-6 text-blue-500" />
                )}
              </div>

              <div className="mt-2 flex flex-wrap items-center gap-3">
                <Badge variant="info" size="md">
                  {prof.specialty}
                </Badge>
                <Badge variant="default" size="sm">
                  {prof.crn}
                </Badge>
              </div>

              <div className="mt-3 flex items-center gap-2">
                <StarRating value={prof.rating} size="md" readOnly />
                <span className="text-sm font-semibold text-gray-700">
                  {prof.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-500">
                  ({prof.reviewCount} avaliacoes)
                </span>
              </div>

              <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-4 w-4" />
                <span>
                  {prof.address} - {prof.city}, {prof.state}
                </span>
              </div>
            </div>

            <Button variant="outline" className="shrink-0">
              <MessageSquare className="h-4 w-4" />
              Enviar Mensagem
            </Button>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* ─── Main Content ─────────────────────────────────── */}
          <div className="space-y-8 lg:col-span-2">
            {/* Bio */}
            <Card>
              <CardHeader>
                <CardTitle>Sobre</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-sm leading-relaxed text-gray-600">
                  {prof.bio}
                </p>
              </CardContent>
            </Card>

            {/* Schedule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-blue-500" />
                  Agende sua consulta
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Date Selector */}
                <div>
                  <label className="mb-3 block text-sm font-medium text-gray-700">
                    Selecione uma data
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={dateScrollStart === 0}
                      onClick={() => setDateScrollStart((s) => Math.max(0, s - 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>

                    <div className="flex flex-1 gap-2 overflow-x-auto">
                      {visibleSchedule.map((day) => {
                        const isSelected =
                          selectedDate?.toDateString() === day.date.toDateString()
                        const availableCount = day.slots.filter((s) => s.available).length

                        return (
                          <button
                            key={day.date.toISOString()}
                            type="button"
                            onClick={() => {
                              setSelectedDate(day.date)
                              setSelectedTime(null)
                            }}
                            className={`flex min-w-[72px] flex-col items-center rounded-lg border-2 px-3 py-2 transition-colors ${
                              isSelected
                                ? 'border-blue-500 bg-blue-50 text-blue-700'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300'
                            }`}
                          >
                            <span className="text-xs font-medium uppercase">
                              {WEEKDAYS_SHORT[day.date.getDay()]}
                            </span>
                            <span className="text-lg font-bold">{day.date.getDate()}</span>
                            <span className="text-xs">
                              {MONTHS_SHORT[day.date.getMonth()]}
                            </span>
                            <span
                              className={`mt-1 text-[10px] ${
                                availableCount > 0 ? 'text-green-600' : 'text-red-500'
                              }`}
                            >
                              {availableCount > 0 ? `${availableCount} vagas` : 'Lotado'}
                            </span>
                          </button>
                        )
                      })}
                    </div>

                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={
                        dateScrollStart + visibleDates >= MOCK_SCHEDULE.length
                      }
                      onClick={() => setDateScrollStart((s) => s + 1)}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Time Slots */}
                {selectedDaySchedule && (
                  <div>
                    <label className="mb-3 block text-sm font-medium text-gray-700">
                      Horarios disponiveis para{' '}
                      {formatDate(selectedDaySchedule.date)}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {selectedDaySchedule.slots.map((slot) => (
                        <button
                          key={slot.time}
                          type="button"
                          disabled={!slot.available}
                          onClick={() => setSelectedTime(slot.time)}
                          className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                            !slot.available
                              ? 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through'
                              : selectedTime === slot.time
                                ? 'border-blue-500 bg-blue-500 text-white'
                                : 'border-gray-200 bg-white text-gray-700 hover:border-blue-300 hover:bg-blue-50'
                          }`}
                        >
                          {slot.time}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Book Button */}
                {selectedDate && selectedTime && (
                  <div className="flex items-center justify-between rounded-lg bg-blue-50 p-4">
                    <div>
                      <p className="text-sm font-medium text-blue-900">
                        {formatDate(selectedDate)} as {selectedTime}
                      </p>
                      <p className="text-xs text-blue-600">
                        Consulta de {prof.durationMinutes} minutos - {formatPrice(prof.priceInCents)}
                      </p>
                    </div>
                    <Button>Agendar Consulta</Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Reviews */}
            <Card>
              <CardHeader>
                <CardTitle>
                  Avaliacoes ({MOCK_REVIEWS.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {MOCK_REVIEWS.map((review) => (
                  <ReviewItem key={review.id} review={review} />
                ))}
              </CardContent>
            </Card>
          </div>

          {/* ─── Sidebar ──────────────────────────────────────── */}
          <div className="space-y-4">
            <Card>
              <CardContent className="space-y-4 p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-green-50">
                    <DollarSign className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Valor da consulta</p>
                    <p className="text-lg font-bold text-gray-900">
                      {formatPrice(prof.priceInCents)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50">
                    <Clock className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Duracao da consulta</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {prof.durationMinutes} minutos
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-50">
                    <Shield className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Convenios aceitos</p>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {prof.insurances.map((ins) => (
                        <Badge key={ins} variant="default" size="sm">
                          {ins}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-50">
                    <MapPin className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Localizacao</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {prof.city}, {prof.state}
                    </p>
                    <p className="text-xs text-gray-500">{prof.address}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Review Item ─────────────────────────────────────────────── */

function ReviewItem({ review }: { review: Review }) {
  return (
    <div className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <Avatar name={review.patientName} size="sm" />
          <div>
            <p className="text-sm font-medium text-gray-900">{review.patientName}</p>
            <p className="text-xs text-gray-500">{formatDate(review.date)}</p>
          </div>
        </div>
        <StarRating value={review.rating} size="sm" readOnly />
      </div>

      <p className="mt-3 text-sm leading-relaxed text-gray-600">{review.comment}</p>

      {review.professionalReply && (
        <div className="mt-3 rounded-lg bg-gray-50 p-3">
          <p className="text-xs font-medium text-gray-700">Resposta da profissional:</p>
          <p className="mt-1 text-sm text-gray-600">{review.professionalReply}</p>
        </div>
      )}
    </div>
  )
}
