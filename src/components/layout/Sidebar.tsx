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
  BookMarked
} from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import { cn } from '@/lib/utils'

const teacherNav = [
  { title: 'Dashboard', href: '/teacher/dashboard', icon: LayoutDashboard },
  { title: 'Classes', href: '/teacher/classes', icon: Users },
  { title: 'Lessons', href: '/teacher/lessons', icon: BookOpen },
  { title: 'Quizzes', href: '/teacher/quizzes', icon: CheckSquare },
  { title: 'Attendance', href: '/teacher/attendance', icon: ClipboardList },
  { title: 'Grades', href: '/teacher/grades', icon: GraduationCap },
  { title: 'Reports', href: '/teacher/reports', icon: TrendingUp },
]

const studentNav = [
  { title: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
  { title: 'My Classes', href: '/student/classes', icon: Users },
  { title: 'Lessons', href: '/student/lessons', icon: BookMarked },
  { title: 'Quizzes', href: '/student/quizzes', icon: CheckSquare },
  { title: 'Attendance', href: '/student/attendance', icon: ClipboardList },
  { title: 'My Grades', href: '/student/grades', icon: GraduationCap },
  { title: 'Leaderboard', href: '/student/leaderboard', icon: Award },
]

export function Sidebar({ className }: { className?: string }) {
  const pathname = usePathname()
  const { profile, role } = useAuth()

  // During loading or unauthenticated, default to an empty or basic list,
  // but since Sidebar is usually wrapped inside protected routes, we will have `role` soon.
  const navItems = role === 'teacher' ? teacherNav : (role === 'student' ? studentNav : [])

  return (
    <div className={cn("hidden md:flex h-full w-64 flex-col glass border-r", className)}>
      <div className="flex h-16 shrink-0 items-center px-6 border-b border-slate-200/50 dark:border-slate-800/50">
        <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl tracking-tight text-primary">
          <BookOpen className="h-6 w-6" />
          <span>EduTech LMS</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-4">
        <nav className="grid gap-1 px-4">
          {navItems.map((item, index) => {
            const Icon = item.icon
            const isActive = pathname.startsWith(item.href)
            return (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-50"
                )}
              >
                <Icon className={cn("h-4 w-4", isActive ? "text-primary-foreground" : "text-slate-500 dark:text-slate-400")} />
                {item.title}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-slate-200/50 dark:border-slate-800/50">
        <Link 
          href={`/${role || 'student'}/profile`}
          className="flex items-center gap-3 rounded-xl p-3 bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
        >
          {profile?.avatar_url ? (
            <img 
              src={profile.avatar_url} 
              alt="Avatar" 
              className="h-9 w-9 rounded-full object-cover group-hover:scale-110 transition-transform border border-slate-200 dark:border-slate-800" 
            />
          ) : (
            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold group-hover:scale-110 transition-transform">
              {profile?.full_name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="flex flex-col flex-1 overflow-hidden">
            <span className="text-sm font-medium truncate group-hover:text-primary transition-colors">{profile?.full_name || 'Loading...'}</span>
            <span className="text-xs text-slate-500 uppercase tracking-wider">{role || '...'}</span>
          </div>
        </Link>
      </div>
    </div>
  )
}
