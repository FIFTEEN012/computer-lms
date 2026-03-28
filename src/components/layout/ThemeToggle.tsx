"use client"

import { useTheme } from "next-themes"
import { Sun, Moon } from "lucide-react"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return <div className="w-10 h-10" />

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="w-10 h-10 rounded-none bg-white/5 border border-white/10 hover:border-primary transition-all duration-300 group relative overflow-hidden"
    >
      <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none"></div>
      {theme === "dark" ? (
        <Sun className="h-4 w-4 text-primary animate-in zoom-in duration-300 group-hover:rotate-90 transition-transform shadow-glow-cyan" />
      ) : (
        <Moon className="h-4 w-4 text-primary animate-in zoom-in duration-300 group-hover:rotate-12 transition-transform shadow-glow-cyan" />
      )}
      <span className="sr-only">Toggle Theme</span>
    </Button>
  )
}
