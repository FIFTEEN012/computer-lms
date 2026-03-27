"use client"

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ArrowLeft, Download, AlertTriangle, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import ClassTabs from '@/components/teacher/ClassTabs'

interface Student { id: string; full_name: string; student_id: string }
interface AttendanceRecord { student_id: string; date: string; status: string }

export default function AttendanceReportClient({
  classData, students, allAttendance
}: {
  classData: any; students: Student[]; allAttendance: AttendanceRecord[]
}) {
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const filtered = useMemo(() => {
    let data = allAttendance
    if (startDate) data = data.filter(a => a.date >= startDate)
    if (endDate) data = data.filter(a => a.date <= endDate)
    return data
  }, [allAttendance, startDate, endDate])

  const report = useMemo(() => {
    return students.map(student => {
      const records = filtered.filter(a => a.student_id === student.id)
      const present = records.filter(r => r.status === 'present').length
      const absent = records.filter(r => r.status === 'absent').length
      const late = records.filter(r => r.status === 'late').length
      const excused = records.filter(r => r.status === 'excused').length
      const total = records.length
      const pct = total > 0 ? Math.round(((present + late) / total) * 100) : 0
      return { ...student, present, absent, late, excused, total, pct }
    }).sort((a, b) => a.pct - b.pct)
  }, [students, filtered])

  const alertStudents = report.filter(s => s.pct < 80 && s.total > 0)

  const exportCSV = () => {
    const header = ['Name', 'Student ID', 'Present', 'Absent', 'Late', 'Excused', 'Total Days', 'Rate %']
    const rows = report.map(s =>
      [s.full_name, s.student_id || '', s.present, s.absent, s.late, s.excused, s.total, `${s.pct}%`].join(',')
    )
    const csv = [header.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${classData.name}_attendance_report.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-emerald-400/20 selection:text-emerald-400 overflow-x-hidden">
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-emerald-500">R/P</div>
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto space-y-6">
        <ClassTabs classId={classData.id} />

        <Link href={`/teacher/classes/${classData.id}/attendance`} className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors group">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> BACK_TO_TRACKER
        </Link>

        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest bg-emerald-500/10 inline-block px-3 py-1 mb-3">ANALYTICS_REPORT</div>
            <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase">Attendance Report</h1>
          </div>
          <Button onClick={exportCSV} variant="ghost" className="rounded-none font-mono text-[10px] uppercase tracking-widest border border-slate-800 text-emerald-400 hover:border-emerald-400 hover:bg-emerald-400/10">
            <Download className="w-3 h-3 mr-2" /> EXPORT_CSV
          </Button>
        </div>

        {/* Date Range Filter */}
        <div className="flex flex-wrap items-center gap-4 bg-[#131313] border border-slate-800 p-4">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">Filter:</span>
          <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)}
            className="bg-[#0a0a0a] border border-slate-800 px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-emerald-500" />
          <span className="font-mono text-[9px] text-slate-600">→</span>
          <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
            className="bg-[#0a0a0a] border border-slate-800 px-3 py-1.5 font-mono text-xs text-white focus:outline-none focus:border-emerald-500" />
          {(startDate || endDate) && (
            <button onClick={() => { setStartDate(''); setEndDate('') }} className="font-mono text-[9px] text-red-400 uppercase tracking-widest hover:text-red-300">CLEAR</button>
          )}
        </div>

        {/* Alert Section */}
        {alertStudents.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-red-400" />
              <span className="font-mono text-[10px] text-red-400 uppercase tracking-widest font-bold">
                ALERT: {alertStudents.length} student{alertStudents.length > 1 ? 's' : ''} below 80% attendance
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
              {alertStudents.map(s => (
                <span key={s.id} className="font-mono text-[10px] px-2 py-1 border border-red-500/50 text-red-400 bg-red-500/10">
                  {s.full_name} ({s.pct}%)
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Report Table */}
        <div className="bg-[#131313] border border-slate-800 overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800 bg-[#1a1a1a]">
                {['Student', 'ID', 'Present', 'Absent', 'Late', 'Excused', 'Total', 'Rate'].map(h => (
                  <th key={h} className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-slate-600">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {report.map((s, i) => (
                <tr key={s.id} className={`border-b border-slate-800/50 ${i % 2 === 0 ? '' : 'bg-[#1a1a1a]/30'} hover:bg-emerald-400/5 transition-colors`}>
                  <td className="px-4 py-3 font-sans text-sm text-white">{s.full_name}</td>
                  <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{s.student_id || '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm text-emerald-400">{s.present}</td>
                  <td className="px-4 py-3 font-mono text-sm text-red-400">{s.absent}</td>
                  <td className="px-4 py-3 font-mono text-sm text-amber-400">{s.late}</td>
                  <td className="px-4 py-3 font-mono text-sm text-cyan-400">{s.excused}</td>
                  <td className="px-4 py-3 font-mono text-sm text-white">{s.total}</td>
                  <td className="px-4 py-3">
                    <span className={`font-mono text-sm font-bold px-2 py-0.5 border ${s.pct >= 90 ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : s.pct >= 75 ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                      {s.total > 0 ? `${s.pct}%` : '—'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
