import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Search,
  Save,
  Paperclip,
  Lock,
  Unlock,
  Scale,
  Ruler,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Select,
  Textarea,
  Avatar,
  Badge,
} from '@/components/ui'

// ─── Types ────────────────────────────────────────────────────────────────────

type RecordType = 'evolution' | 'anamnesis' | 'prescription' | 'exam_request' | 'certificate'

interface PatientOption {
  id: string
  name: string
  avatarUrl: string | null
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PATIENTS: PatientOption[] = [
  { id: '1', name: 'Ana Carolina Silva', avatarUrl: null },
  { id: '2', name: 'Bruno Oliveira Santos', avatarUrl: null },
  { id: '3', name: 'Carla Mendes Ferreira', avatarUrl: null },
  { id: '4', name: 'Diego Almeida Costa', avatarUrl: null },
  { id: '5', name: 'Fernanda Rodrigues Lima', avatarUrl: null },
  { id: '6', name: 'Gabriel Pereira Souza', avatarUrl: null },
  { id: '7', name: 'Helena Castro Ribeiro', avatarUrl: null },
  { id: '8', name: 'Igor Martins Barbosa', avatarUrl: null },
  { id: '9', name: 'Juliana Araujo Campos', avatarUrl: null },
  { id: '10', name: 'Lucas Nascimento Dias', avatarUrl: null },
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecordEditor() {
  // Patient selection
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null)
  const [showPatientList, setShowPatientList] = useState(false)

  // Record fields
  const [recordType, setRecordType] = useState<RecordType | ''>('')
  const [content, setContent] = useState('')
  const [isPrivate, setIsPrivate] = useState(false)

  // Metadata (evolution type)
  const [weight, setWeight] = useState('')
  const [height, setHeight] = useState('')
  const [waist, setWaist] = useState('')
  const [hip, setHip] = useState('')
  const [bodyFat, setBodyFat] = useState('')
  const [notes, setNotes] = useState('')

  const filteredPatients = useMemo(() => {
    if (!patientSearch.trim()) return MOCK_PATIENTS
    const query = patientSearch.toLowerCase()
    return MOCK_PATIENTS.filter((p) => p.name.toLowerCase().includes(query))
  }, [patientSearch])

  const handleSelectPatient = (patient: PatientOption) => {
    setSelectedPatient(patient)
    setPatientSearch(patient.name)
    setShowPatientList(false)
  }

  const handleSave = () => {
    console.log('Salvar registro:', {
      patient: selectedPatient,
      recordType,
      content,
      isPrivate,
      metadata: { weight, height, waist, hip, bodyFat, notes },
    })
  }

  const handleAttachDocument = () => {
    console.log('Anexar documento')
  }

  const handleGoBack = () => {
    console.log('Navigate back to clinical records')
  }

  const isValid = selectedPatient && recordType && content.trim()

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={handleGoBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors self-start"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para prontuários
      </button>

      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Novo Registro Clínico</h1>
          <p className="mt-1 text-sm text-gray-500">
            Crie um novo registro no prontuário do paciente.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleAttachDocument}>
            <Paperclip className="h-4 w-4" />
            Anexar Documento
          </Button>
          <Button onClick={handleSave} disabled={!isValid}>
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content Area */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Patient Selector */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Paciente</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Input
                  placeholder="Buscar paciente..."
                  value={patientSearch}
                  onChange={(e) => {
                    setPatientSearch(e.target.value)
                    setSelectedPatient(null)
                    setShowPatientList(true)
                  }}
                  onFocus={() => setShowPatientList(true)}
                  leftIcon={<Search className="h-4 w-4" />}
                />
                {showPatientList && filteredPatients.length > 0 && !selectedPatient && (
                  <div className="absolute top-full left-0 right-0 z-10 mt-1 max-h-48 overflow-y-auto rounded-lg border border-gray-200 bg-white shadow-lg">
                    {filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => handleSelectPatient(patient)}
                        className="flex w-full items-center gap-3 px-4 py-2.5 text-left hover:bg-gray-50 transition-colors"
                      >
                        <Avatar name={patient.name} src={patient.avatarUrl} size="sm" />
                        <span className="text-sm text-gray-900">{patient.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {selectedPatient && (
                <div className="mt-3 flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                  <Avatar name={selectedPatient.name} src={selectedPatient.avatarUrl} size="md" />
                  <div>
                    <p className="text-sm font-medium text-blue-900">{selectedPatient.name}</p>
                    <p className="text-xs text-blue-600">Paciente selecionado</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Record Type */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Tipo de Registro</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={recordType}
                onChange={(e) => setRecordType(e.target.value as RecordType | '')}
                placeholder="Selecionar tipo de registro"
              >
                <option value="evolution">Evolução</option>
                <option value="anamnesis">Anamnese</option>
                <option value="prescription">Prescrição</option>
                <option value="exam_request">Solicitação de exames</option>
                <option value="certificate">Atestado</option>
              </Select>
            </CardContent>
          </Card>

          {/* Content */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Conteúdo</CardTitle>
                <button
                  type="button"
                  onClick={() => setIsPrivate(!isPrivate)}
                  className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {isPrivate ? (
                    <>
                      <Lock className="h-4 w-4" />
                      <Badge variant="warning" size="sm">Privado</Badge>
                    </>
                  ) : (
                    <>
                      <Unlock className="h-4 w-4" />
                      <Badge variant="success" size="sm">Compartilhado</Badge>
                    </>
                  )}
                </button>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Escreva o conteúdo do registro clínico..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={12}
                helperText="Este campo suportará edição em texto rico em uma versão futura."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - Metadata */}
        <div className="flex flex-col gap-6">
          {/* Measurements (shown for evolution type) */}
          {(recordType === 'evolution' || recordType === '') && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Medidas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-3">
                  <Input
                    label="Peso (kg)"
                    placeholder="Ex: 72.5"
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    leftIcon={<Scale className="h-4 w-4" />}
                  />
                  <Input
                    label="Altura (cm)"
                    placeholder="Ex: 175"
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    leftIcon={<Ruler className="h-4 w-4" />}
                  />
                  <Input
                    label="Circunferência abdominal (cm)"
                    placeholder="Ex: 85"
                    value={waist}
                    onChange={(e) => setWaist(e.target.value)}
                  />
                  <Input
                    label="Circunferência do quadril (cm)"
                    placeholder="Ex: 98"
                    value={hip}
                    onChange={(e) => setHip(e.target.value)}
                  />
                  <Input
                    label="Percentual de gordura (%)"
                    placeholder="Ex: 22.5"
                    value={bodyFat}
                    onChange={(e) => setBodyFat(e.target.value)}
                  />

                  {weight && height && (
                    <div className="rounded-lg bg-gray-50 p-3 mt-1">
                      <p className="text-xs text-gray-500">IMC calculado</p>
                      <p className="text-lg font-bold text-gray-900">
                        {(parseFloat(weight) / Math.pow(parseFloat(height) / 100, 2)).toFixed(1)}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Additional Notes */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Observações Internas</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Notas internas (não visíveis ao paciente)..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
              />
            </CardContent>
          </Card>

          {/* Visibility Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Visibilidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <div className="flex items-center gap-2">
                  {isPrivate ? (
                    <Lock className="h-4 w-4 text-yellow-500" />
                  ) : (
                    <Unlock className="h-4 w-4 text-green-500" />
                  )}
                  <span className="text-gray-700">
                    {isPrivate
                      ? 'Registro visível apenas para profissionais'
                      : 'Registro compartilhado com o paciente'
                    }
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Você pode alterar a visibilidade clicando no cadeado acima do campo de conteúdo.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
