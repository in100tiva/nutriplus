import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  ClipboardList,
  FileText,
} from 'lucide-react'
import {
  Button,
  Card,
  Badge,
  Avatar,
  Input,
  Select,
  EmptyState,
} from '@/components/ui'
import { formatDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

type RecordType = 'evolution' | 'anamnesis' | 'prescription' | 'exam_request' | 'certificate'

interface ClinicalRecord {
  id: string
  date: string
  patientName: string
  patientAvatarUrl: string | null
  type: RecordType
  title: string
  preview: string
  isPrivate: boolean
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_RECORDS: ClinicalRecord[] = [
  {
    id: 'r1',
    date: '2026-02-24',
    patientName: 'Ana Carolina Silva',
    patientAvatarUrl: null,
    type: 'evolution',
    title: 'Consulta de acompanhamento',
    preview: 'Paciente relata melhora significativa nos sintomas gastrointestinais após ajuste na dieta. Peso atual: 62.3kg...',
    isPrivate: false,
  },
  {
    id: 'r2',
    date: '2026-02-22',
    patientName: 'Bruno Oliveira Santos',
    patientAvatarUrl: null,
    type: 'prescription',
    title: 'Prescrição de suplementação',
    preview: 'Whey Protein Isolado 30g/dia pós-treino. Creatina monohidratada 5g/dia. Vitamina D3 2000UI/dia...',
    isPrivate: false,
  },
  {
    id: 'r3',
    date: '2026-02-20',
    patientName: 'Carla Mendes Ferreira',
    patientAvatarUrl: null,
    type: 'anamnesis',
    title: 'Anamnese nutricional completa',
    preview: 'Histórico familiar: mãe com diabetes tipo 2, pai com hipercolesterolemia. Queixas principais: cansaço excessivo...',
    isPrivate: false,
  },
  {
    id: 'r4',
    date: '2026-02-19',
    patientName: 'Fernanda Rodrigues Lima',
    patientAvatarUrl: null,
    type: 'evolution',
    title: 'Retorno - ajuste de plano',
    preview: 'Paciente aderiu 80% ao plano alimentar. Perdeu 1.2kg no último mês. Ajustados valores de macronutrientes...',
    isPrivate: false,
  },
  {
    id: 'r5',
    date: '2026-02-18',
    patientName: 'Gabriel Pereira Souza',
    patientAvatarUrl: null,
    type: 'exam_request',
    title: 'Solicitação de exames laboratoriais',
    preview: 'Hemograma completo, glicemia de jejum, hemoglobina glicada, perfil lipídico, TSH, T4 livre, vitamina D...',
    isPrivate: false,
  },
  {
    id: 'r6',
    date: '2026-02-15',
    patientName: 'Igor Martins Barbosa',
    patientAvatarUrl: null,
    type: 'certificate',
    title: 'Atestado de acompanhamento nutricional',
    preview: 'Atesto para os devidos fins que o paciente Igor Martins Barbosa encontra-se em acompanhamento nutricional...',
    isPrivate: true,
  },
  {
    id: 'r7',
    date: '2026-02-14',
    patientName: 'Juliana Araujo Campos',
    patientAvatarUrl: null,
    type: 'evolution',
    title: 'Primeira consulta - avaliação',
    preview: 'Paciente procura atendimento para emagrecimento saudável. IMC: 28.5. Circunferência abdominal: 92cm...',
    isPrivate: false,
  },
  {
    id: 'r8',
    date: '2026-02-10',
    patientName: 'Ana Carolina Silva',
    patientAvatarUrl: null,
    type: 'prescription',
    title: 'Plano alimentar personalizado',
    preview: 'Dieta de 1800kcal/dia com distribuição: 50% carboidratos, 25% proteínas, 25% lipídios. Foco em alimentos...',
    isPrivate: false,
  },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

const recordTypeConfig: Record<RecordType, { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'default' }> = {
  evolution: { label: 'Evolução', variant: 'info' },
  anamnesis: { label: 'Anamnese', variant: 'warning' },
  prescription: { label: 'Prescrição', variant: 'success' },
  exam_request: { label: 'Solicitação de exames', variant: 'default' },
  certificate: { label: 'Atestado', variant: 'danger' },
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClinicalRecordsPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')

  const filtered = useMemo(() => {
    let result = MOCK_RECORDS

    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(
        (r) =>
          r.patientName.toLowerCase().includes(query) ||
          r.title.toLowerCase().includes(query),
      )
    }

    if (typeFilter !== 'all') {
      result = result.filter((r) => r.type === typeFilter)
    }

    return result.sort((a, b) => b.date.localeCompare(a.date))
  }, [search, typeFilter])

  const handleNewRecord = () => {
    console.log('Navigate to new record editor')
  }

  const handleRecordClick = (id: string) => {
    console.log(`Navigate to record: ${id}`)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Prontuários</h1>
          <p className="mt-1 text-sm text-gray-500">
            Registros clínicos de todos os seus pacientes.
          </p>
        </div>
        <Button onClick={handleNewRecord}>
          <Plus className="h-4 w-4" />
          Novo Registro
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <Input
              placeholder="Buscar por paciente ou título..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <Select
            label="Tipo de registro"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            wrapperClassName="min-w-[200px]"
          >
            <option value="all">Todos os tipos</option>
            <option value="evolution">Evolução</option>
            <option value="anamnesis">Anamnese</option>
            <option value="prescription">Prescrição</option>
            <option value="exam_request">Solicitação de exames</option>
            <option value="certificate">Atestado</option>
          </Select>
        </div>
      </Card>

      {/* Records List */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<ClipboardList className="h-6 w-6" />}
          title="Nenhum registro encontrado"
          description="Tente ajustar os filtros ou crie um novo registro clínico."
          action={
            <Button onClick={handleNewRecord}>
              <Plus className="h-4 w-4" />
              Novo Registro
            </Button>
          }
        />
      ) : (
        <div className="flex flex-col gap-3">
          {filtered.map((record) => {
            const typeConfig = recordTypeConfig[record.type]
            return (
              <Card
                key={record.id}
                className="p-4 cursor-pointer transition-colors hover:bg-gray-50"
                onClick={() => handleRecordClick(record.id)}
              >
                <div className="flex items-start gap-4">
                  <Avatar name={record.patientName} src={record.patientAvatarUrl} size="md" className="shrink-0 hidden sm:block" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-sm font-medium text-gray-900">{record.title}</h3>
                          <Badge variant={typeConfig.variant} size="sm">
                            {typeConfig.label}
                          </Badge>
                          {record.isPrivate && (
                            <Badge variant="default" size="sm">Privado</Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-0.5">{record.patientName}</p>
                      </div>
                      <span className="text-xs text-gray-400 shrink-0">{formatDate(record.date)}</span>
                    </div>
                    <p className="mt-2 text-sm text-gray-500 line-clamp-2">{record.preview}</p>
                  </div>
                  <FileText className="h-5 w-5 text-gray-300 shrink-0 hidden md:block" />
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
