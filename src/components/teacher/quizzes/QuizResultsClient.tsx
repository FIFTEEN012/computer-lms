"use client"

import { useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts'
import { Download, TrendingUp, Users, Target, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function QuizResultsClient({ quiz, questions, attempts, passingScore }: {
  quiz: any, questions: any[], attempts: any[], passingScore: number
}) {

  const stats = useMemo(() => {
    if (!attempts.length) return null
    const percentages = attempts.map(a => a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0)
    const avg = Math.round(percentages.reduce((s, n) => s + n, 0) / percentages.length)
    const highest = Math.max(...percentages)
    const passCount = percentages.filter(p => p >= passingScore).length
    return { avg, highest, passCount, passRate: Math.round((passCount / attempts.length) * 100) }
  }, [attempts, passingScore])

  // Histogram bins 0-10, 11-20, ... 91-100
  const histogram = useMemo(() => {
    const bins = Array.from({ length: 10 }, (_, i) => ({
      label: `${i * 10 + (i === 0 ? 0 : 1)}-${(i + 1) * 10}`,
      count: 0,
    }))
    attempts.forEach(a => {
      const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0
      const bin = Math.min(9, Math.floor(pct / 10))
      bins[bin].count += 1
    })
    return bins
  }, [attempts])

  // Per-question difficulty
  const questionStats = useMemo(() => {
    return questions.map(q => {
      let correctCount = 0
      attempts.forEach(a => {
        const ans = a.answers?.[q.id]
        if (ans && ans.trim().toLowerCase() === q.correct_answer?.trim().toLowerCase()) correctCount++
      })
      const pct = attempts.length > 0 ? Math.round((correctCount / attempts.length) * 100) : 0
      return { ...q, correctCount, pct }
    }).sort((a, b) => a.pct - b.pct)
  }, [questions, attempts])

  const exportCSV = () => {
    const header = ['Student Name', 'Student ID', 'Email', 'Score', 'Max Score', 'Percentage', 'Status', 'Submitted At']
    const rows = attempts.map(a => {
      const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0
      return [
        a.profiles?.full_name || '',
        a.profiles?.student_id || '',
        a.profiles?.email || '',
        a.score,
        a.max_score,
        `${pct}%`,
        pct >= passingScore ? 'PASS' : 'FAIL',
        a.submitted_at ? new Date(a.submitted_at).toLocaleString() : ''
      ].join(',')
    })
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${quiz.title.replace(/\s+/g, '_')}_results.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (!attempts.length) {
    return (
      <div className="py-20 flex flex-col items-center border-2 border-dashed border-slate-800 bg-[#131313] text-center">
        <AlertTriangle className="w-8 h-8 text-slate-600 mb-4" />
        <p className="font-mono text-[10px] uppercase tracking-widest text-slate-500">NO_SUBMISSIONS_DETECTED.<br/>AWAITING STUDENT TRANSMISSIONS.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Attempts', value: attempts.length, icon: Users, color: 'text-cyan-400' },
          { label: 'Avg Score', value: `${stats?.avg}%`, icon: TrendingUp, color: 'text-emerald-400' },
          { label: 'Pass Rate', value: `${stats?.passRate}%`, icon: Target, color: 'text-fuchsia-400' },
          { label: 'Highest Score', value: `${stats?.highest}%`, icon: TrendingUp, color: 'text-amber-400' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-[#131313] border border-slate-800 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="font-mono text-[9px] uppercase tracking-widest text-slate-500">{label}</span>
              <Icon className={`w-4 h-4 ${color} opacity-50`} />
            </div>
            <div className={`text-3xl font-black font-sans ${color}`}>{value}</div>
          </div>
        ))}
      </div>

      {/* Score Distribution Histogram */}
      <div className="bg-[#131313] border border-slate-800 p-6">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-6">SCORE_DISTRIBUTION_HISTOGRAM</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={histogram}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis dataKey="label" tick={{ fontFamily: 'monospace', fontSize: 9, fill: '#64748b' }} />
            <YAxis tick={{ fontFamily: 'monospace', fontSize: 9, fill: '#64748b' }} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: '#1a1a1a', border: '1px solid #334155', fontFamily: 'monospace', fontSize: 10 }}
              cursor={{ fill: 'rgba(16,185,129,0.05)' }}
            />
            <Bar dataKey="count" name="Students">
              {histogram.map((entry, index) => {
                const midPoint = index * 10 + 5
                return <Cell key={index} fill={midPoint >= passingScore ? '#10b981' : '#6b7280'} />
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="font-mono text-[9px] text-slate-600 mt-2 uppercase tracking-widest">Green = above passing threshold ({passingScore}%)</p>
      </div>

      {/* Per-Question Analysis */}
      <div className="bg-[#131313] border border-slate-800 p-6">
        <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 mb-6">QUESTION_DIFFICULTY_RANKING (hardest first)</h3>
        <div className="space-y-3">
          {questionStats.map((q, idx) => (
            <div key={q.id} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-sans text-xs text-slate-300 line-clamp-1 max-w-xl">Q{idx + 1}: {q.question}</span>
                <span className={`font-mono text-[10px] font-bold ml-4 ${q.pct >= 70 ? 'text-emerald-400' : q.pct >= 40 ? 'text-amber-400' : 'text-red-400'}`}>{q.pct}%</span>
              </div>
              <div className="h-1.5 w-full bg-slate-800">
                <div
                  className={`h-full transition-all ${q.pct >= 70 ? 'bg-emerald-400' : q.pct >= 40 ? 'bg-amber-400' : 'bg-red-400'}`}
                  style={{ width: `${q.pct}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Student Results Table */}
      <div className="bg-[#131313] border border-slate-800">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400">STUDENT_TRANSMISSION_LOGS</h3>
          <Button onClick={exportCSV} variant="ghost" className="rounded-none font-mono text-[10px] uppercase tracking-widest border border-slate-800 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-400/10">
            <Download className="w-3 h-3 mr-2" /> EXPORT_CSV
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-[#1a1a1a]">
                {['Student', 'ID', 'Score', 'Percentage', 'Status', 'Submitted'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {attempts.map((a, i) => {
                const pct = a.max_score > 0 ? Math.round((a.score / a.max_score) * 100) : 0
                const passed = pct >= passingScore
                return (
                  <tr key={a.id} className={`border-b border-slate-800/50 ${i % 2 === 0 ? '' : 'bg-[#1a1a1a]/30'} hover:bg-emerald-400/5 transition-colors`}>
                    <td className="px-4 py-3 font-sans text-sm text-white">{a.profiles?.full_name || 'Unknown'}</td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{a.profiles?.student_id || '—'}</td>
                    <td className="px-4 py-3 font-mono text-sm text-white">{a.score || 0} / {a.max_score || 0}</td>
                    <td className="px-4 py-3 font-mono text-sm font-bold text-white">{pct}%</td>
                    <td className="px-4 py-3">
                      <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 border ${passed ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                        {passed ? 'PASS' : 'FAIL'}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-[10px] text-slate-500">
                      {a.submitted_at ? new Date(a.submitted_at).toLocaleString() : '—'}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
