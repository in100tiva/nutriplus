import { create } from 'zustand'
import type { User, AuthError } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export interface Profile {
  id: string
  full_name: string
  email: string
  role: 'patient' | 'professional' | 'admin'
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export interface ProfessionalProfile {
  id: string
  profile_id: string
  display_name: string
  registration_type: string
  registration_number: string
  registration_state: string
  specialty: string
  bio: string | null
  phone: string
  consultation_price_cents: number | null
  consultation_duration_minutes: number | null
  accepts_insurance: boolean
  offers_telemedicine: boolean
  verified: boolean
  rating_average: number
  rating_count: number
  created_at: string
  updated_at: string
}

interface AuthState {
  user: User | null
  profile: Profile | null
  professionalProfile: ProfessionalProfile | null
  loading: boolean
  error: string | null
  initialized: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, role: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Profile>) => Promise<void>
  clearError: () => void
  initialize: () => () => void
}

async function fetchProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) {
    console.error('Erro ao buscar perfil:', error.message)
    return null
  }

  return data as Profile
}

async function fetchProfessionalProfile(userId: string): Promise<ProfessionalProfile | null> {
  const { data, error } = await supabase
    .from('professional_profiles')
    .select('*')
    .eq('profile_id', userId)
    .maybeSingle()

  if (error) {
    console.error('Erro ao buscar perfil profissional:', error.message)
    return null
  }

  return data as ProfessionalProfile | null
}

function formatAuthError(error: AuthError): string {
  const messages: Record<string, string> = {
    'Invalid login credentials': 'E-mail ou senha incorretos',
    'Email not confirmed': 'E-mail não confirmado. Verifique sua caixa de entrada.',
    'User already registered': 'Este e-mail já está cadastrado',
    'Password should be at least 6 characters':
      'A senha deve ter no mínimo 6 caracteres',
    'Email rate limit exceeded':
      'Muitas tentativas. Aguarde alguns minutos e tente novamente.',
  }
  return messages[error.message] ?? error.message
}

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  profile: null,
  professionalProfile: null,
  loading: true,
  error: null,
  initialized: false,

  signIn: async (email: string, password: string) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      // Profile will be loaded by the onAuthStateChange listener
    } catch (err) {
      const authError = err as AuthError
      set({ error: formatAuthError(authError), loading: false })
      throw err
    }
  },

  signUp: async (email: string, password: string, fullName: string, role: string) => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            role,
          },
        },
      })
      if (error) throw error
    } catch (err) {
      const authError = err as AuthError
      set({ error: formatAuthError(authError), loading: false })
      throw err
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      set({
        user: null,
        profile: null,
        professionalProfile: null,
        loading: false,
      })
    } catch (err) {
      const authError = err as AuthError
      set({ error: formatAuthError(authError), loading: false })
      throw err
    }
  },

  updateProfile: async (updates: Partial<Profile>) => {
    const { user } = get()
    if (!user) {
      set({ error: 'Usuário não autenticado' })
      return
    }

    set({ loading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single()

      if (error) throw error

      set({ profile: data as Profile, loading: false })
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao atualizar perfil'
      set({ error: message, loading: false })
      throw err
    }
  },

  clearError: () => set({ error: null }),

  initialize: () => {
    // Prevent double initialization
    if (get().initialized) {
      return () => {}
    }
    set({ initialized: true })

    // Check for existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const [profile, professionalProfile] = await Promise.all([
          fetchProfile(session.user.id),
          fetchProfessionalProfile(session.user.id),
        ])
        set({
          user: session.user,
          profile,
          professionalProfile,
          loading: false,
        })
      } else {
        set({ loading: false })
      }
    })

    // Listen for auth state changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const [profile, professionalProfile] = await Promise.all([
          fetchProfile(session.user.id),
          fetchProfessionalProfile(session.user.id),
        ])
        set({
          user: session.user,
          profile,
          professionalProfile,
          loading: false,
          error: null,
        })
      } else if (event === 'SIGNED_OUT') {
        set({
          user: null,
          profile: null,
          professionalProfile: null,
          loading: false,
        })
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        set({ user: session.user })
      } else if (event === 'USER_UPDATED' && session?.user) {
        const profile = await fetchProfile(session.user.id)
        set({ user: session.user, profile })
      }
    })

    // Return cleanup function
    return () => {
      subscription.unsubscribe()
    }
  },
}))
