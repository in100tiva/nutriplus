import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Menu,
  Bell,
  Search,
  X,
  ChevronDown,
  User,
  Settings,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getInitials } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────

interface HeaderUser {
  name: string
  avatarUrl?: string
  role: string
}

export interface HeaderProps {
  title?: string
  user: HeaderUser
  notificationCount?: number
  onMenuToggle?: () => void
  onSignOut?: () => void
}

// ─── Component ──────────────────────────────────────────────────

export function Header({
  title,
  user,
  notificationCount = 0,
  onMenuToggle,
  onSignOut,
}: HeaderProps) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false)
      }
    }

    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpen])

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchOpen])

  return (
    <header className="flex h-16 shrink-0 items-center gap-3 border-b border-gray-200 bg-white px-4 lg:px-6">
      {/* Mobile hamburger */}
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

      {/* Page title */}
      {title && !searchOpen && (
        <h1 className="truncate text-lg font-semibold text-gray-900">
          {title}
        </h1>
      )}

      {/* Search bar */}
      <div
        className={cn(
          'flex items-center transition-all duration-200',
          searchOpen ? 'flex-1' : 'ml-auto'
        )}
      >
        {searchOpen ? (
          <div className="relative flex flex-1 items-center">
            <Search className="absolute left-3 h-4 w-4 text-gray-400" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar pacientes, consultas, prontuários..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-10 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500"
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="absolute right-2 rounded-md p-1 text-gray-400 hover:text-gray-600"
              aria-label="Fechar busca"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Buscar"
          >
            <Search className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Right side actions */}
      {!searchOpen && (
        <div className="flex items-center gap-1">
          {/* Notifications */}
          <Link
            to="/notificacoes"
            className="relative rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-700"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {notificationCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {notificationCount > 99 ? '99+' : notificationCount}
              </span>
            )}
          </Link>

          {/* User dropdown */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-gray-100"
            >
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.name}
                  className="h-8 w-8 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-sky-100 text-xs font-semibold text-sky-700">
                  {getInitials(user.name)}
                </div>
              )}
              <div className="hidden text-left md:block">
                <p className="text-sm font-medium text-gray-900">
                  {user.name}
                </p>
                <p className="text-xs text-gray-500">{user.role}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-gray-400 md:block" />
            </button>

            {/* Dropdown menu */}
            {dropdownOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-56 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                {/* User info (visible on mobile) */}
                <div className="border-b border-gray-100 px-4 py-3 md:hidden">
                  <p className="text-sm font-medium text-gray-900">
                    {user.name}
                  </p>
                  <p className="text-xs text-gray-500">{user.role}</p>
                </div>

                <Link
                  to="/perfil"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <User className="h-4 w-4 text-gray-400" />
                  Meu Perfil
                </Link>
                <Link
                  to="/configuracoes"
                  onClick={() => setDropdownOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                >
                  <Settings className="h-4 w-4 text-gray-400" />
                  Configurações
                </Link>

                {onSignOut && (
                  <>
                    <div className="my-1 border-t border-gray-100" />
                    <button
                      type="button"
                      onClick={() => {
                        setDropdownOpen(false)
                        onSignOut()
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-sm text-red-600 transition-colors hover:bg-red-50"
                    >
                      <LogOut className="h-4 w-4" />
                      Sair
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
