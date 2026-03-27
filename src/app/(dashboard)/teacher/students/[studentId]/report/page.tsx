import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Award, Zap, Calendar, BookOpen, BrainCircuit } from 'lucide-react'
import { GRADE_WEIGHTS, calculateWeightedScore, getGradeLetter, getGradeColor } from '@/lib/utils/grades'

export const dynamic = 'force-dynamic'

const CATEGORIES = Object.keys(GRADE_WEIGHTS)

export default async function TeacherStudentReportPage({ params }: { params: { studentId: string } }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // Get student profile
  const { data: student } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', params.studentId)
    .single()
  if (!student) redirect('/teacher/dashboard')

  // Get all classes this teacher teaches where this student is enrolled
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select('class_id, classes!inner(id, name, teacher_id)')
    .eq('student_id', params.studentId)

  const teacherClasses = (enrollments || []).filter((e: any) => e.classes.teacher_id === user.id)

  // Grades
  const { data: allGrades } = await supabase
    .from('grades')
    .select('*')
    .eq('student_id', params.studentId)

  // Quiz attempts
  const { data: quizAttempts } = await supabase
    .from('quiz_attempts')
    .select('*, quizzes!inner(title, class_id)')
    .eq('student_id', params.studentId)
    .not('submitted_at', 'is', null)
    .order('submitted_at', { ascending: false })

  // Attendance
  const { data: attendance } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', params.studentId)
    .order('date', { ascending: false })
    .limit(30)

  // Badges
  const { data: badges } = await supabase
    .from('student_badges')
    .select('*, badges!inner(name, description, icon_url)')
    .eq('student_id', params.studentId)

  const presentCount = (attendance || []).filter(a => a.status === 'present' || a.status === 'late').length
  const attendancePct = attendance && attendance.length > 0 ? Math.round((presentCount / attendance.length) * 100) : 0

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-emerald-400/20 overflow-x-hidden">
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-emerald-500">S/R</div>
      </div>

      <div className="relative z-10 w-full max-w-5xl mx-auto space-y-6">
        <Link href="/teacher/dashboard" className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors group">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> BACK
        </Link>

        {/* Profile Header */}
        <div className="bg-[#1c1b1b] border-l-4 border-cyan-400 p-6 md:p-8 flex flex-col md:flex-row gap-6 items-start">
          <div className="w-16 h-16 bg-slate-800 flex items-center justify-center font-mono text-2xl text-white font-bold flex-shrink-0">
            {student.full_name?.charAt(0) || '?'}
          </div>
          <div className="flex-1">
            <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest mb-1">STUDENT_PROFILE_REPORT</div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase">{student.full_name}</h1>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="font-mono text-[10px] text-slate-500 uppercase">ID: {student.student_id || '—'}</span>
              <span className="font-mono text-[10px] text-slate-500 uppercase">{student.email}</span>
            </div>
          </div>
          <div className="flex gap-4 flex-shrink-0">
            <div className="text-center px-4 py-2 border border-slate-800 bg-[#131313]">
              <Zap className="w-4 h-4 text-amber-400 mx-auto mb-1" />
              <div className="text-xl font-black text-amber-400">{student.xp_total || 0}</div>
              <div className="font-mono text-[8px] text-slate-600 uppercase">XP</div>
            </div>
            <div className="text-center px-4 py-2 border border-slate-800 bg-[#131313]">
              <Calendar className="w-4 h-4 text-emerald-400 mx-auto mb-1" />
              <div className={`text-xl font-black ${attendancePct >= 80 ? 'text-emerald-400' : 'text-red-400'}`}>{attendancePct}%</div>
              <div className="font-mono text-[8px] text-slate-600 uppercase">Attendance</div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {badges && badges.length > 0 && (
          <div className="bg-[#131313] border border-slate-800 p-5">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2"><Award className="w-3 h-3" /> EARNED_BADGES</h3>
            <div className="flex flex-wrap gap-2">
              {badges.map((b: any) => (
                <span key={b.id} className="font-mono text-[10px] px-3 py-1.5 border border-amber-400/30 text-amber-400 bg-amber-400/10">
                  🏅 {b.badges.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Grades by Class */}
        {teacherClasses.map((enrollment: any) => {
          const classGrades = (allGrades || []).filter((g: any) => g.class_id === enrollment.class_id)
          const classQuizAttempts = (quizAttempts || []).filter((a: any) => a.quizzes.class_id === enrollment.class_id)

          const byCategory: Record<string, { score: number; maxScore: number }[]> = {}
          CATEGORIES.forEach(cat => {
            if (cat === 'Quizzes') {
              const byQuiz: Record<string, any> = {}
              classQuizAttempts.forEach((a: any) => {
                if (!byQuiz[a.quiz_id] || (a.score || 0) > (byQuiz[a.quiz_id].score || 0)) byQuiz[a.quiz_id] = a
              })
              byCategory[cat] = Object.values(byQuiz).map((a: any) => ({ score: a.score || 0, maxScore: a.max_score || 0 }))
            } else {
              byCategory[cat] = classGrades
                .filter((g: any) => g.category === cat)
                .map((g: any) => ({ score: g.score || 0, maxScore: g.max_score || 0 }))
            }
          })

          const { weighted, breakdown } = calculateWeightedScore(byCategory)
          const letter = getGradeLetter(weighted)

          return (
            <div key={enrollment.class_id} className="bg-[#131313] border border-slate-800">
              <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2">
                  <BookOpen className="w-3 h-3" /> {enrollment.classes.name}
                </h3>
                <span className={`font-mono text-lg font-black px-2 py-0.5 border ${getGradeColor(weighted)} ${weighted >= 70 ? 'border-emerald-500/50 bg-emerald-500/10' : weighted >= 50 ? 'border-amber-500/50 bg-amber-500/10' : 'border-red-500/50 bg-red-500/10'}`}>
                  {letter} ({weighted}%)
                </span>
              </div>
              <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
                {CATEGORIES.map(cat => (
                  <div key={cat} className="text-center">
                    <div className={`text-2xl font-black font-sans ${getGradeColor(breakdown[cat])}`}>{breakdown[cat]}%</div>
                    <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mt-1">{cat} ({GRADE_WEIGHTS[cat as keyof typeof GRADE_WEIGHTS]}%)</div>
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {/* Quiz History */}
        {quizAttempts && quizAttempts.length > 0 && (
          <div className="bg-[#131313] border border-slate-800">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2"><BrainCircuit className="w-3 h-3" /> QUIZ_HISTORY</h3>
            </div>
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-[#1a1a1a]">
                  {['Quiz', 'Score', '%', 'Date'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {quizAttempts.slice(0, 10).map((a: any, i: number) => {
                  const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0
                  return (
                    <tr key={a.id} className={`border-b border-slate-800/50 ${i % 2 === 0 ? '' : 'bg-[#1a1a1a]/30'}`}>
                      <td className="px-4 py-3 font-sans text-sm text-white">{a.quizzes?.title}</td>
                      <td className="px-4 py-3 font-mono text-sm text-white">{a.score}/{a.max_score}</td>
                      <td className="px-4 py-3"><span className={`font-mono text-sm font-bold ${getGradeColor(pct)}`}>{pct}%</span></td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{a.submitted_at ? new Date(a.submitted_at).toLocaleDateString() : '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Recent Attendance */}
        {attendance && attendance.length > 0 && (
          <div className="bg-[#131313] border border-slate-800">
            <div className="px-6 py-4 border-b border-slate-800">
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 flex items-center gap-2"><Calendar className="w-3 h-3" /> RECENT_ATTENDANCE (last 30)</h3>
            </div>
            <div className="p-4 flex flex-wrap gap-1">
              {attendance.map(a => (
                <div key={a.id} title={`${a.date}: ${a.status}`}
                  className={`w-6 h-6 border flex items-center justify-center font-mono text-[8px] ${
                    a.status === 'present' ? 'border-emerald-500/50 bg-emerald-500/20 text-emerald-400' :
                    a.status === 'late' ? 'border-amber-500/50 bg-amber-500/20 text-amber-400' :
                    a.status === 'excused' ? 'border-cyan-500/50 bg-cyan-500/20 text-cyan-400' :
                    'border-red-500/50 bg-red-500/20 text-red-400'
                  }`}
                >
                  {a.status === 'present' ? '✓' : a.status === 'late' ? 'L' : a.status === 'excused' ? 'E' : '✗'}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
