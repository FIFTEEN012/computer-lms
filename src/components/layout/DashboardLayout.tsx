"use client"

import { useState } from 'react'
import { Sidebar } from './Sidebar'
import { TopBar } from './TopBar'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { VisuallyHidden } from '@radix-ui/react-visually-hidden'

export function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-bg-primary text-text-main font-body selection:bg-accent-primary/20">
      {/* Top Header - Global Identity Hub */}
      <TopBar onMenuClick={() => setIsMobileMenuOpen(true)} />

      {/* Spacer for fixed TopBar */}
      <div className="shrink-0 h-16" />

      <div className="flex flex-1 overflow-hidden relative">
        {/* Desktop Sidebar - Side Navigation Matrix */}
        <Sidebar className="hidden md:flex shrink-0 border-r border-accent-primary/5 workstation-panel shadow-2xl z-40 bg-bg-secondary/95 backdrop-blur-3xl" />

        {/* Mobile Sidebar */}
        <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-64 border-r border-accent-primary/20 !bg-bg-primary/95 !backdrop-blur-3xl !rounded-none">
            <VisuallyHidden>
               <SheetTitle>Navigation Matrix</SheetTitle>
            </VisuallyHidden>
            <Sidebar className="flex w-full" />
          </SheetContent>
        </Sheet>

        {/* Main Workstation Viewport */}
        <div className="flex-1 relative flex flex-col overflow-hidden bg-transparent">
          {/* Grid Background Layer */}
          <div className="absolute inset-0 grid-overlay opacity-5 pointer-events-none z-0"></div>
          
          <main className="flex-1 overflow-y-auto relative custom-scrollbar p-2 md:p-6 lg:p-10 z-10 bg-transparent scroll-smooth">
            <div className="mx-auto max-w-[1720px] min-h-full flex flex-col animate-in fade-in slide-in-from-bottom-6 duration-1000 ease-out italic">
               {children}
            </div>
          </main>
          
          {/* Subtle Industrial Labels - System Identification */}
          <div className="absolute right-10 bottom-10 hidden xl:flex flex-col items-end opacity-[0.03] z-0 pointer-events-none select-none font-mono text-[9px] uppercase tracking-[0.5em] space-y-2">
            <p>NODE_ID: 0x-7749-F</p>
            <p>LATENCY_BUFFER: 24MS</p>
            <p>STREAMS: STABLE_OK</p>
          </div>
        </div>
      </div>
    </div>
  )
}
