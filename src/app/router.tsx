import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/hooks/use-auth'
import { Loading } from '@/components/ui/loading'
import { AuthLayout } from '@/components/layout/auth-layout'
import { DashboardShell } from '@/components/layout/dashboard-shell'
import { PublicLayout } from '@/components/layout/public-layout'

// Auth
import { LoginPage } from '@/features/auth/login-page'
import { RegisterPage } from '@/features/auth/register-page'
import { ForgotPasswordPage } from '@/features/auth/forgot-password-page'

// Onboarding
import { ProfessionalOnboarding } from '@/features/onboarding/professional-onboarding'
import { PatientOnboarding } from '@/features/onboarding/patient-onboarding'

// Dashboards
import { ProfessionalDashboard } from '@/features/dashboard/professional-dashboard'
import { PatientDashboard } from '@/features/dashboard/patient-dashboard'

// Professional features
import PatientsPage from '@/features/patients/patients-page'
import PatientDetailPage from '@/features/patients/patient-detail-page'
import AppointmentsPage from '@/features/appointments/appointments-page'
import ClinicalRecordsPage from '@/features/clinical-records/clinical-records-page'
import RecordEditor from '@/features/clinical-records/record-editor'
import FormsPage from '@/features/forms/forms-page'
import TasksPage from '@/features/tasks/tasks-page'
import NewTaskForm from '@/features/tasks/new-task-form'
import ReviewsPage from '@/features/reviews/reviews-page'
import { OrganizationPage } from '@/features/organization/organization-page'

// Patient features
import { MarketplacePage } from '@/features/marketplace/marketplace-page'
import { ProfessionalPublicProfile } from '@/features/marketplace/professional-public-profile'
import { BookingFlow } from '@/features/marketplace/booking-flow'
import { MyAppointmentsPage } from '@/features/appointments/my-appointments-page'
import { MyTasksPage } from '@/features/tasks/my-tasks-page'

// Shared features
import { MessagesPage } from '@/features/messages/messages-page'
import { DocumentsPage } from '@/features/documents/documents-page'
import { BillingPage } from '@/features/billing/billing-page'
import { SettingsPage } from '@/features/settings/settings-page'

// Placeholder for routes not yet built
import { PlaceholderPage } from '@/features/placeholder-page'

// ─── ProtectedRoute ─────────────────────────────────────────────

function ProtectedRoute() {
  const { user, loading, initialized } = useAuth()

  if (!initialized || loading) {
    return <Loading label="Carregando..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <Outlet />
}

// ─── AuthRedirect (already logged in -> redirect) ───────────────

function AuthRedirect() {
  const { user, loading, initialized } = useAuth()

  if (!initialized || loading) {
    return <Loading label="Carregando..." />
  }

  if (user) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}

// ─── Root Redirect ──────────────────────────────────────────────

function RootRedirect() {
  const { user, profile, loading, initialized } = useAuth()

  if (!initialized || loading) {
    return <Loading label="Carregando..." />
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (profile?.role === 'professional') {
    return <Navigate to="/pro" replace />
  }

  return <Navigate to="/app" replace />
}

// ─── Professional Layout Wrapper ─────────────────────────────────

function ProfessionalLayout() {
  const { profile, signOut } = useAuth()

  return (
    <DashboardShell
      role="professional"
      user={{
        name: profile?.full_name ?? 'Profissional',
        avatarUrl: profile?.avatar_url ?? undefined,
        role: 'Profissional',
      }}
      onSignOut={signOut}
    >
      <Outlet />
    </DashboardShell>
  )
}

// ─── Patient Layout Wrapper ──────────────────────────────────────

function PatientLayout() {
  const { profile, signOut } = useAuth()

  return (
    <DashboardShell
      role="patient"
      user={{
        name: profile?.full_name ?? 'Paciente',
        avatarUrl: profile?.avatar_url ?? undefined,
        role: 'Paciente',
      }}
      onSignOut={signOut}
    >
      <Outlet />
    </DashboardShell>
  )
}

// ─── Auth Layout Wrapper ─────────────────────────────────────────

function AuthLayoutWrapper() {
  return (
    <AuthLayout>
      <Outlet />
    </AuthLayout>
  )
}

// ─── Public Layout Wrapper ───────────────────────────────────────

function PublicLayoutWrapper() {
  return (
    <PublicLayout>
      <Outlet />
    </PublicLayout>
  )
}

// ─── Router ──────────────────────────────────────────────────────

export const router = createBrowserRouter([
  // Root redirect
  {
    path: '/',
    element: <RootRedirect />,
  },

  // Auth routes (redirect if already logged in)
  {
    element: <AuthRedirect />,
    children: [
      {
        element: <AuthLayoutWrapper />,
        children: [
          { path: '/login', element: <LoginPage /> },
          { path: '/register', element: <RegisterPage /> },
          { path: '/forgot-password', element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },

  // Onboarding routes (protected)
  {
    element: <ProtectedRoute />,
    children: [
      { path: '/onboarding/professional', element: <ProfessionalOnboarding /> },
      { path: '/onboarding/patient', element: <PatientOnboarding /> },
    ],
  },

  // Professional routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <ProfessionalLayout />,
        children: [
          { path: '/pro', element: <ProfessionalDashboard /> },
          { path: '/pro/patients', element: <PatientsPage /> },
          { path: '/pro/patients/:id', element: <PatientDetailPage /> },
          { path: '/pro/appointments', element: <AppointmentsPage /> },
          {
            path: '/pro/appointments/:id',
            element: (
              <PlaceholderPage
                title="Detalhes da Consulta"
                description="Visualize informações da consulta, notas clínicas e documentos relacionados."
              />
            ),
          },
          { path: '/pro/records', element: <ClinicalRecordsPage /> },
          { path: '/pro/records/new', element: <RecordEditor /> },
          { path: '/pro/forms', element: <FormsPage /> },
          { path: '/pro/tasks', element: <TasksPage /> },
          { path: '/pro/tasks/new', element: <NewTaskForm /> },
          { path: '/pro/messages', element: <MessagesPage /> },
          { path: '/pro/messages/:conversationId', element: <MessagesPage /> },
          { path: '/pro/documents', element: <DocumentsPage /> },
          { path: '/pro/reviews', element: <ReviewsPage /> },
          { path: '/pro/organization', element: <OrganizationPage /> },
          { path: '/pro/settings', element: <SettingsPage /> },
          { path: '/pro/billing', element: <BillingPage /> },
        ],
      },
    ],
  },

  // Patient routes
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <PatientLayout />,
        children: [
          { path: '/app', element: <PatientDashboard /> },
          { path: '/app/search', element: <MarketplacePage /> },
          { path: '/app/professional/:id', element: <ProfessionalPublicProfile /> },
          { path: '/app/booking/:professionalId', element: <BookingFlow /> },
          { path: '/app/appointments', element: <MyAppointmentsPage /> },
          {
            path: '/app/records',
            element: (
              <PlaceholderPage
                title="Meus Prontuários"
                description="Acesse seus prontuários e registros clínicos compartilhados pelos profissionais."
              />
            ),
          },
          { path: '/app/tasks', element: <MyTasksPage /> },
          { path: '/app/messages', element: <MessagesPage /> },
          { path: '/app/documents', element: <DocumentsPage /> },
          { path: '/app/settings', element: <SettingsPage /> },
        ],
      },
    ],
  },

  // Public routes
  {
    element: <PublicLayoutWrapper />,
    children: [
      { path: '/search', element: <MarketplacePage /> },
      { path: '/professional/:id', element: <ProfessionalPublicProfile /> },
    ],
  },
])
