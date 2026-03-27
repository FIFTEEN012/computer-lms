import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LeaderboardClient from '@/components/gamification/LeaderboardClient'
import { getAllBadgesWithStatus } from '@/app/actions/gamification'

export const dynamic = 'force-dynamic'

export default async function GlobalLeaderboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Fetch all students ranked by XP
  const { data: students } = await supabase
    .from('profiles')
    .select('id, full_name, avatar_url, xp_total')
    .eq('role', 'student')
    .order('xp_total', { ascending: false })
    .limit(50)

  // Get badge counts per student
  const studentIds = (students || []).map(s => s.id)
  const { data: badgeCounts } = await supabase
    .from('student_badges')
    .select('student_id')
    .in('student_id', studentIds.length > 0 ? studentIds : ['_'])

  // Count badges per student
  const badgeCountMap: Record<string, number> = {}
  for (const b of badgeCounts || []) {
    badgeCountMap[b.student_id] = (badgeCountMap[b.student_id] || 0) + 1
  }

  const enriched = (students || []).map(s => ({
    ...s,
    full_name: s.full_name || 'UNKNOWN',
    xp_total: s.xp_total || 0,
    badge_count: badgeCountMap[s.id] || 0,
  }))

  // Current user XP
  const currentStudent = enriched.find(s => s.id === user.id)
  const currentUserXP = currentStudent?.xp_total || 0

  // All badges with earned status
  const allBadges = await getAllBadgesWithStatus(user.id)

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto">
      <LeaderboardClient
        students={enriched}
        currentUserId={user.id}
        currentUserXP={currentUserXP}
        allBadges={allBadges}
      />
    </div>
  )
}
