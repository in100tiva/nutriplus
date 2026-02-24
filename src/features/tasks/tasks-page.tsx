import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  ListChecks,
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronUp,
  Calendar,
} from 'lucide-react'
import {
  Button,
  Card,
  Badge,
  Avatar,
  Input,
  Select,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  EmptyState,
} from '@/components/ui'
import { formatDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type TaskType = 'general' | 'meal_plan' | 'exercise' | 'therapy' | 'medication' | 'checkin'

interface TaskItem {
  id: string
  title: string
  description: string
  patientName: string
  patientAvatarUrl: string | null
  type: TaskType
  dueDate: string | null
  completed: boolean
  completedAt: string | null
  createdAt: string
  recurrence: 'none' | 'daily' | 'weekly' | 'monthly'
  completionHistory: { date: string; note: string }[]
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_TASKS: TaskItem[] = [
  {
    id: 't1',
    title: 'Registrar diário alimentar',
    description: 'Anotar todas as refeições do dia, incluindo horários e quantidades.',
    patientName: 'Ana Carolina Silva',
    patientAvatarUrl: null,
    type: 'meal_plan',
    dueDate: '2026-03-01',
    completed: false,
    completedAt: null,
    createdAt: '2026-02-20',
    recurrence: 'daily',
    completionHistory: [
      { date: '2026-02-23', note: 'Registrado via app' },
      { date: '2026-02-22', note: 'Registrado via app' },
    ],
  },
  {
    id: 't2',
    title: 'Realizar exames laboratoriais',
    description: 'Hemograma completo, glicemia de jejum, perfil lipídico e vitamina D.',
    patientName: 'Bruno Oliveira Santos',
    patientAvatarUrl: null,
    type: 'general',
    dueDate: '2026-03-05',
    completed: false,
    completedAt: null,
    createdAt: '2026-02-18',
    recurrence: 'none',
    completionHistory: [],
  },
  {
    id: 't3',
    title: 'Caminhar 30 minutos por dia',
    description: 'Caminhada em ritmo moderado, preferencialmente ao ar livre.',
    patientName: 'Carla Mendes Ferreira',
    patientAvatarUrl: null,
    type: 'exercise',
    dueDate: null,
    completed: false,
    completedAt: null,
    createdAt: '2026-02-15',
    recurrence: 'daily',
    completionHistory: [
      { date: '2026-02-24', note: '35 min no parque' },
      { date: '2026-02-23', note: '30 min na esteira' },
      { date: '2026-02-22', note: '40 min caminhada ao ar livre' },
    ],
  },
  {
    id: 't4',
    title: 'Tomar probiótico diariamente',
    description: 'Lactobacillus rhamnosus 1 cápsula em jejum, 30 min antes do café.',
    patientName: 'Ana Carolina Silva',
    patientAvatarUrl: null,
    type: 'medication',
    dueDate: null,
    completed: false,
    completedAt: null,
    createdAt: '2026-02-06',
    recurrence: 'daily',
    completionHistory: [],
  },
  {
    id: 't5',
    title: 'Preencher check-in semanal',
    description: 'Formulário de acompanhamento semanal com peso, medidas e bem-estar.',
    patientName: 'Fernanda Rodrigues Lima',
    patientAvatarUrl: null,
    type: 'checkin',
    dueDate: '2026-02-28',
    completed: false,
    completedAt: null,
    createdAt: '2026-02-10',
    recurrence: 'weekly',
    completionHistory: [
      { date: '2026-02-21', note: 'Check-in enviado' },
      { date: '2026-02-14', note: 'Check-in enviado' },
    ],
  },
  {
    id: 't6',
    title: 'Sessão de meditação guiada',
    description: 'Praticar meditação mindfulness por 10 minutos usando o app Headspace.',
    patientName: 'Gabriel Pereira Souza',
    patientAvatarUrl: null,
    type: 'therapy',
    dueDate: null,
    completed: false,
    completedAt: null,
    createdAt: '2026-02-12',
    recurrence: 'daily',
    completionHistory: [],
  },
  {
    id: 't7',
    title: 'Enviar fotos das refeições',
    description: 'Fotografar almoço e jantar e enviar via mensagem.',
    patientName: 'Ana Carolina Silva',
    patientAvatarUrl: null,
    type: 'meal_plan',
    dueDate: '2026-02-25',
    completed: true,
    completedAt: '2026-02-24',
    createdAt: '2026-02-20',
    recurrence: 'none',
    completionHistory: [
      { date: '2026-02-24', note: 'Fotos enviadas pelo WhatsApp' },
    ],
  },
  {
    id: 't8',
    title: 'Preparar marmitas da semana',
    description: 'Preparar marmitas seguindo o plano alimentar para a semana.',
    patientName: 'Juliana Araujo Campos',
    patientAvatarUrl: null,
    type: 'meal_plan',
    dueDate: '2026-02-23',
    completed: true,
    completedAt: '2026-02-23',
    createdAt: '2026-02-17',
    recurrence: 'weekly',
    completionHistory: [
      { date: '2026-02-23', note: 'Preparou 5 marmitas' },
      { date: '2026-02-16', note: 'Preparou 4 marmitas' },
    ],
  },
  {
    id: 't9',
    title: 'Registrar peso na balança',
    description: 'Pesar-se em jejum pela manhã e registrar no app.',
    patientName: 'Igor Martins Barbosa',
    patientAvatarUrl: null,
    type: 'checkin',
    dueDate: '2026-02-20',
    completed: true,
    completedAt: '2026-02-20',
    createdAt: '2026-02-10',
    recurrence: 'weekly',
    completionHistory: [
      { date: '2026-02-20', note: '74.2kg' },
      { date: '2026-02-13', note: '74.8kg' },
    ],
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const taskTypeConfig: Record<TaskType, { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'default' }> = {
  general: { label: 'Geral', variant: 'default' },
  meal_plan: { label: 'Plano Alimentar', variant: 'success' },
  exercise: { label: 'Exercício', variant: 'info' },
  therapy: { label: 'Terapia', variant: 'warning' },
  medication: { label: 'Medicação', variant: 'danger' },
  checkin: { label: 'Check-in', variant: 'info' },
}

const recurrenceLabel: Record<string, string> = {
  none: 'Sem recorrência',
  daily: 'Diária',
  weekly: 'Semanal',
  monthly: 'Mensal',
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function TasksPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [expandedTask, setExpandedTask] = useState<string | null>(null)

  const activeTasks = useMemo(() => {
    return MOCK_TASKS.filter((t) => !t.completed)
  }, [])

  const completedTasks = useMemo(() => {
    return MOCK_TASKS.filter((t) => t.completed)
  }, [])

  const filterTasks = (tasks: TaskItem[]) => {
    let result = tasks

    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(
        (t) =>
          t.title.toLowerCase().includes(query) ||
          t.patientName.toLowerCase().includes(query),
      )
    }

    if (typeFilter !== 'all') {
      result = result.filter((t) => t.type === typeFilter)
    }

    return result
  }

  const handleNewTask = () => {
    console.log('Navigate to new task form')
  }

  const handleToggleExpand = (taskId: string) => {
    setExpandedTask(expandedTask === taskId ? null : taskId)
  }

  const handleToggleComplete = (taskId: string) => {
    console.log(`Toggle task completion: ${taskId}`)
  }

  const renderTaskList = (tasks: TaskItem[]) => {
    const filtered = filterTasks(tasks)

    if (filtered.length === 0) {
      return (
        <EmptyState
          icon={<ListChecks className="h-6 w-6" />}
          title="Nenhuma tarefa encontrada"
          description="Tente ajustar os filtros ou crie uma nova tarefa."
          action={
            <Button onClick={handleNewTask}>
              <Plus className="h-4 w-4" />
              Nova Tarefa
            </Button>
          }
        />
      )
    }

    return (
      <div className="flex flex-col gap-3">
        {filtered.map((task) => {
          const typeConfig = taskTypeConfig[task.type]
          const isExpanded = expandedTask === task.id
          return (
            <Card key={task.id} className="overflow-hidden">
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {/* Completion Toggle */}
                  <button
                    type="button"
                    className={`shrink-0 mt-0.5 transition-colors ${
                      task.completed
                        ? 'text-green-500'
                        : 'text-gray-400 hover:text-green-500'
                    }`}
                    onClick={() => handleToggleComplete(task.id)}
                  >
                    {task.completed ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Circle className="h-5 w-5" />
                    )}
                  </button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                          {task.title}
                        </p>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <Avatar name={task.patientName} src={task.patientAvatarUrl} size="sm" />
                            <span className="text-xs text-gray-500">{task.patientName}</span>
                          </div>
                          <Badge variant={typeConfig.variant} size="sm">
                            {typeConfig.label}
                          </Badge>
                          {task.recurrence !== 'none' && (
                            <Badge size="sm">{recurrenceLabel[task.recurrence]}</Badge>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 hidden sm:flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => handleToggleExpand(task.id)}
                          className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Due date on mobile */}
                    {task.dueDate && (
                      <span className="text-xs text-gray-500 flex items-center gap-1 mt-1 sm:hidden">
                        <Calendar className="h-3 w-3" />
                        {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-100 bg-gray-50 p-4">
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>

                  {task.completionHistory.length > 0 && (
                    <div>
                      <p className="text-xs font-medium text-gray-700 mb-2">
                        Histórico de conclusões
                      </p>
                      <ul className="space-y-1.5">
                        {task.completionHistory.map((entry, idx) => (
                          <li key={idx} className="flex items-center gap-2 text-xs text-gray-500">
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
                            <span className="font-medium">{formatDate(entry.date)}</span>
                            <span>{entry.note}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-3 text-xs text-gray-400">
                    <span>Criada em {formatDate(task.createdAt)}</span>
                    {task.completedAt && (
                      <span>Concluída em {formatDate(task.completedAt)}</span>
                    )}
                  </div>
                </div>
              )}
            </Card>
          )
        })}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Tarefas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie as tarefas atribuídas aos seus pacientes.
          </p>
        </div>
        <Button onClick={handleNewTask}>
          <Plus className="h-4 w-4" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <Input
              placeholder="Buscar por título ou paciente..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            label="Tipo"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            wrapperClassName="min-w-[180px]"
          >
            <option value="all">Todos os tipos</option>
            <option value="general">Geral</option>
            <option value="meal_plan">Plano Alimentar</option>
            <option value="exercise">Exercício</option>
            <option value="therapy">Terapia</option>
            <option value="medication">Medicação</option>
            <option value="checkin">Check-in</option>
          </Select>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="active">
        <TabsList>
          <TabsTrigger value="active">
            Ativas ({filterTasks(activeTasks).length})
          </TabsTrigger>
          <TabsTrigger value="completed">
            Concluídas ({filterTasks(completedTasks).length})
          </TabsTrigger>
          <TabsTrigger value="all">
            Todas ({filterTasks(MOCK_TASKS).length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active">
          {renderTaskList(activeTasks)}
        </TabsContent>

        <TabsContent value="completed">
          {renderTaskList(completedTasks)}
        </TabsContent>

        <TabsContent value="all">
          {renderTaskList(MOCK_TASKS)}
        </TabsContent>
      </Tabs>
    </div>
  )
}
