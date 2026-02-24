import { useState } from 'react'
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  ChevronRight,
  ChevronLeft,
  FileText,
  MapPin,
  BadgeCheck,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  Input,
  Textarea,
  Select,
} from '@/components/ui'

/* ─── Types ───────────────────────────────────────────────────── */

type BookingStep = 1 | 2 | 3 | 4

interface FormField {
  id: string
  label: string
  type: 'text' | 'textarea' | 'select'
  required: boolean
  placeholder: string
  options?: string[]
}

/* ─── Mock Data ───────────────────────────────────────────────── */

const PROFESSIONAL = {
  id: '1',
  name: 'Dra. Ana Carolina Mendes',
  avatar: null as string | null,
  specialty: 'Nutricionista Clinico',
  verified: true,
  crn: 'CRN-3 12345',
  city: 'Sao Paulo',
  state: 'SP',
  priceInCents: 25000,
  durationMinutes: 50,
}

const SELECTED_DATE = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
const SELECTED_TIME = '14:00'

const ANAMNESIS_FIELDS: FormField[] = [
  {
    id: 'objective',
    label: 'Qual seu principal objetivo com a consulta?',
    type: 'select',
    required: true,
    placeholder: 'Selecione...',
    options: [
      'Emagrecimento',
      'Ganho de massa muscular',
      'Reeducacao alimentar',
      'Tratamento de doenca',
      'Acompanhamento gestacional',
      'Outro',
    ],
  },
  {
    id: 'health_conditions',
    label: 'Possui alguma condicao de saude ou doenca diagnosticada?',
    type: 'textarea',
    required: true,
    placeholder: 'Ex: diabetes, hipertensao, hipotireoidismo...',
  },
  {
    id: 'medications',
    label: 'Utiliza algum medicamento ou suplemento atualmente?',
    type: 'textarea',
    required: false,
    placeholder: 'Liste os medicamentos e suplementos...',
  },
  {
    id: 'allergies',
    label: 'Possui alergias ou intolerancias alimentares?',
    type: 'text',
    required: true,
    placeholder: 'Ex: lactose, gluten, frutos do mar...',
  },
  {
    id: 'routine',
    label: 'Descreva brevemente sua rotina alimentar atual',
    type: 'textarea',
    required: false,
    placeholder: 'Como e sua alimentacao no dia a dia...',
  },
]

/* ─── Helpers ─────────────────────────────────────────────────── */

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDateBR(date: Date): string {
  return date.toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

const STEP_LABELS: Record<BookingStep, string> = {
  1: 'Confirmar Data',
  2: 'Formulario',
  3: 'Pagamento',
  4: 'Confirmacao',
}

const STEP_ICONS: Record<BookingStep, typeof Calendar> = {
  1: Calendar,
  2: FileText,
  3: CreditCard,
  4: CheckCircle,
}

/* ─── Component ───────────────────────────────────────────────── */

export function BookingFlow() {
  const [currentStep, setCurrentStep] = useState<BookingStep>(1)
  const [formData, setFormData] = useState<Record<string, string>>({})
  const [paymentMethod, setPaymentMethod] = useState<'external' | 'pix' | 'card'>('external')

  function goNext() {
    if (currentStep < 4) setCurrentStep((s) => (s + 1) as BookingStep)
  }

  function goPrev() {
    if (currentStep > 1) setCurrentStep((s) => (s - 1) as BookingStep)
  }

  function handleFormChange(fieldId: string, value: string) {
    setFormData((prev) => ({ ...prev, [fieldId]: value }))
  }

  const isStep2Valid = ANAMNESIS_FIELDS.filter((f) => f.required).every(
    (f) => formData[f.id]?.trim(),
  )

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-2xl font-bold text-gray-900">Agendar Consulta</h1>

        {/* ─── Progress Bar ───────────────────────────────────── */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {([1, 2, 3, 4] as BookingStep[]).map((step) => {
              const Icon = STEP_ICONS[step]
              const isCompleted = currentStep > step
              const isCurrent = currentStep === step

              return (
                <div key={step} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
                        isCompleted
                          ? 'border-green-500 bg-green-500 text-white'
                          : isCurrent
                            ? 'border-blue-500 bg-blue-500 text-white'
                            : 'border-gray-300 bg-white text-gray-400'
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={`mt-2 text-xs font-medium ${
                        isCurrent ? 'text-blue-600' : isCompleted ? 'text-green-600' : 'text-gray-400'
                      }`}
                    >
                      {STEP_LABELS[step]}
                    </span>
                  </div>

                  {step < 4 && (
                    <div
                      className={`mx-2 hidden h-0.5 flex-1 sm:block ${
                        currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* ─── Main Content Area ────────────────────────────── */}
          <div className="lg:col-span-2">
            {currentStep === 1 && (
              <StepConfirmDateTime onNext={goNext} />
            )}
            {currentStep === 2 && (
              <StepForm
                fields={ANAMNESIS_FIELDS}
                formData={formData}
                onChange={handleFormChange}
                onNext={goNext}
                onPrev={goPrev}
                isValid={isStep2Valid}
              />
            )}
            {currentStep === 3 && (
              <StepPayment
                paymentMethod={paymentMethod}
                onMethodChange={setPaymentMethod}
                onNext={goNext}
                onPrev={goPrev}
              />
            )}
            {currentStep === 4 && <StepConfirmation />}
          </div>

          {/* ─── Professional Sidebar ─────────────────────────── */}
          <div>
            <Card className="sticky top-8">
              <CardContent className="p-6">
                <div className="flex items-center gap-3">
                  <Avatar name={PROFESSIONAL.name} src={PROFESSIONAL.avatar} size="lg" />
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {PROFESSIONAL.name}
                      </h3>
                      {PROFESSIONAL.verified && (
                        <BadgeCheck className="h-4 w-4 text-blue-500" />
                      )}
                    </div>
                    <Badge variant="info" size="sm" className="mt-1">
                      {PROFESSIONAL.specialty}
                    </Badge>
                  </div>
                </div>

                <div className="mt-4 space-y-3 rounded-lg bg-gray-50 p-4">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">{formatDateBR(SELECTED_DATE)}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      {SELECTED_TIME} - {PROFESSIONAL.durationMinutes} min
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <span className="text-gray-700">
                      {PROFESSIONAL.city}, {PROFESSIONAL.state}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-4">
                  <span className="text-sm text-gray-500">Total</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatPrice(PROFESSIONAL.priceInCents)}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─── Step 1: Confirm Date/Time ───────────────────────────────── */

function StepConfirmDateTime({ onNext }: { onNext: () => void }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Confirme a data e horario</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-100">
              <Calendar className="h-7 w-7 text-blue-600" />
            </div>
            <div>
              <p className="text-lg font-semibold text-blue-900">
                {formatDateBR(SELECTED_DATE)}
              </p>
              <p className="text-sm text-blue-700">
                Horario: {SELECTED_TIME} - Duracao: {PROFESSIONAL.durationMinutes} minutos
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-yellow-50 p-4">
          <p className="text-sm text-yellow-800">
            <strong>Importante:</strong> Caso precise cancelar ou reagendar, faca com pelo menos 24
            horas de antecedencia para evitar cobranças.
          </p>
        </div>

        <div className="flex justify-end">
          <Button onClick={onNext}>
            Confirmar e continuar
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Step 2: Fill Form ───────────────────────────────────────── */

function StepForm({
  fields,
  formData,
  onChange,
  onNext,
  onPrev,
  isValid,
}: {
  fields: FormField[]
  formData: Record<string, string>
  onChange: (id: string, value: string) => void
  onNext: () => void
  onPrev: () => void
  isValid: boolean
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Formulario pre-consulta</CardTitle>
        <p className="text-sm text-gray-500">
          Preencha as informacoes abaixo para que a profissional possa se preparar para sua consulta.
        </p>
      </CardHeader>
      <CardContent className="space-y-5">
        {fields.map((field) => {
          if (field.type === 'select') {
            return (
              <Select
                key={field.id}
                label={`${field.label}${field.required ? ' *' : ''}`}
                value={formData[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder}
              >
                {field.options?.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </Select>
            )
          }

          if (field.type === 'textarea') {
            return (
              <Textarea
                key={field.id}
                label={`${field.label}${field.required ? ' *' : ''}`}
                value={formData[field.id] || ''}
                onChange={(e) => onChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                rows={3}
              />
            )
          }

          return (
            <Input
              key={field.id}
              label={`${field.label}${field.required ? ' *' : ''}`}
              value={formData[field.id] || ''}
              onChange={(e) => onChange(field.id, e.target.value)}
              placeholder={field.placeholder}
            />
          )
        })}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button onClick={onNext} disabled={!isValid}>
            Continuar
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Step 3: Payment ─────────────────────────────────────────── */

function StepPayment({
  paymentMethod,
  onMethodChange,
  onNext,
  onPrev,
}: {
  paymentMethod: 'external' | 'pix' | 'card'
  onMethodChange: (m: 'external' | 'pix' | 'card') => void
  onNext: () => void
  onPrev: () => void
}) {
  const methods = [
    {
      id: 'external' as const,
      label: 'Pagamento externo',
      description: 'Combine o pagamento diretamente com o profissional',
    },
    {
      id: 'pix' as const,
      label: 'PIX',
      description: 'Pagamento instantaneo via PIX',
    },
    {
      id: 'card' as const,
      label: 'Cartao de credito',
      description: 'Parcele em ate 3x sem juros',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Forma de pagamento</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {methods.map((method) => (
          <button
            key={method.id}
            type="button"
            onClick={() => onMethodChange(method.id)}
            className={`flex w-full items-center gap-4 rounded-lg border-2 p-4 text-left transition-colors ${
              paymentMethod === method.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div
              className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${
                paymentMethod === method.id
                  ? 'border-blue-500'
                  : 'border-gray-300'
              }`}
            >
              {paymentMethod === method.id && (
                <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
              )}
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">{method.label}</p>
              <p className="text-xs text-gray-500">{method.description}</p>
            </div>
          </button>
        ))}

        {paymentMethod === 'pix' && (
          <div className="rounded-lg bg-gray-50 p-4 text-center">
            <p className="text-sm text-gray-600">
              O QR Code do PIX sera gerado apos a confirmacao do agendamento.
            </p>
          </div>
        )}

        {paymentMethod === 'card' && (
          <div className="space-y-4 rounded-lg border bg-gray-50 p-4">
            <Input label="Numero do cartao" placeholder="0000 0000 0000 0000" />
            <div className="grid grid-cols-2 gap-4">
              <Input label="Validade" placeholder="MM/AA" />
              <Input label="CVV" placeholder="123" />
            </div>
            <Input label="Nome no cartao" placeholder="Como aparece no cartao" />
          </div>
        )}

        <div className="flex justify-between pt-4">
          <Button variant="outline" onClick={onPrev}>
            <ChevronLeft className="h-4 w-4" />
            Voltar
          </Button>
          <Button onClick={onNext}>
            Confirmar agendamento
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Step 4: Confirmation ────────────────────────────────────── */

function StepConfirmation() {
  return (
    <Card>
      <CardContent className="flex flex-col items-center px-6 py-12 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>

        <h2 className="mt-6 text-xl font-bold text-gray-900">Consulta agendada com sucesso!</h2>

        <p className="mt-2 max-w-md text-sm text-gray-500">
          Sua consulta com <strong>{PROFESSIONAL.name}</strong> foi confirmada. Voce recebera um
          e-mail com todos os detalhes.
        </p>

        <div className="mt-6 w-full max-w-sm rounded-lg bg-gray-50 p-4">
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Data</span>
              <span className="font-medium text-gray-900">{formatDateBR(SELECTED_DATE)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Horario</span>
              <span className="font-medium text-gray-900">{SELECTED_TIME}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Duracao</span>
              <span className="font-medium text-gray-900">
                {PROFESSIONAL.durationMinutes} minutos
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Valor</span>
              <span className="font-medium text-gray-900">
                {formatPrice(PROFESSIONAL.priceInCents)}
              </span>
            </div>
          </div>
        </div>

        <div className="mt-8 flex gap-3">
          <Button variant="outline">Ver minhas consultas</Button>
          <Button>Voltar ao inicio</Button>
        </div>
      </CardContent>
    </Card>
  )
}
