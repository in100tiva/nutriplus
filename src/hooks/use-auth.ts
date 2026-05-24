import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase, withTimeout } from '@/lib/supabase'
import { log } from '@/lib/observability'
import type { Profile, UserRole } from '@/types/database'

interface AuthState {
  session: Session | null
  profile: Profile | null
  initialized: boolean
  loading: boolean
  initialize: () => () => void
  signOut: () => Promise<void>
  refreshProfile: () => Promise<void>
}

async function carregarProfile(userId: string): Promise<Profile | null> {
  try {
    const { data, error } = await withTimeout(
      Promise.resolve(supabase.from('profiles').select('*').eq('id', userId).maybeSingle()),
      4000,
      'carregarProfile',
    )
    if (error) {
      console.warn('[auth] profile_load_fail', error.message)
      log({ tipo: 'auth.profile_load_fail', severidade: 'erro', payload: { mensagem: error.message } })
      return null
    }
    return data
  } catch (err) {
    console.warn('[auth] profile_load_exception', (err as Error).message)
    return null
  }
}

let initialized = false

export const useAuth = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  initialized: false,
  loading: false,

  initialize: () => {
    if (initialized) return () => {}
    initialized = true

    console.info('[auth] initialize start')
    set({ loading: true })

    // Failsafe: se getSession() pendurar (sessão velha, rede offline),
    // garantimos que a UI sai de "Carregando" depois de 3s.
    const failsafe = setTimeout(() => {
      const st = get()
      if (!st.initialized) {
        console.warn('[auth] failsafe — getSession() não respondeu em 3s')
        set({ initialized: true, loading: false })
      }
    }, 3000)

    void withTimeout(supabase.auth.getSession(), 4000, 'getSession')
      .then(async ({ data, error }) => {
        clearTimeout(failsafe)
        if (error) {
          console.warn('[auth] getSession error:', error.message)
          set({ session: null, profile: null, initialized: true, loading: false })
          return
        }
        const session = data.session
        const profile = session ? await carregarProfile(session.user.id) : null
        console.info('[auth] session resolved', { hasSession: !!session, role: profile?.role })
        set({ session, profile, initialized: true, loading: false })
      })
      .catch((err) => {
        clearTimeout(failsafe)
        console.warn('[auth] getSession timeout/throw:', (err as Error).message)
        set({ session: null, profile: null, initialized: true, loading: false })
      })

    const { data: sub } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.info('[auth] state change:', event, !!session)
      const profile = session ? await carregarProfile(session.user.id) : null
      set({ session, profile, initialized: true, loading: false })
    })

    return () => {
      sub.subscription.unsubscribe()
    }
  },

  signOut: async () => {
    await supabase.auth.signOut()
    set({ session: null, profile: null })
  },

  refreshProfile: async () => {
    const userId = get().session?.user.id
    if (!userId) return
    const profile = await carregarProfile(userId)
    set({ profile })
  },
}))

export function useUser() {
  return useAuth((s) => s.session?.user ?? null)
}

export function useRole(): UserRole | null {
  return useAuth((s) => s.profile?.role ?? null)
}
