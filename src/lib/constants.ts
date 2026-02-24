export const APP_NAME = 'MedHub'
export const APP_DESCRIPTION = 'Plataforma de gestão para profissionais de saúde'

export const PLANS = {
  free: {
    id: 'free',
    name: 'Gratuito',
    price: 0,
    features: [
      'Perfil profissional básico',
      'Até 10 agendamentos por mês',
      'Listagem no marketplace',
      'Receber avaliações',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Profissional',
    price: 9900, // R$ 99,00 in cents
    features: [
      'Tudo do plano Gratuito',
      'Agendamentos ilimitados',
      'Prontuário eletrônico',
      'Envio de documentos',
      'Chat com pacientes',
      'Relatórios e estatísticas',
      'Destaque no marketplace',
      'Suporte prioritário',
    ],
  },
  clinic: {
    id: 'clinic',
    name: 'Clínica',
    price: 24900, // R$ 249,00 in cents
    features: [
      'Tudo do plano Profissional',
      'Gestão de equipe (até 10 profissionais)',
      'Agenda compartilhada',
      'Gestão financeira',
      'Painel administrativo',
      'Formulários personalizados',
      'Marca própria (white-label)',
      'API de integração',
      'Suporte dedicado',
    ],
  },
} as const

export const SPECIALTIES_ICONS: Record<string, string> = {
  medicina: 'Stethoscope',
  psicologia: 'Brain',
  nutricao: 'Apple',
  fisioterapia: 'Activity',
  fonoaudiologia: 'Ear',
  odontologia: 'Smile',
  enfermagem: 'HeartPulse',
  educacao_fisica: 'Dumbbell',
  terapia_ocupacional: 'Hand',
  farmacia: 'Pill',
  biomedicina: 'Microscope',
  veterinaria: 'PawPrint',
}

export const APPOINTMENT_STATUS_COLORS: Record<string, string> = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
  no_show: 'bg-orange-100 text-orange-800',
  rescheduled: 'bg-purple-100 text-purple-800',
}

export const DAYS_OF_WEEK = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const

export const REGISTRATION_TYPES = [
  'CRM',
  'CRP',
  'CRN',
  'CREFITO',
  'CRFa',
  'CREF',
] as const

export const BRAZILIAN_STATES = [
  { value: 'AC', label: 'Acre' },
  { value: 'AL', label: 'Alagoas' },
  { value: 'AP', label: 'Amapá' },
  { value: 'AM', label: 'Amazonas' },
  { value: 'BA', label: 'Bahia' },
  { value: 'CE', label: 'Ceará' },
  { value: 'DF', label: 'Distrito Federal' },
  { value: 'ES', label: 'Espírito Santo' },
  { value: 'GO', label: 'Goiás' },
  { value: 'MA', label: 'Maranhão' },
  { value: 'MT', label: 'Mato Grosso' },
  { value: 'MS', label: 'Mato Grosso do Sul' },
  { value: 'MG', label: 'Minas Gerais' },
  { value: 'PA', label: 'Pará' },
  { value: 'PB', label: 'Paraíba' },
  { value: 'PR', label: 'Paraná' },
  { value: 'PE', label: 'Pernambuco' },
  { value: 'PI', label: 'Piauí' },
  { value: 'RJ', label: 'Rio de Janeiro' },
  { value: 'RN', label: 'Rio Grande do Norte' },
  { value: 'RS', label: 'Rio Grande do Sul' },
  { value: 'RO', label: 'Rondônia' },
  { value: 'RR', label: 'Roraima' },
  { value: 'SC', label: 'Santa Catarina' },
  { value: 'SP', label: 'São Paulo' },
  { value: 'SE', label: 'Sergipe' },
  { value: 'TO', label: 'Tocantins' },
] as const

export const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB

export const ACCEPTED_FILE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
] as const

export const PAGINATION_DEFAULT = 20
