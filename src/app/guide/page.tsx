import { BookOpen, Shield, Users, CheckSquare, Zap, Terminal } from 'lucide-react'
import Link from 'next/link'

export default function GuidePage() {
  return (
    <div className="min-h-screen bg-bg-primary text-text-main p-8 md:p-20 font-body selection:bg-accent-primary/30 relative overflow-hidden italic scanlines">
      <div className="absolute inset-0 bg-accent-primary/2 opacity-[0.03] pointer-events-none z-0"></div>
      
      {/* Background Decor */}
      <div className="fixed top-20 right-10 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-heading text-[180px] leading-none select-none font-black text-accent-primary/10 italic tracking-tighter uppercase">PROTOCOL_V1</div>
      </div>

      <div className="max-w-5xl mx-auto space-y-20 relative z-10">
        
        {/* Header */}
        <div className="space-y-6 border-l-8 border-accent-primary pl-12 py-4 workstation-panel !bg-transparent !border-r-0 !border-y-0">
          <h1 className="text-5xl md:text-8xl font-heading font-black uppercase tracking-[0.1em] text-foreground leading-tight glitch-text neon-glaze" data-text="TEACHER_QUICKSTART">
            TEACHER_QUICKSTART // <br/><span className="text-2xl md:text-4xl opacity-60">คู่มือเริ่มต้นการใช้งานส่วนกลาง</span>
          </h1>
          <p className="font-heading text-xs md:text-sm tracking-[0.5em] text-accent-primary uppercase font-black not-italic border-t border-accent-primary/10 pt-6 flex items-center">
            <Zap className="w-5 h-5 mr-4 animate-pulse" /> PRODUCTION_DEPLOYMENT_GUIDE_V1.0.4 // สถาปัตยกรรมระดับองค์กร
          </p>
        </div>

        {/* Introduction */}
        <div className="workstation-panel bg-bg-secondary/40 border-accent-primary/10 p-12 md:p-16 relative overflow-hidden group hover:border-accent-primary transition-all duration-700 shadow-2xl">
           <div className="absolute top-0 right-0 p-10 opacity-5 text-accent-primary group-hover:scale-110 transition-transform">
             <Terminal className="w-48 h-48" />
           </div>
           <p className="font-body text-xl md:text-2xl leading-relaxed text-text-main relative z-10 font-medium italic">
             ยินดีต้อนรับสู่ <span className="text-foreground font-black underline decoration-accent-primary/30 underline-offset-8">CS_LMS_NETWORK</span>. อินเทอร์เฟซนี้ได้รับการปรับแต่งมาเพื่อประสิทธิภาพสูงสุดในการจัดการคลัสเตอร์การเรียนรู้แบบดิจิทัล โปรดทำตามคำสั่งด้านล่างเพื่อเริ่มการเชื่อมต่อและสร้างสภาวะแวดล้อมการเรียนรู้ของคุณ
           </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
           <GuideStep 
             icon={<Users className="w-8 h-8 text-accent-primary" />}
             title="01_INITIALIZE_CLASS // สร้างโหนด"
             description="ไปที่ส่วน 'Classes' เพื่อสร้างโหนดห้องเรียนใหม่ ระบบจะเจเนอเรต Hash ส่วนตัวสำหรับเชิญนักเรียนเข้าสู่เครือข่ายความรู้"
             accent="cyan"
           />
           <GuideStep 
             icon={<BookOpen className="w-8 h-8 text-accent-secondary" />}
             title="02_DEPLOY_CONTENT // บทเรียน"
             description="ใช้โมดูล Lesson Editor เพื่อสร้างคลังความรู้ รองรับ Rich-text และระบบจัดเก็บข้อมูลอัตโนมัติบนเซิร์ฟเวอร์กลาง"
             accent="pink"
           />
           <GuideStep 
             icon={<CheckSquare className="w-8 h-8 text-emerald-500" />}
             title="03_EVALUATE_NODES // ประเมิน"
             description="สร้าง Quizzes เพื่อตรวจสอบความสมบูรณ์ของข้อมูลในตัวนักเรียน ข้อมูลจะถูกเข้ารหัสและจัดเก็บเพื่อการตรวจสอบย้อนหลัง"
             accent="emerald"
           />
           <GuideStep 
             icon={<Shield className="w-8 h-8 text-orange-500" />}
             title="04_AUDIT_PROGRESS // รายงาน"
             description="เข้าถึง Grades และ Reports เพื่อติดตามการเติบโตของนักเรียนแบบเรียลไทม์ พร้อมกราฟวิเคราะห์ข้อมูลเชิงลึก"
             accent="orange"
           />
        </div>

        {/* Call to Action */}
        <div className="pt-20 border-t-2 border-accent-primary/10 flex flex-col items-center gap-10">
           <div className="flex items-center gap-6">
             <span className="w-20 h-0.5 bg-accent-primary/20"></span>
             <p className="font-heading text-[11px] md:text-xs uppercase text-text-muted tracking-[0.6em] text-center font-black italic">
               ALL_SYSTEMS_OPERATIONAL // SECURE_UPLINK_READY
             </p>
             <span className="w-20 h-0.5 bg-accent-primary/20"></span>
           </div>
           <Link href="/teacher/dashboard">
             <button className="bg-accent-primary text-bg-primary px-16 py-6 font-heading font-black uppercase tracking-[0.6em] text-xs md:text-sm hover:scale-[1.05] transition-all shadow-glow-cyan active:scale-95 border-none italic relative overflow-hidden group">
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500"></div>
                <span className="relative z-10 flex items-center gap-4">ENTER_COMMAND_NEXUS // คุมแดชบอร์ด <Terminal className="w-5 h-5" /></span>
             </button>
           </Link>
        </div>

      </div>
    </div>
  )
}

function GuideStep({ icon, title, description, accent }: { icon: any, title: string, description: string, accent: string }) {
  const accentClass = accent === 'pink' ? 'border-accent-secondary shadow-glow-pink' : accent === 'emerald' ? 'border-emerald-500 shadow-glow-emerald' : accent === 'orange' ? 'border-orange-500 shadow-[0_0_15px_#f97316]' : 'border-accent-primary shadow-glow-cyan';
  
  return (
    <div className={`workstation-panel bg-bg-secondary/40 p-10 space-y-8 hover:border-text-main/20 transition-all duration-700 group shadow-xl relative overflow-hidden border-2 border-transparent hover:scale-[1.02]`}>
      <div className={`w-16 h-16 flex items-center justify-center workstation-panel !bg-bg-primary/60 border-2 ${accentClass.split(' ')[0]} transition-all duration-500 group-hover:scale-110`}>
        {icon}
      </div>
      <div className="space-y-4">
        <h3 className="font-heading text-lg md:text-xl font-black tracking-[0.1em] uppercase text-foreground italic group-hover:text-accent-primary transition-colors">{title}</h3>
        <p className="text-sm md:text-base text-text-muted leading-relaxed font-body font-medium italic group-hover:text-text-main transition-colors">{description}</p>
      </div>
      <div className={`absolute bottom-0 right-0 w-12 h-12 opacity-5 border-b-4 border-r-4 ${accentClass.split(' ')[0]}`}></div>
    </div>
  )
}
