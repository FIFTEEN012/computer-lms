"use client"

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, LineChart, Line } from 'recharts'
import { Download, AlertTriangle, Trophy, TrendingDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GRADE_WEIGHTS, calculateWeightedScore, getGradeLetter, getGradeColor } from '@/lib/utils/grades'
import ClassTabs from '@/components/teacher/ClassTabs'
import Link from 'next/link'

const CATEGORIES = Object.keys(GRADE_WEIGHTS)

export default function ClassReportsClient({ classData, students, grades, attendance, quizAttempts }: {
  classData: any; students: any[]; grades: any[]; attendance: any[]; quizAttempts: any[]
}) {

  // Calculate weighted scores per student
  const studentScores = useMemo(() => {
    return students.map(student => {
      const studentGrades = grades.filter((g: any) => g.student_id === student.id)
      const byCategory: Record<string, { score: number; maxScore: number }[]> = {}

      CATEGORIES.forEach(cat => {
        if (cat === 'Quizzes') {
          const attempts = quizAttempts.filter((a: any) => a.student_id === student.id)
          const byQuiz: Record<string, any> = {}
          attempts.forEach((a: any) => {
            if (!byQuiz[a.quiz_id] || (a.score || 0) > (byQuiz[a.quiz_id].score || 0)) byQuiz[a.quiz_id] = a
          })
          byCategory[cat] = Object.values(byQuiz).map((a: any) => ({ score: a.score || 0, maxScore: a.max_score || 0 }))
        } else {
          byCategory[cat] = studentGrades
            .filter((g: any) => g.category === cat)
            .map((g: any) => ({ score: g.score || 0, maxScore: g.max_score || 0 }))
        }
      })

      const { weighted } = calculateWeightedScore(byCategory)
      const attendanceRecords = attendance.filter((a: any) => a.student_id === student.id)
      const presentCount = attendanceRecords.filter((a: any) => a.status === 'present' || a.status === 'late').length
      const attendancePct = attendanceRecords.length > 0 ? Math.round((presentCount / attendanceRecords.length) * 100) : 0

      return { ...student, weighted, letter: getGradeLetter(weighted), attendancePct }
    }).sort((a, b) => b.weighted - a.weighted)
  }, [students, grades, quizAttempts, attendance])

  // Class average
  const classAvg = useMemo(() => {
    const scores = studentScores.filter(s => s.weighted > 0)
    return scores.length > 0 ? Math.round(scores.reduce((s, st) => s + st.weighted, 0) / scores.length) : 0
  }, [studentScores])

  // Score distribution histogram
  const distribution = useMemo(() => {
    const bins = [
      { range: 'A (≥80)', min: 80, max: 100, count: 0, color: '#10b981' },
      { range: 'B+ (75-79)', min: 75, max: 79, count: 0, color: '#34d399' },
      { range: 'B (70-74)', min: 70, max: 74, count: 0, color: '#6ee7b7' },
      { range: 'C+ (65-69)', min: 65, max: 69, count: 0, color: '#f59e0b' },
      { range: 'C (60-64)', min: 60, max: 64, count: 0, color: '#fbbf24' },
      { range: 'D (50-59)', min: 50, max: 59, count: 0, color: '#fb923c' },
      { range: 'F (<50)', min: 0, max: 49, count: 0, color: '#ef4444' },
    ]
    studentScores.forEach(s => {
      const bin = bins.find(b => s.weighted >= b.min && s.weighted <= b.max)
      if (bin) bin.count++
    })
    return bins
  }, [studentScores])

  // Students needing attention
  const needsAttention = useMemo(() => {
    return studentScores.filter(s => s.weighted < 60 || s.attendancePct < 75)
  }, [studentScores])

  // Top 10
  const top10 = studentScores.slice(0, 10)

  // Category avg line data
  const categoryAvgs = useMemo(() => {
    return CATEGORIES.map(cat => {
      const catGrades = cat === 'Quizzes'
        ? studentScores.map(s => {
            const attempts = quizAttempts.filter((a: any) => a.student_id === s.id)
            if (attempts.length === 0) return 0
            const totalScore = attempts.reduce((sum: number, a: any) => sum + (a.score || 0), 0)
            const totalMax = attempts.reduce((sum: number, a: any) => sum + (a.max_score || 0), 0)
            return totalMax > 0 ? Math.round((totalScore / totalMax) * 100) : 0
          })
        : students.map(st => {
            const g = grades.filter((g: any) => g.student_id === st.id && g.category === cat)
            if (g.length === 0) return 0
            const ts = g.reduce((s: number, gr: any) => s + (gr.score || 0), 0)
            const tm = g.reduce((s: number, gr: any) => s + (gr.max_score || 0), 0)
            return tm > 0 ? Math.round((ts / tm) * 100) : 0
          })
      const nonZero = catGrades.filter(v => v > 0)
      return { category: cat, avg: nonZero.length > 0 ? Math.round(nonZero.reduce((a, b) => a + b, 0) / nonZero.length) : 0 }
    })
  }, [students, grades, quizAttempts, studentScores])

  const exportCSV = () => {
    const header = ['Rank', 'Name', 'Student ID', 'Weighted %', 'Grade', 'Attendance %', 'XP']
    const rows = studentScores.map((s, i) =>
      [i + 1, s.full_name, s.student_id || '', `${s.weighted}%`, s.letter, `${s.attendancePct}%`, s.xp_total].join(',')
    )
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = `${classData.name}_report.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest bg-emerald-500/10 inline-block px-3 py-1 mb-3">CLASS_ANALYTICS</div>
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
            Reports <span className="text-emerald-400">//</span> DATA_DASHBOARD
          </h2>
        </div>
        <Button onClick={exportCSV} variant="ghost" className="rounded-none font-mono text-[10px] uppercase tracking-widest border border-slate-800 text-emerald-400 hover:border-emerald-400 h-9">
          <Download className="w-3 h-3 mr-2" /> EXPORT_CSV
        </Button>
      </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Students', value: students.length, color: 'text-cyan-400' },
            { label: 'Class Avg', value: `${classAvg}%`, color: getGradeColor(classAvg) },
            { label: 'Avg Grade', value: getGradeLetter(classAvg), color: getGradeColor(classAvg) },
            { label: 'At Risk', value: needsAttention.length, color: needsAttention.length > 0 ? 'text-red-400' : 'text-emerald-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#131313] border border-slate-800 p-5">
              <div className="font-mono text-[9px] uppercase tracking-widest text-slate-500 mb-2">{s.label}</div>
              <div className={`text-3xl font-black font-sans ${s.color}`}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Category Avg Bar Chart */}
          <div className="bg-[#131313] border border-slate-800 p-6">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-6">CATEGORY_AVERAGES</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryAvgs}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="category" tick={{ fontFamily: 'monospace', fontSize: 9, fill: '#64748b' }} />
                <YAxis domain={[0, 100]} tick={{ fontFamily: 'monospace', fontSize: 9, fill: '#64748b' }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #334155', fontFamily: 'monospace', fontSize: 10 }} />
                <Bar dataKey="avg" name="Average %">
                  {categoryAvgs.map((entry, index) => (
                    <Cell key={index} fill={entry.avg >= 70 ? '#10b981' : entry.avg >= 50 ? '#f59e0b' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Score Distribution */}
          <div className="bg-[#131313] border border-slate-800 p-6">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-6">GRADE_DISTRIBUTION</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={distribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="range" tick={{ fontFamily: 'monospace', fontSize: 8, fill: '#64748b' }} />
                <YAxis allowDecimals={false} tick={{ fontFamily: 'monospace', fontSize: 9, fill: '#64748b' }} />
                <Tooltip contentStyle={{ background: '#1a1a1a', border: '1px solid #334155', fontFamily: 'monospace', fontSize: 10 }} />
                <Bar dataKey="count" name="Students">
                  {distribution.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top 10 Leaderboard */}
        <div className="bg-[#131313] border border-slate-800">
          <div className="px-6 py-4 border-b border-slate-800 flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400">TOP_10_LEADERBOARD</h3>
          </div>
          <div className="divide-y divide-slate-800/50">
            {top10.map((s, i) => (
              <div key={s.id} className="flex items-center gap-4 px-6 py-3 hover:bg-emerald-400/5 transition-colors">
                <span className={`font-mono text-lg font-black w-8 text-center ${i < 3 ? 'text-amber-400' : 'text-slate-600'}`}>#{i + 1}</span>
                <div className="flex-1">
                  <span className="font-sans text-sm text-white">{s.full_name}</span>
                  <span className="font-mono text-[9px] text-slate-600 ml-2">{s.student_id || ''}</span>
                </div>
                <span className={`font-mono text-sm font-bold ${getGradeColor(s.weighted)}`}>{s.weighted}%</span>
                <span className={`font-mono text-xs font-bold px-2 py-0.5 border ${s.weighted >= 70 ? 'border-emerald-500/50 text-emerald-400' : s.weighted >= 50 ? 'border-amber-500/50 text-amber-400' : 'border-red-500/50 text-red-400'}`}>{s.letter}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Needs Attention */}
        {needsAttention.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/30">
            <div className="px-6 py-4 border-b border-red-500/30 flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-400" />
              <h3 className="font-mono text-[10px] uppercase tracking-widest text-red-400">STUDENTS_NEEDING_ATTENTION</h3>
            </div>
            <div className="p-6">
              <div className="space-y-3">
                {needsAttention.map(s => (
                  <div key={s.id} className="flex items-center justify-between bg-[#131313] border border-red-500/20 p-4">
                    <div>
                      <span className="font-sans text-sm text-white">{s.full_name}</span>
                      <div className="flex gap-3 mt-1">
                        {s.weighted < 60 && <span className="font-mono text-[9px] text-red-400 uppercase">Score: {s.weighted}%</span>}
                        {s.attendancePct < 75 && <span className="font-mono text-[9px] text-amber-400 uppercase">Attendance: {s.attendancePct}%</span>}
                      </div>
                    </div>
                    <Link href={`/teacher/students/${s.id}/report`}>
                      <Button variant="ghost" className="rounded-none font-mono text-[9px] uppercase tracking-widest border border-slate-800 text-slate-400 h-7 px-3">VIEW_REPORT</Button>
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
  )
}
