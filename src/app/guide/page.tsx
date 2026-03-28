import { BookOpen, Shield, Users, CheckSquare, Zap, Terminal } from 'lucide-react'
import Link from 'next/link'

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-[#0e0e0e] text-slate-200 p-8 md:p-16 font-body selection:bg-cyan-500/30">
      <div className="max-w-4xl mx-auto space-y-16">
        
        {/* Header */}
        <div className="space-y-4 border-l-4 border-cyan-500 pl-8 py-2">
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic text-white">
            TEACHER_QUICKSTART
          </h1>
          <p className="font-mono text-xs tracking-[0.3em] text-cyan-500 uppercase">
            Protocol v1.0.4 // Production_Deployment_Guide
          </p>
        </div>

        {/* Introduction */}
        <div className="bg-[#1c1b1b] border border-slate-800 p-8 relative overflow-hidden group">
           <div className="absolute top-0 right-0 p-8 opacity-5 text-cyan-400">
             <Terminal className="w-32 h-32" />
           </div>
           <p className="font-sans text-lg leading-relaxed text-slate-300 relative z-10">
             Welcome to the **Computer Science LMS**. This interface is optimized for high-efficiency management of learning clusters. Follow the directives below to initialize your classroom environment.
           </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
           <GuideStep 
             icon={<Users className="w-6 h-6 text-cyan-400" />}
             title="01_INITIALIZE_CLASS"
             description="Navigate to the 'Classes' sector. Generate a new Class Node and share the invitation hash with your students."
           />
           <GuideStep 
             icon={<BookOpen className="w-6 h-6 text-fuchsia-400" />}
             title="02_DEPLOY_CONTENT"
             description="Use the Lesson Editor to forge new knowledge modules. Rich-text support and auto-save are enabled by default."
           />
           <GuideStep 
             icon={<CheckSquare className="w-6 h-6 text-lime-400" />}
             title="03_EVALUATE_NODES"
             description="Build interactive Quizzes to verify student comprehension. Results are strictly logged for performance auditing."
           />
           <GuideStep 
             icon={<Shield className="w-6 h-6 text-orange-400" />}
             title="04_AUDIT_PROGRESS"
             description="Access the Grades and Reports protocols to monitor collective and individual node growth metrics."
           />
        </div>

        {/* Call to Action */}
        <div className="pt-12 border-t border-slate-800 flex flex-col items-center gap-6">
           <p className="font-mono text-[10px] uppercase text-slate-500 tracking-widest text-center">
             System operational. Ready for deployment.
           </p>
           <Link href="/teacher/dashboard">
             <button className="bg-cyan-500 text-black px-12 py-4 font-black uppercase tracking-widest text-sm hover:bg-cyan-400 transition-all shadow-[0_0_30px_rgba(34,211,238,0.2)] active:scale-95">
                ENTER_DASHBOARD
             </button>
           </Link>
        </div>

      </div>
    </div>
  )
}

function GuideStep({ icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <div className="bg-[#131212] border border-slate-800/50 p-6 space-y-4 hover:border-slate-700 transition-colors group">
      <div className="bg-slate-900 w-12 h-12 flex items-center justify-center border border-slate-800 group-hover:bg-slate-800 transition-colors">
        {icon}
      </div>
      <h3 className="font-mono text-xs font-black tracking-widest uppercase text-white">{title}</h3>
      <p className="text-sm text-slate-400 leading-relaxed font-sans">{description}</p>
    </div>
  )
}
