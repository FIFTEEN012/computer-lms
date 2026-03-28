import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import StudentLessonReader from '@/components/student/lessons/StudentLessonReader'

export const dynamic = 'force-dynamic'

export default async function StudentLessonViewPage({ params }: { params: { lessonId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: lesson } = await supabase
     .from('lessons')
     .select('*')
     .eq('id', params.lessonId)
     .eq('is_published', true)
     .single()

  if (!lesson) redirect('/student/dashboard')

  // Verify explicit enrollment preventing rogue parameter URL jumps
  const { data: enrollment } = await supabase
    .from('class_enrollments')
    .select('id')
    .eq('student_id', user.id)
    .eq('class_id', lesson.class_id)
    .single()

  if (!enrollment) redirect('/student/classes')

  // Check if completed natively
  const { data: progress } = await supabase.from('lesson_progress').select('completed_at').eq('lesson_id', lesson.id).eq('student_id', user.id).single()
  const isCompleted = !!progress?.completed_at

  // Get adjacent lessons for prev/next navigation
  const { data: allLessons } = await supabase
    .from('lessons')
    .select('id, title, lesson_order')
    .eq('class_id', lesson.class_id)
    .eq('is_published', true)
    .order('lesson_order', { ascending: true })

  const currentIndex = allLessons?.findIndex(l => l.id === lesson.id) ?? -1
  const prevLesson = currentIndex > 0 ? allLessons?.[currentIndex - 1] : null
  const nextLesson = allLessons && currentIndex < allLessons.length - 1 ? allLessons[currentIndex + 1] : null
  const totalLessons = allLessons?.length ?? 0
  const progressPercent = totalLessons > 0 ? Math.round(((currentIndex + 1) / totalLessons) * 100) : 0

  return (
    <div className="min-h-[calc(100vh-64px)] relative font-body text-on-surface grid-bg selection:bg-primary-fixed/20 selection:text-primary-fixed">
      {/* Module Header - Stitch Style */}
      <header className="mb-8 md:mb-12 px-2">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-l-4 border-primary-fixed pl-6 gap-6">
          <div>
            <Link href={`/student/classes/${lesson.class_id}`} className="font-headline text-primary-fixed text-sm tracking-[0.3em] uppercase opacity-60 hover:opacity-100 transition-opacity">
              System Core / Learning
            </Link>
            <h1 className="font-headline text-3xl md:text-5xl font-black tracking-tighter text-white mt-2 uppercase">
              {lesson.title}
            </h1>
            {lesson.description && (
              <p className="font-body text-sm text-on-surface-variant mt-3 max-w-xl leading-relaxed">
                {lesson.description}
              </p>
            )}
          </div>
          <div className="text-right shrink-0">
            <div className="font-label text-xs tracking-widest text-outline uppercase mb-2">
              Progress: {progressPercent}%
            </div>
            <div className="w-48 md:w-64 h-1 bg-surface-container-high overflow-hidden">
              <div className="h-full bg-primary-fixed shadow-[0_0_10px_#00fbfb] transition-all duration-700" style={{ width: `${progressPercent}%` }} />
            </div>
            <div className="font-label text-[10px] tracking-widest text-outline/50 uppercase mt-1.5">
              {lesson.time_estimated_minutes || 0} min est.
            </div>
          </div>
        </div>
      </header>

      <StudentLessonReader
        lesson={lesson}
        classId={lesson.class_id}
        isCompleted={isCompleted}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        lessonNumber={currentIndex + 1}
        totalLessons={totalLessons}
      />
    </div>
  )
}
