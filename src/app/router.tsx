import { createBrowserRouter, Navigate, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loading } from '@/components/ui'
import { AuthLayout, DashboardShell } from '@/components/layout'
import { LandingPage } from '@/features/marketing/landing-page'
import { LoginPage } from '@/features/auth/login-page'
import { CadastroPage } from '@/features/auth/cadastro-page'
import { NutriDashboard } from '@/features/app/dashboard-nutri'
import { PerfilNutriPage } from '@/features/app/perfil-page'
import { AgendaPage } from '@/features/app/agenda-page'
import { PacientesPage } from '@/features/app/pacientes-page'
import { PacienteDetalhePage } from '@/features/app/paciente-detalhe-page'
import { PlanosPage } from '@/features/app/planos-page'
import { PlanoEditorPage } from '@/features/app/plano-editor-page'
import { ConsultaPage } from '@/features/app/consulta-page'
import { PacienteAgendamentosPage } from '@/features/paciente/agendamentos-page'
import { PacientePlanoPage } from '@/features/paciente/plano-page'
import { PacienteEvolucaoPage } from '@/features/paciente/evolucao-page'
import { NutriPublicPage } from '@/features/publico/nutri-public-page'
import { AdminSaudePage } from '@/features/admin/saude-page'

function ProtectedRoute() {
  const { session, initialized } = useAuth()
  if (!initialized) return <Loading label="Carregando..." />
  if (!session) return <Navigate to="/login" replace />
  return <Outlet />
}

function AuthRedirect() {
  const { session, initialized, profile } = useAuth()
  if (!initialized) return <Loading label="Carregando..." />
  if (session) {
    if (profile?.role === 'nutricionista') return <Navigate to="/app" replace />
    if (profile?.role === 'admin') return <Navigate to="/admin/saude" replace />
    return <Navigate to="/paciente/agendamentos" replace />
  }
  return <Outlet />
}

function RoleGate({ allow }: { allow: Array<'nutricionista' | 'paciente' | 'admin'> }) {
  const { profile, initialized } = useAuth()
  if (!initialized) return <Loading label="Carregando..." />
  if (!profile) return <Navigate to="/login" replace />
  if (!allow.includes(profile.role)) {
    const fallback =
      profile.role === 'nutricionista'
        ? '/app'
        : profile.role === 'admin'
          ? '/admin/saude'
          : '/paciente/agendamentos'
    return <Navigate to={fallback} replace />
  }
  return <Outlet />
}

function NutriShell() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  return (
    <DashboardShell
      role="nutricionista"
      user={{ name: profile?.nome ?? 'Nutricionista', sub: 'Nutricionista', avatarUrl: profile?.avatar_url ?? undefined }}
      onSignOut={async () => {
        await signOut()
        navigate('/login')
      }}
    >
      <Outlet />
    </DashboardShell>
  )
}

function PacienteShell() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  return (
    <DashboardShell
      role="paciente"
      user={{ name: profile?.nome ?? 'Paciente', sub: 'Paciente', avatarUrl: profile?.avatar_url ?? undefined }}
      onSignOut={async () => {
        await signOut()
        navigate('/login')
      }}
    >
      <Outlet />
    </DashboardShell>
  )
}

function AdminShell() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  return (
    <DashboardShell
      role="admin"
      user={{ name: profile?.nome ?? 'Admin', sub: 'Admin', avatarUrl: profile?.avatar_url ?? undefined }}
      onSignOut={async () => {
        await signOut()
        navigate('/login')
      }}
    >
      <Outlet />
    </DashboardShell>
  )
}

function AuthShell() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}

export const router = createBrowserRouter([
  // Públicas
  { path: '/', element: <LandingPage /> },
  { path: '/nutri/:slug', element: <NutriPublicPage /> },

  // Auth (somente se NÃO logado)
  {
    element: <AuthRedirect />,
    children: [
      {
        element: <AuthShell />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/cadastro', element: <CadastroPage /> },
        ],
      },
    ],
  },

  // Área do nutricionista
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleGate allow={['nutricionista']} />,
        children: [
          {
            element: <NutriShell />,
            children: [
              { path: '/app', element: <NutriDashboard /> },
              { path: '/app/agenda', element: <AgendaPage /> },
              { path: '/app/pacientes', element: <PacientesPage /> },
              { path: '/app/pacientes/:id', element: <PacienteDetalhePage /> },
              { path: '/app/planos', element: <PlanosPage /> },
              { path: '/app/planos/:id', element: <PlanoEditorPage /> },
              { path: '/app/consulta/:id', element: <ConsultaPage perspectiva="nutricionista" /> },
              { path: '/app/perfil', element: <PerfilNutriPage /> },
            ],
          },
        ],
      },

      // Área do paciente
      {
        element: <RoleGate allow={['paciente']} />,
        children: [
          {
            element: <PacienteShell />,
            children: [
              { path: '/paciente/agendamentos', element: <PacienteAgendamentosPage /> },
              { path: '/paciente/plano', element: <PacientePlanoPage /> },
              { path: '/paciente/evolucao', element: <PacienteEvolucaoPage /> },
              { path: '/paciente/consulta/:id', element: <ConsultaPage perspectiva="paciente" /> },
            ],
          },
        ],
      },

      // Área admin
      {
        element: <RoleGate allow={['admin']} />,
        children: [
          {
            element: <AdminShell />,
            children: [{ path: '/admin/saude', element: <AdminSaudePage /> }],
          },
        ],
      },
    ],
  },
])
