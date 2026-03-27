"use client"

import { useToastStore } from '@/components/ui/toaster'

export function useToast() {
  const addToast = useToastStore((state) => state.addToast)

  return {
    toast: (props: { title: string; description?: string; variant?: 'default' | 'destructive' }) => {
      addToast(props)
    }
  }
}
