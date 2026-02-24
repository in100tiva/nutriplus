import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge Tailwind CSS classes with clsx support.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format an integer amount in cents to a BRL currency string.
 * Example: 15000 -> "R$ 150,00"
 */
export function formatCurrency(cents: number): string {
  const value = cents / 100
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  })
}

/**
 * Format a date string or Date object to Brazilian date format (DD/MM/YYYY).
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

/**
 * Format a time string (HH:mm or HH:mm:ss) to display format (HH:mm).
 */
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(':')
  return `${hours}:${minutes}`
}

/**
 * Format a date string or Date object to Brazilian date-time format (DD/MM/YYYY HH:mm).
 */
export function formatDateTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

/**
 * Extract initials from a full name (up to 2 characters).
 * Example: "João da Silva" -> "JS"
 */
export function getInitials(name: string): string {
  if (!name) return ''
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return ''
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
}

/**
 * Convert a string to a URL-safe slug.
 * Example: "Clínica São Paulo" -> "clinica-sao-paulo"
 */
export function slugify(text: string): string {
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Truncate text to a given length, appending "..." if truncated.
 */
export function truncate(text: string, length: number): string {
  if (!text) return ''
  if (text.length <= length) return text
  return text.slice(0, length).trimEnd() + '...'
}

/**
 * Format a phone number string to Brazilian display format.
 * Handles 10-digit (landline) and 11-digit (mobile) numbers.
 * Example: "11999887766" -> "(11) 99988-7766"
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`
  }
  return phone
}

/**
 * Format a numeric rating to a display string with one decimal place.
 * Example: 4.5 -> "4.5"
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1)
}

/**
 * Get a human-readable label in Portuguese for an appointment status.
 */
export function getAppointmentStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: 'Agendado',
    confirmed: 'Confirmado',
    in_progress: 'Em andamento',
    completed: 'Concluído',
    cancelled: 'Cancelado',
    no_show: 'Não compareceu',
    rescheduled: 'Reagendado',
  }
  return labels[status] ?? status
}

/**
 * Get a human-readable label in Portuguese for a verification status.
 */
export function getVerificationStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: 'Pendente',
    under_review: 'Em análise',
    verified: 'Verificado',
    rejected: 'Rejeitado',
    suspended: 'Suspenso',
  }
  return labels[status] ?? status
}
