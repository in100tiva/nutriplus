import { z } from 'zod'
import { REGISTRATION_TYPES } from './constants'

// ─── Auth Schemas ────────────────────────────────────────────────

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório')
    .email('E-mail inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export type LoginInput = z.infer<typeof loginSchema>

export const registerSchema = z
  .object({
    fullName: z
      .string()
      .min(1, 'Nome completo é obrigatório')
      .min(3, 'Nome deve ter no mínimo 3 caracteres')
      .max(120, 'Nome deve ter no máximo 120 caracteres'),
    email: z
      .string()
      .min(1, 'E-mail é obrigatório')
      .email('E-mail inválido'),
    password: z
      .string()
      .min(1, 'Senha é obrigatória')
      .min(8, 'Senha deve ter no mínimo 8 caracteres')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Senha deve conter pelo menos uma letra maiúscula, uma minúscula e um número'
      ),
    confirmPassword: z
      .string()
      .min(1, 'Confirmação de senha é obrigatória'),
    role: z.enum(['patient', 'professional'], {
      required_error: 'Selecione o tipo de conta',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  })

export type RegisterInput = z.infer<typeof registerSchema>

// ─── Professional Profile Schema ─────────────────────────────────

export const professionalProfileSchema = z.object({
  displayName: z
    .string()
    .min(1, 'Nome de exibição é obrigatório')
    .max(120, 'Nome deve ter no máximo 120 caracteres'),
  registrationType: z.enum(REGISTRATION_TYPES as unknown as [string, ...string[]], {
    required_error: 'Tipo de registro é obrigatório',
  }),
  registrationNumber: z
    .string()
    .min(1, 'Número de registro é obrigatório')
    .max(20, 'Número de registro deve ter no máximo 20 caracteres'),
  registrationState: z
    .string()
    .length(2, 'Selecione o estado do registro'),
  specialty: z
    .string()
    .min(1, 'Especialidade é obrigatória'),
  bio: z
    .string()
    .max(2000, 'Biografia deve ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .regex(/^\d+$/, 'Telefone deve conter apenas números'),
  consultationPriceCents: z
    .number()
    .int('Valor deve ser um número inteiro')
    .min(0, 'Valor não pode ser negativo')
    .optional(),
  consultationDurationMinutes: z
    .number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima é 15 minutos')
    .max(240, 'Duração máxima é 240 minutos')
    .optional(),
  acceptsInsurance: z.boolean().default(false),
  acceptedInsurances: z
    .array(z.string())
    .optional()
    .default([]),
  address: z
    .object({
      street: z.string().optional().or(z.literal('')),
      number: z.string().optional().or(z.literal('')),
      complement: z.string().optional().or(z.literal('')),
      neighborhood: z.string().optional().or(z.literal('')),
      city: z.string().min(1, 'Cidade é obrigatória'),
      state: z.string().length(2, 'Selecione o estado'),
      zipCode: z
        .string()
        .regex(/^\d{8}$/, 'CEP deve conter 8 dígitos')
        .optional()
        .or(z.literal('')),
    })
    .optional(),
  offersTelemedicine: z.boolean().default(false),
  languages: z
    .array(z.string())
    .optional()
    .default([]),
})

export type ProfessionalProfileInput = z.infer<typeof professionalProfileSchema>

// ─── Organization Schema ─────────────────────────────────────────

export const organizationSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome da organização é obrigatório')
    .max(200, 'Nome deve ter no máximo 200 caracteres'),
  slug: z
    .string()
    .min(1, 'Slug é obrigatório')
    .max(100, 'Slug deve ter no máximo 100 caracteres')
    .regex(/^[a-z0-9-]+$/, 'Slug deve conter apenas letras minúsculas, números e hifens'),
  cnpj: z
    .string()
    .regex(/^\d{14}$/, 'CNPJ deve conter 14 dígitos')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .min(10, 'Telefone deve ter no mínimo 10 dígitos')
    .max(15, 'Telefone deve ter no máximo 15 dígitos')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('E-mail inválido')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),
  address: z
    .object({
      street: z.string().optional().or(z.literal('')),
      number: z.string().optional().or(z.literal('')),
      complement: z.string().optional().or(z.literal('')),
      neighborhood: z.string().optional().or(z.literal('')),
      city: z.string().min(1, 'Cidade é obrigatória'),
      state: z.string().length(2, 'Selecione o estado'),
      zipCode: z
        .string()
        .regex(/^\d{8}$/, 'CEP deve conter 8 dígitos')
        .optional()
        .or(z.literal('')),
    })
    .optional(),
})

export type OrganizationInput = z.infer<typeof organizationSchema>

// ─── Appointment Schema ──────────────────────────────────────────

export const appointmentSchema = z.object({
  professionalId: z
    .string()
    .uuid('ID do profissional inválido'),
  patientId: z
    .string()
    .uuid('ID do paciente inválido'),
  date: z
    .string()
    .min(1, 'Data é obrigatória')
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD'),
  startTime: z
    .string()
    .min(1, 'Horário de início é obrigatório')
    .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:mm'),
  endTime: z
    .string()
    .min(1, 'Horário de término é obrigatório')
    .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:mm'),
  type: z.enum(['in_person', 'telemedicine'], {
    required_error: 'Tipo de consulta é obrigatório',
  }),
  reason: z
    .string()
    .max(500, 'Motivo deve ter no máximo 500 caracteres')
    .optional()
    .or(z.literal('')),
  notes: z
    .string()
    .max(2000, 'Observações devem ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),
  priceCents: z
    .number()
    .int('Valor deve ser um número inteiro')
    .min(0, 'Valor não pode ser negativo')
    .optional(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>

// ─── Review Schema ───────────────────────────────────────────────

export const reviewSchema = z.object({
  rating: z
    .number()
    .int('Avaliação deve ser um número inteiro')
    .min(1, 'Avaliação mínima é 1 estrela')
    .max(5, 'Avaliação máxima é 5 estrelas'),
  comment: z
    .string()
    .max(2000, 'Comentário deve ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),
})

export type ReviewInput = z.infer<typeof reviewSchema>

// ─── Schedule Config Schema ──────────────────────────────────────

const timeSlotSchema = z.object({
  startTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:mm'),
  endTime: z
    .string()
    .regex(/^\d{2}:\d{2}$/, 'Horário deve estar no formato HH:mm'),
})

const dayScheduleSchema = z.object({
  enabled: z.boolean(),
  slots: z.array(timeSlotSchema),
})

export const scheduleConfigSchema = z.object({
  weeklySchedule: z.object({
    sunday: dayScheduleSchema,
    monday: dayScheduleSchema,
    tuesday: dayScheduleSchema,
    wednesday: dayScheduleSchema,
    thursday: dayScheduleSchema,
    friday: dayScheduleSchema,
    saturday: dayScheduleSchema,
  }),
  slotDurationMinutes: z
    .number()
    .int('Duração deve ser um número inteiro')
    .min(15, 'Duração mínima é 15 minutos')
    .max(240, 'Duração máxima é 240 minutos'),
  bufferMinutes: z
    .number()
    .int('Intervalo deve ser um número inteiro')
    .min(0, 'Intervalo não pode ser negativo')
    .max(60, 'Intervalo máximo é 60 minutos')
    .default(0),
  advanceBookingDays: z
    .number()
    .int('Antecedência deve ser um número inteiro')
    .min(1, 'Antecedência mínima é 1 dia')
    .max(365, 'Antecedência máxima é 365 dias')
    .default(30),
})

export type ScheduleConfigInput = z.infer<typeof scheduleConfigSchema>

// ─── Message Schema ──────────────────────────────────────────────

export const messageSchema = z.object({
  content: z
    .string()
    .min(1, 'Mensagem não pode estar vazia')
    .max(5000, 'Mensagem deve ter no máximo 5000 caracteres'),
})

export type MessageInput = z.infer<typeof messageSchema>

// ─── Task Schema ─────────────────────────────────────────────────

export const taskSchema = z.object({
  title: z
    .string()
    .min(1, 'Título é obrigatório')
    .max(200, 'Título deve ter no máximo 200 caracteres'),
  description: z
    .string()
    .max(2000, 'Descrição deve ter no máximo 2000 caracteres')
    .optional()
    .or(z.literal('')),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato AAAA-MM-DD')
    .optional()
    .or(z.literal('')),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Prioridade é obrigatória',
  }).default('medium'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled'], {
    required_error: 'Status é obrigatório',
  }).default('pending'),
  assigneeId: z
    .string()
    .uuid('ID do responsável inválido')
    .optional()
    .or(z.literal('')),
})

export type TaskInput = z.infer<typeof taskSchema>
