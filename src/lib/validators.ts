import { z } from 'zod'
import { slugify } from './utils'

// Auth ---------------------------------------------------------------

export const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
})
export type LoginInput = z.infer<typeof loginSchema>

export const cadastroBaseSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome completo'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'A senha precisa ter ao menos 6 caracteres'),
  consentimentoLgpd: z.literal(true, {
    message: 'É preciso aceitar o tratamento de dados (LGPD)',
  }),
})

export const cadastroPacienteSchema = cadastroBaseSchema.extend({
  papel: z.literal('paciente'),
})

export const cadastroNutriSchema = cadastroBaseSchema.extend({
  papel: z.literal('nutricionista'),
  crn: z.string().min(3, 'Informe o número do CRN'),
})

export const cadastroSchema = z.discriminatedUnion('papel', [
  cadastroPacienteSchema,
  cadastroNutriSchema,
])
export type CadastroInput = z.infer<typeof cadastroSchema>

// Perfil do nutri (F1) ------------------------------------------------

export const perfilNutriSchema = z.object({
  nome: z.string().min(2, 'Informe seu nome completo'),
  bio: z.string().max(2000).optional().or(z.literal('')),
  crn: z.string().min(3, 'Informe o CRN'),
  slug: z
    .string()
    .min(3, 'Slug muito curto')
    .max(64)
    .regex(/^[a-z0-9-]+$/, 'Use apenas letras minúsculas, números e hífens'),
  valor_consulta_centavos: z.number().int().nonnegative('Valor inválido'),
  duracao_consulta_min: z
    .number()
    .int()
    .min(15, 'Mínimo 15 minutos')
    .max(240, 'Máximo 240 minutos'),
  ativo: z.boolean(),
  especialidades: z.array(z.string().uuid()),
})
export type PerfilNutriInput = z.infer<typeof perfilNutriSchema>

// Disponibilidade (F2) ------------------------------------------------

export const disponibilidadeSchema = z
  .object({
    dia_semana: z.number().int().min(0).max(6),
    hora_inicio: z.string().regex(/^\d{2}:\d{2}$/, 'Use formato HH:mm'),
    hora_fim: z.string().regex(/^\d{2}:\d{2}$/, 'Use formato HH:mm'),
  })
  .refine((d) => d.hora_inicio < d.hora_fim, {
    message: 'A hora final precisa ser maior que a inicial',
    path: ['hora_fim'],
  })
export type DisponibilidadeInput = z.infer<typeof disponibilidadeSchema>

// Anamnese / prontuário (F6) ------------------------------------------

export const anamneseSchema = z.object({
  historico: z.string().max(5000).optional().or(z.literal('')),
  rotina: z.string().max(5000).optional().or(z.literal('')),
  restricoes: z.string().max(2000).optional().or(z.literal('')),
  alergias: z.string().max(2000).optional().or(z.literal('')),
  medicamentos: z.string().max(2000).optional().or(z.literal('')),
})
export type AnamneseInput = z.infer<typeof anamneseSchema>

// Avaliação antropométrica (F9) ---------------------------------------

// Os campos numéricos usam `register('x', { valueAsNumber: true })`, então o
// schema espera `number | null | undefined` — sem coerce.
export const avaliacaoSchema = z.object({
  data: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
  peso_kg: z.number().min(0).max(500).nullable().optional(),
  altura_cm: z.number().min(0).max(300).nullable().optional(),
  percentual_gordura: z.number().min(0).max(100).nullable().optional(),
  circunferencias: z
    .object({
      cintura: z.number().nullable().optional(),
      quadril: z.number().nullable().optional(),
      braco: z.number().nullable().optional(),
      coxa: z.number().nullable().optional(),
    })
    .partial()
    .optional(),
  observacoes: z.string().max(2000).optional().or(z.literal('')),
})
export type AvaliacaoInput = z.infer<typeof avaliacaoSchema>

// Plano alimentar (F7) ------------------------------------------------

export const planoSchema = z.object({
  titulo: z.string().min(2, 'Informe um título'),
  data_inicio: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida'),
  data_fim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida')
    .optional()
    .or(z.literal('')),
  observacoes: z.string().max(2000).optional().or(z.literal('')),
})
export type PlanoInput = z.infer<typeof planoSchema>

export { slugify }
