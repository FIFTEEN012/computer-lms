"use client"

import { Bell, Menu, User, Terminal, Database, Cpu, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ThemeToggle } from './ThemeToggle'
import { cn } from '@/lib/utils'
import { signOutAction } from '@/app/actions/auth'
import { getStreakDataAction } from '@/app/actions/streak'
import StreakBadge from '@/components/gamification/StreakBadge'

export function TopBar({ onMenuClick }: { onMenuClick?: () => void }) {
  const { profile, role, signOut } = useAuth()
  const router = useRouter()
  const [streakData, setStreakData] = useState<{ currentStreak: number; isActiveToday: boolean } | null>(null)

  useEffect(() => {
    if (role === 'student') {
      getStreakDataAction().then(data => {
        if (data) setStreakData({ currentStreak: data.currentStreak, isActiveToday: data.isActiveToday })
      })
    }
  }, [role])

  const handleSignOut = async () => {
    await signOut()
    await signOutAction()
    window.location.href = '/login'
  }

  return (
    <header className="fixed top-0 w-full z-50 flex h-16 items-center justify-between border-b border-accent-primary/20 bg-bg-secondary/90 px-6 backdrop-blur-3xl shadow-[0_0_20px_rgba(0,251,251,0.05)] overflow-hidden">
      <div className="absolute inset-0 scanlines-tv opacity-[0.05] pointer-events-none"></div>
      
      {/* BRANDING NODE */}
      <div className="flex items-center gap-12 relative z-10">
        <Link href="/dashboard" className="flex items-center gap-4 group">
          <div className="w-10 h-10 bg-accent-primary flex items-center justify-center transition-transform duration-500 hover:rotate-90">
             <Terminal className="h-5 w-5 text-bg-primary shadow-glow-cyan" />
          </div>
          <h1 className="font-heading font-black text-2xl tracking-[0.2em] text-accent-primary uppercase italic neon-glaze glitch-text pointer-events-none" data-text="KINETIC_TERMINAL">
            KINETIC_TERMINAL
          </h1>
        </Link>

        {/* CENTERED FLOW NAVIGATION - STITCH STYLE */}
        <nav className="hidden lg:flex items-center gap-1">
          {[
            { label: 'DASHBOARD', href: `/${profile?.role || 'student'}/dashboard` },
            { label: 'ARCHIVE', href: `/${profile?.role || 'student'}/classes` },
            { label: 'NETWORK', href: '#' },
          ].map((nav, i) => (
             <Link 
               key={i}
               href={nav.href}
               className="px-6 py-2 text-[10px] font-heading font-black tracking-[0.2em] text-text-muted hover:text-accent-primary hover:bg-accent-primary/5 transition-all relative group"
             >
               {nav.label}
               <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-accent-primary transition-all duration-500 group-hover:w-full shadow-glow-cyan"></div>
             </Link>
          ))}
        </nav>
      </div>

      {/* MOBILE TRIGGER */}
      {onMenuClick && (
        <Button variant="ghost" size="icon" className="md:hidden border border-accent-primary/20 bg-bg-primary" onClick={onMenuClick}>
          <Menu className="h-5 w-5 text-accent-primary" />
        </Button>
      )}

      {/* TELEMETRY & PROFILE NODE */}
      <div className="flex items-center gap-6 relative z-10">
        <div className="hidden xl:flex items-center gap-10 font-mono text-[9px] tracking-[0.4em] text-text-muted uppercase italic">
          <div className="flex items-center gap-3">
             <Cpu className="w-3 h-3 text-accent-primary/40" />
             CORE: <span className="text-accent-primary/80">STABLE_OK</span>
          </div>
          <div className="flex items-center gap-3">
             <Database className="w-3 h-3 text-accent-secondary/40" />
             MEM: <span className="text-accent-secondary/80">99.2%_FREE</span>
          </div>
        </div>

        <div className="h-8 w-[1px] bg-accent-primary/10 hidden sm:block" />
        
        <ThemeToggle />

        {role === 'student' && streakData && (
          <StreakBadge streak={streakData.currentStreak} isActiveToday={streakData.isActiveToday} />
        )}

        <Button variant="ghost" size="icon" className="relative group hover:bg-accent-primary/5 transition-all active:scale-95">
          <Bell className="h-5 w-5 text-accent-primary/60 group-hover:text-accent-primary transition-all drop-shadow-glow-cyan" />
          <span className="absolute top-1 right-1 h-1.5 w-1.5 bg-accent-secondary animate-pulse shadow-glow-pink"></span>
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-10 px-4 group hover:bg-accent-primary/10 border border-accent-primary/10 transition-all flex items-center gap-3 relative overflow-hidden group">
               <div className="flex flex-col items-end text-[9px] font-mono leading-none tracking-tighter opacity-70 group-hover:opacity-100 transition-opacity uppercase italic font-bold">
                  <span className="text-foreground">{profile?.full_name?.split(' ')[0] || 'USER'}</span>
                  <span className="text-accent-primary/60">{role === 'teacher' ? 'COMMANDER' : 'NEURAL_UNIT'}</span>
               </div>
               <div className="w-8 h-8 flex items-center justify-center bg-accent-primary/10 border border-accent-primary/30 group-hover:border-accent-primary transition-colors">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all" alt="U" />
                  ) : (
                    <User className="h-4 w-4 text-accent-primary" />
                  )}
               </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-64 bg-bg-secondary/95 border border-accent-primary/30 shadow-2xl font-heading mt-4 backdrop-blur-3xl">
            <div className="absolute inset-0 scanlines-tv opacity-[0.05] pointer-events-none"></div>
            <DropdownMenuLabel className="uppercase tracking-[0.2em] text-[10px] text-text-muted py-6 px-8 border-b border-accent-primary/5">
              UPLINK_STATUS_ARCH Architect_01
            </DropdownMenuLabel>
            
            <DropdownMenuItem onClick={() => router.push(`/${profile?.role || 'student'}/profile`)} className="cursor-pointer py-4 px-8 text-[10px] font-black uppercase tracking-[0.3em] hover:bg-accent-primary/10 hover:text-accent-primary transition-all italic flex items-center gap-4">
              <SettingsIcon className="h-4 w-4" /> CONFIG_PROFILE
            </DropdownMenuItem>
            
            <DropdownMenuSeparator className="bg-accent-primary/10" />
            
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer py-4 px-8 text-[10px] font-black uppercase tracking-[0.3em] text-accent-secondary hover:bg-accent-secondary/10 transition-all italic flex items-center gap-4">
              <LogOut className="h-4 w-4" /> TERMINATE_SESSION
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {/* Decorative Glow Line */}
      <div className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent"></div>
    </header>
  )
}
