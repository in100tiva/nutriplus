import { useState } from 'react'
import { Link, Outlet } from 'react-router-dom'
import { Search, Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// ─── Types ──────────────────────────────────────────────────────

interface FooterLinkGroup {
  title: string
  links: { label: string; href: string }[]
}

export interface PublicLayoutProps {
  children?: React.ReactNode
}

// ─── Footer link groups ─────────────────────────────────────────

const footerLinks: FooterLinkGroup[] = [
  {
    title: 'Plataforma',
    links: [
      { label: 'Para Profissionais', href: '/para-profissionais' },
      { label: 'Para Pacientes', href: '/para-pacientes' },
      { label: 'Especialidades', href: '/especialidades' },
      { label: 'Planos e Preços', href: '/planos' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Blog', href: '/blog' },
      { label: 'Central de Ajuda', href: '/ajuda' },
      { label: 'Documentação', href: '/documentacao' },
      { label: 'Status', href: '/status' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre', href: '/sobre' },
      { label: 'Contato', href: '/contato' },
      { label: 'Termos de Uso', href: '/termos' },
      { label: 'Política de Privacidade', href: '/privacidade' },
    ],
  },
]

// ─── Navbar ─────────────────────────────────────────────────────

function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold text-white">
            M
          </div>
          <span className="text-xl font-bold tracking-tight text-gray-900">
            MedHub
          </span>
        </Link>

        {/* Desktop search bar */}
        <div className="mx-4 hidden flex-1 md:block lg:mx-8">
          <div className="relative max-w-lg">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar profissionais, especialidades..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500"
            />
          </div>
        </div>

        {/* Desktop navigation links */}
        <nav className="hidden items-center gap-1 md:flex">
          <Link
            to="/especialidades"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Especialidades
          </Link>
          <Link
            to="/para-profissionais"
            className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Para Profissionais
          </Link>
        </nav>

        {/* Auth buttons */}
        <div className="hidden items-center gap-2 md:flex">
          <Link
            to="/login"
            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100"
          >
            Entrar
          </Link>
          <Link
            to="/cadastro"
            className="rounded-lg bg-sky-500 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-sky-600"
          >
            Cadastrar
          </Link>
        </div>

        {/* Mobile menu button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="ml-auto rounded-lg p-2 text-gray-500 transition-colors hover:bg-gray-100 md:hidden"
          aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
        >
          {mobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          'overflow-hidden border-t border-gray-100 transition-all duration-300 ease-in-out md:hidden',
          mobileMenuOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className="space-y-3 px-4 py-4">
          {/* Mobile search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar profissionais..."
              className="h-10 w-full rounded-lg border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none focus:border-sky-500 focus:bg-white focus:ring-1 focus:ring-sky-500"
            />
          </div>

          {/* Mobile nav links */}
          <nav className="flex flex-col gap-1">
            <Link
              to="/especialidades"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Especialidades
            </Link>
            <Link
              to="/para-profissionais"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 hover:text-gray-900"
            >
              Para Profissionais
            </Link>
          </nav>

          {/* Mobile auth buttons */}
          <div className="flex flex-col gap-2 border-t border-gray-100 pt-3">
            <Link
              to="/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-lg border border-gray-200 px-4 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50"
            >
              Entrar
            </Link>
            <Link
              to="/cadastro"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-sky-600"
            >
              Cadastrar
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}

// ─── Footer ─────────────────────────────────────────────────────

function Footer() {
  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Footer grid */}
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand column */}
          <div className="col-span-2 md:col-span-1">
            <Link to="/" className="inline-flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500 text-sm font-bold text-white">
                M
              </div>
              <span className="text-lg font-bold tracking-tight text-gray-900">
                MedHub
              </span>
            </Link>
            <p className="mt-3 max-w-xs text-sm text-gray-500">
              A plataforma completa para conectar profissionais de saúde e
              pacientes.
            </p>
          </div>

          {/* Link groups */}
          {footerLinks.map((group) => (
            <div key={group.title}>
              <h3 className="text-sm font-semibold text-gray-900">
                {group.title}
              </h3>
              <ul className="mt-3 space-y-2.5">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-gray-500 transition-colors hover:text-gray-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 sm:flex-row">
          <p className="text-sm text-gray-400">
            &copy; {new Date().getFullYear()} MedHub. Todos os direitos
            reservados.
          </p>
          <div className="flex gap-6">
            <Link
              to="/termos"
              className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              Termos
            </Link>
            <Link
              to="/privacidade"
              className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              Privacidade
            </Link>
            <Link
              to="/contato"
              className="text-sm text-gray-400 transition-colors hover:text-gray-600"
            >
              Contato
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}

// ─── Component ──────────────────────────────────────────────────

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <Navbar />

      <main className="flex-1">{children ?? <Outlet />}</main>

      <Footer />
    </div>
  )
}
