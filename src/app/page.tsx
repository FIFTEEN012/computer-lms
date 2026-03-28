import Link from 'next/link'
import { BookOpen, ArrowRight, GraduationCap, Users, LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-main flex flex-col font-body italic scanlines relative overflow-hidden">
      <div className="absolute inset-0 bg-accent-primary/2 opacity-[0.03] pointer-events-none z-0"></div>
      
      {/* Header */}
      <header className="flex items-center justify-between px-6 md:px-12 h-24 border-b-2 border-accent-primary/20 bg-bg-secondary/40 backdrop-blur-2xl fixed top-0 w-full z-50 workstation-panel !bg-transparent !border-x-0 !border-t-0 rounded-none shadow-2xl">
        <div className="flex items-center gap-4 group cursor-pointer">
          <div className="w-12 h-12 bg-accent-primary flex items-center justify-center shadow-glow-cyan clip-path-diag transition-transform group-hover:scale-110">
            <BookOpen className="text-bg-primary w-7 h-7" />
          </div>
          <div className="flex flex-col">
             <span className="font-heading font-black text-2xl tracking-[0.2em] text-accent-primary uppercase neon-glaze italic glitch-text" data-text="CS_LMS_PRO_v2.5">CS_LMS_PRO_v2.5</span>
             <span className="text-[9px] font-heading font-bold text-text-muted tracking-[0.4em] uppercase -mt-1 hidden md:block">NEURAL_LEARNING_NETWORK // SECURED</span>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <Link href="/register" className="hidden lg:block text-[11px] font-heading font-black text-text-muted hover:text-accent-primary transition-all tracking-[0.3em] uppercase italic relative group">
            ลงทะเบียน_ENROLL
            <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-accent-primary group-hover:w-full transition-all duration-500 shadow-glow-cyan"></span>
          </Link>
          <Link href="/login">
            <Button variant="default" className="font-heading font-black rounded-none px-10 shadow-glow-cyan transition-all hover:scale-[1.05] active:scale-95 uppercase tracking-[0.4em] h-14 italic bg-accent-primary text-bg-primary hover:bg-accent-primary/90 border-none shadow-inner">
               INITIALIZE_SESSION // เข้าสู่ระบบ
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 pt-48 pb-32 text-center relative">
        {/* Ambient Gradients - High intensity for Cyberpunk vibe */}
        <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-accent-primary/10 rounded-full blur-[140px] -z-10 animate-pulse pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent-secondary/10 rounded-full blur-[140px] -z-10 animate-pulse delay-1000 pointer-events-none"></div>

        <div className="inline-flex items-center gap-4 px-6 py-2.5 workstation-panel bg-accent-primary/10 text-accent-primary text-[10px] md:text-[11px] font-heading font-black tracking-[0.5em] uppercase mb-16 border-2 border-accent-primary/30 shadow-inner group cursor-default shadow-glow-cyan/20">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-accent-primary shadow-glow-cyan"></span>
          </span>
          ระบบออนไลน์_V2.5.0 // DEPLOY_STATUS: STABLE_ACTIVE
        </div>
        
        <h1 className="text-5xl md:text-9xl font-heading font-black tracking-tighter mb-12 max-w-7xl uppercase italic glitch-text leading-none drop-shadow-2xl">
          นวัตกรรมการเรียนรู้ <br className="hidden md:block"/>
          <span className="neon-glaze text-shadow-neon-cyan italic scale-110 inline-block py-4">วิทยาการคำนวณ</span> <br className="hidden md:block"/> <span className="text-foreground">แห่งโลกอนาคต</span>
        </h1>
        
        <p className="text-[12px] md:text-base text-text-muted max-w-3xl mb-16 leading-relaxed font-body uppercase tracking-[0.4em] border-l-4 border-accent-primary/40 pl-10 not-italic italic mx-auto font-medium transition-all group hover:border-accent-primary">
          แพลตฟอร์มการจัดการเรียนการสอนสถาปัตยกรรมระดับสูง <span className="text-accent-primary font-bold shadow-glow-cyan">INTELLIGENT_LMS</span> <br className="hidden md:block"/> ออกแบบมาเพื่อประสิทธิภาพ ความปลอดภัย และประสบการณ์การใช้งานที่ไร้ขีดจำกัดสูงสุด
        </p>
        
        <div className="flex flex-col sm:flex-row gap-10 w-full sm:w-auto relative z-10 scale-110">
          <Link href="/register" className="w-full sm:w-auto">
            <Button size="lg" className="h-20 w-full md:w-auto rounded-none px-14 text-[13px] font-heading font-black shadow-glow-cyan hover:scale-[1.05] transition-all uppercase tracking-[0.5em] italic bg-accent-primary text-bg-primary hover:bg-accent-primary/90 relative overflow-hidden group shadow-inner">
               <div className="absolute inset-0 bg-white/10 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700"></div>
               <span className="relative z-10 flex items-center justify-center gap-6">
                 CONNECT_NODE <ArrowRight className="w-6 h-6 group-hover:translate-x-4 transition-transform duration-500" />
               </span>
            </Button>
          </Link>
          <Link href="/login" className="w-full sm:w-auto">
            <Button size="lg" variant="outline" className="h-20 w-full md:w-auto rounded-none px-14 text-[13px] font-heading font-black hover:scale-[1.05] transition-all bg-bg-secondary/40 backdrop-blur-2xl border-2 border-accent-primary/30 uppercase tracking-[0.5em] text-foreground hover:bg-accent-primary hover:text-bg-primary hover:border-accent-primary italic shadow-inner relative overflow-hidden group">
               <div className="absolute inset-0 bg-accent-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700"></div>
               <span className="relative z-10">OPERATIONAL_AREA // เข้าสู่ระบบ</span>
            </Button>
          </Link>
        </div>

        {/* Feature Grid */}
        <div className="mt-60 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full max-w-7xl text-left font-body relative z-10">
          {[
            { icon: LayoutDashboard, title: "การควบคุมแบบรวมศูนย์", desc: "ติดตามประสิทธิภาพ งานที่มอบหมาย และหลักสูตรทั้งหมดจากแดชบอร์ดเดียว [CORE_ACCESS]" },
            { icon: GraduationCap, title: "การเรียนรู้แบบโต้ตอบ", desc: "สัมผัสประสบการณ์การเรียนรู้ด้วยระบบตรวจคะแนนและแสดงผลแบบเรียลไทม์ [NEURAL_SYNK]" },
            { icon: Users, title: "สถาปัตยกรรมตามบทบาท", desc: "อินเทอร์เฟซที่ปรับแต่งมาโดยเฉพาะสำหรับทั้งอาจารย์และนักเรียนโดยเฉพาะ [USER_PROFILE]" }
          ].map((feature, i) => (
            <div key={i} className="workstation-panel bg-bg-secondary/40 p-12 hover:border-accent-primary transition-all duration-700 group relative overflow-hidden shadow-2xl backdrop-blur-3xl italic cursor-default hover:scale-[1.03]">
              <div className="absolute top-0 right-0 p-8 opacity-10 font-heading text-[120px] font-black italic group-hover:opacity-20 transition-all duration-700 text-foreground/5 scale-y-125 select-none pointer-events-none">0{i+1}</div>
              
              <div className="w-16 h-16 bg-bg-primary/50 text-accent-primary flex items-center justify-center mb-10 border-2 border-accent-primary/20 group-hover:border-accent-primary group-hover:bg-accent-primary group-hover:text-bg-primary transition-all shadow-inner shadow-glow-cyan/10 group-hover:shadow-glow-cyan clip-path-diag">
                <feature.icon className="w-8 h-8 group-hover:scale-90 transition-transform" />
              </div>
              
              <h3 className="text-2xl font-heading font-black mb-6 text-foreground tracking-[0.1em] uppercase italic border-l-4 border-accent-primary/40 group-hover:border-accent-primary transition-all pl-6" data-text={feature.title.toUpperCase()}>{feature.title}</h3>
              <p className="text-text-muted text-[13px] leading-[1.8] uppercase tracking-[0.05em] italic font-medium lg:pr-10 group-hover:text-foreground transition-colors">{feature.desc}</p>
              
              <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-accent-primary/30 to-transparent group-hover:via-accent-primary transition-all duration-1000 shadow-glow-cyan"></div>
              
              <div className="absolute top-0 left-0 w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity">
                 <div className="absolute top-0 left-0 w-2 h-[2px] bg-accent-primary"></div>
                 <div className="absolute top-0 left-0 h-2 w-[2px] bg-accent-primary"></div>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
