"use client"
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Users, BookOpen, BrainCircuit, Calendar, LineChart, TrendingUp, Trophy } from 'lucide-react'

export default function ClassTabs({ classId }: { classId: string }) {
  const pathname = usePathname()
  
  const tabs = [
    { name: 'Students', href: `/teacher/classes/${classId}/students`, icon: Users },
    { name: 'Lessons', href: `/teacher/classes/${classId}/lessons`, icon: BookOpen },
    { name: 'Quizzes', href: `/teacher/classes/${classId}/quizzes`, icon: BrainCircuit },
    { name: 'Attendance', href: `/teacher/classes/${classId}/attendance`, icon: Calendar },
    { name: 'Grades', href: `/teacher/classes/${classId}/grades`, icon: LineChart },
    { name: 'Reports', href: `/teacher/classes/${classId}/reports`, icon: TrendingUp },
    { name: 'Leaderboard', href: `/teacher/classes/${classId}/leaderboard`, icon: Trophy },
  ]

  return (
    <div className="flex overflow-x-auto border-b border-slate-200 dark:border-slate-800 mb-8 relative z-10 hide-scrollbar bg-white dark:bg-[#131313] shadow-sm">
      {tabs.map((tab) => {
        // Precise matching prevents /students triggering on /students/... nested paths if not desired, but .includes is okay for now
        const isActive = pathname.endsWith(tab.href) || pathname.includes(`${tab.href}/`)

        return (
          <Link key={tab.name} href={tab.href}>
            <div className={`px-8 py-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-widest transition-all whitespace-nowrap cursor-pointer border-b-2 ${isActive ? 'text-emerald-500 border-emerald-500 bg-slate-50 dark:bg-[#1c1b1b]' : 'text-slate-500 dark:text-slate-500 hover:text-slate-900 dark:hover:text-white border-transparent hover:border-slate-300 dark:hover:border-slate-700'}`}>
              <tab.icon className={`w-4 h-4 ${isActive ? 'animate-pulse' : ''}`} />
              {tab.name}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
