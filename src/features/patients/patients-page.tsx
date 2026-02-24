import { useState, useMemo } from 'react'
import {
  Search,
  Plus,
  Filter,
  ChevronLeft,
  ChevronRight,
  Users,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { EmptyState } from '@/components/ui/empty-state'
import { formatDate } from '@/lib/utils'

// ─── Types ────────────────────────────────────────────────────────────────────

interface Patient {
  id: string
  name: string
  email: string
  phone: string
  avatarUrl: string | null
  status: 'active' | 'inactive'
  lastAppointment: string | null
  nextAppointment: string | null
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PATIENTS: Patient[] = [
  {
    id: '1',
    name: 'Ana Carolina Silva',
    email: 'ana.silva@email.com',
    phone: '11999887766',
    avatarUrl: null,
    status: 'active',
    lastAppointment: '2026-02-20',
    nextAppointment: '2026-03-06',
  },
  {
    id: '2',
    name: 'Bruno Oliveira Santos',
    email: 'bruno.santos@email.com',
    phone: '11988776655',
    avatarUrl: null,
    status: 'active',
    lastAppointment: '2026-02-18',
    nextAppointment: '2026-03-04',
  },
  {
    id: '3',
    name: 'Carla Mendes Ferreira',
    email: 'carla.ferreira@email.com',
    phone: '21977665544',
    avatarUrl: null,
    status: 'active',
    lastAppointment: '2026-02-15',
    nextAppointment: '2026-03-01',
  },
  {
    id: '4',
    name: 'Diego Almeida Costa',
    email: 'diego.costa@email.com',
    phone: '11966554433',
    avatarUrl: null,
    status: 'inactive',
    lastAppointment: '2025-12-10',
    nextAppointment: null,
  },
  {
    id: '5',
    name: 'Fernanda Rodrigues Lima',
    email: 'fernanda.lima@email.com',
    phone: '31955443322',
    avatarUrl: null,
    status: 'active',
    lastAppointment: '2026-02-22',
    nextAppointment: '2026-03-08',
  },
  {
    id: '6',
    name: 'Gabriel Pereira Souza',
    email: 'gabriel.souza@email.com',
    phone: '11944332211',
    avatarUrl: null,
    status: 'active',
    lastAppointment: '2026-02-10',
    nextAppointment: '2026-03-10',
  },
  {
    id: '7',
    name: 'Helena Castro Ribeiro',
    email: 'helena.ribeiro@email.com',
    phone: '21933221100',
    avatarUrl: null,
    status: 'inactive',
    lastAppointment: '2025-11-05',
    nextAppointment: null,
  },
  {
    id: '8',
    name: 'Igor Martins Barbosa',
    email: 'igor.barbosa@email.com',
    phone: '11922110099',
    avatarUrl: null,
    status: 'active',
    lastAppointment: '2026-02-19',
    nextAppointment: '2026-03-05',
  },
  {
    id: '9',
    name: 'Juliana Araujo Campos',
    email: 'juliana.campos@email.com',
    phone: '31911009988',
    avatarUrl: null,
    status: 'active',
    lastAppointment: '2026-02-17',
    nextAppointment: '2026-03-03',
  },
  {
    id: '10',
    name: 'Lucas Nascimento Dias',
    email: 'lucas.dias@email.com',
    phone: '11900998877',
    avatarUrl: null,
    status: 'active',
    lastAppointment: '2026-02-21',
    nextAppointment: '2026-03-07',
  },
  {
    id: '11',
    name: 'Mariana Teixeira Gomes',
    email: 'mariana.gomes@email.com',
    phone: '21998877665',
    avatarUrl: null,
    status: 'inactive',
    lastAppointment: '2025-10-20',
    nextAppointment: null,
  },
  {
    id: '12',
    name: 'Pedro Henrique Cardoso',
    email: 'pedro.cardoso@email.com',
    phone: '11987766554',
    avatarUrl: null,
    status: 'active',
    lastAppointment: '2026-02-14',
    nextAppointment: '2026-02-28',
  },
]

const ITEMS_PER_PAGE = 8

// ─── Component ────────────────────────────────────────────────────────────────

export default function PatientsPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('all')
  const [currentPage, setCurrentPage] = useState(1)

  const filteredPatients = useMemo(() => {
    let result = MOCK_PATIENTS

    // Search filter
    if (search.trim()) {
      const query = search.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.email.toLowerCase().includes(query),
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((p) => p.status === statusFilter)
    }

    // Last appointment date filter
    if (dateFilter !== 'all') {
      const now = new Date()
      result = result.filter((p) => {
        if (!p.lastAppointment) return dateFilter === '90+'
        const diff = Math.floor(
          (now.getTime() - new Date(p.lastAppointment).getTime()) /
            (1000 * 60 * 60 * 24),
        )
        switch (dateFilter) {
          case '7':
            return diff <= 7
          case '30':
            return diff <= 30
          case '90':
            return diff <= 90
          case '90+':
            return diff > 90
          default:
            return true
        }
      })
    }

    return result
  }, [search, statusFilter, dateFilter])

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / ITEMS_PER_PAGE))
  const paginatedPatients = filteredPatients.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handlePageChange = (page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)))
  }

  const handlePatientClick = (patientId: string) => {
    // Navigation placeholder - would use react-router navigate
    console.log(`Navigate to patient detail: ${patientId}`)
  }

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 lg:p-8">
      {/* Page Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seus pacientes e acompanhe seus atendimentos.
          </p>
        </div>
        <Button>
          <Plus className="h-4 w-4" />
          Novo Paciente
        </Button>
      </div>

      {/* Filters Bar */}
      <Card className="p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end">
          <div className="flex-1">
            <Input
              placeholder="Buscar por nome ou e-mail..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setCurrentPage(1)
              }}
              leftIcon={<Search className="h-4 w-4" />}
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <Select
              label="Status"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              wrapperClassName="min-w-[140px]"
            >
              <option value="all">Todos</option>
              <option value="active">Ativo</option>
              <option value="inactive">Inativo</option>
            </Select>
            <Select
              label="Ultima consulta"
              value={dateFilter}
              onChange={(e) => {
                setDateFilter(e.target.value)
                setCurrentPage(1)
              }}
              wrapperClassName="min-w-[180px]"
            >
              <option value="all">Qualquer data</option>
              <option value="7">Ultimos 7 dias</option>
              <option value="30">Ultimos 30 dias</option>
              <option value="90">Ultimos 90 dias</option>
              <option value="90+">Mais de 90 dias</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Patient List */}
      {paginatedPatients.length === 0 ? (
        <EmptyState
          icon={<Users className="h-6 w-6" />}
          title="Nenhum paciente encontrado"
          description="Tente ajustar os filtros ou adicione um novo paciente."
          action={
            <Button>
              <Plus className="h-4 w-4" />
              Novo Paciente
            </Button>
          }
        />
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Card>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 text-left">
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Paciente
                      </th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Status
                      </th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Ultima Consulta
                      </th>
                      <th className="px-6 py-3 text-xs font-medium uppercase tracking-wider text-gray-500">
                        Proxima Consulta
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedPatients.map((patient) => (
                      <tr
                        key={patient.id}
                        onClick={() => handlePatientClick(patient.id)}
                        className="cursor-pointer transition-colors hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar
                              name={patient.name}
                              src={patient.avatarUrl}
                              size="md"
                            />
                            <div>
                              <p className="font-medium text-gray-900">
                                {patient.name}
                              </p>
                              <p className="text-sm text-gray-500">
                                {patient.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={
                              patient.status === 'active' ? 'success' : 'default'
                            }
                          >
                            {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {patient.lastAppointment
                            ? formatDate(patient.lastAppointment)
                            : '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {patient.nextAppointment
                            ? formatDate(patient.nextAppointment)
                            : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </div>

          {/* Mobile Cards */}
          <div className="flex flex-col gap-3 md:hidden">
            {paginatedPatients.map((patient) => (
              <Card
                key={patient.id}
                className="cursor-pointer p-4 transition-colors hover:bg-gray-50"
                onClick={() => handlePatientClick(patient.id)}
              >
                <div className="flex items-start gap-3">
                  <Avatar
                    name={patient.name}
                    src={patient.avatarUrl}
                    size="md"
                  />
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="font-medium text-gray-900">{patient.name}</p>
                      <Badge
                        variant={
                          patient.status === 'active' ? 'success' : 'default'
                        }
                      >
                        {patient.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">{patient.email}</p>
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                      <span>
                        Ultima:{' '}
                        {patient.lastAppointment
                          ? formatDate(patient.lastAppointment)
                          : '-'}
                      </span>
                      <span>
                        Proxima:{' '}
                        {patient.nextAppointment
                          ? formatDate(patient.nextAppointment)
                          : '-'}
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-500">
              Mostrando{' '}
              <span className="font-medium">
                {(currentPage - 1) * ITEMS_PER_PAGE + 1}
              </span>{' '}
              a{' '}
              <span className="font-medium">
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredPatients.length)}
              </span>{' '}
              de{' '}
              <span className="font-medium">{filteredPatients.length}</span>{' '}
              pacientes
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'primary' : 'ghost'}
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
