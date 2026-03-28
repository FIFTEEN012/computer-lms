import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, MoreVertical, Copy, Settings, Trash2, Calendar, Hash, ArrowRight, Layers, Activity } from 'lucide-react'
import { Button } from '@/components/ui/button'
import CreateClassModal from '@/components/teacher/CreateClassModal'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const dynamic = 'force-dynamic'

export default async function ClassesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: classes } = await supabase
    .from('classes')
    .select('*, class_enrollments(count)')
    .eq('teacher_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="p-4 md:p-6 h-full flex flex-col relative font-body text-text-main selection:bg-accent-primary/20 selection:text-accent-primary overflow-hidden italic scanlines bg-bg-primary">
      <div className="absolute inset-0 bg-accent-primary/2 opacity-[0.03] pointer-events-none z-0"></div>
      
      {/* Background Decor */}
      <div className="fixed top-20 right-10 p-4 opacity-[0.02] pointer-events-none z-0 transition-all duration-1000">
        <div className="font-heading text-[54px] leading-none select-none font-black text-accent-primary/10 italic tracking-tighter uppercase">ARCHIVE_0XFF</div>
      </div>

      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between relative z-10 gap-6 max-w-7xl mx-auto font-heading border-l-4 border-accent-primary pl-6 py-3 workstation-panel !bg-transparent !border-r-0 !border-y-0 relative group">
        <div className="absolute inset-0 bg-accent-primary/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
        <div>
          <h1 className="text-2xl md:text-3xl font-black tracking-[0.2em] text-foreground uppercase italic glitch-text neon-glaze leading-tight" data-text="จัดการคลาสเรียน">
            จัดการคลาสเรียน // NODE_MANAGER
          </h1>
          <p className="text-[10px] text-accent-primary font-black uppercase tracking-[0.4em] mt-3 flex items-center italic border-l-2 border-accent-primary/20 pl-6 not-italic">
             <span className="w-2 h-2 bg-accent-primary mr-3 animate-ping rounded-full shadow-glow-cyan"></span>
             DETECTED_{classes?.length || 0}_ACTIVE_CLUSTERS // SECTOR_STABLE
          </p>
        </div>
        <div className="flex items-center gap-4 relative z-10">
          <CreateClassModal />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10 max-w-7xl mx-auto flex-1 overflow-y-auto custom-scrollbar pr-2 pb-6">
        {classes?.map((cls, i) => (
          <div key={cls.id} className="workstation-panel bg-bg-secondary/40 border border-accent-primary/10 hover:border-accent-primary/40 relative group transition-all duration-700 flex flex-col overflow-hidden shadow-2xl backdrop-blur-3xl hover:scale-[1.01] cursor-default h-fit">
            <div className="absolute top-0 right-0 p-4 opacity-[0.05] font-heading text-4xl italic font-black group-hover:opacity-10 transition-opacity text-foreground">SECTOR_0{i+1}</div>
            <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

            <div className="p-6 flex-1 relative z-10">
              <div className="flex justify-between items-start mb-6">
                <div className="flex-1 pr-4 overflow-hidden">
                  <h3 className="font-body font-black text-xl text-foreground uppercase tracking-[0.1em] group-hover:text-accent-primary transition-all truncate italic leading-tight shadow-glow-cyan" data-text={cls.name?.toUpperCase()}>{cls.name || 'UNTITLED_NODE'}</h3>
                  <div className="mt-4 flex items-center gap-3">
                     <div className="h-1 w-12 bg-accent-primary/30 group-hover:w-full transition-all duration-1000 shadow-glow-cyan"></div>
                  </div>
                  <p className="font-body text-[10px] text-text-muted uppercase tracking-widest mt-4 line-clamp-2 italic leading-relaxed h-[30px]">{cls.description || 'STATUS: NO_ADDITIONAL_INTEL_PROVIDED_BY_COMMAND // ยังไม่ได้ระบุรายละเอียด'}</p>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-10 w-10 text-text-muted hover:text-accent-primary hover:bg-accent-primary/10 border border-accent-primary/10 hover:border-accent-primary/40 transition-all clip-path-diag !rounded-none">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-bg-primary/95 border-accent-primary/20 rounded-none font-heading text-[9px] uppercase tracking-[0.2em] shadow-2xl backdrop-blur-xl text-text-muted p-2">
                    <DropdownMenuItem className="focus:bg-accent-primary focus:text-bg-primary cursor-pointer transition-all border-l-2 border-transparent focus:border-white py-2 px-4 font-black italic">
                      <Settings className="w-3 h-3 mr-3" /> SETTINGS_NODE
                    </DropdownMenuItem>
                    <DropdownMenuItem className="text-red-500 focus:bg-red-600 focus:text-white cursor-pointer transition-all border-l-2 border-transparent focus:border-white mt-1 py-2 px-4 font-black italic">
                      <Trash2 className="w-3 h-3 mr-3" /> TERMINATE_NODE
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-3 mt-6 font-heading">
                <div className="flex items-center text-text-muted text-[10px] uppercase tracking-widest font-black italic group-hover:text-foreground transition-colors">
                  <div className="p-1.5 workstation-panel border-accent-primary/10 bg-bg-primary/50 mr-3">
                     <Hash className="w-3 h-3 text-accent-primary group-hover:animate-pulse" />
                  </div>
                  CODE: <span className="ml-2 text-accent-primary italic digital-display shadow-glow-cyan">{cls.class_code}</span>
                </div>
                <div className="flex items-center text-text-muted text-[10px] uppercase tracking-widest font-black italic group-hover:text-foreground transition-colors">
                  <div className="p-1.5 workstation-panel border-accent-primary/10 bg-bg-primary/50 mr-3">
                     <Calendar className="w-3 h-3 text-text-muted" />
                  </div>
                  TIMELINE: <span className="ml-2 text-foreground italic digital-display">{cls.academic_year} // SEM_0{cls.semester}</span>
                </div>
                <div className="flex items-center text-text-muted text-[10px] uppercase tracking-widest font-black italic group-hover:text-foreground transition-colors">
                  <div className="p-1.5 workstation-panel border-accent-primary/10 bg-bg-primary/50 mr-3">
                     <Users className="w-3 h-3 text-text-muted" />
                  </div>
                  CAPACITY: <span className="ml-2 text-foreground italic digital-display">{cls.class_enrollments[0]?.count || 0}_UNITS</span>
                </div>
              </div>
            </div>

            <div className="border-t border-accent-primary/10 p-5 bg-bg-primary/20 flex gap-4 relative z-10 font-heading">
              <Link href={`/teacher/classes/${cls.id}`} className="flex-1">
                <Button className="w-full h-12 bg-accent-primary/10 hover:bg-accent-primary text-foreground hover:text-bg-primary border border-accent-primary/20 hover:border-accent-primary font-black text-[10px] uppercase tracking-[0.4em] transition-all duration-700 italic group/btn relative overflow-hidden !rounded-none shadow-inner">
                  <div className="absolute inset-0 bg-accent-primary/20 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-700"></div>
                  <span className="relative z-10 flex items-center justify-center gap-3">
                     ACCESS_CORE <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-2 transition-transform duration-500" />
                  </span>
                </Button>
              </Link>
              <Button variant="outline" size="icon" className="group h-12 w-12 workstation-panel border-accent-primary/20 bg-bg-primary/50 hover:bg-accent-secondary hover:text-white transition-all hover:border-transparent !rounded-none" title="คัดลอกรหัสคลาส">
                <Copy className="w-4 h-4 text-text-muted group-hover:text-white transition-colors" />
              </Button>
            </div>
            
            <div className="absolute bottom-0 left-0 h-0.5 bg-accent-primary/40 w-0 group-hover:w-full transition-all duration-1000"></div>
          </div>
        ))}

        {(!classes || classes.length === 0) && (
          <div className="col-span-full h-64 flex flex-col items-center justify-center workstation-panel bg-bg-secondary/40 border-dashed border-accent-primary/10 p-12 text-center opacity-40 italic">
            <Layers className="w-16 h-16 mb-4 animate-pulse text-accent-primary/20" />
            <p className="font-heading text-[11px] text-text-muted font-black uppercase tracking-[0.4em] leading-relaxed italic">
              // NO_ACTIVE_NODES_ALLOCATED<br/>
              กรุณาเริ่มต้นการจัดเตรียมหน่วยข้อมูลใหม่ผ่านโมดูลด้านบน
            </p>
          </div>
        )}
      </div>

      <div className="mt-4 p-3 workstation-panel bg-bg-secondary border-accent-primary/10 flex items-center justify-between font-mono text-[9px] text-text-muted shrink-0">
           <div className="flex items-center gap-4">
              <Activity className="w-3 h-3 text-accent-primary animate-pulse" />
              <span className="uppercase tracking-[0.3em] font-black italic">NODE_STATUS: ONLINE</span>
           </div>
           <div className="opacity-30 uppercase tracking-[0.2em] font-black italic">
              SECTOR: COMMAND_CORE
           </div>
        </div>
    </div>
  )
}
