import { useState, useMemo } from 'react'
import { Search, Link as LinkIcon } from 'lucide-react'
import {
  Modal,
  ModalHeader,
  ModalTitle,
  ModalDescription,
  ModalBody,
  ModalFooter,
  Button,
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

interface NewAppointmentModalProps {
  open: boolean
  onClose: () => void
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

const AVAILABLE_TIMES = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '11:00', '11:30', '13:00', '13:30', '14:00', '14:30',
  '15:00', '15:30', '16:00', '16:30', '17:00',
]

// ─── Component ────────────────────────────────────────────────────────────────

export default function NewAppointmentModal({ open, onClose }: NewAppointmentModalProps) {
  const [patientSearch, setPatientSearch] = useState('')
  const [selectedPatient, setSelectedPatient] = useState<PatientOption | null>(null)
  const [showPatientList, setShowPatientList] = useState(false)
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [type, setType] = useState('')
  const [notes, setNotes] = useState('')
  const [price, setPrice] = useState('200,00')
  const [meetingLink, setMeetingLink] = useState('')

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
    console.log('Agendar consulta:', {
      patient: selectedPatient,
      date,
      time,
      type,
      notes,
      price,
      meetingLink,
    })
    handleReset()
    onClose()
  }

  const handleReset = () => {
    setPatientSearch('')
    setSelectedPatient(null)
    setShowPatientList(false)
    setDate('')
    setTime('')
    setType('')
    setNotes('')
    setPrice('200,00')
    setMeetingLink('')
  }

  const handleClose = () => {
    handleReset()
    onClose()
  }

  const isValid = selectedPatient && date && time && type

  return (
    <Modal open={open} onClose={handleClose} size="lg">
      <ModalHeader onClose={handleClose}>
        <ModalTitle>Nova Consulta</ModalTitle>
        <ModalDescription>Preencha os dados para agendar uma nova consulta.</ModalDescription>
      </ModalHeader>

      <ModalBody className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto">
        {/* Patient Search */}
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

        {/* Date and Time */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Data"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />

          <Select
            label="Horário"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            placeholder="Selecionar horário"
          >
            {AVAILABLE_TIMES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </Select>
        </div>

        {/* Appointment Type */}
        <Select
          label="Tipo de consulta"
          value={type}
          onChange={(e) => setType(e.target.value)}
          placeholder="Selecionar tipo"
        >
          <option value="first">Primeira consulta</option>
          <option value="return">Retorno</option>
          <option value="follow_up">Acompanhamento</option>
        </Select>

        {/* Price */}
        <Input
          label="Valor (R$)"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="0,00"
          helperText="Valor pré-configurado. Altere se necessário."
        />

        {/* Meeting Link */}
        <Input
          label="Link da reunião (opcional)"
          placeholder="https://meet.google.com/... ou https://zoom.us/..."
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
          leftIcon={<LinkIcon className="h-4 w-4" />}
        />

        {/* Notes */}
        <Textarea
          label="Observações"
          placeholder="Informações adicionais sobre a consulta..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </ModalBody>

      <ModalFooter>
        <Button variant="outline" onClick={handleClose}>
          Cancelar
        </Button>
        <Button onClick={handleSubmit} disabled={!isValid}>
          Agendar
        </Button>
      </ModalFooter>
    </Modal>
  )
}
