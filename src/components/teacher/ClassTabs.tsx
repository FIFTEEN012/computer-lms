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
    <div className="flex overflow-x-auto border-b border-white/5 mb-8 relative z-10 hide-scrollbar bg-black/40 backdrop-blur-xl shadow-2xl">
      {tabs.map((tab) => {
        const isActive = pathname.endsWith(tab.href) || pathname.includes(`${tab.href}/`)

        return (
          <Link key={tab.name} href={tab.href}>
            <div className={`px-8 py-5 flex items-center gap-4 font-heading text-[10px] font-black uppercase tracking-[0.3em] transition-all whitespace-nowrap cursor-pointer border-b-2 italic ${isActive ? 'text-emerald-500 border-emerald-500 bg-white/[0.05] shadow-[inset_0_-10px_20px_rgba(16,185,129,0.05)]' : 'text-slate-600 border-transparent hover:text-white hover:border-white/20 hover:bg-white/[0.02]'}`}>
              <tab.icon className={`w-4 h-4 transition-all duration-500 ${isActive ? 'text-emerald-400 shadow-glow-emerald animate-pulse rotate-3' : 'text-slate-700'}`} />
              {tab.name}
              {isActive && (
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping absolute top-4 right-4"></span>
              )}
            </div>
          </Link>
        )
      })}
    </div>
  )
}
