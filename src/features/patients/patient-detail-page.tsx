import { useState } from 'react'
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  ClipboardList,
  CheckCircle2,
  Circle,
  FileText,
  Upload,
  FileUp,
  ListChecks,
  Eye,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  EmptyState,
} from '@/components/ui'
import { formatDate, formatPhone } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface PatientInfo {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string | null
  status: 'active' | 'inactive'
  birthDate: string
  cpf: string
  gender: string
  address: string
  notes: string
  nextAppointment: string | null
}

interface ClinicalRecord {
  id: string
  date: string
  type: 'evolution' | 'anamnesis' | 'prescription'
  title: string
  preview: string
  professional: string
}

interface Appointment {
  id: string
  date: string
  time: string
  type: 'first' | 'follow_up' | 'return'
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled'
  duration: number
  notes: string
}

interface Task {
  id: string
  title: string
  type: string
  dueDate: string | null
  completed: boolean
  completedAt: string | null
}

interface Document {
  id: string
  name: string
  type: string
  size: string
  uploadedAt: string
  uploadedBy: string
}

interface FormSubmission {
  id: string
  formName: string
  submittedAt: string
  status: 'pending' | 'completed'
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PATIENT: PatientInfo = {
  id: '1',
  name: 'Ana Carolina Silva',
  email: 'ana.silva@email.com',
  phone: '11999887766',
  avatarUrl: null,
  status: 'active',
  birthDate: '1992-05-15',
  cpf: '123.456.789-00',
  gender: 'Feminino',
  address: 'Rua das Flores, 123 - São Paulo, SP',
  notes: 'Paciente com intolerância a lactose. Preferência por consultas no período da manhã.',
  nextAppointment: '2026-03-06',
}

const MOCK_CLINICAL_RECORDS: ClinicalRecord[] = [
  {
    id: 'cr1',
    date: '2026-02-20',
    type: 'evolution',
    title: 'Consulta de acompanhamento',
    preview: 'Paciente relata melhora significativa nos sintomas gastrointestinais após ajuste na dieta...',
    professional: 'Dr. Rafael Mendes',
  },
  {
    id: 'cr2',
    date: '2026-02-06',
    type: 'prescription',
    title: 'Prescrição de suplementos',
    preview: 'Vitamina D 2000UI/dia, Probiótico Lactobacillus 1 cápsula/dia em jejum...',
    professional: 'Dr. Rafael Mendes',
  },
  {
    id: 'cr3',
    date: '2026-01-15',
    type: 'evolution',
    title: 'Retorno mensal',
    preview: 'Peso: 62.3kg. Paciente mantém adesão ao plano alimentar. Relata mais disposição e melhora no sono...',
    professional: 'Dr. Rafael Mendes',
  },
  {
    id: 'cr4',
    date: '2025-12-10',
    type: 'anamnesis',
    title: 'Anamnese inicial',
    preview: 'Histórico familiar: mãe com diabetes tipo 2, pai hipertenso. Paciente com queixas de distensão abdominal...',
    professional: 'Dr. Rafael Mendes',
  },
]

const MOCK_APPOINTMENTS: Appointment[] = [
  {
    id: 'ap1',
    date: '2026-03-06',
    time: '09:00',
    type: 'follow_up',
    status: 'scheduled',
    duration: 30,
    notes: 'Trazer exames de sangue recentes',
  },
  {
    id: 'ap2',
    date: '2026-02-20',
    time: '09:00',
    type: 'follow_up',
    status: 'completed',
    duration: 45,
    notes: 'Acompanhamento mensal',
  },
  {
    id: 'ap3',
    date: '2026-01-15',
    time: '10:30',
    type: 'return',
    status: 'completed',
    duration: 30,
    notes: 'Retorno pós exames',
  },
  {
    id: 'ap4',
    date: '2025-12-10',
    time: '14:00',
    type: 'first',
    status: 'completed',
    duration: 60,
    notes: 'Primeira consulta',
  },
]

const MOCK_TASKS: Task[] = [
  {
    id: 't1',
    title: 'Registrar diário alimentar',
    type: 'Plano Alimentar',
    dueDate: '2026-03-01',
    completed: false,
    completedAt: null,
  },
  {
    id: 't2',
    title: 'Realizar exames laboratoriais',
    type: 'Geral',
    dueDate: '2026-03-05',
    completed: false,
    completedAt: null,
  },
  {
    id: 't3',
    title: 'Caminhar 30 min por dia',
    type: 'Exercício',
    dueDate: null,
    completed: false,
    completedAt: null,
  },
  {
    id: 't4',
    title: 'Enviar fotos das refeições',
    type: 'Plano Alimentar',
    dueDate: '2026-02-25',
    completed: true,
    completedAt: '2026-02-24',
  },
  {
    id: 't5',
    title: 'Tomar suplemento de vitamina D',
    type: 'Medicação',
    dueDate: null,
    completed: true,
    completedAt: '2026-02-20',
  },
]

const MOCK_DOCUMENTS: Document[] = [
  {
    id: 'd1',
    name: 'Hemograma completo - Fev 2026.pdf',
    type: 'PDF',
    size: '245 KB',
    uploadedAt: '2026-02-18',
    uploadedBy: 'Paciente',
  },
  {
    id: 'd2',
    name: 'Plano alimentar personalizado.pdf',
    type: 'PDF',
    size: '180 KB',
    uploadedAt: '2026-02-06',
    uploadedBy: 'Dr. Rafael Mendes',
  },
  {
    id: 'd3',
    name: 'Exame de intolerância alimentar.pdf',
    type: 'PDF',
    size: '520 KB',
    uploadedAt: '2025-12-10',
    uploadedBy: 'Paciente',
  },
]

const MOCK_FORM_SUBMISSIONS: FormSubmission[] = [
  {
    id: 'f1',
    formName: 'Recordatório Alimentar 24h',
    submittedAt: '2026-02-22',
    status: 'completed',
  },
  {
    id: 'f2',
    formName: 'Questionário de Qualidade de Vida',
    submittedAt: '2026-02-15',
    status: 'completed',
  },
  {
    id: 'f3',
    formName: 'Avaliação de Sintomas Gastrointestinais',
    submittedAt: '2026-01-15',
    status: 'completed',
  },
  {
    id: 'f4',
    formName: 'Check-in Semanal',
    submittedAt: '',
    status: 'pending',
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const recordTypeBadge: Record<ClinicalRecord['type'], { label: string; variant: 'info' | 'success' | 'warning' }> = {
  evolution: { label: 'Evolução', variant: 'info' },
  anamnesis: { label: 'Anamnese', variant: 'warning' },
  prescription: { label: 'Prescrição', variant: 'success' },
}

const appointmentTypeLabel: Record<Appointment['type'], string> = {
  first: 'Primeira consulta',
  follow_up: 'Acompanhamento',
  return: 'Retorno',
}

const appointmentStatusBadge: Record<Appointment['status'], { label: string; variant: 'info' | 'success' | 'default' | 'danger' }> = {
  scheduled: { label: 'Agendada', variant: 'info' },
  confirmed: { label: 'Confirmada', variant: 'success' },
  completed: { label: 'Concluída', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PatientDetailPage() {
  const [patient] = useState<PatientInfo>(MOCK_PATIENT)

  const handleGoBack = () => {
    console.log('Navigate back to patients list')
  }

  const pendingTasks = MOCK_TASKS.filter((t) => !t.completed)
  const completedTasks = MOCK_TASKS.filter((t) => t.completed)

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={handleGoBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors self-start"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para pacientes
      </button>

      {/* Patient Header */}
      <Card className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <Avatar name={patient.name} src={patient.avatarUrl} size="xl" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-gray-900">{patient.name}</h1>
                <Badge variant={patient.status === 'active' ? 'success' : 'default'}>
                  {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </div>
              <div className="mt-2 flex flex-col gap-1 text-sm text-gray-500 sm:flex-row sm:items-center sm:gap-4">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-3.5 w-3.5" />
                  {patient.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Phone className="h-3.5 w-3.5" />
                  {formatPhone(patient.phone)}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Calendar className="h-4 w-4" />
              Agendar consulta
            </Button>
            <Button size="sm">
              <ClipboardList className="h-4 w-4" />
              Novo registro
            </Button>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex-wrap">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="records">Prontuário</TabsTrigger>
          <TabsTrigger value="appointments">Consultas</TabsTrigger>
          <TabsTrigger value="tasks">Tarefas</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
          <TabsTrigger value="forms">Formulários</TabsTrigger>
        </TabsList>

        {/* ── Visão Geral ──────────────────────────────────────── */}
        <TabsContent value="overview">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {/* Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações Pessoais</CardTitle>
              </CardHeader>
              <CardContent>
                <dl className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Data de nascimento</dt>
                    <dd className="font-medium text-gray-900">{formatDate(patient.birthDate)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">CPF</dt>
                    <dd className="font-medium text-gray-900">{patient.cpf}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Sexo</dt>
                    <dd className="font-medium text-gray-900">{patient.gender}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-gray-500">Endereço</dt>
                    <dd className="font-medium text-gray-900 text-right max-w-[200px]">{patient.address}</dd>
                  </div>
                </dl>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-blue-50 p-3 text-center">
                    <p className="text-2xl font-bold text-blue-600">{MOCK_APPOINTMENTS.length}</p>
                    <p className="text-xs text-blue-600">Consultas</p>
                  </div>
                  <div className="rounded-lg bg-green-50 p-3 text-center">
                    <p className="text-2xl font-bold text-green-600">{MOCK_CLINICAL_RECORDS.length}</p>
                    <p className="text-xs text-green-600">Registros</p>
                  </div>
                  <div className="rounded-lg bg-yellow-50 p-3 text-center">
                    <p className="text-2xl font-bold text-yellow-600">{pendingTasks.length}</p>
                    <p className="text-xs text-yellow-600">Tarefas ativas</p>
                  </div>
                  <div className="rounded-lg bg-purple-50 p-3 text-center">
                    <p className="text-2xl font-bold text-purple-600">{MOCK_DOCUMENTS.length}</p>
                    <p className="text-xs text-purple-600">Documentos</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Appointment & Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Próxima Consulta</CardTitle>
              </CardHeader>
              <CardContent>
                {patient.nextAppointment ? (
                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-900">
                        {formatDate(patient.nextAppointment)}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-blue-700">
                      {MOCK_APPOINTMENTS[0].time} - {appointmentTypeLabel[MOCK_APPOINTMENTS[0].type]}
                    </p>
                    <p className="mt-2 text-xs text-blue-600">{MOCK_APPOINTMENTS[0].notes}</p>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">Nenhuma consulta agendada</p>
                )}

                <div className="mt-4">
                  <p className="text-sm font-medium text-gray-700 mb-2">Tarefas pendentes</p>
                  <ul className="space-y-2">
                    {pendingTasks.slice(0, 3).map((task) => (
                      <li key={task.id} className="flex items-center gap-2 text-sm text-gray-600">
                        <Circle className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                        <span className="truncate">{task.title}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card className="md:col-span-2 lg:col-span-3">
              <CardHeader>
                <CardTitle className="text-base">Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{patient.notes}</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ── Prontuário ───────────────────────────────────────── */}
        <TabsContent value="records">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Prontuário Clínico</h2>
              <Button size="sm">
                <ClipboardList className="h-4 w-4" />
                Novo Registro
              </Button>
            </div>

            {/* Timeline */}
            <div className="relative">
              <div className="absolute left-5 top-0 bottom-0 w-px bg-gray-200 hidden sm:block" />
              <div className="flex flex-col gap-4">
                {MOCK_CLINICAL_RECORDS.map((record) => {
                  const badgeInfo = recordTypeBadge[record.type]
                  return (
                    <div key={record.id} className="relative sm:pl-12">
                      <div className="absolute left-3 top-5 hidden h-4 w-4 rounded-full border-2 border-blue-500 bg-white sm:block" />
                      <Card className="p-4 hover:bg-gray-50 transition-colors cursor-pointer">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge variant={badgeInfo.variant}>{badgeInfo.label}</Badge>
                              <span className="text-xs text-gray-500">{formatDate(record.date)}</span>
                            </div>
                          </div>
                          <h3 className="text-sm font-medium text-gray-900">{record.title}</h3>
                          <p className="text-sm text-gray-500 line-clamp-2">{record.preview}</p>
                          <p className="text-xs text-gray-400">{record.professional}</p>
                        </div>
                      </Card>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* ── Consultas ────────────────────────────────────────── */}
        <TabsContent value="appointments">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Histórico de Consultas</h2>
              <Button size="sm">
                <Calendar className="h-4 w-4" />
                Agendar Consulta
              </Button>
            </div>

            <div className="flex flex-col gap-3">
              {MOCK_APPOINTMENTS.map((apt) => {
                const statusInfo = appointmentStatusBadge[apt.status]
                return (
                  <Card key={apt.id} className="p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-medium text-gray-900">
                            {formatDate(apt.date)} às {apt.time}
                          </span>
                          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span>{appointmentTypeLabel[apt.type]}</span>
                          <span>{apt.duration} min</span>
                        </div>
                        {apt.notes && (
                          <p className="text-xs text-gray-400 mt-1">{apt.notes}</p>
                        )}
                      </div>
                      {apt.status === 'scheduled' && (
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm">Cancelar</Button>
                          <Button variant="success" size="sm">Confirmar</Button>
                        </div>
                      )}
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </TabsContent>

        {/* ── Tarefas ──────────────────────────────────────────── */}
        <TabsContent value="tasks">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Tarefas</h2>
              <Button size="sm">
                <ListChecks className="h-4 w-4" />
                Nova Tarefa
              </Button>
            </div>

            {pendingTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Pendentes ({pendingTasks.length})</h3>
                <div className="flex flex-col gap-2">
                  {pendingTasks.map((task) => (
                    <Card key={task.id} className="p-4">
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          className="shrink-0 text-gray-400 hover:text-green-500 transition-colors"
                          onClick={() => console.log(`Toggle task: ${task.id}`)}
                        >
                          <Circle className="h-5 w-5" />
                        </button>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{task.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge size="sm">{task.type}</Badge>
                            {task.dueDate && (
                              <span className="text-xs text-gray-500">Até {formatDate(task.dueDate)}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {completedTasks.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-gray-700 mb-2">Concluídas ({completedTasks.length})</h3>
                <div className="flex flex-col gap-2">
                  {completedTasks.map((task) => (
                    <Card key={task.id} className="p-4 bg-gray-50">
                      <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-green-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-500 line-through">{task.title}</p>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Badge size="sm">{task.type}</Badge>
                            {task.completedAt && (
                              <span className="text-xs text-gray-400">
                                Concluída em {formatDate(task.completedAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Documentos ───────────────────────────────────────── */}
        <TabsContent value="documents">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Documentos</h2>
              <Button size="sm">
                <Upload className="h-4 w-4" />
                Enviar Documento
              </Button>
            </div>

            {MOCK_DOCUMENTS.length === 0 ? (
              <EmptyState
                icon={<FileUp className="h-6 w-6" />}
                title="Nenhum documento"
                description="Envie documentos como exames, laudos e outros arquivos."
                action={
                  <Button size="sm">
                    <Upload className="h-4 w-4" />
                    Enviar Documento
                  </Button>
                }
              />
            ) : (
              <div className="flex flex-col gap-2">
                {MOCK_DOCUMENTS.map((doc) => (
                  <Card key={doc.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-50 text-red-500 shrink-0">
                        <FileText className="h-5 w-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name}</p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 mt-0.5">
                          <span>{doc.type}</span>
                          <span>{doc.size}</span>
                          <span>Enviado em {formatDate(doc.uploadedAt)}</span>
                          <span>por {doc.uploadedBy}</span>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </TabsContent>

        {/* ── Formulários ──────────────────────────────────────── */}
        <TabsContent value="forms">
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Formulários</h2>
              <Button size="sm">
                <FileText className="h-4 w-4" />
                Enviar Formulário
              </Button>
            </div>

            <div className="flex flex-col gap-2">
              {MOCK_FORM_SUBMISSIONS.map((form) => (
                <Card key={form.id} className="p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">{form.formName}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge
                          variant={form.status === 'completed' ? 'success' : 'warning'}
                          size="sm"
                        >
                          {form.status === 'completed' ? 'Preenchido' : 'Pendente'}
                        </Badge>
                        {form.submittedAt && (
                          <span className="text-xs text-gray-500">
                            {formatDate(form.submittedAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    {form.status === 'completed' && (
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                        Ver respostas
                      </Button>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
