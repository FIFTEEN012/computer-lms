import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL.trim(),
  process.env.SUPABASE_SERVICE_ROLE_KEY.trim()
)

const STUDENT_ID = 'a92e31e4-0183-4e5f-ba2d-afc9e6740c23'

async function seed() {
  console.log('--- SEEDING MORE DATA ---')

  // 1. Add Badges (Insert new if not exists by name)
  const badgesToSeed = [
    { name: 'Neural Pioneer', description: 'Begin your neural interface journey.', icon_url: 'Zap', condition_type: 'level', condition_value: 1 },
    { name: 'Matrix Runner', description: 'Complete 3 lessons without failure.', icon_url: 'Shield', condition_type: 'lessons', condition_value: 3 },
    { name: 'UI Hack Master', description: 'Deploy a neon design into production.', icon_url: 'Layout', condition_type: 'design', condition_value: 1 },
    { name: 'Data Whisperer', description: 'Analyze complex datasets in the matrix.', icon_url: 'Database', condition_type: 'quiz', condition_value: 10 }
  ]
  const { data: existingBadges } = await supabase.from('badges').select('name')
  const existingNames = new Set((existingBadges || []).map(b => b.name))
  const newBadges = badgesToSeed.filter(b => !existingNames.has(b.name))

  if (newBadges.length > 0) {
    const { error: insErr } = await supabase.from('badges').insert(newBadges)
    if (insErr) { console.error('Error inserting badges:', insErr); return; }
    console.log('✅ New badges added:', newBadges.map(b => b.name))
  } else {
    console.log('ℹ️  All badges already exist.')
  }
  const { data: allBadges } = await supabase.from('badges').select('*')
  const badges = allBadges


  // 2. Fetch Lessons to mark progress
  const { data: lessons, error: lErr } = await supabase.from('lessons').select('id, title').limit(2)
  if (lErr) { console.error('Error fetching lessons:', lErr); return; }
  
  if (lessons && lessons.length > 0) {
    const progressData = lessons.map(lesson => ({
      lesson_id: lesson.id,
      student_id: STUDENT_ID,
      time_spent_seconds: Math.floor(Math.random() * 600) + 120, // 2-10 mins
      completed_at: new Date().toISOString()
    }))
    const { error: pErr } = await supabase.from('lesson_progress').upsert(progressData, { onConflict: 'lesson_id,student_id' })
    if (pErr) console.error('Error seeding progress:', pErr)
    else console.log('✅ Lesson progress added for:', lessons.map(l => l.title))
  }

  // 3. Award Badges to Student
  if (badges && badges.length > 0) {
    const studentBadgesData = badges.slice(0, 2).map(badge => ({
      student_id: STUDENT_ID,
      badge_id: badge.id
    }))
    const { error: sbErr } = await supabase.from('student_badges').upsert(studentBadgesData, { onConflict: 'student_id,badge_id' })
    if (sbErr) console.error('Error awarding badges:', sbErr)
    else console.log('✅ Student badges awarded')
  }

  console.log('\n--- DATA ADDED SUCCESSFULLY ---')
}

seed()
