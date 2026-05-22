import { create } from 'zustand'
import type { Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
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
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) {
    log({ tipo: 'auth.profile_load_fail', severidade: 'erro', payload: { mensagem: error.message } })
    return null
  }
  return data
}

export const useAuth = create<AuthState>((set, get) => ({
  session: null,
  profile: null,
  initialized: false,
  loading: false,

  initialize: () => {
    set({ loading: true })

    void supabase.auth.getSession().then(async ({ data }) => {
      const session = data.session
      const profile = session ? await carregarProfile(session.user.id) : null
      set({ session, profile, initialized: true, loading: false })
    })

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
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
