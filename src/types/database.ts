// AUTO-GENERATED via Supabase MCP (generate_typescript_types).
// Não editar à mão. Para regenerar, use mcp__0a...__generate_typescript_types
// e cole o conteúdo aqui mantendo os helpers no fim do arquivo.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5'
  }
  public: {
    Tables: {
      agendamentos: {
        Row: {
          created_at: string
          daily_room_url: string | null
          fim: string
          id: string
          inicio: string
          nutricionista_id: string
          observacoes: string | null
          paciente_profile_id: string
          status: Database['public']['Enums']['agendamento_status']
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_room_url?: string | null
          fim: string
          id?: string
          inicio: string
          nutricionista_id: string
          observacoes?: string | null
          paciente_profile_id: string
          status?: Database['public']['Enums']['agendamento_status']
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_room_url?: string | null
          fim?: string
          id?: string
          inicio?: string
          nutricionista_id?: string
          observacoes?: string | null
          paciente_profile_id?: string
          status?: Database['public']['Enums']['agendamento_status']
          updated_at?: string
        }
        Relationships: []
      }
      alimentos: {
        Row: {
          carboidrato_g: number
          categoria: string | null
          created_at: string
          fibra_g: number
          fonte: string
          id: string
          kcal_por_100g: number
          lipidio_g: number
          nome: string
          proteina_g: number
        }
        Insert: {
          carboidrato_g?: number
          categoria?: string | null
          created_at?: string
          fibra_g?: number
          fonte?: string
          id?: string
          kcal_por_100g?: number
          lipidio_g?: number
          nome: string
          proteina_g?: number
        }
        Update: {
          carboidrato_g?: number
          categoria?: string | null
          created_at?: string
          fibra_g?: number
          fonte?: string
          id?: string
          kcal_por_100g?: number
          lipidio_g?: number
          nome?: string
          proteina_g?: number
        }
        Relationships: []
      }
      assinaturas: {
        Row: {
          abacatepay_subscription_id: string | null
          ciclo: Database['public']['Enums']['assinatura_ciclo']
          created_at: string
          id: string
          nutricionista_id: string
          proxima_cobranca: string | null
          status: Database['public']['Enums']['assinatura_status']
          updated_at: string
        }
        Insert: {
          abacatepay_subscription_id?: string | null
          ciclo?: Database['public']['Enums']['assinatura_ciclo']
          created_at?: string
          id?: string
          nutricionista_id: string
          proxima_cobranca?: string | null
          status?: Database['public']['Enums']['assinatura_status']
          updated_at?: string
        }
        Update: {
          abacatepay_subscription_id?: string | null
          ciclo?: Database['public']['Enums']['assinatura_ciclo']
          created_at?: string
          id?: string
          nutricionista_id?: string
          proxima_cobranca?: string | null
          status?: Database['public']['Enums']['assinatura_status']
          updated_at?: string
        }
        Relationships: []
      }
      avaliacoes_antropometricas: {
        Row: {
          altura_cm: number | null
          circunferencias: Json
          created_at: string
          data: string
          id: string
          observacoes: string | null
          percentual_gordura: number | null
          peso_kg: number | null
          prontuario_id: string
          updated_at: string
        }
        Insert: {
          altura_cm?: number | null
          circunferencias?: Json
          created_at?: string
          data?: string
          id?: string
          observacoes?: string | null
          percentual_gordura?: number | null
          peso_kg?: number | null
          prontuario_id: string
          updated_at?: string
        }
        Update: {
          altura_cm?: number | null
          circunferencias?: Json
          created_at?: string
          data?: string
          id?: string
          observacoes?: string | null
          percentual_gordura?: number | null
          peso_kg?: number | null
          prontuario_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      disponibilidades: {
        Row: {
          created_at: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id: string
          nutricionista_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          dia_semana: number
          hora_fim: string
          hora_inicio: string
          id?: string
          nutricionista_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          dia_semana?: number
          hora_fim?: string
          hora_inicio?: string
          id?: string
          nutricionista_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      especialidades: {
        Row: { created_at: string; id: string; nome: string; slug: string }
        Insert: { created_at?: string; id?: string; nome: string; slug: string }
        Update: { created_at?: string; id?: string; nome?: string; slug?: string }
        Relationships: []
      }
      eventos_sistema: {
        Row: {
          created_at: string
          entidade: string | null
          entidade_id: string | null
          id: string
          payload: Json
          request_id: string | null
          severidade: Database['public']['Enums']['evento_severidade']
          tipo: string
        }
        Insert: {
          created_at?: string
          entidade?: string | null
          entidade_id?: string | null
          id?: string
          payload?: Json
          request_id?: string | null
          severidade?: Database['public']['Enums']['evento_severidade']
          tipo: string
        }
        Update: {
          created_at?: string
          entidade?: string | null
          entidade_id?: string | null
          id?: string
          payload?: Json
          request_id?: string | null
          severidade?: Database['public']['Enums']['evento_severidade']
          tipo?: string
        }
        Relationships: []
      }
      execucoes_jobs: {
        Row: {
          detalhe: Json | null
          finalizado_em: string | null
          id: string
          iniciado_em: string
          itens_falha: number
          itens_processados: number
          job_nome: string
          status: Database['public']['Enums']['job_status']
        }
        Insert: {
          detalhe?: Json | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          itens_falha?: number
          itens_processados?: number
          job_nome: string
          status?: Database['public']['Enums']['job_status']
        }
        Update: {
          detalhe?: Json | null
          finalizado_em?: string | null
          id?: string
          iniciado_em?: string
          itens_falha?: number
          itens_processados?: number
          job_nome?: string
          status?: Database['public']['Enums']['job_status']
        }
        Relationships: []
      }
      lembretes: {
        Row: {
          agendamento_id: string
          canal: Database['public']['Enums']['lembrete_canal']
          created_at: string
          enviado_em: string | null
          id: string
          tipo: Database['public']['Enums']['lembrete_tipo']
        }
        Insert: {
          agendamento_id: string
          canal?: Database['public']['Enums']['lembrete_canal']
          created_at?: string
          enviado_em?: string | null
          id?: string
          tipo: Database['public']['Enums']['lembrete_tipo']
        }
        Update: {
          agendamento_id?: string
          canal?: Database['public']['Enums']['lembrete_canal']
          created_at?: string
          enviado_em?: string | null
          id?: string
          tipo?: Database['public']['Enums']['lembrete_tipo']
        }
        Relationships: []
      }
      nutricionista_especialidades: {
        Row: { created_at: string; especialidade_id: string; nutricionista_id: string }
        Insert: { created_at?: string; especialidade_id: string; nutricionista_id: string }
        Update: { created_at?: string; especialidade_id?: string; nutricionista_id?: string }
        Relationships: []
      }
      nutricionistas: {
        Row: {
          ativo: boolean
          bio: string | null
          created_at: string
          crn: string
          duracao_consulta_min: number
          id: string
          profile_id: string
          slug: string
          updated_at: string
          valor_consulta_centavos: number
        }
        Insert: {
          ativo?: boolean
          bio?: string | null
          created_at?: string
          crn: string
          duracao_consulta_min?: number
          id?: string
          profile_id: string
          slug: string
          updated_at?: string
          valor_consulta_centavos?: number
        }
        Update: {
          ativo?: boolean
          bio?: string | null
          created_at?: string
          crn?: string
          duracao_consulta_min?: number
          id?: string
          profile_id?: string
          slug?: string
          updated_at?: string
          valor_consulta_centavos?: number
        }
        Relationships: []
      }
      pagamentos: {
        Row: {
          abacatepay_id: string | null
          assinatura_id: string
          created_at: string
          id: string
          metodo: Database['public']['Enums']['pagamento_metodo'] | null
          pago_em: string | null
          status: string | null
          valor_centavos: number
        }
        Insert: {
          abacatepay_id?: string | null
          assinatura_id: string
          created_at?: string
          id?: string
          metodo?: Database['public']['Enums']['pagamento_metodo'] | null
          pago_em?: string | null
          status?: string | null
          valor_centavos: number
        }
        Update: {
          abacatepay_id?: string | null
          assinatura_id?: string
          created_at?: string
          id?: string
          metodo?: Database['public']['Enums']['pagamento_metodo'] | null
          pago_em?: string | null
          status?: string | null
          valor_centavos?: number
        }
        Relationships: []
      }
      plano_itens: {
        Row: {
          alimento_id: string
          created_at: string
          id: string
          medida_caseira: string | null
          ordem: number
          quantidade_g: number
          refeicao_id: string
          updated_at: string
        }
        Insert: {
          alimento_id: string
          created_at?: string
          id?: string
          medida_caseira?: string | null
          ordem?: number
          quantidade_g: number
          refeicao_id: string
          updated_at?: string
        }
        Update: {
          alimento_id?: string
          created_at?: string
          id?: string
          medida_caseira?: string | null
          ordem?: number
          quantidade_g?: number
          refeicao_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      plano_refeicoes: {
        Row: {
          created_at: string
          horario: string | null
          id: string
          nome: string
          ordem: number
          plano_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          horario?: string | null
          id?: string
          nome: string
          ordem?: number
          plano_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          horario?: string | null
          id?: string
          nome?: string
          ordem?: number
          plano_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      planos_alimentares: {
        Row: {
          created_at: string
          data_fim: string | null
          data_inicio: string
          id: string
          observacoes: string | null
          prontuario_id: string
          publicado: boolean
          titulo: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          prontuario_id: string
          publicado?: boolean
          titulo: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          data_fim?: string | null
          data_inicio?: string
          id?: string
          observacoes?: string | null
          prontuario_id?: string
          publicado?: boolean
          titulo?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          consentimento_lgpd_em: string | null
          created_at: string
          id: string
          nome: string
          role: Database['public']['Enums']['user_role']
          telefone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          consentimento_lgpd_em?: string | null
          created_at?: string
          id: string
          nome?: string
          role?: Database['public']['Enums']['user_role']
          telefone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          consentimento_lgpd_em?: string | null
          created_at?: string
          id?: string
          nome?: string
          role?: Database['public']['Enums']['user_role']
          telefone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      prontuario_evolucoes: {
        Row: {
          agendamento_id: string | null
          created_at: string
          data: string
          id: string
          prontuario_id: string
          texto: string
        }
        Insert: {
          agendamento_id?: string | null
          created_at?: string
          data?: string
          id?: string
          prontuario_id: string
          texto: string
        }
        Update: {
          agendamento_id?: string | null
          created_at?: string
          data?: string
          id?: string
          prontuario_id?: string
          texto?: string
        }
        Relationships: []
      }
      prontuarios: {
        Row: {
          anamnese: Json
          created_at: string
          id: string
          nutricionista_id: string
          objetivo: string | null
          observacoes: string | null
          paciente_profile_id: string
          updated_at: string
        }
        Insert: {
          anamnese?: Json
          created_at?: string
          id?: string
          nutricionista_id: string
          objetivo?: string | null
          observacoes?: string | null
          paciente_profile_id: string
          updated_at?: string
        }
        Update: {
          anamnese?: Json
          created_at?: string
          id?: string
          nutricionista_id?: string
          objetivo?: string | null
          observacoes?: string | null
          paciente_profile_id?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: {
      current_nutricionista_id: { Args: Record<string, never>; Returns: string }
      current_user_role: {
        Args: Record<string, never>
        Returns: Database['public']['Enums']['user_role']
      }
      fn_admin_top_queries: {
        Args: { p_limit?: number }
        Returns: Array<{
          query: string
          calls: number
          total_exec_time_ms: number
          mean_exec_time_ms: number
          rows: number
        }>
      }
      fn_admin_ultimas_execucoes_jobs: {
        Args: { p_limit?: number }
        Returns: Database['public']['Tables']['execucoes_jobs']['Row'][]
      }
      fn_admin_eventos_recentes: {
        Args: {
          p_severidade?: Database['public']['Enums']['evento_severidade']
          p_limit?: number
        }
        Returns: Database['public']['Tables']['eventos_sistema']['Row'][]
      }
      fn_slots_disponiveis: {
        Args: { p_nutri_id: string; p_inicio: string; p_fim: string }
        Returns: Array<{ slot_inicio: string; slot_fim: string }>
      }
      fn_refeicao_totais: {
        Args: { p_refeicao_id: string }
        Returns: Array<{
          kcal: number
          carboidrato_g: number
          proteina_g: number
          lipidio_g: number
          fibra_g: number
        }>
      }
      fn_plano_totais: {
        Args: { p_plano_id: string }
        Returns: Array<{
          kcal: number
          carboidrato_g: number
          proteina_g: number
          lipidio_g: number
          fibra_g: number
        }>
      }
    }
    Enums: {
      agendamento_status:
        | 'pendente_pagamento'
        | 'confirmado'
        | 'realizado'
        | 'cancelado'
        | 'falta'
      assinatura_ciclo: 'WEEKLY' | 'MONTHLY' | 'SEMIANNUALLY' | 'ANNUALLY'
      assinatura_status: 'ativa' | 'inadimplente' | 'cancelada'
      evento_severidade: 'info' | 'aviso' | 'erro'
      job_status: 'ok' | 'erro' | 'parcial'
      lembrete_canal: 'email'
      lembrete_tipo: '24h' | '1h'
      pagamento_metodo: 'pix' | 'cartao'
      user_role: 'nutricionista' | 'paciente' | 'admin'
    }
  }
}

// ─── Helpers ────────────────────────────────────────────────────────────────
export type UserRole = Database['public']['Enums']['user_role']
export type AgendamentoStatus = Database['public']['Enums']['agendamento_status']
export type EventoSeveridade = Database['public']['Enums']['evento_severidade']
export type JobStatus = Database['public']['Enums']['job_status']
export type LembreteTipo = Database['public']['Enums']['lembrete_tipo']

export type Profile = Database['public']['Tables']['profiles']['Row']
export type Nutricionista = Database['public']['Tables']['nutricionistas']['Row']
export type Especialidade = Database['public']['Tables']['especialidades']['Row']
export type Disponibilidade = Database['public']['Tables']['disponibilidades']['Row']
export type Agendamento = Database['public']['Tables']['agendamentos']['Row']
export type Prontuario = Database['public']['Tables']['prontuarios']['Row']
export type Evolucao = Database['public']['Tables']['prontuario_evolucoes']['Row']
export type Avaliacao = Database['public']['Tables']['avaliacoes_antropometricas']['Row']
export type PlanoAlimentar = Database['public']['Tables']['planos_alimentares']['Row']
export type PlanoRefeicao = Database['public']['Tables']['plano_refeicoes']['Row']
export type PlanoItem = Database['public']['Tables']['plano_itens']['Row']
export type Alimento = Database['public']['Tables']['alimentos']['Row']

export type Slot = { slot_inicio: string; slot_fim: string }
