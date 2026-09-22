import { useEffect, useState } from 'react'
import './Toast.css'

export type ToastType = 'success' | 'error'
type ToastItem = { id: number; message: string; type: ToastType }

let idCounter = 0
let toasts: ToastItem[] = []
const listeners = new Set<(items: ToastItem[]) => void>()

function emit() {
  listeners.forEach((listener) => listener(toasts))
}

export function showToast(message: string, type: ToastType = 'success') {
  const id = ++idCounter
  toasts = [...toasts, { id, message, type }]
  emit()
  setTimeout(() => dismissToast(id), 3500)
}

export function dismissToast(id: number) {
  toasts = toasts.filter((item) => item.id !== id)
  emit()
}

export function ToastContainer() {
  const [items, setItems] = useState<ToastItem[]>(toasts)

  useEffect(() => {
    listeners.add(setItems)
    return () => {
      listeners.delete(setItems)
    }
  }, [])

  if (items.length === 0) return null

  return (
    <div className="toast-container">
      {items.map((item) => (
        <div key={item.id} className={`toast toast-${item.type}`} role="status">
          <span className="toast-icon" aria-hidden="true">
            {item.type === 'success' ? (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="4 12 10 18 20 6" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="7" x2="12" y2="13" />
                <circle cx="12" cy="17" r="0.5" fill="currentColor" />
              </svg>
            )}
          </span>
          <span className="toast-message">{item.message}</span>
          <button type="button" className="toast-close" onClick={() => dismissToast(item.id)} aria-label="დახურვა">
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
