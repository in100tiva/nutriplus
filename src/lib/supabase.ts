import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '@/types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY

export const supabaseConfigOk = Boolean(supabaseUrl && supabaseAnonKey)
export const supabaseUrlConfigured = supabaseUrl ?? '(não definida)'

const PROJECT_REF =
  typeof supabaseUrl === 'string'
    ? supabaseUrl.match(/https?:\/\/([^.]+)\.supabase\./)?.[1] ?? null
    : null

// Limpa qualquer token de auth de OUTROS projetos Supabase no localStorage.
if (typeof window !== 'undefined' && PROJECT_REF) {
  try {
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k) continue
      const match = k.match(/^sb-([^-]+)-/)
      if (match && match[1] !== PROJECT_REF) {
        toRemove.push(k)
      }
    }
    if (toRemove.length > 0) {
      console.warn(
        `[supabase] limpando ${toRemove.length} token(s) de outros projetos no localStorage:`,
        toRemove,
      )
      toRemove.forEach((k) => localStorage.removeItem(k))
    }
  } catch {
    /* localStorage indisponível */
  }
}

// ─────────────────────────────────────────────────────────────────────────
// Singleton via window — sobrevive ao HMR do Vite.
// Sem isso, cada hot-reload cria um GoTrueClient novo que briga com o
// anterior pela lock `sb-<ref>-auth-token` no navigator.locks → timeout 10s.
// ─────────────────────────────────────────────────────────────────────────
declare global {
  interface Window {
    __nutri_supabase__?: SupabaseClient<Database>
  }
}

function buildClient(): SupabaseClient<Database> {
  return createClient<Database>(
    supabaseUrl ?? 'https://placeholder.supabase.co',
    supabaseAnonKey ?? 'placeholder',
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        // No-op lock: sem coordenação cross-tab (suficiente para nosso caso e
        // evita o deadlock entre instâncias re-criadas pelo HMR ou StrictMode).
        lock: async (_key, _acquireTimeout, fn) => fn(),
      },
    },
  )
}

const existing = typeof window !== 'undefined' ? window.__nutri_supabase__ : undefined

export const supabase: SupabaseClient<Database> = existing ?? buildClient()

if (typeof window !== 'undefined' && !existing) {
  window.__nutri_supabase__ = supabase
}

/**
 * Envolve uma Promise com um timeout.
 */
export function withTimeout<T>(p: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(`timeout ${ms}ms em ${label}`)), ms),
    ),
  ])
}
