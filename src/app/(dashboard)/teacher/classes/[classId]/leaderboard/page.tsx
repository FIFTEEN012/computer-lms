import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Podium from '@/components/gamification/Podium'
import LeaderboardRow from '@/components/gamification/LeaderboardRow'
import { Trophy } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TeacherClassLeaderboardPage({ params }: { params: { classId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch class info
  const { data: classData } = await supabase
    .from('classes')
    .select('name')
    .eq('id', params.classId)
    .single()

  // Fetch enrolled students
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('student_id, profiles(id, full_name, avatar_url, xp_total)')
    .eq('class_id', params.classId)

  // Get badge counts
  const studentIds = (enrollments || []).map((e: any) => e.student_id)
  const { data: badgeCounts } = await supabase
    .from('student_badges')
    .select('student_id')
    .in('student_id', studentIds.length > 0 ? studentIds : ['_'])

  const badgeCountMap: Record<string, number> = {}
  for (const b of badgeCounts || []) {
    badgeCountMap[b.student_id] = (badgeCountMap[b.student_id] || 0) + 1
  }

  // Build ranked list
  const students = (enrollments || [])
    .map((e: any) => ({
      id: e.student_id,
      full_name: e.profiles?.full_name || 'UNKNOWN',
      avatar_url: e.profiles?.avatar_url || null,
      xp_total: e.profiles?.xp_total || 0,
      badge_count: badgeCountMap[e.student_id] || 0,
    }))
    .sort((a: any, b: any) => (b.xp_total || 0) - (a.xp_total || 0))

  const podiumPlayers = students.slice(0, 3).map((s: any) => ({
    name: s.full_name,
    avatarUrl: s.avatar_url,
    xp: s.xp_total,
    badgeCount: s.badge_count,
    isCurrentUser: false,
  }))

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="font-mono text-[10px] text-yellow-500 uppercase tracking-widest bg-yellow-500/10 inline-block px-3 py-1 mb-3">
            CLASS_RANKINGS
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
            Leaderboard <span className="text-yellow-400">//</span> XP_RANKINGS
          </h2>
        </div>
        <div className="bg-[#131313] border border-slate-800 px-4 py-3 flex items-center gap-3">
          <Trophy className="w-5 h-5 text-yellow-500/50" />
          <div>
            <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">TOTAL_NODES</div>
            <div className="font-sans font-black text-white text-lg">{students.length}</div>
          </div>
        </div>
      </div>

      {/* Podium */}
      {students.length >= 3 && (
        <div className="bg-[#0e0e0e] border border-slate-800 p-4 md:p-6">
          <div className="font-mono text-[10px] text-yellow-500/60 uppercase tracking-widest text-center mb-2">
            ★ TOP_3_PERFORMERS ★
          </div>
          <Podium players={podiumPlayers} />
        </div>
      )}

      {/* Full Ranking */}
      <div>
        <div className="font-mono text-[10px] text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
          <span className="w-2 h-2 bg-emerald-400 animate-pulse" />
          FULL_RANKING // {students.length} STUDENTS
        </div>
        <div className="space-y-2">
          {students.map((student: any, idx: number) => (
            <LeaderboardRow
              key={student.id}
              rank={idx + 1}
              name={student.full_name}
              avatarUrl={student.avatar_url}
              xp={student.xp_total}
              badgeCount={student.badge_count}
              isCurrentUser={false}
              studentId={student.id}
            />
          ))}
          {students.length === 0 && (
            <div className="py-12 text-center bg-[#131313] border border-slate-800">
              <div className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">
                NO_STUDENTS_ENROLLED.<br/>AWAITING_NODE_CONNECTIONS.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
