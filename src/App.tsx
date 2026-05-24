import { RouterProvider } from 'react-router-dom'
import { router } from '@/app/router'
import { Providers } from '@/app/providers'
import { ToastContainer } from '@/components/ui/toast'
import { supabaseConfigOk } from '@/lib/supabase'

function App() {
  if (!supabaseConfigOk) {
    return <EnvErrorScreen />
  }
  // expõe um helper de "reset" no console para casos de sessão velha
  if (typeof window !== 'undefined') {
    ;(window as unknown as { nutriReset?: () => void }).nutriReset = () => {
      const keys: string[] = []
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i)
        if (k) keys.push(k)
      }
      keys.forEach((k) => {
        if (k.startsWith('sb-') || k.startsWith('supabase.')) {
          localStorage.removeItem(k)
        }
      })
      sessionStorage.clear()
      console.info('[nutri] storage limpo. Recarregando…')
      location.reload()
    }
  }
  return (
    <Providers>
      <RouterProvider router={router} />
      <ToastContainer />
    </Providers>
  )
}

function EnvErrorScreen() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        background: 'var(--paper)',
      }}
    >
      <div className="card" style={{ maxWidth: 560 }}>
        <h2 style={{ marginBottom: 8 }}>Configuração ausente</h2>
        <p style={{ fontSize: 13.5, color: 'var(--ink-2)', lineHeight: 1.55 }}>
          Não encontrei <code className="mono">VITE_SUPABASE_URL</code> e/ou{' '}
          <code className="mono">VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY</code> no env.
        </p>
        <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 12 }}>
          Coloque em <code className="mono">.env.local</code> e <strong>reinicie o dev
          server</strong> (Vite só lê env no start):
        </p>
        <pre
          style={{
            marginTop: 10,
            padding: 12,
            background: 'var(--paper-2)',
            borderRadius: 8,
            fontSize: 12,
            overflowX: 'auto',
          }}
        >
{`VITE_SUPABASE_URL=https://zyxrmsrweqywekvadnvb.supabase.co
VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY=sb_publishable_eiY5Z60T86LhJqfeTKXL5A_N4oig2Le`}
        </pre>
      </div>
    </div>
  )
}

export default App
