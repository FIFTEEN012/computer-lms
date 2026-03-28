import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Users, Plus, AlertTriangle, Eye, Terminal, Edit } from 'lucide-react'
import ActivityChart from '@/components/teacher/ActivityChart'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function TeacherDashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('role, full_name').eq('id', user.id).single()
  if (profile?.role !== 'teacher') redirect('/student/dashboard')

  const { data: classes } = await supabase.from('classes').select('*, class_enrollments(count)').eq('teacher_id', user.id)

  const activeClassesCount = classes?.length || 0
  const totalStudentsCount = classes?.reduce((acc, cls) => acc + (cls.class_enrollments[0]?.count || 0), 0) || 0

  return (
    <div className="space-y-8 py-6 relative">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
        <div className="font-mono text-[100px] leading-none select-none font-bold text-outline-variant">01</div>
      </div>

      {/* SYSTEM METRICS */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Metric 1 */}
        <div className="bg-surface-container-low p-6 relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-2">
            <Users className="w-8 h-8 text-primary-fixed/20" />
          </div>
          <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-outline mb-2">นักเรียนทั้งหมด // TOTAL_LEARNERS</h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-headline font-bold text-white">{totalStudentsCount.toLocaleString()}</span>
            <span className="text-[10px] font-mono text-tertiary-fixed">+5% GROWTH</span>
          </div>
          <div className="mt-4 h-[2px] w-full bg-outline-variant">
            <div className="h-full bg-primary-fixed w-3/4 shadow-[0_0_8px_rgba(0,251,251,0.5)]"></div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-surface-container-low p-6 relative overflow-hidden">
          <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-outline mb-2">คลาสเรียน // ACTIVE_COURSES</h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-headline font-bold text-white">{activeClassesCount < 10 ? `0${activeClassesCount}` : activeClassesCount}</span>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <div className="w-2 h-2 bg-tertiary-fixed rounded-full animate-pulse shadow-[0_0_8px_rgba(121,255,91,0.5)]"></div>
            <span className="text-[10px] font-mono text-tertiary-fixed uppercase tracking-widest">OPERATIONAL</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-surface-container-low p-6 relative overflow-hidden">
          <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-outline mb-2">ภาพรวม // AVG_PROGRESS</h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-headline font-bold text-white">68%</span>
          </div>
          <div className="mt-4 flex flex-col space-y-1">
            <div className="flex justify-between text-[8px] font-mono text-outline">
              <span>LOCKED</span>
              <span>DEPLOYED</span>
            </div>
            <div className="h-[2px] w-full bg-outline-variant">
              <div className="h-full bg-secondary-fixed w-[68%] shadow-[0_0_8px_rgba(255,171,243,0.5)]"></div>
            </div>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-surface-container-low p-6 relative overflow-hidden">
          <h3 className="font-headline text-[10px] uppercase tracking-[0.2em] text-outline mb-2">สถานะระบบ // SYSTEM_STATUS</h3>
          <div className="flex items-baseline space-x-3">
            <span className="text-3xl font-headline font-bold text-white">STABLE</span>
          </div>
          <div className="mt-4 flex items-center space-x-2">
            <span className="text-primary-fixed text-xs animate-ping">&#x25CF;</span>
            <span className="text-[10px] font-mono text-primary-fixed uppercase tracking-widest">LIVE_FEED</span>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content Area */}
        <div className="lg:col-span-2 space-y-8">
          {/* Analytics Chart */}
          <div className="bg-surface-container-low relative">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-headline font-bold text-sm tracking-widest uppercase flex items-center">
                <span className="w-2 h-4 bg-primary-fixed mr-3"></span>
                Learner Activity // กราฟกิจกรรม <span className="ml-2 text-outline font-normal text-[10px] font-mono">/ LAST 30 CYCLES</span>
              </h2>
              <div className="flex space-x-2">
                <span className="w-3 h-3 bg-primary-fixed"></span>
                <span className="w-3 h-3 bg-secondary-md"></span>
              </div>
            </div>
            <div className="p-6 h-64 relative">
              <ActivityChart />
            </div>
          </div>

          {/* Course Inventory Table */}
          <div className="bg-surface-container-low overflow-hidden">
            <div className="p-6 border-b border-outline-variant flex justify-between items-center">
              <h2 className="font-headline font-bold text-sm tracking-widest uppercase flex items-center">
                <span className="w-2 h-4 bg-secondary-md mr-3"></span>
                Course Inventory // รายการคลาสเรียน
              </h2>
              <Link href="/teacher/classes" className="font-headline font-bold text-[10px] text-primary-fixed hover:underline uppercase tracking-widest">
                VIEW_ALL
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="text-outline uppercase text-[10px] tracking-widest border-b border-outline-variant">
                    <th className="px-6 py-4 font-normal">Course_Identity</th>
                    <th className="px-6 py-4 font-normal">Node_Count</th>
                    <th className="px-6 py-4 font-normal">Status</th>
                    <th className="px-6 py-4 font-normal text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/30">
                  {classes?.map((cls) => (
                    <tr key={cls.id} className="hover:bg-surface-container-high transition-colors group">
                      <td className="px-6 py-4 text-white font-bold uppercase">{cls.name}</td>
                      <td className="px-6 py-4 text-on-surface-variant">{cls.class_enrollments[0]?.count || 0} LEARNERS</td>
                      <td className="px-6 py-4">
                        <span className="text-tertiary-fixed flex items-center">
                          <span className="w-1.5 h-1.5 bg-tertiary-fixed mr-2"></span> ACTIVE
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right space-x-3">
                        <Link href={`/teacher/classes/${cls.id}`} className="text-primary-fixed hover:underline text-[10px] font-headline font-bold tracking-tighter">
                          EDIT_NODE
                        </Link>
                        <Link href={`/teacher/classes/${cls.id}`} className="text-on-surface-variant hover:text-white transition-colors inline-block">
                          <Eye className="w-4 h-4 inline" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                  {!classes?.length && (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-outline font-mono text-[10px] tracking-widest uppercase">
                        NO_COURSES_FOUND // สร้างคลาสเรียนใหม่เพื่อเริ่มต้น
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Create New Course Button */}
          <Link href="/teacher/classes" className="block">
            <button className="w-full py-3 bg-primary-fixed text-on-primary-fixed font-headline font-bold text-xs uppercase tracking-widest glow-primary transition-all active:scale-95 flex items-center justify-center gap-2">
              <Plus className="w-4 h-4" />
              New Course // สร้างคลาสเรียน
            </button>
          </Link>

          {/* Urgent Protocols */}
          <div className="bg-surface-container-low border-l-4 border-error p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-headline font-bold text-sm tracking-widest uppercase">URGENT_PROTOCOLS</h2>
              <AlertTriangle className="w-5 h-5 text-error animate-pulse" />
            </div>
            <div className="space-y-4">
              <div className="p-4 bg-surface-container-high border border-outline-variant/20 hover:border-error transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-error font-bold tracking-tighter">UNGRADED_ASSIGNMENTS</span>
                  <span className="bg-error text-on-error px-2 py-0.5 text-[10px] font-bold">15</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-mono">รอการตรวจงานนักเรียนที่ค้างอยู่</p>
              </div>

              <div className="p-4 bg-surface-container-high border border-outline-variant/20 hover:border-primary-fixed transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-primary-fixed font-bold tracking-tighter">SYSTEM_UPDATE_PENDING</span>
                  <Edit className="w-4 h-4 text-primary-fixed" />
                </div>
                <p className="text-[10px] text-on-surface-variant font-mono">อัปเดตระบบ v2.5.2 กำลังจะเริ่ม</p>
              </div>

              <div className="p-4 bg-surface-container-high border border-outline-variant/20 hover:border-tertiary-fixed transition-colors cursor-pointer">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-[10px] font-mono text-tertiary-fixed font-bold tracking-tighter">NEW_QUERY_RECEIVED</span>
                  <span className="text-[10px] font-mono text-tertiary-fixed">3</span>
                </div>
                <p className="text-[10px] text-on-surface-variant font-mono">นักเรียน 3 คนรอการช่วยเหลือ</p>
              </div>
            </div>
          </div>

          {/* Terminal Overlay */}
          <div className="bg-surface-container-lowest p-6 font-mono text-[10px] text-primary-fixed/60 relative group">
            <div className="scanline-overlay absolute inset-0 opacity-10"></div>
            <div className="space-y-1 relative z-10">
              <p>&gt; BOOT_SEQUENCE: COMPLETED</p>
              <p>&gt; CACHE_SYNC: 98%</p>
              <p>&gt; ARCHITECT_ID: #{user.id.slice(0, 8).toUpperCase()}</p>
              <p>&gt; STATUS: MONITORING_ACTIVE</p>
              <div className="pt-4 flex items-center">
                <span className="w-2 h-4 bg-primary-fixed animate-pulse mr-2"></span>
                <span className="text-primary-fixed">WAITING_FOR_INPUT...</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
