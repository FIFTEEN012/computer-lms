"use client"

import { useEffect, useState } from "react"
import { create } from "zustand"
import { X, AlertCircle, CheckCircle2 } from "lucide-react"

type ToastVariant = "default" | "destructive" | "success"

interface Toast {
  id: string
  title: string
  description?: string
  variant?: ToastVariant
}

interface ToastStore {
  toasts: Toast[]
  addToast: (toast: Omit<Toast, "id">) => void
  removeToast: (id: string) => void
}

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast) => {
    const id = Math.random().toString(36).substring(2, 9)
    set((state) => ({ toasts: [...state.toasts, { ...toast, id }] }))
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }))
    }, 5000)
  },
  removeToast: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}))

export function Toaster() {
  const { toasts, removeToast } = useToastStore()

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-full max-w-[400px]">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            relative p-4 border-2 shadow-[0_0_20px_rgba(0,0,0,0.5)] overflow-hidden animate-in slide-in-from-right-full duration-300
            ${toast.variant === "destructive" 
              ? "bg-[#1a0a0d] border-red-500/50 text-red-400" 
              : "bg-[#0a1a1a] border-cyan-500/50 text-cyan-400"
            }
          `}
        >
          {/* Scanline overlay */}
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.1),rgba(0,0,0,0.1)_1px,transparent_1px,transparent_2px)] pointer-events-none"></div>
          
          <div className="flex gap-4 relative z-10">
            {toast.variant === "destructive" ? (
              <AlertCircle className="w-5 h-5 shrink-0" />
            ) : (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            )}
            
            <div className="flex-1 space-y-1">
              <h4 className="font-mono font-black uppercase tracking-widest text-xs italic">
                {toast.title}
              </h4>
              {toast.description && (
                <p className="font-mono text-[10px] uppercase opacity-70 tracking-widest leading-relaxed">
                   {toast.description}
                </p>
              )}
            </div>

            <button
              onClick={() => removeToast(toast.id)}
              className="hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Glich border / pulse */}
          <div className={`absolute bottom-0 left-0 h-1 transition-all duration-[5000ms] ease-linear bg-current`} style={{ width: '0%' }}></div>
        </div>
      ))}
    </div>
  )
}
