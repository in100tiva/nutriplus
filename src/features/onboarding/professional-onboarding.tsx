import { useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Upload,
  Camera,
  User,
  Clock,
  Calendar,
  FileText,
} from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/use-auth'
import { toastSuccess, toastError } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  REGISTRATION_TYPES,
  BRAZILIAN_STATES,
  DAYS_OF_WEEK,
} from '@/lib/constants'

// ─── Types ──────────────────────────────────────────────────────

interface ProfessionalInfo {
  registrationType: string
  registrationNumber: string
  registrationState: string
  specialty: string
}

interface AboutInfo {
  bio: string
  shortDescription: string
  consultationPrice: string
  consultationDuration: string
}

interface DayConfig {
  enabled: boolean
  startTime: string
  endTime: string
}

type WeekSchedule = Record<string, DayConfig>

const SPECIALTIES = [
  { value: 'medicina', label: 'Medicina' },
  { value: 'psicologia', label: 'Psicologia' },
  { value: 'nutricao', label: 'Nutrição' },
  { value: 'fisioterapia', label: 'Fisioterapia' },
  { value: 'fonoaudiologia', label: 'Fonoaudiologia' },
  { value: 'odontologia', label: 'Odontologia' },
  { value: 'enfermagem', label: 'Enfermagem' },
  { value: 'educacao_fisica', label: 'Educação Física' },
  { value: 'terapia_ocupacional', label: 'Terapia Ocupacional' },
  { value: 'farmacia', label: 'Farmácia' },
  { value: 'biomedicina', label: 'Biomedicina' },
  { value: 'veterinaria', label: 'Veterinária' },
]

const STEPS = [
  { label: 'Registro', icon: FileText },
  { label: 'Sobre', icon: User },
  { label: 'Agenda', icon: Calendar },
  { label: 'Foto', icon: Camera },
]

const DEFAULT_SCHEDULE: WeekSchedule = {
  monday: { enabled: true, startTime: '08:00', endTime: '18:00' },
  tuesday: { enabled: true, startTime: '08:00', endTime: '18:00' },
  wednesday: { enabled: true, startTime: '08:00', endTime: '18:00' },
  thursday: { enabled: true, startTime: '08:00', endTime: '18:00' },
  friday: { enabled: true, startTime: '08:00', endTime: '18:00' },
  saturday: { enabled: false, startTime: '08:00', endTime: '12:00' },
  sunday: { enabled: false, startTime: '', endTime: '' },
}

const DAY_KEYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

// ─── Component ──────────────────────────────────────────────────

export function ProfessionalOnboarding() {
  const navigate = useNavigate()
  const { user, profile } = useAuth()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [currentStep, setCurrentStep] = useState(0)
  const [saving, setSaving] = useState(false)

  // Step 1: Professional info
  const [professionalInfo, setProfessionalInfo] = useState<ProfessionalInfo>({
    registrationType: '',
    registrationNumber: '',
    registrationState: '',
    specialty: '',
  })

  // Step 2: About
  const [aboutInfo, setAboutInfo] = useState<AboutInfo>({
    bio: '',
    shortDescription: '',
    consultationPrice: '',
    consultationDuration: '50',
  })

  // Step 3: Schedule
  const [schedule, setSchedule] = useState<WeekSchedule>(DEFAULT_SCHEDULE)

  // Step 4: Photo
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(null)

  // ─── Step 1 validation ─────────────────────────────────────────
  const isStep1Valid =
    professionalInfo.registrationType !== '' &&
    professionalInfo.registrationNumber.trim() !== '' &&
    professionalInfo.registrationState !== '' &&
    professionalInfo.specialty !== ''

  // ─── Step 2 validation ─────────────────────────────────────────
  const isStep2Valid = aboutInfo.shortDescription.trim().length >= 10

  // ─── Navigation ────────────────────────────────────────────────
  function handleNext() {
    if (currentStep < STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  function canAdvance(): boolean {
    if (currentStep === 0) return isStep1Valid
    if (currentStep === 1) return isStep2Valid
    return true
  }

  // ─── Photo handling ────────────────────────────────────────────
  function handlePhotoSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      toastError('Arquivo muito grande', 'A foto deve ter no máximo 5MB')
      return
    }

    setPhotoFile(file)
    const reader = new FileReader()
    reader.onload = () => setPhotoPreview(reader.result as string)
    reader.readAsDataURL(file)
  }

  // ─── Schedule handling ─────────────────────────────────────────
  function toggleDay(dayKey: string) {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        enabled: !prev[dayKey].enabled,
      },
    }))
  }

  function updateDayTime(dayKey: string, field: 'startTime' | 'endTime', value: string) {
    setSchedule((prev) => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        [field]: value,
      },
    }))
  }

  // ─── Submit ────────────────────────────────────────────────────
  async function handleComplete() {
    if (!user || !profile) return
    setSaving(true)

    try {
      // Upload photo if selected
      let avatarUrl: string | null = null
      if (photoFile) {
        const fileExt = photoFile.name.split('.').pop()
        const filePath = `avatars/${user.id}.${fileExt}`
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, photoFile, { upsert: true })

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('avatars')
            .getPublicUrl(filePath)
          avatarUrl = urlData.publicUrl
        }
      }

      // Build weekly schedule
      const weeklySchedule = Object.fromEntries(
        DAY_KEYS.map((day) => [
          day,
          {
            enabled: schedule[day].enabled,
            slots: schedule[day].enabled
              ? [{ startTime: schedule[day].startTime, endTime: schedule[day].endTime }]
              : [],
          },
        ]),
      )

      // Parse price
      const priceCents = aboutInfo.consultationPrice
        ? Math.round(parseFloat(aboutInfo.consultationPrice.replace(',', '.')) * 100)
        : null

      // Create professional profile
      const { error: profileError } = await supabase.from('professional_profiles').insert({
        profile_id: user.id,
        display_name: profile.full_name,
        registration_type: professionalInfo.registrationType,
        registration_number: professionalInfo.registrationNumber,
        registration_state: professionalInfo.registrationState,
        specialty: professionalInfo.specialty,
        bio: aboutInfo.bio || null,
        phone: '',
        consultation_price_cents: priceCents,
        consultation_duration_minutes: parseInt(aboutInfo.consultationDuration) || 50,
        accepts_insurance: false,
        offers_telemedicine: false,
      })

      if (profileError) throw profileError

      // Update avatar if uploaded
      if (avatarUrl) {
        await supabase
          .from('profiles')
          .update({ avatar_url: avatarUrl })
          .eq('id', user.id)
      }

      // Save schedule config
      const { data: proProfile } = await supabase
        .from('professional_profiles')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (proProfile) {
        await supabase.from('schedule_configs').insert({
          professional_id: proProfile.id,
          weekly_schedule: weeklySchedule,
          slot_duration_minutes: parseInt(aboutInfo.consultationDuration) || 50,
          buffer_minutes: 0,
          advance_booking_days: 30,
        })
      }

      toastSuccess('Perfil criado com sucesso!', 'Bem-vindo ao MedHub')
      navigate('/pro', { replace: true })
    } catch (err) {
      console.error('Erro ao salvar perfil profissional:', err)
      toastError('Erro ao salvar', 'Tente novamente mais tarde')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Header */}
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto flex h-16 max-w-3xl items-center gap-3 px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold text-white">
            M
          </div>
          <span className="text-lg font-semibold tracking-tight text-gray-900">
            MedHub
          </span>
          <span className="ml-2 text-sm text-gray-500">Configuração do perfil</span>
        </div>
      </header>

      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-8">
        {/* Progress bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {STEPS.map((step, index) => {
              const Icon = step.icon
              const isCompleted = index < currentStep
              const isCurrent = index === currentStep

              return (
                <div key={step.label} className="flex flex-1 items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        'flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors',
                        isCompleted
                          ? 'border-sky-500 bg-sky-500 text-white'
                          : isCurrent
                            ? 'border-sky-500 bg-white text-sky-500'
                            : 'border-gray-300 bg-white text-gray-400',
                      )}
                    >
                      {isCompleted ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <Icon className="h-5 w-5" />
                      )}
                    </div>
                    <span
                      className={cn(
                        'mt-2 text-xs font-medium',
                        isCurrent ? 'text-sky-600' : 'text-gray-500',
                      )}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={cn(
                        'mx-2 h-0.5 flex-1 transition-colors',
                        index < currentStep ? 'bg-sky-500' : 'bg-gray-200',
                      )}
                    />
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Step content */}
        <Card>
          <CardContent className="p-6">
            {/* Step 1: Professional Info */}
            {currentStep === 0 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Informações profissionais
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Informe seus dados de registro profissional
                  </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Tipo de registro"
                    value={professionalInfo.registrationType}
                    onChange={(e) =>
                      setProfessionalInfo((prev) => ({
                        ...prev,
                        registrationType: e.target.value,
                      }))
                    }
                    placeholder="Selecione"
                  >
                    {REGISTRATION_TYPES.map((type) => (
                      <option key={type} value={type}>
                        {type}
                      </option>
                    ))}
                  </Select>

                  <Input
                    label="Número de registro"
                    placeholder="Ex: 123456"
                    value={professionalInfo.registrationNumber}
                    onChange={(e) =>
                      setProfessionalInfo((prev) => ({
                        ...prev,
                        registrationNumber: e.target.value,
                      }))
                    }
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Select
                    label="Estado do registro"
                    value={professionalInfo.registrationState}
                    onChange={(e) =>
                      setProfessionalInfo((prev) => ({
                        ...prev,
                        registrationState: e.target.value,
                      }))
                    }
                    placeholder="Selecione o estado"
                  >
                    {BRAZILIAN_STATES.map((state) => (
                      <option key={state.value} value={state.value}>
                        {state.label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Especialidade"
                    value={professionalInfo.specialty}
                    onChange={(e) =>
                      setProfessionalInfo((prev) => ({
                        ...prev,
                        specialty: e.target.value,
                      }))
                    }
                    placeholder="Selecione"
                  >
                    {SPECIALTIES.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            )}

            {/* Step 2: About */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Sobre você</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Essas informações serão exibidas no seu perfil público
                  </p>
                </div>

                <Input
                  label="Descrição curta"
                  placeholder="Ex: Nutricionista esportiva com 10 anos de experiência"
                  helperText="Será exibida nos resultados de busca (mínimo 10 caracteres)"
                  value={aboutInfo.shortDescription}
                  onChange={(e) =>
                    setAboutInfo((prev) => ({
                      ...prev,
                      shortDescription: e.target.value,
                    }))
                  }
                />

                <Textarea
                  label="Biografia"
                  placeholder="Conte um pouco sobre sua formação, experiência e abordagem..."
                  helperText="Opcional. Máximo 2000 caracteres"
                  value={aboutInfo.bio}
                  onChange={(e) =>
                    setAboutInfo((prev) => ({ ...prev, bio: e.target.value }))
                  }
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Valor da consulta (R$)"
                    placeholder="Ex: 250,00"
                    helperText="Opcional. Informe o valor em reais"
                    value={aboutInfo.consultationPrice}
                    onChange={(e) =>
                      setAboutInfo((prev) => ({
                        ...prev,
                        consultationPrice: e.target.value,
                      }))
                    }
                  />

                  <Select
                    label="Duração da consulta"
                    value={aboutInfo.consultationDuration}
                    onChange={(e) =>
                      setAboutInfo((prev) => ({
                        ...prev,
                        consultationDuration: e.target.value,
                      }))
                    }
                  >
                    <option value="30">30 minutos</option>
                    <option value="40">40 minutos</option>
                    <option value="50">50 minutos</option>
                    <option value="60">60 minutos</option>
                    <option value="90">90 minutos</option>
                    <option value="120">120 minutos</option>
                  </Select>
                </div>
              </div>
            )}

            {/* Step 3: Schedule */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">
                    Configuração de agenda
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Selecione os dias e horários em que você atende. Você pode
                    alterar isso depois.
                  </p>
                </div>

                <div className="flex flex-col gap-3">
                  {DAY_KEYS.map((dayKey, index) => {
                    const day = schedule[dayKey]
                    return (
                      <div
                        key={dayKey}
                        className={cn(
                          'flex flex-col gap-3 rounded-lg border p-4 transition-colors sm:flex-row sm:items-center',
                          day.enabled
                            ? 'border-sky-200 bg-sky-50/50'
                            : 'border-gray-200 bg-gray-50',
                        )}
                      >
                        <label className="flex min-w-[140px] cursor-pointer items-center gap-3">
                          <input
                            type="checkbox"
                            checked={day.enabled}
                            onChange={() => toggleDay(dayKey)}
                            className="h-4 w-4 rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                          />
                          <span
                            className={cn(
                              'text-sm font-medium',
                              day.enabled ? 'text-gray-900' : 'text-gray-400',
                            )}
                          >
                            {DAYS_OF_WEEK[index]}
                          </span>
                        </label>

                        {day.enabled && (
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-gray-400" />
                              <input
                                type="time"
                                value={day.startTime}
                                onChange={(e) =>
                                  updateDayTime(dayKey, 'startTime', e.target.value)
                                }
                                className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                              />
                            </div>
                            <span className="text-sm text-gray-400">até</span>
                            <input
                              type="time"
                              value={day.endTime}
                              onChange={(e) =>
                                updateDayTime(dayKey, 'endTime', e.target.value)
                              }
                              className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Step 4: Photo */}
            {currentStep === 3 && (
              <div className="flex flex-col items-center gap-6">
                <div className="text-center">
                  <h2 className="text-xl font-semibold text-gray-900">
                    Foto de perfil
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Adicione uma foto profissional para transmitir confiança aos
                    pacientes
                  </p>
                </div>

                <div
                  className={cn(
                    'flex h-40 w-40 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed transition-colors',
                    photoPreview
                      ? 'border-sky-300'
                      : 'border-gray-300 hover:border-sky-400',
                  )}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {photoPreview ? (
                    <img
                      src={photoPreview}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-2 text-gray-400">
                      <Upload className="h-8 w-8" />
                      <span className="text-xs">Clique para enviar</span>
                    </div>
                  )}
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />

                {photoPreview && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setPhotoFile(null)
                      setPhotoPreview(null)
                    }}
                  >
                    Remover foto
                  </Button>
                )}

                <p className="text-xs text-gray-400">
                  Formatos aceitos: JPG, PNG, WebP. Tamanho máximo: 5MB
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation buttons */}
        <div className="mt-6 flex items-center justify-between">
          <Button
            variant="ghost"
            onClick={handlePrev}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4" />
            Anterior
          </Button>

          {currentStep < STEPS.length - 1 ? (
            <Button onClick={handleNext} disabled={!canAdvance()}>
              Próximo
              <ChevronRight className="h-4 w-4" />
            </Button>
          ) : (
            <Button onClick={handleComplete} loading={saving}>
              Concluir
              <Check className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
