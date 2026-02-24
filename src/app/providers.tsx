import { useEffect, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuth } from '@/hooks/use-auth'

// ─── React Query Client ─────────────────────────────────────────

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

// ─── Auth Initializer ────────────────────────────────────────────

function AuthInitializer({ children }: { children: ReactNode }) {
  const initialize = useAuth((state) => state.initialize)

  useEffect(() => {
    const cleanup = initialize()
    return cleanup
  }, [initialize])

  return <>{children}</>
}

// ─── Providers ──────────────────────────────────────────────────

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer>{children}</AuthInitializer>
    </QueryClientProvider>
  )
}
