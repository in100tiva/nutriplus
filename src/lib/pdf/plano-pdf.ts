// Geração de PDF do plano alimentar — usado pelo nutri (editor) e pelo paciente.
// jsPDF + jspdf-autotable, fontes built-in (Helvetica + Times). Cores
// equivalentes às do design system (forest accent).
import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { format, parseISO } from 'date-fns'
import { ptBR } from 'date-fns/locale'

// ─── Tipos de entrada ───────────────────────────────────────────────
export interface PdfAlimento {
  nome: string
  kcal_por_100g: number
  carboidrato_g: number
  proteina_g: number
  lipidio_g: number
  fibra_g: number
}

export interface PdfItem {
  quantidade_g: number
  medida_caseira: string | null
  alimentos: PdfAlimento | null
}

export interface PdfRefeicao {
  nome: string
  horario: string | null
  ordem: number
  plano_itens: PdfItem[]
}

export interface PdfPlano {
  titulo: string
  data_inicio: string
  data_fim: string | null
  observacoes: string | null
  plano_refeicoes: PdfRefeicao[]
}

export interface PdfNutri {
  nome: string
  crn: string
}

export interface PdfPaciente {
  nome: string
}

// ─── Cores e métricas ───────────────────────────────────────────────
const COR = {
  ink:    '#1f1d18',
  ink2:   '#5b574d',
  ink3:   '#8a8478',
  ink4:   '#b3ad9f',
  line:   '#d4cfc1',
  paper2: '#efebde',
  paper3: '#fafaf3',
  accent: '#2d6a4f',
  accentSoft: '#d8ead9',
  clay:   '#a66744',
  warn:   '#b88523',
}

const MARGIN_X = 36 // pt
const PAGE_W = 595 // A4 em pt
const CONTENT_W = PAGE_W - MARGIN_X * 2

// ─── Helpers de macro ───────────────────────────────────────────────
function macroDoItem(it: PdfItem) {
  const a = it.alimentos
  if (!a) return { kcal: 0, c: 0, p: 0, l: 0, fib: 0 }
  const f = it.quantidade_g / 100
  return {
    kcal: a.kcal_por_100g * f,
    c: a.carboidrato_g * f,
    p: a.proteina_g * f,
    l: a.lipidio_g * f,
    fib: a.fibra_g * f,
  }
}

function macroDaRefeicao(r: PdfRefeicao) {
  const t = { kcal: 0, c: 0, p: 0, l: 0, fib: 0 }
  for (const it of r.plano_itens) {
    const m = macroDoItem(it)
    t.kcal += m.kcal
    t.c += m.c
    t.p += m.p
    t.l += m.l
    t.fib += m.fib
  }
  return t
}

function macroDoPlano(refs: PdfRefeicao[]) {
  const t = { kcal: 0, c: 0, p: 0, l: 0, fib: 0 }
  for (const r of refs) {
    const m = macroDaRefeicao(r)
    t.kcal += m.kcal
    t.c += m.c
    t.p += m.p
    t.l += m.l
    t.fib += m.fib
  }
  return t
}

function fmtData(s: string): string {
  try {
    return format(parseISO(s), "d 'de' MMMM 'de' yyyy", { locale: ptBR })
  } catch {
    return s
  }
}

/**
 * Sanitiza texto para o PDF: troca glyphs Unicode que Helvetica/Times built-in
 * do jsPDF não suportam (→, ≥, ≤, —, …) por equivalentes ASCII. Sem isso o
 * jsPDF aplica letter-spacing estranho ou renderiza como pontuação aleatória.
 */
function sanit(s: string | null | undefined): string {
  if (!s) return ''
  return s
    .replace(/→/g, '->')
    .replace(/←/g, '<-')
    .replace(/≥/g, '>=')
    .replace(/≤/g, '<=')
    .replace(/—/g, '-')
    .replace(/–/g, '-')
    .replace(/…/g, '...')
    .replace(/·/g, '•')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
}

// ─── Componente: marca (brand-mark + wordmark) ──────────────────────
function desenharMarca(doc: jsPDF, x: number, y: number) {
  const size = 22
  doc.setFillColor(COR.accent)
  doc.roundedRect(x, y, size, size, 5, 5, 'F')
  doc.setTextColor('#ffffff')
  doc.setFont('times', 'normal')
  doc.setFontSize(16)
  doc.text('N', x + size / 2, y + size / 2 + 5, { align: 'center' })

  doc.setFont('times', 'normal')
  doc.setFontSize(17)
  doc.setTextColor(COR.ink)
  doc.text('Nutri', x + size + 8, y + size / 2 + 4.5)
}

// ─── Geração principal ──────────────────────────────────────────────
export interface GerarPlanoPdfArgs {
  plano: PdfPlano
  nutri: PdfNutri
  paciente: PdfPaciente
  /** Metas opcionais (kcal, carb, prot, lip). Padrão: 2100/240/140/70 */
  metas?: { kcal: number; carb: number; prot: number; lip: number }
}

export function gerarPlanoPdf(args: GerarPlanoPdfArgs): jsPDF {
  const { plano, nutri, paciente } = args
  const metas = args.metas ?? { kcal: 2100, carb: 240, prot: 140, lip: 70 }

  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  let y = 40

  // — Cabeçalho: marca + data de emissão
  desenharMarca(doc, MARGIN_X, y)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(9)
  doc.setTextColor(COR.ink3)
  doc.text(
    sanit(`Emitido em ${format(new Date(), "d 'de' MMM yyyy 'as' HH:mm", { locale: ptBR })}`),
    PAGE_W - MARGIN_X,
    y + 14,
    { align: 'right' },
  )
  y += 44

  // — Título + período
  doc.setDrawColor(COR.line)
  doc.setLineWidth(0.5)
  doc.line(MARGIN_X, y, PAGE_W - MARGIN_X, y)
  y += 18

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8.5)
  doc.setTextColor(COR.ink3)
  doc.text('PLANO ALIMENTAR', MARGIN_X, y)
  y += 16

  doc.setFont('times', 'normal')
  doc.setFontSize(22)
  doc.setTextColor(COR.ink)
  const tituloLinhas = doc.splitTextToSize(sanit(plano.titulo), CONTENT_W)
  doc.text(tituloLinhas, MARGIN_X, y)
  y += tituloLinhas.length * 22 + 4

  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10.5)
  doc.setTextColor(COR.ink2)
  const periodo = plano.data_fim
    ? `${fmtData(plano.data_inicio)} a ${fmtData(plano.data_fim)}`
    : `A partir de ${fmtData(plano.data_inicio)} - em vigor`
  doc.text(sanit(periodo), MARGIN_X, y + 6)
  y += 32

  // — Card duplo: nutricionista | paciente
  const colW = (CONTENT_W - 12) / 2
  const cardH = 60

  // Nutri
  doc.setFillColor(COR.paper2)
  doc.roundedRect(MARGIN_X, y, colW, cardH, 6, 6, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(COR.ink3)
  doc.text('NUTRICIONISTA', MARGIN_X + 12, y + 16)
  doc.setFont('times', 'normal')
  doc.setFontSize(15)
  doc.setTextColor(COR.ink)
  doc.text(sanit(nutri.nome), MARGIN_X + 12, y + 34, { maxWidth: colW - 24 })
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(COR.ink2)
  doc.text(sanit(`CRN ${nutri.crn}`), MARGIN_X + 12, y + 50)

  // Paciente
  const xPac = MARGIN_X + colW + 12
  doc.setFillColor(COR.accentSoft)
  doc.roundedRect(xPac, y, colW, cardH, 6, 6, 'F')
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(8)
  doc.setTextColor(COR.ink3)
  doc.text('PACIENTE', xPac + 12, y + 16)
  doc.setFont('times', 'normal')
  doc.setFontSize(15)
  doc.setTextColor(COR.ink)
  doc.text(sanit(paciente.nome), xPac + 12, y + 34, { maxWidth: colW - 24 })

  y += cardH + 22

  // — Refeições
  const refeicoes = [...plano.plano_refeicoes].sort((a, b) => a.ordem - b.ordem)

  for (const r of refeicoes) {
    const m = macroDaRefeicao(r)

    // Quebra de página se necessário (header da refeição ~ 38pt + ao menos 2 linhas)
    if (y > 720) {
      doc.addPage()
      y = 40
    }

    // Header da refeição
    doc.setFillColor(COR.paper3)
    doc.setDrawColor(COR.line)
    doc.setLineWidth(0.5)
    doc.roundedRect(MARGIN_X, y, CONTENT_W, 32, 4, 4, 'FD')

    doc.setFont('times', 'normal')
    doc.setFontSize(14)
    doc.setTextColor(COR.ink)
    doc.text(sanit(r.nome), MARGIN_X + 12, y + 20)

    if (r.horario) {
      doc.setFont('courier', 'normal')
      doc.setFontSize(10)
      doc.setTextColor(COR.ink3)
      doc.text(r.horario.slice(0, 5), MARGIN_X + 130, y + 20)
    }

    // Macros à direita
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(COR.ink2)
    const macroTxt = `${Math.round(m.kcal)} kcal | C ${m.c.toFixed(0)}g  P ${m.p.toFixed(0)}g  L ${m.l.toFixed(0)}g`
    doc.text(macroTxt, PAGE_W - MARGIN_X - 10, y + 20, { align: 'right' })

    y += 38

    // Tabela de itens
    autoTable(doc, {
      startY: y,
      head: [['Alimento', 'Medida', 'Qtd', 'kcal', 'C', 'P', 'L']],
      body: r.plano_itens.length
        ? r.plano_itens.map((it) => {
            const im = macroDoItem(it)
            return [
              sanit(it.alimentos?.nome ?? '-'),
              sanit(it.medida_caseira ?? '-'),
              `${it.quantidade_g} g`,
              Math.round(im.kcal).toString(),
              im.c.toFixed(0),
              im.p.toFixed(0),
              im.l.toFixed(0),
            ]
          })
        : [['Sem itens cadastrados.', '', '', '', '', '', '']],
      theme: 'plain',
      styles: {
        font: 'helvetica',
        fontSize: 9.5,
        cellPadding: { top: 6, right: 6, bottom: 6, left: 8 },
        textColor: COR.ink,
        lineColor: '#ebe6d8',
        lineWidth: 0.4,
      },
      headStyles: {
        fillColor: '#ffffff',
        textColor: COR.ink3,
        fontStyle: 'bold',
        fontSize: 8,
        cellPadding: { top: 4, right: 6, bottom: 4, left: 8 },
      },
      columnStyles: {
        0: { cellWidth: 'auto' },
        1: { cellWidth: 130, textColor: COR.ink2 },
        2: { cellWidth: 50, halign: 'right', textColor: COR.ink2 },
        3: { cellWidth: 46, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 32, halign: 'right', textColor: COR.ink3 },
        5: { cellWidth: 32, halign: 'right', textColor: COR.ink3 },
        6: { cellWidth: 32, halign: 'right', textColor: COR.ink3 },
      },
      margin: { left: MARGIN_X, right: MARGIN_X },
      didDrawPage: () => {
        // nada por página
      },
    })

    // @ts-expect-error — `lastAutoTable` é injetado por jspdf-autotable
    y = (doc.lastAutoTable as { finalY: number }).finalY + 18
  }

  // — Totais do dia
  // Altura aumentada (88pt) com layout em 3 linhas dentro de cada coluna:
  // valor (serif grande) / label minúsculo / meta minúsculo
  if (y > 690) {
    doc.addPage()
    y = 40
  }
  const total = macroDoPlano(refeicoes)
  const TOTAL_CARD_H = 90
  doc.setFillColor(COR.accent)
  doc.roundedRect(MARGIN_X, y, CONTENT_W, TOTAL_CARD_H, 6, 6, 'F')

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(8.5)
  doc.setTextColor('#cfe8d9')
  doc.text('TOTAL DO DIA', MARGIN_X + 16, y + 18)

  // 5 colunas igualmente espaçadas com padding interno
  const PAD_LEFT = 16
  const cellW = (CONTENT_W - PAD_LEFT * 2) / 5
  const startX = MARGIN_X + PAD_LEFT

  interface Cell {
    value: string
    unit: string
    label: string
    meta: string
  }
  const cells: Cell[] = [
    { value: `${Math.round(total.kcal)}`, unit: 'kcal', label: 'Energia', meta: `meta ${metas.kcal}` },
    { value: `${total.c.toFixed(0)}`, unit: 'g', label: 'Carboidrato', meta: `meta ${metas.carb}g` },
    { value: `${total.p.toFixed(0)}`, unit: 'g', label: 'Proteina', meta: `meta ${metas.prot}g` },
    { value: `${total.l.toFixed(0)}`, unit: 'g', label: 'Lipidio', meta: `meta ${metas.lip}g` },
    { value: `${total.fib.toFixed(1)}`, unit: 'g', label: 'Fibra', meta: 'recom. >= 25g' },
  ]

  cells.forEach((c, i) => {
    const cx = startX + i * cellW
    // Valor + unidade (serif grande)
    doc.setFont('times', 'normal')
    doc.setFontSize(22)
    doc.setTextColor('#ffffff')
    doc.text(c.value, cx, y + 50)

    // Unidade discreta à direita do valor
    const valW = doc.getTextWidth(c.value)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)
    doc.setTextColor('#cfe8d9')
    doc.text(c.unit, cx + valW + 3, y + 50)

    // Label
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8.5)
    doc.setTextColor('#a8d5b9')
    doc.text(c.label, cx, y + 65)

    // Meta abaixo
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(7.5)
    doc.setTextColor('#8fc6a5')
    doc.text(c.meta, cx, y + 78)
  })

  y += TOTAL_CARD_H + 18

  // — Observações
  if (plano.observacoes) {
    const obsLimpa = sanit(plano.observacoes)
    if (y > 730) {
      doc.addPage()
      y = 40
    }
    // Card warm com padding interno
    doc.setFont('helvetica', 'bold')
    doc.setFontSize(8)
    doc.setTextColor(COR.ink3)
    doc.text('OBSERVACOES DA NUTRICIONISTA', MARGIN_X, y)
    y += 14

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10.5)
    doc.setTextColor(COR.ink2)
    const obsLinhas = doc.splitTextToSize(obsLimpa, CONTENT_W - 20)

    // Fundo suave para destacar
    const obsH = obsLinhas.length * 14 + 20
    doc.setFillColor(COR.paper2)
    doc.roundedRect(MARGIN_X, y - 6, CONTENT_W, obsH, 6, 6, 'F')
    doc.setTextColor(COR.ink2)
    doc.text(obsLinhas, MARGIN_X + 14, y + 8)
    y += obsH + 8
  }

  // — Rodapé em todas as páginas
  const total_pages = (doc as unknown as { internal: { getNumberOfPages: () => number } }).internal.getNumberOfPages()
  for (let i = 1; i <= total_pages; i++) {
    doc.setPage(i)
    doc.setDrawColor(COR.line)
    doc.line(MARGIN_X, 810, PAGE_W - MARGIN_X, 810)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(8)
    doc.setTextColor(COR.ink3)
    doc.text('Nutri · consultório digital', MARGIN_X, 824)
    doc.text(`Página ${i} de ${total_pages}`, PAGE_W - MARGIN_X, 824, { align: 'right' })
    doc.setTextColor(COR.ink4)
    doc.setFontSize(7.5)
    doc.text(
      sanit(
        'Este documento e informativo e nao substitui orientacao clinica individual presencial.',
      ),
      PAGE_W / 2,
      834,
      { align: 'center' },
    )
  }

  return doc
}

/**
 * Conveniência: gera e baixa o PDF do plano alimentar.
 */
export function baixarPlanoPdf(args: GerarPlanoPdfArgs, nomeArquivo?: string): void {
  const doc = gerarPlanoPdf(args)
  const nome =
    nomeArquivo ??
    `plano-${args.paciente.nome.replace(/\s+/g, '-').toLowerCase()}-${args.plano.data_inicio}.pdf`
  doc.save(nome)
}
