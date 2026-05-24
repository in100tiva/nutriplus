// Helpers compartilhados para visualização semanal da agenda.

import { addDays, format, parseISO, startOfWeek } from 'date-fns'
import { ptBR } from 'date-fns/locale'

export const DIAS_LBL = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'] as const
export const DIAS_FULL = [
  'Domingo',
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
] as const

export function fmtHora(min: number): string {
  const h = Math.floor(min / 60)
  const m = min % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

export function minDoDia(iso: string): number {
  const d = parseISO(iso)
  return d.getHours() * 60 + d.getMinutes()
}

export interface SemanaInfo {
  inicio: Date
  fim: Date
  dias: Date[]
  /** rótulo "25 — 31 de maio, 2026" */
  rotulo: string
  /** índice 0..6 do dia de hoje (ou -1 se hoje for fora da semana) */
  hojeIdx: number
}

export function semanaAtual(base: Date = new Date()): SemanaInfo {
  const inicio = startOfWeek(base, { weekStartsOn: 0 })
  const fim = addDays(inicio, 6)
  const dias = Array.from({ length: 7 }, (_, i) => addDays(inicio, i))
  const mesIni = format(inicio, 'MMMM', { locale: ptBR })
  const mesFim = format(fim, 'MMMM', { locale: ptBR })
  const ano = format(fim, 'yyyy')
  const rotulo =
    mesIni === mesFim
      ? `${format(inicio, 'd')} — ${format(fim, 'd')} de ${mesIni}, ${ano}`
      : `${format(inicio, 'd', { locale: ptBR })} ${mesIni} — ${format(
          fim,
          'd',
        )} ${mesFim}, ${ano}`
  const hoje = new Date()
  const hojeIdx = dias.findIndex((d) => d.toDateString() === hoje.toDateString())
  return { inicio, fim, dias, rotulo, hojeIdx }
}
