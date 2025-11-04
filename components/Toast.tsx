"use client"

import { useEffect, useState } from "react"
import { X } from "lucide-react"

export interface ToastData {
  id: string
  title: string
  description?: string
  details?: string
}

interface ToastProps {
  toast: ToastData
  onDismiss: (id: string) => void
}

function Toast({ toast, onDismiss }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id)
    }, 6000)

    return () => clearTimeout(timer)
  }, [toast.id, onDismiss])

  return (
    <div className="pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg bg-card shadow-lg ring-1 ring-border">
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-1">
            <p className="text-sm font-bold text-foreground">{toast.title}</p>
            {toast.description && <p className="mt-1 text-sm text-foreground">{toast.description}</p>}
            {toast.details && <p className="mt-2 text-xs text-muted-foreground">{toast.details}</p>}
          </div>
          <button
            onClick={() => onDismiss(toast.id)}
            className="ml-4 inline-flex rounded-md text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <span className="sr-only">Close</span>
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<ToastData[]>([])

  useEffect(() => {
    const handleToast = (event: CustomEvent<ToastData>) => {
      setToasts((prev) => [...prev, event.detail])
    }

    window.addEventListener("show-toast" as any, handleToast)
    return () => window.removeEventListener("show-toast" as any, handleToast)
  }, [])

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <div className="pointer-events-none fixed bottom-0 right-0 z-50 flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:flex-col md:max-w-[420px]">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onDismiss={dismissToast} />
      ))}
    </div>
  )
}

export function showToast(data: Omit<ToastData, "id">) {
  const event = new CustomEvent("show-toast", {
    detail: { ...data, id: Math.random().toString(36).substring(7) },
  })
  window.dispatchEvent(event)
}
