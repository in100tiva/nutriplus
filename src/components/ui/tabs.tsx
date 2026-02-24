import {
  createContext,
  forwardRef,
  useContext,
  useState,
  useCallback,
  type HTMLAttributes,
  type ButtonHTMLAttributes,
  type ReactNode,
} from 'react'
import { cn } from '@/lib/utils'

/* ─── Context ─────────────────────────────────────────────────── */

interface TabsContextValue {
  activeTab: string
  setActiveTab: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | null>(null)

function useTabsContext() {
  const ctx = useContext(TabsContext)
  if (!ctx) {
    throw new Error('Tabs compound components must be used within a <Tabs> parent.')
  }
  return ctx
}

/* ─── Tabs (root) ─────────────────────────────────────────────── */

export interface TabsProps extends HTMLAttributes<HTMLDivElement> {
  defaultValue: string
  value?: string
  onValueChange?: (value: string) => void
  children: ReactNode
}

const Tabs = forwardRef<HTMLDivElement, TabsProps>(
  ({ className, defaultValue, value, onValueChange, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = useState(defaultValue)

    const activeTab = value ?? internalValue

    const setActiveTab = useCallback(
      (newValue: string) => {
        if (value === undefined) {
          setInternalValue(newValue)
        }
        onValueChange?.(newValue)
      },
      [value, onValueChange],
    )

    return (
      <TabsContext.Provider value={{ activeTab, setActiveTab }}>
        <div ref={ref} className={cn('flex flex-col', className)} {...props}>
          {children}
        </div>
      </TabsContext.Provider>
    )
  },
)
Tabs.displayName = 'Tabs'

/* ─── TabsList ────────────────────────────────────────────────── */

const TabsList = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      role="tablist"
      className={cn(
        'inline-flex items-center gap-1 rounded-lg bg-gray-100 p-1',
        className,
      )}
      {...props}
    />
  ),
)
TabsList.displayName = 'TabsList'

/* ─── TabsTrigger ─────────────────────────────────────────────── */

export interface TabsTriggerProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  value: string
}

const TabsTrigger = forwardRef<HTMLButtonElement, TabsTriggerProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab, setActiveTab } = useTabsContext()
    const isActive = activeTab === value

    return (
      <button
        ref={ref}
        type="button"
        role="tab"
        aria-selected={isActive}
        tabIndex={isActive ? 0 : -1}
        onClick={() => setActiveTab(value)}
        className={cn(
          'inline-flex items-center justify-center rounded-md px-3 py-1.5 text-sm font-medium',
          'transition-colors',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500/40 focus-visible:ring-offset-1',
          isActive
            ? 'bg-white text-gray-900 shadow-sm'
            : 'text-gray-600 hover:text-gray-900',
          className,
        )}
        {...props}
      >
        {children}
      </button>
    )
  },
)
TabsTrigger.displayName = 'TabsTrigger'

/* ─── TabsContent ─────────────────────────────────────────────── */

export interface TabsContentProps extends HTMLAttributes<HTMLDivElement> {
  value: string
}

const TabsContent = forwardRef<HTMLDivElement, TabsContentProps>(
  ({ className, value, children, ...props }, ref) => {
    const { activeTab } = useTabsContext()

    if (activeTab !== value) return null

    return (
      <div
        ref={ref}
        role="tabpanel"
        tabIndex={0}
        className={cn('mt-3 focus-visible:outline-none', className)}
        {...props}
      >
        {children}
      </div>
    )
  },
)
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent }
