// Conjunto de ícones inline em SVG — single-stroke, 16px por padrão, currentColor.
// Espelha o conjunto `I.*` da entrega de design.
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement>

const base: IconProps = {
  width: 16,
  height: 16,
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.6,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

export const IconAgenda = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 9h18M8 3v4M16 3v4" />
  </svg>
)

export const IconUsers = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M2.5 20c.6-3.5 3.4-5.2 6.5-5.2s5.9 1.7 6.5 5.2" />
    <path d="M16 4.5a3 3 0 0 1 0 6M22 19.5c-.3-2-1.6-3.4-3.5-4.1" />
  </svg>
)

export const IconPlate = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <circle cx="12" cy="12" r="5.2" />
    <path d="M12 7v10M7 12h10" />
  </svg>
)

export const IconVideo = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <rect x="2.5" y="6.5" width="13" height="11" rx="2" />
    <path d="m21.5 8-5 3.2v1.6l5 3.2z" />
  </svg>
)

export const IconChart = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 20h18" />
    <path d="m4 16 4-5 4 3 6-8" />
  </svg>
)

export const IconUser = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <circle cx="12" cy="9" r="3.6" />
    <path d="M4 20c1-3.5 4.2-5.5 8-5.5s7 2 8 5.5" />
  </svg>
)

export const IconInbox = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M3 13v6a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-6l-3-9H6z" />
    <path d="M3 13h5l1 3h6l1-3h5" />
  </svg>
)

export const IconHealth = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} {...p}>
    <path d="M21 12h-4l-2 6-4-12-2 6H3" />
  </svg>
)

export const IconSearch = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} strokeWidth={1.7} {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.5-3.5" />
  </svg>
)

export const IconPlus = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} strokeWidth={1.7} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)

export const IconChevR = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} strokeWidth={1.8} {...p}>
    <path d="m9 6 6 6-6 6" />
  </svg>
)

export const IconChevL = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} strokeWidth={1.8} {...p}>
    <path d="m15 6-6 6 6 6" />
  </svg>
)

export const IconChevD = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} strokeWidth={1.8} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
)

export const IconBell = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} strokeWidth={1.7} {...p}>
    <path d="M6 8a6 6 0 1 1 12 0c0 5 2 6 2 6H4s2-1 2-6Z" />
    <path d="M10 19a2 2 0 0 0 4 0" />
  </svg>
)

export const IconSettings = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} strokeWidth={1.7} {...p}>
    <circle cx="12" cy="12" r="2.6" />
    <path d="M19.4 14.5a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-1.8-.3 1.6 1.6 0 0 0-1 1.5V20a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-1-1.5 1.6 1.6 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0 .3-1.8 1.6 1.6 0 0 0-1.5-1H4a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.5-1 1.6 1.6 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3h.1a1.6 1.6 0 0 0 1-1.5V4a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 1 1.5 1.6 1.6 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H20a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z" />
  </svg>
)

export const IconCheck = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} strokeWidth={2} {...p}>
    <path d="m5 12 5 5 9-11" />
  </svg>
)

export const IconX = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} strokeWidth={1.8} {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </svg>
)

export const IconDownload = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} strokeWidth={1.7} {...p}>
    <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" />
  </svg>
)

export const IconExternal = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} strokeWidth={1.7} {...p}>
    <path d="M10 5H5v14h14v-5" />
    <path d="M14 4h6v6" />
    <path d="m14 10 6-6" />
  </svg>
)

export const IconMore = (p: IconProps) => (
  <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" {...p}>
    <circle cx="5" cy="12" r="1.6" />
    <circle cx="12" cy="12" r="1.6" />
    <circle cx="19" cy="12" r="1.6" />
  </svg>
)

export const IconFilter = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} {...p}>
    <path d="M4 5h16l-6 8v6l-4-2v-4z" />
  </svg>
)

export const IconMic = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={1.7} {...p}>
    <rect x="9" y="3" width="6" height="11" rx="3" />
    <path d="M5 11a7 7 0 0 0 14 0M12 18v3" />
  </svg>
)

export const IconCamera = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={1.7} {...p}>
    <rect x="2.5" y="6.5" width="13" height="11" rx="2" />
    <path d="m21.5 8-5 3.2v1.6l5 3.2z" />
  </svg>
)

export const IconNotes = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} {...p}>
    <rect x="4" y="3" width="16" height="18" rx="2" />
    <path d="M8 8h8M8 12h8M8 16h5" />
  </svg>
)

export const IconCopy = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} {...p}>
    <rect x="8" y="8" width="13" height="13" rx="2" />
    <path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3" />
  </svg>
)

export const IconTrash = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} width={14} height={14} {...p}>
    <path d="M4 7h16M10 11v6M14 11v6M5 7l1 13a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2l1-13M9 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
  </svg>
)

export const IconDrag = (p: IconProps) => (
  <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" {...p}>
    <circle cx="9" cy="6" r="1.3" />
    <circle cx="9" cy="12" r="1.3" />
    <circle cx="9" cy="18" r="1.3" />
    <circle cx="15" cy="6" r="1.3" />
    <circle cx="15" cy="12" r="1.3" />
    <circle cx="15" cy="18" r="1.3" />
  </svg>
)

export const IconEnd = (p: IconProps) => (
  <svg viewBox="0 0 24 24" width={16} height={16} fill="currentColor" {...p}>
    <path
      d="M3 13c4-4 14-4 18 0l-2 2-3-1-1-2c-2-1-4-1-6 0l-1 2-3 1z"
      transform="rotate(135 12 12)"
    />
  </svg>
)

export const IconShare = (p: IconProps) => (
  <svg viewBox="0 0 24 24" {...base} strokeWidth={1.7} {...p}>
    <rect x="3" y="4" width="18" height="13" rx="2" />
    <path d="M8 21h8M12 17v4" />
  </svg>
)
