import Link from 'next/link'
import { BookOpen, ArrowRight, GraduationCap, Users, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 h-20 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#0a0a0a]/50 backdrop-blur-xl fixed top-0 w-full z-50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
            <BookOpen className="text-white w-6 h-6" />
          </div>
          <span className="font-bold text-xl tracking-tight text-primary">EduTech LMS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/register" className="hidden sm:block text-sm font-semibold text-slate-500 hover:text-primary transition-colors">
            Register Node
          </Link>
          <Link href="/login">
            <Button variant="default" className="font-semibold rounded-full px-6 shadow-lg shadow-primary/20 transition-transform hover:scale-105 active:scale-95">
              Access Portal
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center relative overflow-hidden">
        {/* Ambient Gradients */}
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] -z-10 animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[120px] -z-10 animate-pulse delay-1000"></div>

        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold tracking-widest uppercase mb-8 border border-primary/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          System Online v2.4.0
        </div>
        
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-6 max-w-4xl text-transparent bg-clip-text bg-gradient-to-br from-slate-900 to-slate-500 dark:from-white dark:to-slate-400">
          The Next Generation of <br/>
          <span className="text-primary drop-shadow-sm">Computer Science</span> Education.
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 dark:text-slate-400 max-w-2xl mb-12 leading-relaxed">
          A high-performance learning management system built for speed, security, and exceptional user experiences. 
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="w-full rounded-full px-8 h-14 text-base font-bold shadow-xl shadow-primary/30 hover:scale-105 transition-all">
              Initialize New Node <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="w-full rounded-full px-8 h-14 text-base font-bold hover:scale-105 transition-all bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border-slate-200 dark:border-slate-800">
              Access the Grid
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl text-left">
          {[
            { icon: LayoutDashboard, title: "Centralized Control", desc: "Track performance, assignments, and curriculum from a single unified glassmorphic dashboard." },
            { icon: GraduationCap, title: "Interactive Learning", desc: "Engage with perfectly formatted syntax blocks and integrated real-time grading systems." },
            { icon: Users, title: "Role-Based Architecture", desc: "Custom-tailored interfaces automatically rendered whether you're an instructor or student." }
          ].map((feature, i) => (
            <div key={i} className="p-8 rounded-3xl bg-white/60 dark:bg-slate-900/60 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-none hover:-translate-y-2 transition-transform duration-500">
              <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900 dark:text-white tracking-tight">{feature.title}</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
