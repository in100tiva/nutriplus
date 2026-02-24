import { useState, useCallback } from 'react'
import {
  Upload,
  FileText,
  Image,
  File,
  Download,
  Eye,
  Trash2,
  Search,
  Grid3X3,
  List,
  HardDrive,
  X,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Input,
  Select,
  EmptyState,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui'
import { formatDate } from '@/lib/utils'

/* ─── Types ───────────────────────────────────────────────────── */

type DocumentCategory = 'exam' | 'prescription' | 'meal_plan' | 'report' | 'image' | 'other'
type ViewMode = 'grid' | 'list'

interface Document {
  id: string
  name: string
  category: DocumentCategory
  uploadedBy: string
  uploadedByRole: 'professional' | 'patient'
  date: string
  sizeBytes: number
  fileType: string
  previewUrl?: string
}

/* ─── Mock Data ───────────────────────────────────────────────── */

const MOCK_DOCUMENTS: Document[] = [
  {
    id: '1',
    name: 'Hemograma Completo - Fev 2026.pdf',
    category: 'exam',
    uploadedBy: 'Voce',
    uploadedByRole: 'patient',
    date: '2026-02-20',
    sizeBytes: 245000,
    fileType: 'pdf',
  },
  {
    id: '2',
    name: 'Plano Alimentar - Semana 8.pdf',
    category: 'meal_plan',
    uploadedBy: 'Dra. Ana Carolina Mendes',
    uploadedByRole: 'professional',
    date: '2026-02-18',
    sizeBytes: 180000,
    fileType: 'pdf',
  },
  {
    id: '3',
    name: 'Receita - Vitamina D3 2000UI.pdf',
    category: 'prescription',
    uploadedBy: 'Dra. Ana Carolina Mendes',
    uploadedByRole: 'professional',
    date: '2026-02-15',
    sizeBytes: 95000,
    fileType: 'pdf',
  },
  {
    id: '4',
    name: 'Bioimpedancia - Jan 2026.pdf',
    category: 'exam',
    uploadedBy: 'Voce',
    uploadedByRole: 'patient',
    date: '2026-01-28',
    sizeBytes: 320000,
    fileType: 'pdf',
  },
  {
    id: '5',
    name: 'Foto Refeicao - Almoco.jpg',
    category: 'image',
    uploadedBy: 'Voce',
    uploadedByRole: 'patient',
    date: '2026-02-21',
    sizeBytes: 1250000,
    fileType: 'jpg',
    previewUrl: undefined,
  },
  {
    id: '6',
    name: 'Relatorio Evolucao - 3 meses.pdf',
    category: 'report',
    uploadedBy: 'Dra. Ana Carolina Mendes',
    uploadedByRole: 'professional',
    date: '2026-02-10',
    sizeBytes: 420000,
    fileType: 'pdf',
  },
  {
    id: '7',
    name: 'Plano Alimentar - Semana 7.pdf',
    category: 'meal_plan',
    uploadedBy: 'Dra. Ana Carolina Mendes',
    uploadedByRole: 'professional',
    date: '2026-02-11',
    sizeBytes: 175000,
    fileType: 'pdf',
  },
  {
    id: '8',
    name: 'Glicemia de Jejum - Fev 2026.pdf',
    category: 'exam',
    uploadedBy: 'Voce',
    uploadedByRole: 'patient',
    date: '2026-02-20',
    sizeBytes: 150000,
    fileType: 'pdf',
  },
  {
    id: '9',
    name: 'Protocolo Pre-Treino.pdf',
    category: 'meal_plan',
    uploadedBy: 'Dra. Juliana Costa Ferreira',
    uploadedByRole: 'professional',
    date: '2026-02-05',
    sizeBytes: 210000,
    fileType: 'pdf',
  },
  {
    id: '10',
    name: 'Atestado Medico.pdf',
    category: 'other',
    uploadedBy: 'Dr. Pedro Henrique Lima',
    uploadedByRole: 'professional',
    date: '2026-01-30',
    sizeBytes: 88000,
    fileType: 'pdf',
  },
]

const TOTAL_STORAGE_MB = 500
const USED_STORAGE_MB = 127

/* ─── Helpers ─────────────────────────────────────────────────── */

const CATEGORY_CONFIG: Record<DocumentCategory, { label: string; variant: 'info' | 'success' | 'warning' | 'danger' | 'default' }> = {
  exam: { label: 'Exame', variant: 'warning' },
  prescription: { label: 'Receita', variant: 'danger' },
  meal_plan: { label: 'Plano Alimentar', variant: 'success' },
  report: { label: 'Relatorio', variant: 'info' },
  image: { label: 'Imagem', variant: 'default' },
  other: { label: 'Outro', variant: 'default' },
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getFileIcon(fileType: string) {
  if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileType)) {
    return <Image className="h-5 w-5 text-purple-500" />
  }
  if (fileType === 'pdf') {
    return <FileText className="h-5 w-5 text-red-500" />
  }
  return <File className="h-5 w-5 text-gray-500" />
}

/* ─── Component ───────────────────────────────────────────────── */

export function DocumentsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isDragging, setIsDragging] = useState(false)
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)

  const filtered = MOCK_DOCUMENTS.filter((doc) => {
    const matchesSearch = searchQuery.trim()
      ? doc.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
      : true
    const matchesCategory = categoryFilter === 'all' || doc.category === categoryFilter
    return matchesSearch && matchesCategory
  })

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    // In a real app, handle file upload here
  }, [])

  function handleDeleteClick(doc: Document) {
    setSelectedDoc(doc)
    setDeleteModalOpen(true)
  }

  const storagePercent = Math.round((USED_STORAGE_MB / TOTAL_STORAGE_MB) * 100)

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Documentos</h1>
            <p className="mt-1 text-sm text-gray-500">
              Gerencie seus exames, receitas e planos alimentares
            </p>
          </div>

          {/* Storage indicator */}
          <Card className="shrink-0">
            <CardContent className="flex items-center gap-3 px-4 py-3">
              <HardDrive className="h-5 w-5 text-gray-400" />
              <div className="w-32">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-600">{USED_STORAGE_MB} MB</span>
                  <span className="text-gray-400">{TOTAL_STORAGE_MB} MB</span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-gray-200">
                  <div
                    className={`h-1.5 rounded-full ${
                      storagePercent > 80 ? 'bg-red-500' : storagePercent > 50 ? 'bg-yellow-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${storagePercent}%` }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* ─── Upload Area ────────────────────────────────────── */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          className={`mb-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-gray-400'
          }`}
        >
          <Upload
            className={`h-10 w-10 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`}
          />
          <p className="mt-3 text-sm font-medium text-gray-700">
            Arraste e solte arquivos aqui
          </p>
          <p className="mt-1 text-xs text-gray-500">ou</p>
          <Button variant="outline" size="sm" className="mt-3">
            <Upload className="h-4 w-4" />
            Selecionar arquivos
          </Button>
          <p className="mt-2 text-xs text-gray-400">
            PDF, JPG, PNG ate 10MB
          </p>
        </div>

        {/* ─── Filters ────────────────────────────────────────── */}
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 gap-3">
            <Input
              placeholder="Buscar documento..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              leftIcon={<Search className="h-4 w-4" />}
              wrapperClassName="flex-1 max-w-xs"
            />
            <Select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="all">Todas categorias</option>
              <option value="exam">Exames</option>
              <option value="prescription">Receitas</option>
              <option value="meal_plan">Planos Alimentares</option>
              <option value="report">Relatorios</option>
              <option value="image">Imagens</option>
              <option value="other">Outros</option>
            </Select>
          </div>

          <div className="flex gap-1">
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* ─── Document List/Grid ─────────────────────────────── */}
        {filtered.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-6 w-6" />}
            title="Nenhum documento encontrado"
            description="Tente ajustar os filtros ou envie um novo documento."
          />
        ) : viewMode === 'list' ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 bg-gray-50 text-left">
                      <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">
                        Arquivo
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium uppercase text-gray-500 sm:table-cell">
                        Categoria
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium uppercase text-gray-500 md:table-cell">
                        Enviado por
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium uppercase text-gray-500 md:table-cell">
                        Data
                      </th>
                      <th className="hidden px-4 py-3 text-xs font-medium uppercase text-gray-500 lg:table-cell">
                        Tamanho
                      </th>
                      <th className="px-4 py-3 text-xs font-medium uppercase text-gray-500">
                        Acoes
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((doc) => {
                      const catConfig = CATEGORY_CONFIG[doc.category]
                      return (
                        <tr
                          key={doc.id}
                          className="border-b border-gray-100 last:border-0 hover:bg-gray-50"
                        >
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                              {getFileIcon(doc.fileType)}
                              <span className="text-sm font-medium text-gray-900">
                                {doc.name}
                              </span>
                            </div>
                          </td>
                          <td className="hidden px-4 py-3 sm:table-cell">
                            <Badge variant={catConfig.variant} size="sm">
                              {catConfig.label}
                            </Badge>
                          </td>
                          <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell">
                            {doc.uploadedBy}
                          </td>
                          <td className="hidden px-4 py-3 text-sm text-gray-500 md:table-cell">
                            {formatDate(doc.date)}
                          </td>
                          <td className="hidden px-4 py-3 text-sm text-gray-500 lg:table-cell">
                            {formatFileSize(doc.sizeBytes)}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1">
                              {(doc.fileType === 'pdf' || ['jpg', 'jpeg', 'png'].includes(doc.fileType)) && (
                                <Button variant="ghost" size="sm">
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
                              </Button>
                              {doc.uploadedByRole === 'patient' && (
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleDeleteClick(doc)}
                                >
                                  <Trash2 className="h-4 w-4 text-red-500" />
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((doc) => {
              const catConfig = CATEGORY_CONFIG[doc.category]
              return (
                <Card key={doc.id} className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-100">
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">
                          {doc.name}
                        </p>
                        <Badge variant={catConfig.variant} size="sm" className="mt-1">
                          {catConfig.label}
                        </Badge>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                      <span>{doc.uploadedBy}</span>
                      <span>{formatDate(doc.date)}</span>
                    </div>
                    <p className="mt-1 text-xs text-gray-400">
                      {formatFileSize(doc.sizeBytes)}
                    </p>

                    <div className="mt-3 flex gap-1 border-t pt-3">
                      {(doc.fileType === 'pdf' || ['jpg', 'jpeg', 'png'].includes(doc.fileType)) && (
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      {doc.uploadedByRole === 'patient' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(doc)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ─── Delete Modal ─────────────────────────────────────── */}
      <Modal open={deleteModalOpen} onClose={() => setDeleteModalOpen(false)} size="sm">
        <ModalHeader onClose={() => setDeleteModalOpen(false)}>
          <ModalTitle>Excluir documento</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p className="text-sm text-gray-600">
            Tem certeza que deseja excluir{' '}
            <strong>{selectedDoc?.name}</strong>? Esta acao nao pode ser desfeita.
          </p>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={() => setDeleteModalOpen(false)}>
            <Trash2 className="h-4 w-4" />
            Excluir
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
