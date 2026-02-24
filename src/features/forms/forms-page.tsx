import { useState, useMemo } from 'react'
import {
  Plus,
  Search,
  FileText,
  Eye,
  Copy,
  Pencil,
  Send,
  MoreVertical,
  ClipboardList,
} from 'lucide-react'
import {
  Button,
  Card,
  Badge,
  Input,
  EmptyState,
} from '@/components/ui'
import { formatDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface FormTemplate {
  id: string
  name: string
  description: string
  type: 'system' | 'custom'
  category: string
  questionsCount: number
  createdAt: string
  updatedAt: string
  submissionsCount: number
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_FORMS: FormTemplate[] = [
  {
    id: 'f1',
    name: 'Anamnese Nutricional',
    description: 'Formulário completo de anamnese para primeira consulta nutricional.',
    type: 'system',
    category: 'Anamnese',
    questionsCount: 35,
    createdAt: '2025-01-15',
    updatedAt: '2026-01-10',
    submissionsCount: 48,
  },
  {
    id: 'f2',
    name: 'Recordatório Alimentar 24h',
    description: 'Registro detalhado de todas as refeições consumidas nas últimas 24 horas.',
    type: 'system',
    category: 'Avaliação',
    questionsCount: 12,
    createdAt: '2025-01-15',
    updatedAt: '2026-02-01',
    submissionsCount: 125,
  },
  {
    id: 'f3',
    name: 'Questionário de Qualidade de Vida',
    description: 'Avaliação da qualidade de vida relacionada à alimentação e saúde.',
    type: 'system',
    category: 'Avaliação',
    questionsCount: 20,
    createdAt: '2025-01-15',
    updatedAt: '2025-12-20',
    submissionsCount: 67,
  },
  {
    id: 'f4',
    name: 'Avaliação de Sintomas Gastrointestinais',
    description: 'Formulário para avaliar sintomas GI e identificar possíveis intolerâncias.',
    type: 'system',
    category: 'Avaliação',
    questionsCount: 18,
    createdAt: '2025-03-01',
    updatedAt: '2025-11-15',
    submissionsCount: 34,
  },
  {
    id: 'f5',
    name: 'Check-in Semanal',
    description: 'Formulário rápido de acompanhamento semanal com peso, medidas e bem-estar geral.',
    type: 'custom',
    category: 'Acompanhamento',
    questionsCount: 8,
    createdAt: '2026-01-10',
    updatedAt: '2026-02-15',
    submissionsCount: 89,
  },
  {
    id: 'f6',
    name: 'Histórico de Atividade Física',
    description: 'Levantamento do histórico e nível atual de atividade física do paciente.',
    type: 'custom',
    category: 'Avaliação',
    questionsCount: 15,
    createdAt: '2026-01-20',
    updatedAt: '2026-02-10',
    submissionsCount: 22,
  },
  {
    id: 'f7',
    name: 'Avaliação de Satisfação',
    description: 'Pesquisa de satisfação com o atendimento e serviços prestados.',
    type: 'custom',
    category: 'Feedback',
    questionsCount: 10,
    createdAt: '2026-02-01',
    updatedAt: '2026-02-20',
    submissionsCount: 15,
  },
  {
    id: 'f8',
    name: 'Diário de Sono e Estresse',
    description: 'Acompanhamento da qualidade do sono e níveis de estresse ao longo da semana.',
    type: 'custom',
    category: 'Acompanhamento',
    questionsCount: 6,
    createdAt: '2026-02-05',
    updatedAt: '2026-02-18',
    submissionsCount: 31,
  },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function FormsPage() {
  const [search, setSearch] = useState('')
  const [activeMenu, setActiveMenu] = useState<string | null>(null)

  const filtered = useMemo(() => {
    if (!search.trim()) return MOCK_FORMS
    const query = search.toLowerCase()
    return MOCK_FORMS.filter(
      (f) =>
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.category.toLowerCase().includes(query),
    )
  }, [search])

  const systemForms = filtered.filter((f) => f.type === 'system')
  const customForms = filtered.filter((f) => f.type === 'custom')

  const handlePreview = (id: string) => {
    console.log(`Preview form: ${id}`)
    setActiveMenu(null)
  }

  const handleEdit = (id: string) => {
    console.log(`Edit form: ${id}`)
    setActiveMenu(null)
  }

  const handleDuplicate = (id: string) => {
    console.log(`Duplicate form: ${id}`)
    setActiveMenu(null)
  }

  const handleSendToPatient = (id: string) => {
    console.log(`Send form to patient: ${id}`)
    setActiveMenu(null)
  }

  const handleNewForm = () => {
    console.log('Navigate to form builder')
  }

  const toggleMenu = (formId: string) => {
    setActiveMenu(activeMenu === formId ? null : formId)
  }

  const renderFormCard = (form: FormTemplate) => (
    <Card key={form.id} className="p-4">
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-blue-500 shrink-0">
          <FileText className="h-5 w-5" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm font-medium text-gray-900">{form.name}</h3>
                <Badge
                  variant={form.type === 'system' ? 'info' : 'success'}
                  size="sm"
                >
                  {form.type === 'system' ? 'Sistema' : 'Personalizado'}
                </Badge>
                <Badge size="sm">{form.category}</Badge>
              </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{form.description}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                <span>{form.questionsCount} perguntas</span>
                <span>{form.submissionsCount} respostas</span>
                <span className="hidden sm:inline">Atualizado em {formatDate(form.updatedAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="relative shrink-0">
              {/* Desktop Actions */}
              <div className="hidden md:flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handlePreview(form.id)}
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                {form.type === 'custom' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleEdit(form.id)}
                    title="Editar"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDuplicate(form.id)}
                  title="Duplicar"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSendToPatient(form.id)}
                  title="Enviar para paciente"
                  className="text-blue-500 hover:text-blue-600 hover:bg-blue-50"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Actions (Dropdown) */}
              <div className="md:hidden">
                <button
                  type="button"
                  onClick={() => toggleMenu(form.id)}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors rounded"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>

                {activeMenu === form.id && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-48 rounded-lg border border-gray-200 bg-white shadow-lg">
                    <div className="py-1">
                      <button
                        type="button"
                        onClick={() => handlePreview(form.id)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Eye className="h-4 w-4" />
                        Visualizar
                      </button>
                      {form.type === 'custom' && (
                        <button
                          type="button"
                          onClick={() => handleEdit(form.id)}
                          className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDuplicate(form.id)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Copy className="h-4 w-4" />
                        Duplicar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSendToPatient(form.id)}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50"
                      >
                        <Send className="h-4 w-4" />
                        Enviar para paciente
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  )

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Formulários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus modelos de formulários e envie para pacientes.
          </p>
        </div>
        <Button onClick={handleNewForm}>
          <Plus className="h-4 w-4" />
          Novo Formulário
        </Button>
      </div>

      {/* Search */}
      <Card className="p-4">
        <Input
          placeholder="Buscar formulários..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          leftIcon={<Search className="h-4 w-4" />}
        />
      </Card>

      {/* Forms List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title="Nenhum formulário encontrado"
          description="Tente ajustar a busca ou crie um novo formulário."
          action={
            <Button onClick={handleNewForm}>
              <Plus className="h-4 w-4" />
              Novo Formulário
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-6">
          {/* System Forms */}
          {systemForms.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Badge variant="info" size="sm">Sistema</Badge>
                Formulários do sistema ({systemForms.length})
              </h2>
              <div className="flex flex-col gap-3">
                {systemForms.map(renderFormCard)}
              </div>
            </div>
          )}

          {/* Custom Forms */}
          {customForms.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                <Badge variant="success" size="sm">Personalizado</Badge>
                Seus formulários ({customForms.length})
              </h2>
              <div className="flex flex-col gap-3">
                {customForms.map(renderFormCard)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
