# MedHub - Plataforma de Gestão para Profissionais de Saúde

Plataforma completa para profissionais de saúde gerenciarem seus consultórios online. Conecta médicos, nutricionistas, psicólogos, fisioterapeutas e outros profissionais com seus pacientes.

## Stack Tecnológica

- **Frontend**: React 19 + TypeScript + Vite
- **Estilos**: TailwindCSS v4
- **Backend/BaaS**: Supabase (Auth, Database, Storage, Realtime)
- **Estado**: Zustand + React Query (TanStack Query)
- **Formulários**: React Hook Form + Zod
- **Ícones**: Lucide React
- **Datas**: date-fns

## Arquitetura

```
src/
├── app/                          # App entry, routing, providers
│   ├── router.tsx                # React Router v6 config
│   └── providers.tsx             # Context providers
├── components/
│   ├── ui/                       # Design system (Button, Input, Modal, etc.)
│   ├── layout/                   # Shell layouts (Sidebar, Header, DashboardShell)
│   └── forms/                    # Dynamic form renderer + templates
├── features/                     # Feature modules
│   ├── auth/                     # Login, Register, Forgot Password
│   ├── onboarding/               # Professional + Patient onboarding
│   ├── dashboard/                # Dashboard views
│   ├── patients/                 # Gestão de pacientes
│   ├── appointments/             # Agenda e consultas
│   ├── clinical-records/         # Prontuários e evoluções
│   ├── forms/                    # Templates de formulários
│   ├── tasks/                    # Tarefas e acompanhamento
│   ├── messages/                 # Chat assíncrono
│   ├── documents/                # Documentos e arquivos
│   ├── reviews/                  # Avaliações
│   ├── marketplace/              # Busca pública de profissionais
│   ├── organization/             # Gestão de clínica
│   ├── billing/                  # Planos e assinaturas
│   └── settings/                 # Configurações
├── hooks/                        # Custom hooks (auth, toast)
├── lib/                          # Utilities, Supabase client, validators
├── types/                        # TypeScript types
└── assets/                       # Static assets
```

## Modelo de Dados

### Entidades Principais
- **profiles** - Perfis de usuário (paciente/profissional/admin)
- **professional_profiles** - Dados do profissional (especialidade, CRM/CRP, preço)
- **organizations** - Clínicas e consultórios
- **appointments** - Consultas agendadas
- **clinical_records** - Prontuários e evoluções
- **form_templates** - Formulários dinâmicos (JSON Schema)
- **tasks** - Tarefas atribuídas ao paciente
- **messages/conversations** - Chat assíncrono
- **reviews** - Avaliações de pacientes
- **documents** - Arquivos anexados
- **subscriptions** - Planos de assinatura

### Segurança
- Row Level Security (RLS) em todas as tabelas
- Validação de registro profissional (CRM, CRP, CRN, CREFITO)
- Controle de acesso por role (patient/professional/admin)

## Funcionalidades

### Visão do Profissional
- Dashboard com métricas e visão geral do dia
- Gestão completa de pacientes
- Agenda configurável (dias, horários, duração do slot)
- Prontuário eletrônico com timeline de evoluções
- Formulários dinâmicos personalizáveis por especialidade
- Sistema de tarefas (plano alimentar, exercícios, terapia)
- Chat assíncrono com pacientes
- Gestão de documentos e arquivos
- Avaliações e reputação
- Gestão de clínica (multi-profissional)

### Visão do Paciente
- Marketplace para busca de profissionais
- Perfil público do profissional com agenda disponível
- Agendamento de consultas
- Acesso a prontuários e formulários
- Tarefas e acompanhamento (registrar refeições, exercícios, etc.)
- Chat com profissional
- Upload de documentos (exames, fotos)
- Avaliação pós-consulta

### Planos
| | Free | Pro (R$97/mês) | Clínica (R$249/mês) |
|---|---|---|---|
| Pacientes | Até 20 | Ilimitados | Ilimitados |
| Formulários | 1 padrão | Personalizados | Personalizados |
| Chat | Vinculado a consulta | Livre | Livre |
| Armazenamento | 500MB | 5GB | 20GB |
| Multi-profissional | - | - | Sim |
| Painel admin | - | - | Sim |

## Setup

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Edite .env com suas credenciais do Supabase

# 3. Rodar migrations no Supabase
# Copie supabase/migrations/00001_initial_schema.sql para o SQL Editor do Supabase

# 4. Iniciar dev server
npm run dev
```

## Scripts

```bash
npm run dev       # Servidor de desenvolvimento
npm run build     # Build de produção
npm run preview   # Preview do build
npm run lint      # Lint do código
```
