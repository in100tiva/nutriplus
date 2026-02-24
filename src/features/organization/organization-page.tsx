import { useState } from 'react'
import {
  Building2,
  MapPin,
  Phone,
  Users,
  CalendarDays,
  UserPlus,
  Crown,
  ArrowUpRight,
  Mail,
  Copy,
  Check,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Avatar,
  Input,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui'
import { formatDate } from '@/lib/utils'

/* ─── Types ───────────────────────────────────────────────────── */

type MemberRole = 'admin' | 'professional' | 'secretary'

interface OrganizationMember {
  id: string
  name: string
  avatar: string | null
  specialty: string
  role: MemberRole
  joinDate: string
  email: string
}

interface ClinicInfo {
  name: string
  address: string
  city: string
  state: string
  phone: string
  email: string
  logo: string | null
  plan: string
}

/* ─── Mock Data ───────────────────────────────────────────────── */

const CLINIC: ClinicInfo = {
  name: 'Clinica NutriVida',
  address: 'Av. Paulista, 1578 - Sala 1204, Bela Vista',
  city: 'Sao Paulo',
  state: 'SP',
  phone: '11999887766',
  email: 'contato@nutrivida.com.br',
  logo: null,
  plan: 'Clinic',
}

const MOCK_MEMBERS: OrganizationMember[] = [
  {
    id: '1',
    name: 'Dra. Ana Carolina Mendes',
    avatar: null,
    specialty: 'Nutricionista Clinico',
    role: 'admin',
    joinDate: '2024-06-15',
    email: 'ana.mendes@nutrivida.com.br',
  },
  {
    id: '2',
    name: 'Dr. Rafael Oliveira Santos',
    avatar: null,
    specialty: 'Nutrologo',
    role: 'professional',
    joinDate: '2024-08-20',
    email: 'rafael.santos@nutrivida.com.br',
  },
  {
    id: '3',
    name: 'Dra. Juliana Costa Ferreira',
    avatar: null,
    specialty: 'Nutricionista Esportivo',
    role: 'professional',
    joinDate: '2025-01-10',
    email: 'juliana.ferreira@nutrivida.com.br',
  },
  {
    id: '4',
    name: 'Dra. Camila Rodrigues Pinto',
    avatar: null,
    specialty: 'Nutricionista Clinico',
    role: 'professional',
    joinDate: '2025-03-05',
    email: 'camila.pinto@nutrivida.com.br',
  },
  {
    id: '5',
    name: 'Patricia Almeida',
    avatar: null,
    specialty: 'Secretaria',
    role: 'secretary',
    joinDate: '2024-07-01',
    email: 'patricia@nutrivida.com.br',
  },
]

const ANALYTICS = {
  totalPatients: 342,
  totalAppointmentsThisMonth: 87,
  activeMembers: 5,
  occupancyRate: 72,
}

/* ─── Helpers ─────────────────────────────────────────────────── */

const ROLE_CONFIG: Record<MemberRole, { label: string; variant: 'info' | 'success' | 'warning' | 'default' }> = {
  admin: { label: 'Administrador', variant: 'warning' },
  professional: { label: 'Profissional', variant: 'info' },
  secretary: { label: 'Secretaria', variant: 'default' },
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  return phone
}

/* ─── Component ───────────────────────────────────────────────── */

export function OrganizationPage() {
  const [inviteModalOpen, setInviteModalOpen] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteRole, setInviteRole] = useState<MemberRole>('professional')
  const [copiedLink, setCopiedLink] = useState(false)

  function handleCopyInviteLink() {
    setCopiedLink(true)
    setTimeout(() => setCopiedLink(false), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Organizacao</h1>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* ─── Left Column ──────────────────────────────────── */}
          <div className="space-y-6 lg:col-span-2">
            {/* Clinic Info Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5 text-blue-500" />
                    {CLINIC.name}
                  </CardTitle>
                  <Badge variant="info" size="md">
                    Plano {CLINIC.plan}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="h-4 w-4 text-gray-400" />
                  <span>
                    {CLINIC.address} - {CLINIC.city}, {CLINIC.state}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{formatPhone(CLINIC.phone)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{CLINIC.email}</span>
                </div>
              </CardContent>
            </Card>

            {/* Members List */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>
                    Membros ({MOCK_MEMBERS.length})
                  </CardTitle>
                  <Button size="sm" onClick={() => setInviteModalOpen(true)}>
                    <UserPlus className="h-4 w-4" />
                    Convidar Profissional
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {MOCK_MEMBERS.map((member) => {
                    const roleConfig = ROLE_CONFIG[member.role]
                    return (
                      <div
                        key={member.id}
                        className="flex items-center justify-between rounded-lg border border-gray-100 p-4 transition-colors hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <Avatar name={member.name} src={member.avatar} size="md" />
                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-sm font-semibold text-gray-900">
                                {member.name}
                              </p>
                              {member.role === 'admin' && (
                                <Crown className="h-4 w-4 text-yellow-500" />
                              )}
                            </div>
                            <p className="text-xs text-gray-500">{member.specialty}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <Badge variant={roleConfig.variant} size="sm">
                            {roleConfig.label}
                          </Badge>
                          <span className="hidden text-xs text-gray-400 sm:block">
                            Desde {formatDate(member.joinDate)}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ─── Right Column ─────────────────────────────────── */}
          <div className="space-y-6">
            {/* Analytics */}
            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Users className="mx-auto h-6 w-6 text-blue-500" />
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {ANALYTICS.totalPatients}
                  </p>
                  <p className="text-xs text-gray-500">Pacientes totais</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <CalendarDays className="mx-auto h-6 w-6 text-green-500" />
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {ANALYTICS.totalAppointmentsThisMonth}
                  </p>
                  <p className="text-xs text-gray-500">Consultas este mes</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <UserPlus className="mx-auto h-6 w-6 text-purple-500" />
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {ANALYTICS.activeMembers}
                  </p>
                  <p className="text-xs text-gray-500">Membros ativos</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <CalendarDays className="mx-auto h-6 w-6 text-orange-500" />
                  <p className="mt-2 text-2xl font-bold text-gray-900">
                    {ANALYTICS.occupancyRate}%
                  </p>
                  <p className="text-xs text-gray-500">Taxa de ocupacao</p>
                </CardContent>
              </Card>
            </div>

            {/* Plan info */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Seu Plano</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Plano atual</span>
                  <Badge variant="info" size="md">
                    Clinic
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Profissionais</span>
                  <span className="text-sm font-medium text-gray-900">
                    {MOCK_MEMBERS.filter((m) => m.role !== 'secretary').length} / 10
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Valor mensal</span>
                  <span className="text-sm font-bold text-gray-900">R$ 249,00</span>
                </div>

                <Button variant="outline" size="sm" className="w-full">
                  <ArrowUpRight className="h-4 w-4" />
                  Gerenciar plano
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* ─── Invite Modal ─────────────────────────────────────── */}
      <Modal open={inviteModalOpen} onClose={() => setInviteModalOpen(false)} size="md">
        <ModalHeader onClose={() => setInviteModalOpen(false)}>
          <ModalTitle>Convidar Profissional</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <Input
            label="E-mail do profissional"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="nome@email.com"
          />

          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Funcao
            </label>
            <div className="flex gap-2">
              {(['professional', 'secretary'] as MemberRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  onClick={() => setInviteRole(role)}
                  className={`rounded-lg border-2 px-4 py-2 text-sm font-medium transition-colors ${
                    inviteRole === role
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {ROLE_CONFIG[role].label}
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg bg-gray-50 p-4">
            <p className="mb-2 text-xs font-medium text-gray-700">
              Ou compartilhe o link de convite:
            </p>
            <div className="flex gap-2">
              <Input
                value="https://medhub.com/invite/nv-abc123"
                readOnly
                className="text-xs"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyInviteLink}
              >
                {copiedLink ? (
                  <Check className="h-4 w-4 text-green-500" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setInviteModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            disabled={!inviteEmail.trim()}
            onClick={() => setInviteModalOpen(false)}
          >
            <Mail className="h-4 w-4" />
            Enviar convite
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}
