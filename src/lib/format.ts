import { format, parseISO, isSameDay, differenceInMinutes, formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export function formatDataHora(iso: string): string {
  return format(parseISO(iso), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })
}

export function formatData(iso: string): string {
  return format(parseISO(iso), 'dd/MM/yyyy', { locale: ptBR })
}

export function formatHora(iso: string): string {
  return format(parseISO(iso), 'HH:mm', { locale: ptBR })
}

export function formatDiaSemana(iso: string): string {
  return format(parseISO(iso), 'EEEE', { locale: ptBR })
}

export function formatRelativo(iso: string): string {
  return formatDistanceToNow(parseISO(iso), { locale: ptBR, addSuffix: true })
}

export { isSameDay, differenceInMinutes }

export const DIAS_SEMANA = [
  'Domingo',
  'Segunda-feira',
  'Terça-feira',
  'Quarta-feira',
  'Quinta-feira',
  'Sexta-feira',
  'Sábado',
] as const
