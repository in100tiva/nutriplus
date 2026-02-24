import { useState } from 'react'
import {
  CheckCircle,
  Circle,
  Clock,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  MessageSquare,
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
  Textarea,
} from '@/components/ui'
import { formatDate } from '@/lib/utils'

/* ─── Types ───────────────────────────────────────────────────── */

type TaskType = 'meal_plan' | 'exercise' | 'exam' | 'supplement' | 'habit' | 'other'
type TaskStatus = 'pending' | 'completed'

interface Task {
  id: string
  title: string
  description: string
  type: TaskType
  dueDate: string
  status: TaskStatus
  completedAt?: string
  notes?: string
  professionalId: string
}

interface ProfessionalGroup {
  id: string
  name: string
  avatar: string | null
  specialty: string
  tasks: Task[]
}

/* ─── Mock Data ───────────────────────────────────────────────── */

const MOCK_GROUPS: ProfessionalGroup[] = [
  {
    id: 'prof-1',
    name: 'Dra. Ana Carolina Mendes',
    avatar: null,
    specialty: 'Nutricionista Clinico',
    tasks: [
      {
        id: 't1',
        title: 'Seguir plano alimentar da semana',
        description:
          'Siga o plano alimentar enviado no documento "Plano Alimentar - Semana 8". Atencao especial ao cafe da manha e lanches intermediarios.',
        type: 'meal_plan',
        dueDate: '2026-03-07',
        status: 'pending',
        professionalId: 'prof-1',
      },
      {
        id: 't2',
        title: 'Registrar diario alimentar',
        description:
          'Anote tudo que comer durante esta semana no app. Inclua horarios, quantidades e como se sentiu apos as refeicoes.',
        type: 'habit',
        dueDate: '2026-03-07',
        status: 'pending',
        professionalId: 'prof-1',
      },
      {
        id: 't3',
        title: 'Realizar exame de sangue',
        description:
          'Fazer hemograma completo, glicemia de jejum, TSH e T4 livre. Levar resultado na proxima consulta.',
        type: 'exam',
        dueDate: '2026-03-10',
        status: 'pending',
        professionalId: 'prof-1',
      },
      {
        id: 't4',
        title: 'Tomar suplemento de vitamina D',
        description: 'Vitamina D3 2000 UI - 1 capsula por dia, preferencialmente apos o almoco.',
        type: 'supplement',
        dueDate: '2026-03-15',
        status: 'pending',
        professionalId: 'prof-1',
      },
      {
        id: 't5',
        title: 'Completar questionario de habitos',
        description: 'Preencher o formulario sobre habitos alimentares enviado por mensagem.',
        type: 'other',
        dueDate: '2026-02-20',
        status: 'completed',
        completedAt: '2026-02-19',
        notes: 'Preenchido e enviado conforme solicitado.',
        professionalId: 'prof-1',
      },
    ],
  },
  {
    id: 'prof-2',
    name: 'Dra. Juliana Costa Ferreira',
    avatar: null,
    specialty: 'Nutricionista Esportivo',
    tasks: [
      {
        id: 't6',
        title: 'Seguir protocolo pre-treino',
        description:
          'Consumir refeicao rica em carboidratos 1h30 antes do treino conforme orientacoes. Hidratar bem.',
        type: 'meal_plan',
        dueDate: '2026-03-05',
        status: 'pending',
        professionalId: 'prof-2',
      },
      {
        id: 't7',
        title: 'Fazer bioimpedancia',
        description:
          'Realizar exame de bioimpedancia para acompanhar evolucao da composicao corporal. Jejum de 4 horas.',
        type: 'exam',
        dueDate: '2026-03-12',
        status: 'pending',
        professionalId: 'prof-2',
      },
      {
        id: 't8',
        title: 'Atividade fisica 5x por semana',
        description:
          'Manter rotina de treino conforme planilha: 3x musculacao + 2x cardio. Minimo 45 minutos por sessao.',
        type: 'exercise',
        dueDate: '2026-03-07',
        status: 'pending',
        professionalId: 'prof-2',
      },
      {
        id: 't9',
        title: 'Enviar fotos das refeicoes',
        description: 'Fotografar as refeicoes principais por 3 dias e enviar por mensagem.',
        type: 'other',
        dueDate: '2026-02-22',
        status: 'completed',
        completedAt: '2026-02-21',
        professionalId: 'prof-2',
      },
    ],
  },
]

/* ─── Helpers ─────────────────────────────────────────────────── */

const TYPE_CONFIG: Record<TaskType, { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'default' }> = {
  meal_plan: { label: 'Plano Alimentar', variant: 'success' },
  exercise: { label: 'Exercicio', variant: 'info' },
  exam: { label: 'Exame', variant: 'warning' },
  supplement: { label: 'Suplemento', variant: 'default' },
  habit: { label: 'Habito', variant: 'info' },
  other: { label: 'Outro', variant: 'default' },
}

function isOverdue(dueDate: string): boolean {
  return new Date(dueDate) < new Date()
}

/* ─── Component ───────────────────────────────────────────────── */

export function MyTasksPage() {
  const allTasks = MOCK_GROUPS.flatMap((g) => g.tasks)
  const pendingCount = allTasks.filter((t) => t.status === 'pending').length
  const completedCount = allTasks.filter((t) => t.status === 'completed').length
  const totalCount = allTasks.length

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Minhas Tarefas</h1>
            <p className="mt-1 text-sm text-gray-500">
              Acompanhe suas tarefas e orientacoes dos profissionais
            </p>
          </div>

          {/* Progress */}
          <Card className="shrink-0">
            <CardContent className="flex items-center gap-4 px-5 py-3">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{completedCount}</p>
                <p className="text-xs text-gray-500">de {totalCount}</p>
              </div>
              <div className="h-10 w-10">
                <svg viewBox="0 0 36 36" className="h-10 w-10 -rotate-90">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#E5E7EB"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#3B82F6"
                    strokeWidth="3"
                    strokeDasharray={`${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}, 100`}
                  />
                </svg>
              </div>
              <p className="text-xs font-medium text-gray-600">concluidas</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="pending">
          <TabsList>
            <TabsTrigger value="pending">Pendentes ({pendingCount})</TabsTrigger>
            <TabsTrigger value="completed">Concluidas ({completedCount})</TabsTrigger>
          </TabsList>

          <TabsContent value="pending">
            {pendingCount === 0 ? (
              <EmptyState
                icon={<CheckCircle className="h-6 w-6" />}
                title="Todas as tarefas concluidas!"
                description="Parabens! Voce completou todas as suas tarefas."
              />
            ) : (
              <div className="space-y-6">
                {MOCK_GROUPS.map((group) => {
                  const pendingTasks = group.tasks.filter((t) => t.status === 'pending')
                  if (pendingTasks.length === 0) return null
                  return (
                    <ProfessionalTaskGroup
                      key={group.id}
                      group={group}
                      tasks={pendingTasks}
                      showComplete
                    />
                  )
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed">
            {completedCount === 0 ? (
              <EmptyState
                icon={<ClipboardList className="h-6 w-6" />}
                title="Nenhuma tarefa concluida"
                description="Suas tarefas concluidas aparecerão aqui."
              />
            ) : (
              <div className="space-y-6">
                {MOCK_GROUPS.map((group) => {
                  const completedTasks = group.tasks.filter((t) => t.status === 'completed')
                  if (completedTasks.length === 0) return null
                  return (
                    <ProfessionalTaskGroup
                      key={group.id}
                      group={group}
                      tasks={completedTasks}
                      showComplete={false}
                    />
                  )
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

/* ─── Professional Task Group ─────────────────────────────────── */

function ProfessionalTaskGroup({
  group,
  tasks,
  showComplete,
}: {
  group: ProfessionalGroup
  tasks: Task[]
  showComplete: boolean
}) {
  return (
    <div>
      <div className="mb-3 flex items-center gap-3">
        <Avatar name={group.name} src={group.avatar} size="sm" />
        <div>
          <p className="text-sm font-semibold text-gray-900">{group.name}</p>
          <p className="text-xs text-gray-500">{group.specialty}</p>
        </div>
      </div>
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} showComplete={showComplete} />
        ))}
      </div>
    </div>
  )
}

/* ─── Task Card ───────────────────────────────────────────────── */

function TaskCard({ task, showComplete }: { task: Task; showComplete: boolean }) {
  const [expanded, setExpanded] = useState(false)
  const [notes, setNotes] = useState('')
  const [showNotesInput, setShowNotesInput] = useState(false)
  const typeConfig = TYPE_CONFIG[task.type]
  const overdue = task.status === 'pending' && isOverdue(task.dueDate)

  return (
    <Card className={overdue ? 'border-red-200' : undefined}>
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <button
            type="button"
            className="mt-0.5 shrink-0"
            onClick={() => setExpanded(!expanded)}
          >
            {task.status === 'completed' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : (
              <Circle className="h-5 w-5 text-gray-300" />
            )}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h4
                className={`text-sm font-medium ${
                  task.status === 'completed' ? 'text-gray-400 line-through' : 'text-gray-900'
                }`}
              >
                {task.title}
              </h4>
              <Badge variant={typeConfig.variant} size="sm">
                {typeConfig.label}
              </Badge>
              {overdue && (
                <Badge variant="danger" size="sm">
                  Atrasada
                </Badge>
              )}
            </div>

            <div className="mt-1 flex items-center gap-3 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {task.status === 'completed' && task.completedAt
                  ? `Concluida em ${formatDate(task.completedAt)}`
                  : `Prazo: ${formatDate(task.dueDate)}`}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="shrink-0 text-gray-400 hover:text-gray-600"
          >
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>

        {/* Expanded content */}
        {expanded && (
          <div className="mt-4 ml-8 space-y-3">
            <p className="text-sm leading-relaxed text-gray-600">{task.description}</p>

            {task.notes && (
              <div className="rounded-lg bg-gray-50 p-3">
                <p className="text-xs font-medium text-gray-700">
                  <MessageSquare className="mr-1 inline h-3 w-3" />
                  Suas notas:
                </p>
                <p className="mt-1 text-sm text-gray-600">{task.notes}</p>
              </div>
            )}

            {showComplete && task.status === 'pending' && (
              <div className="space-y-2">
                {showNotesInput ? (
                  <>
                    <Textarea
                      placeholder="Adicione notas (opcional)..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      rows={2}
                    />
                    <div className="flex gap-2">
                      <Button size="sm" variant="success">
                        <CheckCircle className="h-4 w-4" />
                        Marcar como concluida
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setShowNotesInput(false)}>
                        Cancelar
                      </Button>
                    </div>
                  </>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setShowNotesInput(true)}
                  >
                    <CheckCircle className="h-4 w-4" />
                    Marcar como concluida
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
