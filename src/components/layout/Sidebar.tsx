"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  BookOpen,
  LayoutDashboard,
  Users,
  CheckSquare,
  ClipboardList,
  GraduationCap,
  TrendingUp,
  Award,
  BookMarked,
  Terminal,
  Activity,
  MessagesSquare,
  Settings,
  ShieldCheck,
  HelpCircle
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const teacherNav = [
  { title: 'แดชบอร์ด', subtitle: 'COMMAND_NEXUS', href: '/teacher/dashboard', icon: LayoutDashboard },
  { title: 'คลาสเรียน', subtitle: 'NODE_ARCHIVE', href: '/teacher/classes', icon: Users },
  { title: 'บทเรียน', subtitle: 'KNOWLEDGE_STREAM', href: '/teacher/lessons', icon: BookOpen },
  { title: 'แบบทดสอบ', subtitle: 'COGNITIVE_TEST', href: '/teacher/quizzes', icon: CheckSquare },
  { title: 'เช็คชื่อ', subtitle: 'PRESENCE_SYNC', href: '/teacher/attendance', icon: ClipboardList },
  { title: 'คะแนน', subtitle: 'MATRIX_DATA', href: '/teacher/grades', icon: GraduationCap },
]

const studentNav = [
  { title: 'แดชบอร์ด', subtitle: 'CORE_DASHBOARD', href: '/student/dashboard', icon: LayoutDashboard },
  { title: 'คลาสเรียน', subtitle: 'ENROLLED_SECTORS', href: '/student/classes', icon: Users },
  { title: 'บทเรียน', subtitle: 'LEARNING_MODULES', href: '/student/lessons', icon: BookMarked },
  { title: 'แบบทดสอบ', subtitle: 'ASSESSMENT_UPLINK', href: '/student/quizzes', icon: CheckSquare },
  { title: 'เช็คชื่อ', subtitle: 'PRESENCE_LOGS', href: '/student/attendance', icon: ClipboardList },
  { title: 'คะแนน', subtitle: 'PERFORMANCE_STATS', href: '/student/grades', icon: GraduationCap },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { profile, role, loading } = useAuth()

  // Use pathname as fallback while auth is still loading to prevent empty sidebar
  const effectiveRole = role || (pathname.startsWith('/teacher') ? 'teacher' : pathname.startsWith('/student') ? 'student' : null)
  const navItems = effectiveRole === 'teacher' ? teacherNav : (effectiveRole === 'student' ? studentNav : [])

  return (
    <nav className={cn("hidden md:flex flex-col h-full w-64 bg-bg-primary border-r border-accent-primary/10 z-40 transition-all duration-500", className)}>
      {/* Sidebar Header Section */}
      <div className="p-8 pb-10 flex flex-col gap-1 border-b border-accent-primary/5 bg-bg-secondary/40">
        <div className="text-accent-primary font-black font-heading text-xl uppercase tracking-widest neon-glaze italic" data-text={role === 'teacher' ? 'INSTRUCTOR_CORE' : 'STUDENT_CORE'}>
          {role === 'teacher' ? 'INSTRUCTOR_CORE' : 'STUDENT_CORE'}
        </div>
        <div className="text-text-muted/30 font-mono text-[9px] tracking-[0.3em] uppercase italic font-bold">V1.0.4-STABLE_PRO_BUILD</div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar bg-bg-primary/50 backdrop-blur-sm">
        <nav className="flex flex-col py-6">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-5 px-8 py-5 text-[11px] font-heading font-black transition-all duration-300 uppercase tracking-[0.2em] relative group italic border-l-4 border-transparent",
                  isActive 
                    ? "bg-bg-tertiary text-accent-primary border-accent-primary shadow-[inset_0_0_15px_rgba(0,251,251,0.05)]" 
                    : "text-text-muted hover:text-foreground hover:bg-bg-elevated/40 hover:translate-x-1"
                )}
              >
                <Icon className={cn("h-5 w-5 shrink-0", isActive ? "text-accent-primary drop-shadow-glow-cyan" : "text-text-muted/40 group-hover:text-accent-primary/70 transition-colors")} />
                
                <div className="flex flex-col">
                  <span className="font-thai-heading text-[12px] leading-none mb-1 shadow-glow-cyan/10" data-text={item.title}>{item.title}</span>
                  <span className={cn("text-[8px] font-mono tracking-[0.1em] opacity-40 group-hover:opacity-60 transition-opacity whitespace-nowrap", !isActive && "text-text-dim")}>
                    {item.subtitle}
                  </span>
                </div>
                
                {isActive && (
                  <div className="absolute right-4 w-1 h-3 bg-accent-primary/30 animate-pulse"></div>
                )}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto flex flex-col bg-bg-secondary/60 border-t border-accent-primary/10">
        <div className="p-6 font-heading text-[9px] uppercase tracking-[0.3em] space-y-4 font-black italic">
          <Link href="#" className="flex items-center gap-4 text-text-muted/40 hover:text-accent-primary transition-all group/sub">
            <ShieldCheck className="w-4 h-4 text-text-muted/20 group-hover/sub:text-accent-primary transition-colors" />
            <span className="relative">DOCUMENTATION <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent-primary/30 group-hover/sub:w-full transition-all duration-500" /></span>
          </Link>
          <Link href="#" className="flex items-center gap-4 text-text-muted/40 hover:text-accent-primary transition-all group/sub">
            <HelpCircle className="w-4 h-4 text-text-muted/20 group-hover/sub:text-accent-primary transition-colors" />
            <span className="relative">SYSTEM_SUPPORT <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-accent-primary/30 group-hover/sub:w-full transition-all duration-500" /></span>
          </Link>
        </div>
        
        <div className="px-8 py-6 border-t border-accent-primary/5 flex items-center justify-between">
           <div className="flex items-center gap-2">
              <span className="w-2 h-2 bg-accent-tertiary rounded-full animate-pulse shadow-glow-emerald"></span>
              <span className="text-[8px] font-mono text-accent-tertiary uppercase tracking-tighter">SECURE_LINK_ACTIVE</span>
           </div>
           <Activity className="w-3 h-3 text-accent-primary/20 animate-bounce" />
        </div>
      </div>
    </nav>
  )
}
