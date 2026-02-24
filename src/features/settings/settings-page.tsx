import { useState } from 'react'
import {
  User,
  Bell,
  Shield,
  Lock,
  Download,
  Trash2,
  Camera,
  Save,
  Eye,
  EyeOff,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Input,
  Textarea,
  Avatar,
  Badge,
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
  Modal,
  ModalHeader,
  ModalTitle,
  ModalBody,
  ModalFooter,
} from '@/components/ui'

/* ─── Types ───────────────────────────────────────────────────── */

interface NotificationSetting {
  id: string
  label: string
  description: string
  email: boolean
  push: boolean
}

/* ─── Mock Data ───────────────────────────────────────────────── */

const PROFILE = {
  name: 'Maria Clara Santos',
  email: 'maria.clara@email.com',
  phone: '11987654321',
  avatar: null as string | null,
  bio: 'Paciente dedicada a melhorar minha saude e qualidade de vida atraves da nutricao e habitos saudaveis.',
}

const INITIAL_NOTIFICATIONS: NotificationSetting[] = [
  {
    id: 'appointment_reminder',
    label: 'Lembretes de consulta',
    description: 'Receba lembretes antes de suas consultas agendadas',
    email: true,
    push: true,
  },
  {
    id: 'new_message',
    label: 'Novas mensagens',
    description: 'Notificacoes quando receber novas mensagens dos profissionais',
    email: false,
    push: true,
  },
  {
    id: 'task_due',
    label: 'Tarefas com prazo proximo',
    description: 'Alerta quando uma tarefa estiver proxima do prazo',
    email: true,
    push: true,
  },
  {
    id: 'new_document',
    label: 'Novos documentos',
    description: 'Quando um profissional enviar um novo documento para voce',
    email: true,
    push: false,
  },
  {
    id: 'appointment_cancelled',
    label: 'Cancelamento de consulta',
    description: 'Quando uma consulta for cancelada pelo profissional',
    email: true,
    push: true,
  },
  {
    id: 'promotions',
    label: 'Novidades e promocoes',
    description: 'Informacoes sobre novos recursos e promocoes da plataforma',
    email: false,
    push: false,
  },
]

/* ─── Component ───────────────────────────────────────────────── */

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Configuracoes</h1>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">
              <User className="mr-1.5 h-4 w-4" />
              Perfil
            </TabsTrigger>
            <TabsTrigger value="notifications">
              <Bell className="mr-1.5 h-4 w-4" />
              Notificacoes
            </TabsTrigger>
            <TabsTrigger value="security">
              <Lock className="mr-1.5 h-4 w-4" />
              Seguranca
            </TabsTrigger>
            <TabsTrigger value="privacy">
              <Shield className="mr-1.5 h-4 w-4" />
              Privacidade
            </TabsTrigger>
          </TabsList>

          <TabsContent value="profile">
            <ProfileSection />
          </TabsContent>

          <TabsContent value="notifications">
            <NotificationsSection />
          </TabsContent>

          <TabsContent value="security">
            <SecuritySection />
          </TabsContent>

          <TabsContent value="privacy">
            <PrivacySection />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

/* ─── Profile Section ─────────────────────────────────────────── */

function ProfileSection() {
  const [name, setName] = useState(PROFILE.name)
  const [email, setEmail] = useState(PROFILE.email)
  const [phone, setPhone] = useState(PROFILE.phone)
  const [bio, setBio] = useState(PROFILE.bio)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Informacoes do Perfil</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Avatar */}
        <div className="flex items-center gap-4">
          <div className="relative">
            <Avatar name={PROFILE.name} src={PROFILE.avatar} size="xl" className="h-20 w-20 [&>div]:h-20 [&>div]:w-20 [&>div]:text-xl" />
            <button
              type="button"
              className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white shadow-sm transition-colors hover:bg-blue-600"
            >
              <Camera className="h-4 w-4" />
            </button>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{PROFILE.name}</p>
            <p className="text-xs text-gray-500">JPG, PNG ou GIF. Max 2MB.</p>
          </div>
        </div>

        {/* Form fields */}
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="E-mail"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <Input
            label="Telefone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(00) 00000-0000"
          />
        </div>

        <Textarea
          label="Bio"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Conte um pouco sobre voce..."
          rows={3}
          helperText="Esta informacao pode ser visivel para profissionais."
        />

        <div className="flex justify-end border-t pt-4">
          <Button>
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Notifications Section ───────────────────────────────────── */

function NotificationsSection() {
  const [notifications, setNotifications] = useState(INITIAL_NOTIFICATIONS)

  function toggleNotification(
    id: string,
    channel: 'email' | 'push',
  ) {
    setNotifications((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, [channel]: !n[channel] } : n,
      ),
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Preferencias de Notificacao</CardTitle>
      </CardHeader>
      <CardContent>
        {/* Header row */}
        <div className="mb-4 flex items-center justify-end gap-8 pr-1">
          <span className="text-xs font-medium uppercase text-gray-500">E-mail</span>
          <span className="text-xs font-medium uppercase text-gray-500">Push</span>
        </div>

        <div className="space-y-4">
          {notifications.map((setting) => (
            <div
              key={setting.id}
              className="flex items-center justify-between rounded-lg border border-gray-100 p-4"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">{setting.label}</p>
                <p className="text-xs text-gray-500">{setting.description}</p>
              </div>

              <div className="flex items-center gap-8">
                <ToggleSwitch
                  enabled={setting.email}
                  onToggle={() => toggleNotification(setting.id, 'email')}
                  label={`Email para ${setting.label}`}
                />
                <ToggleSwitch
                  enabled={setting.push}
                  onToggle={() => toggleNotification(setting.id, 'push')}
                  label={`Push para ${setting.label}`}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 flex justify-end border-t pt-4">
          <Button>
            <Save className="h-4 w-4" />
            Salvar
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

/* ─── Security Section ────────────────────────────────────────── */

function SecuritySection() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const passwordsMatch = newPassword === confirmPassword
  const isValid =
    currentPassword.length > 0 && newPassword.length >= 8 && passwordsMatch

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Alterar Senha</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Senha atual"
            type={showCurrent ? 'text' : 'password'}
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Digite sua senha atual"
            rightIcon={
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="pointer-events-auto cursor-pointer"
              >
                {showCurrent ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />

          <Input
            label="Nova senha"
            type={showNew ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="Minimo 8 caracteres"
            helperText="Use letras, numeros e caracteres especiais."
            rightIcon={
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="pointer-events-auto cursor-pointer"
              >
                {showNew ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            }
          />

          <Input
            label="Confirmar nova senha"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repita a nova senha"
            error={
              confirmPassword && !passwordsMatch
                ? 'As senhas nao coincidem'
                : undefined
            }
          />

          <div className="flex justify-end border-t pt-4">
            <Button disabled={!isValid}>
              <Lock className="h-4 w-4" />
              Alterar senha
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Autenticacao em dois fatores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">
                Adicione uma camada extra de seguranca a sua conta.
              </p>
              <Badge variant="warning" size="sm" className="mt-2">
                Em breve
              </Badge>
            </div>
            <Button variant="outline" disabled>
              Configurar
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

/* ─── Privacy Section ─────────────────────────────────────────── */

function PrivacySection() {
  const [deleteModalOpen, setDeleteModalOpen] = useState(false)
  const [deleteConfirmation, setDeleteConfirmation] = useState('')

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Exportar Dados</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            Voce pode solicitar uma copia de todos os seus dados pessoais armazenados na plataforma.
            O arquivo sera enviado para seu e-mail em formato JSON.
          </p>
          <Button variant="outline">
            <Download className="h-4 w-4" />
            Solicitar exportacao de dados
          </Button>
        </CardContent>
      </Card>

      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="text-red-600">Excluir Conta</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="mb-4 text-sm text-gray-600">
            Ao excluir sua conta, todos os seus dados serao permanentemente removidos. Esta acao
            nao pode ser desfeita. Seus dados serao apagados em ate 30 dias.
          </p>
          <Button variant="danger" onClick={() => setDeleteModalOpen(true)}>
            <Trash2 className="h-4 w-4" />
            Solicitar exclusao de conta
          </Button>
        </CardContent>
      </Card>

      {/* Delete account modal */}
      <Modal
        open={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        size="sm"
        persistent
      >
        <ModalHeader onClose={() => setDeleteModalOpen(false)}>
          <ModalTitle>Excluir conta permanentemente</ModalTitle>
        </ModalHeader>
        <ModalBody className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4">
            <p className="text-sm font-medium text-red-800">
              Atencao: esta acao e irreversivel!
            </p>
            <p className="mt-1 text-sm text-red-600">
              Todos os seus dados, incluindo historico de consultas, documentos e mensagens,
              serao permanentemente excluidos.
            </p>
          </div>

          <Input
            label='Digite "EXCLUIR" para confirmar'
            value={deleteConfirmation}
            onChange={(e) => setDeleteConfirmation(e.target.value)}
            placeholder="EXCLUIR"
          />
        </ModalBody>
        <ModalFooter>
          <Button variant="outline" onClick={() => setDeleteModalOpen(false)}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            disabled={deleteConfirmation !== 'EXCLUIR'}
            onClick={() => setDeleteModalOpen(false)}
          >
            Confirmar exclusao
          </Button>
        </ModalFooter>
      </Modal>
    </div>
  )
}

/* ─── Toggle Switch ───────────────────────────────────────────── */

function ToggleSwitch({
  enabled,
  onToggle,
  label,
}: {
  enabled: boolean
  onToggle: () => void
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={enabled}
      aria-label={label}
      onClick={onToggle}
      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors ${
        enabled ? 'bg-blue-500' : 'bg-gray-200'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          enabled ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}
