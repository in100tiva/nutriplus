import { create } from 'zustand'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  title: string
  description?: string
  type: ToastType
}

interface ToastState {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, 'id'>) => void
  removeToast: (id: string) => void
  clearToasts: () => void
}

let toastCounter = 0

function generateId(): string {
  toastCounter += 1
  return `toast-${Date.now()}-${toastCounter}`
}

const AUTO_DISMISS_MS = 5000

export const useToast = create<ToastState>((set, get) => ({
  toasts: [],

  addToast: (toast: Omit<Toast, 'id'>) => {
    const id = generateId()
    const newToast: Toast = { ...toast, id }

    set((state) => ({
      toasts: [...state.toasts, newToast],
    }))

    // Auto-remove after 5 seconds
    setTimeout(() => {
      const { toasts } = get()
      if (toasts.some((t) => t.id === id)) {
        set((state) => ({
          toasts: state.toasts.filter((t) => t.id !== id),
        }))
      }
    }, AUTO_DISMISS_MS)
  },

  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    }))
  },

  clearToasts: () => {
    set({ toasts: [] })
  },
}))

// ─── Convenience helpers ─────────────────────────────────────────

export function toast(title: string, description?: string, type: ToastType = 'info') {
  useToast.getState().addToast({ title, description, type })
}

export function toastSuccess(title: string, description?: string) {
  useToast.getState().addToast({ title, description, type: 'success' })
}

export function toastError(title: string, description?: string) {
  useToast.getState().addToast({ title, description, type: 'error' })
}

export function toastWarning(title: string, description?: string) {
  useToast.getState().addToast({ title, description, type: 'warning' })
}

export function toastInfo(title: string, description?: string) {
  useToast.getState().addToast({ title, description, type: 'info' })
}
