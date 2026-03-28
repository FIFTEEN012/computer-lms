import { cn } from '@/lib/utils'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Terminal, Award, Zap, Flame, Rocket, ShieldAlert } from 'lucide-react'
import StudentActivityChart from '@/components/student/ActivityChart'
import DailyGoalWidget from '@/components/gamification/DailyGoalWidget'
import { getStreakData } from '@/lib/streak'

export const dynamic = 'force-dynamic'

export default async function StudentDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, streakInfo] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getStreakData(user.id),
  ])
  if (profile?.role !== 'student') redirect('/teacher/dashboard')

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

  const activeClassesCount = enrollments?.length || 0

  return (
    <div className="space-y-12 py-6 grid-bg relative">
      <div className="scanline-overlay absolute inset-0 opacity-10 pointer-events-none"></div>

      <div className="relative z-10 space-y-12">
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-l-4 border-primary-fixed-dim pl-6">
          <div>
            <h1 className="font-headline text-5xl font-black uppercase tracking-tighter text-white italic">SYSTEM_DASHBOARD</h1>
            <p className="font-mono text-primary-fixed-dim/60 text-sm mt-2 tracking-widest uppercase">
              กำลังโหลดสภาพแวดล้อมการเรียนรู้... การเชื่อมต่อเสถียร
            </p>
          </div>
          <div className="flex items-center gap-4 bg-surface-container-low p-4 border border-outline-variant/20 neon-glow-green">
            <div className="w-12 h-12 grayscale brightness-125 border border-outline-variant/30 flex items-center justify-center bg-surface-container-lowest">
              {profile?.avatar_url ? (
                <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="font-headline font-black text-primary-fixed text-lg">{profile?.full_name?.charAt(0) || 'U'}</span>
              )}
            </div>
            <div className="flex flex-col">
              <span className="font-headline font-bold text-on-surface">{profile?.full_name?.toUpperCase() || 'USER_ARCHITECT_01'}</span>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 bg-tertiary-fixed rounded-full shadow-[0_0_8px_#79ff5b]"></span>
                <span className="font-mono text-[10px] text-tertiary-fixed uppercase">STATUS: ONLINE</span>
              </div>
            </div>
          </div>
        </div>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Stat 1 */}
          <div className="bg-surface-container-low p-6 relative overflow-hidden border border-outline-variant/10 group transition-all duration-300 hover:bg-surface-container-high">
            <div className="absolute top-0 right-0 p-2 text-primary-fixed-dim/20 font-mono text-4xl font-black">01</div>
            <div className="relative z-10">
              <div className="font-mono text-[10px] text-primary-fixed-dim tracking-[0.2em] mb-1">คลาสเรียน // COURSES_ACTIVE</div>
              <div className="font-headline text-4xl font-black text-white">{activeClassesCount < 10 ? `0${activeClassesCount}` : activeClassesCount}</div>
              <div className="mt-4 h-1 w-full bg-surface-container-highest">
                <div className="h-full bg-primary-fixed-dim w-[65%] shadow-[0_0_10px_#00ffff]"></div>
              </div>
            </div>
          </div>

          {/* Stat 2 */}
          <div className="bg-surface-container-low p-6 relative overflow-hidden border border-outline-variant/10 group transition-all duration-300 hover:bg-surface-container-high">
            <div className="absolute top-0 right-0 p-2 text-secondary-fixed-dim/20 font-mono text-4xl font-black">02</div>
            <div className="relative z-10">
              <div className="font-mono text-[10px] text-secondary-fixed-dim tracking-[0.2em] mb-1">แต้ม XP // XP_GAINED</div>
              <div className="font-headline text-4xl font-black text-white">{(profile?.xp || 0).toLocaleString()}</div>
              <div className="mt-4 flex items-center gap-2 font-mono text-[10px] text-secondary-fixed">
                +15% FROM LAST CYCLE
              </div>
            </div>
          </div>

          {/* Stat 3 */}
          <div className="bg-surface-container-low p-6 relative overflow-hidden border border-outline-variant/10 group transition-all duration-300 hover:bg-surface-container-high">
            <div className="absolute top-0 right-0 p-2 text-tertiary-fixed-dim/20 font-mono text-4xl font-black">03</div>
            <div className="relative z-10">
              <div className="font-mono text-[10px] text-tertiary-fixed-dim tracking-[0.2em] mb-1">ระดับ // RANKING</div>
              <div className="font-headline text-4xl font-black text-white">LV.{profile?.level || 1}</div>
              <div className="mt-4 font-mono text-[10px] text-tertiary-fixed">TOP COHORT LEARNER</div>
            </div>
          </div>

          {/* Stat 4 */}
          <div className="bg-surface-container-low p-6 relative overflow-hidden border border-outline-variant/10 group transition-all duration-300 hover:bg-surface-container-high">
            <div className="absolute top-0 right-0 p-2 text-white/10 font-mono text-4xl font-black">04</div>
            <div className="relative z-10">
              <div className="font-mono text-[10px] text-on-surface-variant tracking-[0.2em] mb-1">ความก้าวหน้า // PROGRESS</div>
              <div className="font-headline text-4xl font-black text-white">{profile?.xp ? Math.min(Math.floor((profile.xp % 1000) / 10), 100) : 0}%</div>
              <div className="mt-4 h-1 w-full bg-surface-container-highest">
                <div className="h-full bg-white w-[82%] shadow-[0_0_10px_#ffffff]"></div>
              </div>
            </div>
          </div>
        </div>

        {/* CONTENT BENTO GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Learning Velocity Chart */}
          <div className="lg:col-span-2 bg-surface-container-low p-8 border border-outline-variant/10 relative overflow-hidden">
            <div className="flex justify-between items-center mb-10">
              <h2 className="font-headline font-black text-xl tracking-widest uppercase flex items-center gap-3">
                <span className="w-1 h-6 bg-primary-fixed-dim"></span>
                Learning_Velocity // กราฟการเรียนรู้
              </h2>
              <div className="flex gap-4 font-mono text-[10px] text-on-surface-variant">
                <span>CYCLE_07</span>
                <span className="text-primary-fixed-dim underline cursor-pointer">DOWNLOAD_REPORT</span>
              </div>
            </div>
            <div className="h-64 w-full relative">
              <StudentActivityChart />
            </div>
          </div>

          {/* Active Sectors */}
          <div className="bg-surface-container-low p-8 border border-outline-variant/10 flex flex-col">
            <h2 className="font-headline font-black text-xl tracking-widest uppercase flex items-center gap-3 mb-8">
              <span className="w-1 h-6 bg-secondary-md"></span>
              Active_Sectors // คลาสเรียน
            </h2>
            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
              {enrollments && enrollments.length > 0 ? enrollments.map((enr, i) => {
                const clsInfo = enr.classes as any
                const progress = [78, 32, 95, 12, 54][i % 5] || 45
                return (
                  <Link href={`/student/classes/${enr.class_id}`} key={enr.class_id} className="group cursor-pointer block">
                    <div className="flex justify-between items-start mb-2">
                      <span className="font-headline font-bold text-sm text-white uppercase group-hover:text-primary-fixed-dim transition-colors">{clsInfo?.name}</span>
                      <span className="font-mono text-[10px] text-on-surface-variant">{progress}%</span>
                    </div>
                    <div className="h-1 w-full bg-surface-container-highest">
                      <div
                        className={cn("h-full transition-all duration-700", progress > 80 ? "bg-tertiary-fixed shadow-[0_0_8px_#79ff5b]" : "bg-primary-fixed-dim")}
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </Link>
                )
              }) : (
                <div className="flex flex-col items-center justify-center h-32 opacity-30">
                  <ShieldAlert className="w-8 h-8 mb-2" />
                  <p className="font-mono text-[10px] tracking-widest uppercase">NO_ACTIVE_SECTORS</p>
                </div>
              )}
            </div>
            <Link href="/student/classes" className="mt-8 py-3 bg-surface-container-high border border-outline-variant/20 font-headline font-black text-xs uppercase tracking-[0.2em] text-on-surface hover:bg-primary-fixed-dim hover:text-on-primary-fixed transition-all duration-300 text-center block">
              ACCESS_ALL_MODULES // ดูทั้งหมด
            </Link>
          </div>
        </div>

        {/* LOWER SECTION */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Terminal Component */}
          <div className="bg-surface-container-lowest border-l-4 border-primary-fixed-dim p-6 font-mono text-xs overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Terminal className="w-16 h-16" />
            </div>
            <div className="flex items-center gap-2 mb-4 text-primary-fixed-dim">
              <span className="w-2 h-2 rounded-full bg-primary-fixed-dim animate-pulse"></span>
              <span>SYSTEM_LOGS // SESSION_492</span>
            </div>
            <div className="space-y-1 text-on-surface-variant/80">
              <p><span className="text-tertiary-fixed">[SUCCESS]</span> AUTH_TOKEN validated for {profile?.full_name || 'User'}</p>
              <p><span className="text-primary-fixed-dim">[INFO]</span> Loading learning environment...</p>
              <p><span className="text-primary-fixed-dim">[INFO]</span> Synchronizing progress with GLOBAL_CORE...</p>
              <p><span className="text-secondary-fixed-dim">[ALERT]</span> Quiz deadline approaching</p>
              <p><span className="text-on-surface">&gt; </span><span className="animate-pulse">_</span></p>
            </div>
          </div>

          {/* Achievements Grid */}
          <div className="grid grid-cols-2 gap-4">
            {[
              { icon: Award, label: "เซียนโค้ด", sub: "MASTER_CODER_v1", time: "Earned 2h ago", color: "text-primary-fixed-dim" },
              { icon: Flame, label: "ต่อเนื่อง 7 วัน", sub: "7_DAY_STREAK", time: "Keep it up", color: "text-secondary-fixed-dim" },
              { icon: Rocket, label: "ความเร็วสูง", sub: "FAST_TRACKER", time: "Top 10% speed", color: "text-tertiary-fixed-dim" },
              { icon: Zap, label: "พร้อมเป็นพี่เลี้ยง", sub: "MENTOR_READY", time: "Unlocked rank", color: "text-on-surface" }
            ].map((ach, i) => (
              <div key={i} className="bg-surface-container-low p-4 border border-outline-variant/10 hover:border-primary-fixed-dim/40 transition-colors flex flex-col justify-center items-center text-center">
                <ach.icon className={cn("mb-2 w-8 h-8", ach.color)} />
                <div className="font-headline font-bold text-[10px] uppercase text-white">{ach.sub}</div>
                <div className="font-mono text-[8px] text-on-surface-variant uppercase mt-1">{ach.time}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
