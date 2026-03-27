"use client"

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronLeft, ChevronRight, Check, X, Clock, FileText } from 'lucide-react'

const STATUS_ICONS: Record<string, { icon: any; color: string; heatColor: string }> = {
  present: { icon: Check, color: 'text-emerald-400', heatColor: 'bg-emerald-500' },
  absent: { icon: X, color: 'text-red-400', heatColor: 'bg-red-500' },
  late: { icon: Clock, color: 'text-amber-400', heatColor: 'bg-amber-500' },
  excused: { icon: FileText, color: 'text-cyan-400', heatColor: 'bg-cyan-500' },
}

interface AttendanceRecord { date: string; status: string; note: string | null }

export default function StudentAttendanceClient({
  classData, attendance
}: {
  classData: any; attendance: AttendanceRecord[]
}) {
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  // Summary stats
  const stats = useMemo(() => {
    const total = attendance.length
    const present = attendance.filter(a => a.status === 'present').length
    const absent = attendance.filter(a => a.status === 'absent').length
    const late = attendance.filter(a => a.status === 'late').length
    const excused = attendance.filter(a => a.status === 'excused').length
    const rate = total > 0 ? Math.round(((present + late) / total) * 100) : 0
    return { total, present, absent, late, excused, rate }
  }, [attendance])

  // Calendar data
  const calendarDays = useMemo(() => {
    const { year, month } = calMonth
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [calMonth])

  const attendanceMap = useMemo(() => {
    const map: Record<string, AttendanceRecord> = {}
    attendance.forEach(a => { map[a.date] = a })
    return map
  }, [attendance])

  // Monthly table data
  const monthRecords = useMemo(() => {
    const { year, month } = calMonth
    const prefix = `${year}-${String(month + 1).padStart(2, '0')}`
    return attendance.filter(a => a.date.startsWith(prefix)).sort((a, b) => a.date.localeCompare(b.date))
  }, [attendance, calMonth])

  const today = new Date().toISOString().split('T')[0]
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-emerald-400/20 selection:text-emerald-400 overflow-x-hidden">
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-cyan-500">L/G</div>
      </div>

      <div className="relative z-10 w-full max-w-4xl mx-auto space-y-6">
        <Link href={`/student/classes/${classData.id}`} className="inline-flex items-center text-[10px] font-mono uppercase tracking-widest text-slate-500 hover:text-emerald-400 transition-colors group">
          <ArrowLeft className="w-3 h-3 mr-2 group-hover:-translate-x-1 transition-transform" /> BACK_TO_CLASS
        </Link>

        <div className="border-b border-slate-800 pb-6">
          <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest bg-cyan-400/10 inline-block px-3 py-1 mb-3">ATTENDANCE_LOG</div>
          <h1 className="text-2xl md:text-4xl font-black tracking-tighter text-white uppercase">{classData.name}</h1>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          {[
            { label: 'Rate', value: `${stats.rate}%`, color: stats.rate >= 90 ? 'text-emerald-400' : stats.rate >= 75 ? 'text-amber-400' : 'text-red-400' },
            { label: 'Total', value: stats.total, color: 'text-white' },
            { label: 'Present', value: stats.present, color: 'text-emerald-400' },
            { label: 'Absent', value: stats.absent, color: 'text-red-400' },
            { label: 'Late', value: stats.late, color: 'text-amber-400' },
            { label: 'Excused', value: stats.excused, color: 'text-cyan-400' },
          ].map(s => (
            <div key={s.label} className="bg-[#131313] border border-slate-800 p-4 text-center">
              <div className={`text-2xl font-black font-sans ${s.color}`}>{s.value}</div>
              <div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Calendar Heatmap */}
        <div className="bg-[#131313] border border-slate-800 p-6">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setCalMonth(p => ({ year: p.month === 0 ? p.year - 1 : p.year, month: p.month === 0 ? 11 : p.month - 1 }))} className="text-slate-500 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-mono text-sm text-white uppercase tracking-widest">{monthNames[calMonth.month]} {calMonth.year}</h3>
            <button onClick={() => setCalMonth(p => ({ year: p.month === 11 ? p.year + 1 : p.year, month: p.month === 11 ? 0 : p.month + 1 }))} className="text-slate-500 hover:text-white transition-colors">
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
              <div key={d} className="text-center font-mono text-[9px] text-slate-600 uppercase tracking-widest py-1">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, i) => {
              if (day === null) return <div key={`e-${i}`} />
              const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
              const record = attendanceMap[dateStr]
              const isToday = dateStr === today
              const statusCfg = record ? STATUS_ICONS[record.status] : null

              return (
                <div
                  key={day}
                  className={`relative h-12 border flex flex-col items-center justify-center transition-colors ${isToday ? 'border-emerald-400/50' : 'border-slate-800'} ${record ? 'bg-[#1a1a1a]' : ''}`}
                  title={record ? `${record.status}${record.note ? ` — ${record.note}` : ''}` : ''}
                >
                  <span className={`font-mono text-xs ${isToday ? 'text-emerald-400 font-bold' : 'text-slate-500'}`}>{day}</span>
                  {statusCfg && (
                    <div className={`w-2 h-2 mt-1 ${statusCfg.heatColor} opacity-80`} />
                  )}
                </div>
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 justify-center">
            {Object.entries(STATUS_ICONS).map(([key, cfg]) => (
              <div key={key} className="flex items-center gap-1.5">
                <div className={`w-2.5 h-2.5 ${cfg.heatColor}`} />
                <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">{key}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Table */}
        <div className="bg-[#131313] border border-slate-800">
          <div className="px-6 py-4 border-b border-slate-800">
            <h3 className="font-mono text-[10px] uppercase tracking-widest text-slate-400">
              {monthNames[calMonth.month].toUpperCase()}_DETAIL_LOG // {monthRecords.length} records
            </h3>
          </div>

          {monthRecords.length === 0 ? (
            <div className="py-12 text-center">
              <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">NO_RECORDS_FOR_THIS_MONTH</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800 bg-[#1a1a1a]">
                  {['Date', 'Day', 'Status', 'Note'].map(h => (
                    <th key={h} className="px-4 py-3 text-left font-mono text-[9px] uppercase tracking-widest text-slate-600">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {monthRecords.map((r, i) => {
                  const dayName = new Date(r.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short' })
                  const cfg = STATUS_ICONS[r.status]
                  const Icon = cfg?.icon
                  return (
                    <tr key={r.date} className={`border-b border-slate-800/50 ${i % 2 === 0 ? '' : 'bg-[#1a1a1a]/30'}`}>
                      <td className="px-4 py-3 font-mono text-sm text-white">{r.date}</td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500 uppercase">{dayName}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest ${cfg?.color || 'text-slate-500'}`}>
                          {Icon && <Icon className="w-3 h-3" />} {r.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-[10px] text-slate-500">{r.note || '—'}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
