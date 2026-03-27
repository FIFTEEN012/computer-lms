import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Activity, Zap, Plus, AlertTriangle, Eye } from 'lucide-react'
import ActivityChart from '@/components/teacher/ActivityChart'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'teacher') redirect('/student/dashboard')

  // Fetch actual metrics
  const { data: classes } = await supabase.from('classes').select('*, class_enrollments(count)').eq('teacher_id', user.id)
  
  const activeClasses = classes?.length || 0
  const totalStudents = classes?.reduce((acc, cls) => acc + (cls.class_enrollments[0]?.count || 0), 0) || 0

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-100 dark:bg-[#0e0e0e]/50 selection:bg-primary/20 selection:text-primary">
      
      {/* Background Grid Decoration */}
      <div className="fixed top-0 right-0 p-4 opacity-10 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-slate-800">T/D</div>
      </div>

      <div className="mb-8 flex items-end justify-between relative z-10">
        <div>
          <h1 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">Architect_Dashboard</h1>
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mt-1">Welcome back, {profile?.full_name}</p>
        </div>
        <div className="hidden sm:flex gap-3">
          <Link href="/teacher/classes">
            <Button className="font-mono text-[10px] font-bold tracking-widest uppercase rounded-none h-10 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all">
              <Plus className="w-4 h-4 mr-2" /> CREATE_NODE (CLASS)
            </Button>
          </Link>
        </div>
      </div>

      {/* Cyberpunk System Metrics */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 relative z-10">
        
        {/* Metric 1 */}
        <div className="bg-white dark:bg-[#1c1b1b] p-6 relative overflow-hidden group border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="absolute top-0 right-0 p-3">
            <Users className="text-primary/20 w-10 h-10" />
          </div>
          <h3 className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">TOTAL_LEARNERS</h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{totalStudents}</span>
            <span className="text-[10px] font-mono text-emerald-500">+12% GROWTH</span>
          </div>
          <div className="mt-5 h-[2px] w-full bg-slate-100 dark:bg-slate-800">
            <div className="h-full bg-primary w-3/4 shadow-[0_0_8px_rgba(var(--primary),0.5)]"></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white dark:bg-[#1c1b1b] p-6 relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">ACTIVE_COURSES</h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-4xl font-black text-slate-900 dark:text-white">{activeClasses}</span>
          </div>
          <div className="mt-5 flex items-center space-x-2">
            <div className="w-2 h-2 bg-emerald-500 transform rotate-45 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest">OPERATIONAL</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white dark:bg-[#1c1b1b] p-6 relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">AVG_COURSE_PROGRESS</h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-4xl font-black text-slate-900 dark:text-white">68%</span>
          </div>
          <div className="mt-5 flex flex-col space-y-1">
            <div className="flex justify-between text-[8px] font-mono text-slate-500">
              <span>LOCKED</span>
              <span>DEPLOYED</span>
            </div>
            <div className="h-[2px] w-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full bg-pink-500 w-[68%] shadow-[0_0_8px_rgba(236,72,153,0.5)]"></div>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white dark:bg-[#1c1b1b] p-6 relative overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm">
          <h3 className="font-sans font-bold text-[10px] uppercase tracking-[0.2em] text-slate-500 mb-2">SYSTEM_ENGAGEMENT</h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-4xl font-black text-slate-900 dark:text-white">High</span>
          </div>
          <div className="mt-5 flex items-center space-x-2">
            <Activity className="text-primary w-3 h-3 animate-ping" />
            <span className="text-[10px] font-mono text-primary uppercase tracking-widest">LIVE_FEED</span>
          </div>
        </div>

      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
        
        {/* Main Area: Analytics & Inventory */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Analytics Wave Chart */}
          <div className="bg-white dark:bg-[#1c1b1b] border border-slate-200 dark:border-slate-800 shadow-sm relative">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-sans font-black tracking-widest text-sm uppercase flex items-center text-slate-900 dark:text-white">
                <span className="w-2 h-4 bg-primary mr-3"></span>
                Learner Activity <span className="ml-3 text-slate-500 font-normal text-[10px] font-mono tracking-widest">/ LAST 30 CYCLES</span>
              </h2>
            </div>
            <div className="p-6 pb-10">
              <ActivityChart />
            </div>
          </div>

          {/* Course Inventory Table */}
          <div className="bg-white dark:bg-[#1c1b1b] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
              <h2 className="font-sans font-black text-sm tracking-widest uppercase flex items-center text-slate-900 dark:text-white">
                <span className="w-2 h-4 bg-pink-500 mr-3"></span>
                Course Inventory
              </h2>
              <Link href="/teacher/classes">
                <Button variant="ghost" className="font-mono text-[10px] uppercase tracking-widest h-8 bg-slate-100 dark:bg-[#201f1f]">View_All_Nodes</Button>
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-black/20">
                    <th className="px-6 py-4 font-normal">Course_Identity</th>
                    <th className="px-6 py-4 font-normal">Node_Count</th>
                    <th className="px-6 py-4 font-normal">Status</th>
                    <th className="px-6 py-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {classes?.slice(0, 5).map((cls) => (
                    <tr key={cls.id} className="hover:bg-slate-50 dark:hover:bg-[#201f1f] transition-colors group">
                      <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{cls.name || 'UNNAMED_NODE'}</td>
                      <td className="px-6 py-4 text-slate-500">{cls.class_enrollments[0]?.count || 0} LEARNERS</td>
                      <td className="px-6 py-4">
                        <span className="text-emerald-500 flex items-center">
                          <span className="w-1.5 h-1.5 bg-emerald-500 mr-2 rounded-full"></span> ACTIVE
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-4 flex justify-end">
                        <Link href={`/teacher/classes/${cls.id}`} className="text-slate-400 hover:text-primary transition-colors flex items-center">
                          <Eye className="w-4 h-4 mr-2" /> <span className="text-[10px] uppercase font-bold tracking-widest hover:underline">Access</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {classes?.length === 0 && (
                    <tr>
                      <td colSpan={4} className="px-6 py-12 text-center text-slate-500 font-mono text-[10px] uppercase tracking-widest bg-slate-50/50 dark:bg-transparent">
                        NO_COURSES_DETECTED. INITIALIZE_NEW_NODE.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar: Urgent Protocols */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#1c1b1b] border-l-4 border-l-red-500 border-t border-r border-b border-slate-200 dark:border-slate-800 p-6 shadow-sm relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-sans font-black text-sm tracking-widest uppercase text-slate-900 dark:text-white">URGENT_PROTOCOLS</h2>
              <AlertTriangle className="text-red-500 w-5 h-5 animate-pulse" />
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 dark:bg-[#201f1f] border border-slate-200 dark:border-slate-800 hover:border-red-500 transition-colors cursor-pointer shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-red-500 font-bold tracking-tighter">UNGRADED_ASSIGNMENTS</span>
                  <span className="bg-red-500 text-white px-2 py-0.5 text-[10px] font-bold">15</span>
                </div>
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed">Action required for active instruction algorithms.</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-[#201f1f] border border-slate-200 dark:border-slate-800 hover:border-primary transition-colors cursor-pointer shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-primary font-bold tracking-tighter">SYSTEM_UPDATE_PENDING</span>
                  <Zap className="text-primary w-4 h-4" />
                </div>
                <p className="text-[10px] text-slate-500 font-mono leading-relaxed">V2.4 Architecture rollout scheduled for 04:00 GMT.</p>
              </div>
            </div>

            <Button variant="outline" className="mt-8 w-full border-slate-300 dark:border-slate-700 text-[10px] font-mono font-bold uppercase tracking-widest hover:bg-slate-100 dark:hover:bg-[#201f1f] rounded-none h-10 transition-colors">
              Clear_All_Logs
            </Button>
          </div>

          {/* Terminal Overlay */}
          <div className="bg-slate-900 dark:bg-[#0e0e0e] p-6 font-mono text-[10px] text-primary/70 relative border-l-2 border-primary shadow-xl">
            <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,0,0,0.3)_50%)] bg-[length:100%_4px] pointer-events-none"></div>
            <div className="space-y-1 relative z-10 leading-relaxed tracking-wider">
              <p>{'>'} BOOT_SEQUENCE: COMPLETED</p>
              <p>{'>'} CACHE_SYNC: 98%</p>
              <p>{'>'} ARCHITECT_ID: #{user.id.slice(0, 7).toUpperCase()}</p>
              <p>{'>'} STATUS: SYSTEM_ONLINE</p>
              <div className="pt-4 flex items-center text-primary font-bold">
                <span className="w-2 h-4 bg-primary animate-pulse mr-2"></span>
                WAITING_FOR_INPUT...
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
