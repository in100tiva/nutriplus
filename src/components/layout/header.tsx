import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, ChevronDown, LogOut, UserCog } from 'lucide-react'
import { cn, getInitials } from '@/lib/utils'

interface HeaderUser {
  name: string
  avatarUrl?: string
  role: string
}

export interface HeaderProps {
  title?: string
  user: HeaderUser
  perfilHref?: string
  onMenuToggle?: () => void
  onSignOut?: () => void
}

export function Header({ title, user, perfilHref, onMenuToggle, onSignOut }: HeaderProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    if (open) document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
      {onMenuToggle && (
        <button
          type="button"
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700 lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
      {title && <h1 className="truncate text-lg font-semibold text-gray-900">{title}</h1>}

      <div className="relative ml-auto" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
        >
          {user.avatarUrl ? (
            <img
              src={user.avatarUrl}
              alt={user.name}
              className="h-8 w-8 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-xs font-semibold text-emerald-700">
              {getInitials(user.name)}
            </div>
          )}
          <div className="hidden text-left md:block">
            <p className="text-sm font-medium text-gray-900">{user.name}</p>
            <p className="text-xs text-gray-500">{user.role}</p>
          </div>
          <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
        </button>

        {open && (
          <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
            {perfilHref && (
              <Link
                to={perfilHref}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
              >
                <UserCog className="h-4 w-4 text-gray-400" />
                Meu perfil
              </Link>
            )}
            {onSignOut && (
              <>
                {perfilHref && <div className="my-1 border-t border-gray-100" />}
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false)
                    onSignOut()
                  }}
                  className={cn(
                    'flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50',
                  )}
                >
                  <LogOut className="h-4 w-4" />
                  Sair
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
