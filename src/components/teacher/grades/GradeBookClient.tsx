"use client"

import { useState, useMemo, useCallback } from 'react'
import { Save, Loader2, Lock, Unlock, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveGradeAction } from '@/app/actions/grades'
import { GRADE_WEIGHTS, getGradeLetter, getGradeColor, calculateWeightedScore } from '@/lib/utils/grades'
import { useToast } from '@/hooks/useToast'
import ClassTabs from '@/components/teacher/ClassTabs'

interface Student { id: string; full_name: string; student_id: string }
interface GradeRecord { id: string; student_id: string; category: string; title: string; score: number; max_score: number }
interface QuizAttempt { quiz_id: string; student_id: string; score: number; max_score: number }

const CATEGORIES = Object.keys(GRADE_WEIGHTS) as (keyof typeof GRADE_WEIGHTS)[]

export default function GradeBookClient({ classData, students, grades, quizzes, quizAttempts }: {
  classData: any; students: Student[]; grades: GradeRecord[]; quizzes: any[]; quizAttempts: QuizAttempt[]
}) {
  const [locked, setLocked] = useState(false)
  const [editingCell, setEditingCell] = useState<string | null>(null)
  const [editValue, setEditValue] = useState('')
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  // Build quiz scores per student (auto-pull best attempt)
  const quizScores = useMemo(() => {
    const map: Record<string, { score: number; maxScore: number }[]> = {}
    students.forEach(s => {
      const studentAttempts = quizAttempts.filter(a => a.student_id === s.id)
      // Group by quiz_id, take best score
      const byQuiz: Record<string, QuizAttempt> = {}
      studentAttempts.forEach(a => {
        if (!byQuiz[a.quiz_id] || (a.score || 0) > (byQuiz[a.quiz_id].score || 0)) {
          byQuiz[a.quiz_id] = a
        }
      })
      map[s.id] = Object.values(byQuiz).map(a => ({ score: a.score || 0, maxScore: a.max_score || 0 }))
    })
    return map
  }, [students, quizAttempts])

  // Build grade data per student per category
  const studentData = useMemo(() => {
    return students.map(student => {
      const studentGrades = grades.filter(g => g.student_id === student.id)
      const byCategory: Record<string, { score: number; maxScore: number }[]> = {}

      CATEGORIES.forEach(cat => {
        if (cat === 'Quizzes') {
          byCategory[cat] = quizScores[student.id] || []
        } else {
          byCategory[cat] = studentGrades
            .filter(g => g.category === cat)
            .map(g => ({ score: g.score || 0, maxScore: g.max_score || 0 }))
        }
      })

      const { weighted, breakdown } = calculateWeightedScore(byCategory)
      return { ...student, byCategory, weighted, breakdown, letter: getGradeLetter(weighted) }
    })
  }, [students, grades, quizScores])

  const handleCellClick = (studentId: string, category: string) => {
    if (locked || category === 'Quizzes') return
    const key = `${studentId}-${category}`
    const existing = grades.find(g => g.student_id === studentId && g.category === category)
    setEditingCell(key)
    setEditValue(existing ? String(existing.score) : '')
  }

  const handleCellSave = async (studentId: string, category: string) => {
    const score = parseFloat(editValue)
    if (isNaN(score)) { setEditingCell(null); return }

    setSaving(true)
    const res = await saveGradeAction(classData.id, studentId, category, category, score, 100)
    setSaving(false)
    setEditingCell(null)

    if (res?.error) {
      toast({ title: 'SAVE_ERROR', description: res.error, variant: 'destructive' })
    } else {
      toast({ title: 'GRADE_SAVED', description: `${category} updated successfully.` })
    }
  }

  const exportCSV = () => {
    const header = ['Name', 'Student ID', ...CATEGORIES.map(c => `${c} (${GRADE_WEIGHTS[c]}%)`), 'Weighted %', 'Grade']
    const rows = studentData.map(s =>
      [s.full_name, s.student_id || '', ...CATEGORIES.map(c => `${s.breakdown[c]}%`), `${s.weighted}%`, s.letter].join(',')
    )
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = `${classData.name}_gradebook.csv`; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest bg-emerald-500/10 inline-block px-3 py-1 mb-3">GRADE_BOOK</div>
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
            ACADEMIC_MATRIX <span className="text-emerald-400">//</span> PERFORMANCE_LOG
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Button onClick={() => setLocked(l => !l)} variant="ghost" className={`rounded-none font-mono text-[10px] uppercase tracking-widest border h-9 ${locked ? 'border-red-400 text-red-400' : 'border-slate-800 text-slate-400'}`}>
            {locked ? <><Lock className="w-3 h-3 mr-2" /> LOCKED</> : <><Unlock className="w-3 h-3 mr-2" /> EDITABLE</>}
          </Button>
          <Button onClick={exportCSV} variant="ghost" className="rounded-none font-mono text-[10px] uppercase tracking-widest border border-slate-800 text-emerald-400 hover:border-emerald-400 h-9">
            <Download className="w-3 h-3 mr-2" /> CSV
          </Button>
        </div>
      </div>

        {/* Weights Legend */}
        <div className="flex flex-wrap gap-3 bg-[#131313] border border-slate-800 p-4">
          <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest self-center">Weights:</span>
          {CATEGORIES.map(cat => (
            <span key={cat} className="font-mono text-[10px] px-2 py-1 border border-slate-800 text-slate-300">
              {cat} <span className="text-emerald-400 font-bold">{GRADE_WEIGHTS[cat]}%</span>
            </span>
          ))}
          <span className="font-mono text-[10px] px-2 py-1 border border-emerald-400/50 text-emerald-400 ml-auto">
            Total: {Object.values(GRADE_WEIGHTS).reduce((a, b) => a + b, 0)}%
          </span>
        </div>

        {/* Grade Table */}
        <div className="bg-[#131313] border border-slate-800 overflow-x-auto">
          <table className="w-full min-w-[800px]">
            <thead>
              <tr className="border-b border-slate-800 bg-[#1a1a1a]">
                <th className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-slate-600 sticky left-0 bg-[#1a1a1a] z-10 min-w-[160px]">Student</th>
                {CATEGORIES.map(cat => (
                  <th key={cat} className="px-4 py-3 text-center font-mono text-[9px] uppercase tracking-widest text-slate-600 min-w-[100px]">
                    {cat}<br /><span className="text-emerald-400/60">{GRADE_WEIGHTS[cat]}%</span>
                  </th>
                ))}
                <th className="px-4 py-3 text-center font-mono text-[9px] uppercase tracking-widest text-slate-600 min-w-[80px]">Weighted</th>
                <th className="px-4 py-3 text-center font-mono text-[9px] uppercase tracking-widest text-slate-600 min-w-[70px]">Grade</th>
              </tr>
            </thead>
            <tbody>
              {studentData.map((s, i) => (
                <tr key={s.id} className={`border-b border-slate-800/50 ${i % 2 === 0 ? '' : 'bg-[#1a1a1a]/30'} hover:bg-emerald-400/5 transition-colors`}>
                  <td className="px-4 py-3 sticky left-0 bg-[#131313] z-10">
                    <div className="font-sans text-sm text-white font-medium">{s.full_name}</div>
                    <div className="font-mono text-[9px] text-slate-600">{s.student_id || ''}</div>
                  </td>
                  {CATEGORIES.map(cat => {
                    const cellKey = `${s.id}-${cat}`
                    const isEditing = editingCell === cellKey
                    const val = s.breakdown[cat]
                    const isQuiz = cat === 'Quizzes'

                    return (
                      <td key={cat} className="px-4 py-3 text-center"
                        onClick={() => handleCellClick(s.id, cat)}
                      >
                        {isEditing ? (
                          <input
                            type="number" min={0} max={100}
                            value={editValue}
                            onChange={e => setEditValue(e.target.value)}
                            onBlur={() => handleCellSave(s.id, cat)}
                            onKeyDown={e => e.key === 'Enter' && handleCellSave(s.id, cat)}
                            autoFocus
                            className="w-16 bg-[#0a0a0a] border border-emerald-400 px-2 py-1 font-mono text-sm text-white text-center focus:outline-none mx-auto"
                          />
                        ) : (
                          <span className={`font-mono text-sm font-bold ${getGradeColor(val)} ${!isQuiz && !locked ? 'cursor-pointer hover:underline' : ''}`}>
                            {val > 0 ? `${val}%` : <span className="text-slate-700">—</span>}
                          </span>
                        )}
                        {isQuiz && val > 0 && (
                          <div className="font-mono text-[8px] text-slate-600 mt-0.5">auto</div>
                        )}
                      </td>
                    )
                  })}
                  <td className="px-4 py-3 text-center">
                    <span className={`font-mono text-lg font-black ${getGradeColor(s.weighted)}`}>{s.weighted}%</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`font-mono text-lg font-black px-2 py-0.5 border ${s.weighted >= 70 ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : s.weighted >= 50 ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                      {s.letter}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Grade Scale */}
        <div className="bg-[#131313] border border-slate-800 p-4">
          <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest mb-2 block">GRADE_SCALE:</span>
          <div className="flex flex-wrap gap-2">
            {[
              { letter: 'A', range: '≥80', color: 'border-emerald-500/50 text-emerald-400' },
              { letter: 'B+', range: '75-79', color: 'border-emerald-500/30 text-emerald-300' },
              { letter: 'B', range: '70-74', color: 'border-emerald-500/20 text-emerald-200' },
              { letter: 'C+', range: '65-69', color: 'border-amber-500/50 text-amber-400' },
              { letter: 'C', range: '60-64', color: 'border-amber-500/30 text-amber-300' },
              { letter: 'D', range: '50-59', color: 'border-amber-500/20 text-amber-200' },
              { letter: 'F', range: '<50', color: 'border-red-500/50 text-red-400' },
            ].map(g => (
              <span key={g.letter} className={`font-mono text-[10px] px-2 py-1 border ${g.color}`}>
                {g.letter} ({g.range})
              </span>
            ))}
          </div>
        </div>
      </div>
  )
}
