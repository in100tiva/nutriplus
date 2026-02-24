import { useState, useMemo } from 'react'
import {
  ArrowLeft,
  Search,
  Plus,
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
} from '@/components/ui'

// ─── Types ────────────────────────────────────────────────────────────────────

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

export default function NewTaskForm() {
  // Patient selection
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null)
  const [showPatientList, setShowPatientList] = useState(false)

  // Task fields
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [taskType, setTaskType] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [recurrence, setRecurrence] = useState('none')

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

  const handleSubmit = () => {
    console.log('Criar tarefa:', {
      patient: selectedPatient,
      title,
      description,
      taskType,
      dueDate,
      recurrence,
    })
  }

  const handleGoBack = () => {
    console.log('Navigate back to tasks')
  }

  const isValid = selectedPatient && title.trim() && taskType

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Back Button */}
      <button
        type="button"
        onClick={handleGoBack}
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors self-start"
      >
        <ArrowLeft className="h-4 w-4" />
        Voltar para tarefas
      </button>

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Nova Tarefa</h1>
        <p className="mt-1 text-sm text-gray-500">
          Crie uma nova tarefa para um paciente.
        </p>
      </div>

      <div className="max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Detalhes da Tarefa</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            {/* Patient Selector */}
            <div className="relative">
              <Input
                label="Paciente"
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
              {showPatientList && filteredPatients.length === 0 && patientSearch.trim() && (
                <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-lg border border-gray-200 bg-white p-4 shadow-lg">
                  <p className="text-sm text-gray-500 text-center">Nenhum paciente encontrado</p>
                </div>
              )}
            </div>

            {selectedPatient && (
              <div className="flex items-center gap-3 rounded-lg bg-blue-50 p-3">
                <Avatar name={selectedPatient.name} src={selectedPatient.avatarUrl} size="sm" />
                <div>
                  <p className="text-sm font-medium text-blue-900">{selectedPatient.name}</p>
                  <p className="text-xs text-blue-600">Paciente selecionado</p>
                </div>
              </div>
            )}

            {/* Title */}
            <Input
              label="Título"
              placeholder="Ex: Registrar diário alimentar"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />

            {/* Description */}
            <Textarea
              label="Descrição"
              placeholder="Descreva os detalhes da tarefa..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            {/* Task Type */}
            <Select
              label="Tipo de tarefa"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              placeholder="Selecionar tipo"
            >
              <option value="general">Geral</option>
              <option value="meal_plan">Plano Alimentar</option>
              <option value="exercise">Exercício</option>
              <option value="therapy">Terapia</option>
              <option value="medication">Medicação</option>
              <option value="checkin">Check-in</option>
            </Select>

            {/* Due Date */}
            <Input
              label="Data limite (opcional)"
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              helperText="Deixe em branco para tarefas sem prazo."
            />

            {/* Recurrence */}
            <Select
              label="Recorrência"
              value={recurrence}
              onChange={(e) => setRecurrence(e.target.value)}
            >
              <option value="none">Nenhuma</option>
              <option value="daily">Diária</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
            </Select>

            {/* Submit Button */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button variant="outline" onClick={handleGoBack}>
                Cancelar
              </Button>
              <Button onClick={handleSubmit} disabled={!isValid}>
                <Plus className="h-4 w-4" />
                Criar Tarefa
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
