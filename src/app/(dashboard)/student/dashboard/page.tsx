import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Terminal, TrendingUp, Award, Zap, Users, Flame, Rocket } from 'lucide-react'
import StudentActivityChart from '@/components/student/ActivityChart'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()
  if (profile?.role !== 'student') redirect('/teacher/dashboard')

  // Fetch actual metrics
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      class_id, 
      classes (
        name, 
        class_code, 
        teacher_id
      )
    `)
    .eq('student_id', user.id)
    .order('enrolled_at', { ascending: false })
  
  const activeClasses = enrollments?.length || 0

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-cyan-400/20 selection:text-cyan-400 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-4 opacity-10 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-cyan-500/20">S/C</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-4 border-cyan-400 pl-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white italic">SYSTEM_DASHBOARD</h1>
            <p className="font-mono text-cyan-400/60 text-[10px] md:text-sm mt-2 tracking-widest uppercase">Initializing learning environment... connection stable.</p>
          </div>
          <div className="flex items-center gap-4 bg-[#1c1b1b] p-4 border border-slate-800 shadow-[0_0_15px_rgba(34,211,238,0.15)]">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="Profile" className="w-12 h-12 grayscale brightness-125 object-cover" />
            ) : (
              <div className="w-12 h-12 bg-slate-800 flex items-center justify-center grayscale brightness-125 shadow-inner">
                 <Terminal className="text-cyan-400/50 w-6 h-6" />
              </div>
            )}
            <div className="flex flex-col">
              <span className="font-sans font-bold text-white uppercase tracking-widest text-sm">{profile?.full_name || 'USER_ANOMALY'}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="w-2 h-2 bg-lime-400 rounded-full shadow-[0_0_8px_#a3e635]"></span>
                <span className="font-mono text-[10px] text-lime-400 uppercase tracking-widest">STATUS: ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat 1 */}
          <div className="bg-[#1c1b1b] p-6 relative overflow-hidden border border-slate-800 group transition-colors duration-300 hover:bg-[#2a2a2a]">
            <div className="absolute top-0 right-0 p-2 text-cyan-400/10 font-mono text-4xl font-black transition-transform group-hover:scale-110">01</div>
            <div className="relative z-10">
              <div className="font-mono text-[10px] text-cyan-400 tracking-[0.2em] mb-1">COURSES_ACTIVE</div>
              <div className="font-sans text-4xl font-black text-white">{activeClasses < 10 && activeClasses > 0 ? `0${activeClasses}` : activeClasses}</div>
              <div className="mt-4 h-1 w-full bg-[#353534]">
                <div className="h-full bg-cyan-400 w-[65%] shadow-[0_0_10px_#22d3ee]"></div>
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-[#1c1b1b] p-6 relative overflow-hidden border border-slate-800 group transition-colors duration-300 hover:bg-[#2a2a2a]">
            <div className="absolute top-0 right-0 p-2 text-fuchsia-400/10 font-mono text-4xl font-black transition-transform group-hover:scale-110">02</div>
            <div className="relative z-10">
              <div className="font-mono text-[10px] text-fuchsia-400 tracking-[0.2em] mb-1">XP_GAINED</div>
              <div className="font-sans text-4xl font-black text-white">{profile?.xp || 0}</div>
              <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-fuchsia-300">
                <TrendingUp className="w-3 h-3 text-fuchsia-400" /> +15% FROM LAST CYCLE
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-[#1c1b1b] p-6 relative overflow-hidden border border-slate-800 group transition-colors duration-300 hover:bg-[#2a2a2a]">
            <div className="absolute top-0 right-0 p-2 text-lime-400/10 font-mono text-4xl font-black transition-transform group-hover:scale-110">03</div>
            <div className="relative z-10">
              <div className="font-mono text-[10px] text-lime-400 tracking-[0.2em] mb-1">CURRENT_LEVEL</div>
              <div className="font-sans text-4xl font-black text-white">LVL {profile?.level || 1}</div>
              <div className="mt-4 font-mono text-[10px] text-lime-400 uppercase tracking-widest">TOP 2% OF GLOBAL COHORT</div>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-[#1c1b1b] p-6 relative overflow-hidden border border-slate-800 group transition-colors duration-300 hover:bg-[#2a2a2a]">
            <div className="absolute top-0 right-0 p-2 text-white/5 font-mono text-4xl font-black transition-transform group-hover:scale-110">04</div>
            <div className="relative z-10">
              <div className="font-mono text-[10px] text-slate-400 tracking-[0.2em] mb-1">PROGRESS_PERCENTAGE</div>
              <div className="font-sans text-4xl font-black text-white">{profile?.xp ? Math.floor((profile.xp % 1000) / 10) : 0}%</div>
              <div className="mt-4 h-1 w-full bg-[#353534]">
                <div className="h-full bg-white transition-all shadow-[0_0_10px_#ffffff]" style={{ width: `${profile?.xp ? Math.floor((profile.xp % 1000) / 10) : 0}%` }}></div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* ACTIVITY CHART */}
          <div className="lg:col-span-2 bg-[#1c1b1b] p-6 border border-slate-800 relative overflow-hidden flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-sans font-black text-lg md:text-xl tracking-widest uppercase flex items-center gap-3 text-white">
                <span className="w-1 h-6 bg-cyan-400"></span>
                Learning_Velocity
              </h2>
              <div className="flex gap-4 font-mono text-[10px] text-slate-400 uppercase tracking-widest hidden sm:flex">
                <span>CYCLE_07</span>
                <span className="text-cyan-400 underline cursor-pointer hover:text-white transition-colors">DOWNLOAD_REPORT</span>
              </div>
            </div>
            
            <StudentActivityChart />
          </div>

          {/* RECENT COURSES */}
          <div className="bg-[#1c1b1b] p-6 border border-slate-800 flex flex-col relative h-[400px]">
             {/* Gradient glow edge */}
             <div className="absolute top-0 p-4 opacity-5 pointer-events-none right-0 font-mono text-9xl text-fuchsia-400 overflow-hidden leading-none z-0">A/S</div>
             
             <h2 className="font-sans font-black text-lg md:text-xl tracking-widest uppercase flex items-center gap-3 mb-6 relative z-10 text-white">
                <span className="w-1 h-6 bg-fuchsia-400"></span> Active_Sectors
             </h2>
             
             <div className="space-y-6 flex-1 overflow-y-auto pr-2 relative z-10">
                {enrollments && enrollments.length > 0 ? enrollments.map((enr, i) => {
                  const clsInfo = enr.classes as any
                  // deterministic random progress mapping arrays
                  const pgsArr = [78, 32, 95, 12, 54]
                  const progress = pgsArr[i % pgsArr.length]
                  const progressColor = progress > 80 ? 'bg-lime-400 shadow-[0_0_8px_#a3e635]' : progress < 20 ? 'bg-fuchsia-400 shadow-[0_0_8px_#e879f9]' : 'bg-cyan-400 shadow-[0_0_8px_#22d3ee]'
                  
                  return (
                  <Link href={`/student/classes/${enr.class_id}`} key={enr.class_id}>
                     <div className="group cursor-pointer mb-6 last:mb-2 block">
                       <div className="flex justify-between items-start mb-2">
                         <span className="font-sans font-bold text-sm text-white uppercase tracking-wider group-hover:text-cyan-400 transition-colors line-clamp-1 flex-1 pr-4">{clsInfo.name}</span>
                         <span className="font-mono text-[10px] text-slate-400 w-8 text-right">{progress}%</span>
                       </div>
                       <div className="h-1 w-full bg-[#353534]">
                         <div className={`h-full ${progressColor} transition-all duration-1000 w-0 group-hover:w-[${progress}%]`} style={{ width: `${progress}%` }}></div>
                       </div>
                     </div>
                  </Link>
                )}) : (
                  <div className="flex flex-col items-center justify-center h-full opacity-50 text-center">
                    <Terminal className="w-8 h-8 text-cyan-400 mb-4" />
                    <span className="font-mono text-[10px] tracking-widest text-slate-400 uppercase">NO_ACTIVE_SECTORS.<br/>AWAITING_ENROLLMENT.</span>
                  </div>
                )}
             </div>

             <Link href="/student/classes" className="w-full mt-auto relative z-10 pt-4">
               <Button className="w-full bg-[#2a2a2a] border border-slate-800 font-sans font-black text-xs uppercase tracking-[0.2em] text-slate-200 hover:bg-cyan-400 hover:text-[#004f4f] transition-all duration-300 rounded-none h-12">
                 ACCESS_ALL_MODULES
               </Button>
             </Link>
          </div>
        </div>

        {/* LOWER SECTION: Terminal Output & Quick Tasks */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Terminal Component */}
          <div className="bg-[#0e0e0e] border-l-4 border-cyan-400 p-6 font-mono text-xs overflow-hidden relative shadow-[inset_0_-40px_40px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Terminal className="w-32 h-32" />
            </div>
            <div className="flex items-center gap-2 mb-6 text-cyan-400">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_8px_#22d3ee]"></span>
              <span className="uppercase tracking-widest font-bold">SYSTEM_LOGS // SESSION_492</span>
            </div>
            <div className="space-y-3 text-slate-300/80 uppercase tracking-widest leading-relaxed">
              <p><span className="text-lime-400">[SUCCESS]</span> AUTH_TOKEN validated for #{user.id.slice(0, 8)}</p>
              <p><span className="text-cyan-400">[INFO]</span> Loading framework matrices...</p>
              <p><span className="text-cyan-400">[INFO]</span> Synchronizing progress with GLOBAL_CORE...</p>
              <p><span className="text-fuchsia-400 font-bold">[ALERT]</span> Quiz_Deadline rapidly approaching.</p>
              <p className="pt-2"><span className="text-white">&gt; </span> <span className="animate-pulse bg-cyan-400 text-cyan-400">_</span></p>
            </div>
          </div>

          {/* Announcements/Achievements */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1c1b1b] p-4 border border-slate-800 hover:border-cyan-400/40 transition-colors flex flex-col justify-center items-center text-center group cursor-default">
              <Award className="text-cyan-400 mb-3 w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              <div className="font-sans font-black text-[10px] uppercase text-white tracking-widest">MASTER_CODER_v1</div>
              <div className="font-mono text-[8px] text-slate-400 uppercase mt-2 tracking-widest">Earned 2h ago</div>
            </div>
            <div className="bg-[#1c1b1b] p-4 border border-slate-800 hover:border-fuchsia-400/40 transition-colors flex flex-col justify-center items-center text-center group cursor-default">
              <Flame className="text-fuchsia-400 mb-3 w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              <div className="font-sans font-black text-[10px] uppercase text-white tracking-widest">7_DAY_STREAK</div>
              <div className="font-mono text-[8px] text-slate-400 uppercase mt-2 tracking-widest">Keep it up</div>
            </div>
            <div className="bg-[#1c1b1b] p-4 border border-slate-800 hover:border-lime-400/40 transition-colors flex flex-col justify-center items-center text-center group cursor-default">
              <Rocket className="text-lime-400 mb-3 w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              <div className="font-sans font-black text-[10px] uppercase text-white tracking-widest">FAST_TRACKER</div>
              <div className="font-mono text-[8px] text-slate-400 uppercase mt-2 tracking-widest">Top 10% speed</div>
            </div>
            <div className="bg-[#1c1b1b] p-4 border border-slate-800 hover:border-slate-200/40 transition-colors flex flex-col justify-center items-center text-center group cursor-default">
              <Users className="text-slate-200 mb-3 w-8 h-8 group-hover:scale-110 transition-transform duration-300" />
              <div className="font-sans font-black text-[10px] uppercase text-white tracking-widest">MENTOR_READY</div>
              <div className="font-mono text-[8px] text-slate-400 uppercase mt-2 tracking-widest">Unlocked rank</div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
