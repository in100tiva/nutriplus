import { useState } from 'react'
import {
  Check,
  Crown,
  Zap,
  Building2,
  ExternalLink,
  CreditCard,
  Receipt,
  Download,
} from 'lucide-react'
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
} from '@/components/ui'
import { formatDate } from '@/lib/utils'

/* ─── Types ───────────────────────────────────────────────────── */

type PlanId = 'free' | 'pro' | 'clinic'

interface Plan {
  id: PlanId
  name: string
  priceMonthly: string
  priceLabel: string
  description: string
  icon: typeof Zap
  features: string[]
  highlighted?: boolean
}

type InvoiceStatus = 'paid' | 'pending' | 'overdue'

interface Invoice {
  id: string
  date: string
  description: string
  amountInCents: number
  status: InvoiceStatus
}

/* ─── Mock Data ───────────────────────────────────────────────── */

const CURRENT_PLAN: PlanId = 'pro'

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    priceMonthly: 'R$ 0',
    priceLabel: '/mes',
    description: 'Para profissionais que estao comecando',
    icon: Zap,
    features: [
      'Ate 20 pacientes',
      'Agenda basica',
      '1 formulario personalizado',
      'Chat com pacientes',
      'Documentos (100 MB)',
    ],
  },
  {
    id: 'pro',
    name: 'Pro',
    priceMonthly: 'R$ 97',
    priceLabel: '/mes',
    description: 'Para profissionais que querem crescer',
    icon: Crown,
    highlighted: true,
    features: [
      'Pacientes ilimitados',
      'Formularios personalizados ilimitados',
      'Chat com pacientes',
      'Relatorios avancados',
      'Documentos (5 GB)',
      'Lembretes automaticos',
      'Suporte prioritario',
      'Perfil verificado no marketplace',
    ],
  },
  {
    id: 'clinic',
    name: 'Clinic',
    priceMonthly: 'R$ 249',
    priceLabel: '/mes',
    description: 'Para clinicas e equipes',
    icon: Building2,
    features: [
      'Tudo do Pro, mais:',
      'Multi-profissional (ate 10)',
      'Painel administrativo',
      'Metricas da clinica',
      'Documentos (20 GB)',
      'Gestao de agendas',
      'Convites por e-mail',
      'Relatorios consolidados',
      'Suporte dedicado',
    ],
  },
]

const MOCK_INVOICES: Invoice[] = [
  {
    id: 'inv-001',
    date: '2026-02-01',
    description: 'Plano Pro - Fevereiro 2026',
    amountInCents: 9700,
    status: 'paid',
  },
  {
    id: 'inv-002',
    date: '2026-01-01',
    description: 'Plano Pro - Janeiro 2026',
    amountInCents: 9700,
    status: 'paid',
  },
  {
    id: 'inv-003',
    date: '2025-12-01',
    description: 'Plano Pro - Dezembro 2025',
    amountInCents: 9700,
    status: 'paid',
  },
  {
    id: 'inv-004',
    date: '2025-11-01',
    description: 'Plano Pro - Novembro 2025',
    amountInCents: 9700,
    status: 'paid',
  },
  {
    id: 'inv-005',
    date: '2025-10-01',
    description: 'Plano Pro - Outubro 2025',
    amountInCents: 9700,
    status: 'paid',
  },
  {
    id: 'inv-006',
    date: '2025-09-01',
    description: 'Plano Free - Upgrade para Pro',
    amountInCents: 9700,
    status: 'paid',
  },
]

/* ─── Helpers ─────────────────────────────────────────────────── */

function formatPrice(cents: number): string {
  return (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

const INVOICE_STATUS_CONFIG: Record<InvoiceStatus, { label: string; variant: 'success' | 'warning' | 'danger' }> = {
  paid: { label: 'Pago', variant: 'success' },
  pending: { label: 'Pendente', variant: 'warning' },
  overdue: { label: 'Atrasado', variant: 'danger' },
}

/* ─── Component ───────────────────────────────────────────────── */

export function BillingPage() {
  const currentPlanData = PLANS.find((p) => p.id === CURRENT_PLAN)!

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Assinatura e Cobrancas</h1>
          <p className="mt-1 text-sm text-gray-500">
            Gerencie seu plano, metodo de pagamento e historico de faturas
          </p>
        </div>

        {/* ─── Current Plan ───────────────────────────────────── */}
        <Card className="mb-8 border-blue-200 bg-gradient-to-r from-blue-50 to-white">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
                  <currentPlanData.icon className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-gray-900">
                      Plano {currentPlanData.name}
                    </h2>
                    <Badge variant="success" size="sm">
                      Ativo
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-500">{currentPlanData.description}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">
                  {currentPlanData.priceMonthly}
                  <span className="text-sm font-normal text-gray-500">
                    {currentPlanData.priceLabel}
                  </span>
                </p>
                <p className="text-xs text-gray-500">Proxima cobranca: 01/03/2026</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ─── Plan Comparison ────────────────────────────────── */}
        <h2 className="mb-4 text-lg font-bold text-gray-900">Comparar Planos</h2>
        <div className="mb-8 grid gap-6 lg:grid-cols-3">
          {PLANS.map((plan) => {
            const isCurrent = plan.id === CURRENT_PLAN
            const Icon = plan.icon

            return (
              <Card
                key={plan.id}
                className={
                  plan.highlighted
                    ? 'relative border-blue-500 shadow-md'
                    : undefined
                }
              >
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge variant="info" size="md" className="shadow-sm">
                      Mais popular
                    </Badge>
                  </div>
                )}

                <CardContent className="p-6">
                  <div className="mb-4 flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-lg ${
                        plan.highlighted ? 'bg-blue-100' : 'bg-gray-100'
                      }`}
                    >
                      <Icon
                        className={`h-5 w-5 ${
                          plan.highlighted ? 'text-blue-600' : 'text-gray-600'
                        }`}
                      />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900">{plan.name}</h3>
                      <p className="text-xs text-gray-500">{plan.description}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-bold text-gray-900">
                      {plan.priceMonthly}
                    </span>
                    <span className="text-sm text-gray-500">{plan.priceLabel}</span>
                  </div>

                  <ul className="mb-6 space-y-2.5">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <Button variant="secondary" className="w-full" disabled>
                      Plano atual
                    </Button>
                  ) : (
                    <Button
                      variant={plan.highlighted ? 'primary' : 'outline'}
                      className="w-full"
                    >
                      {PLANS.indexOf(plan) > PLANS.findIndex((p) => p.id === CURRENT_PLAN)
                        ? 'Fazer upgrade'
                        : 'Fazer downgrade'}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* ─── Billing History ────────────────────────────────── */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5 text-gray-400" />
              Historico de Faturas
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-left">
                    <th className="px-6 py-3 text-xs font-medium uppercase text-gray-500">
                      Data
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase text-gray-500">
                      Descricao
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase text-gray-500">
                      Valor
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase text-gray-500">
                      Status
                    </th>
                    <th className="px-6 py-3 text-xs font-medium uppercase text-gray-500">
                      Fatura
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_INVOICES.map((invoice) => {
                    const statusConfig = INVOICE_STATUS_CONFIG[invoice.status]
                    return (
                      <tr
                        key={invoice.id}
                        className="border-b border-gray-100 last:border-0"
                      >
                        <td className="px-6 py-4 text-sm text-gray-700">
                          {formatDate(invoice.date)}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {invoice.description}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {formatPrice(invoice.amountInCents)}
                        </td>
                        <td className="px-6 py-4">
                          <Badge variant={statusConfig.variant} size="sm">
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          <Button variant="ghost" size="sm">
                            <Download className="h-4 w-4" />
                          </Button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
