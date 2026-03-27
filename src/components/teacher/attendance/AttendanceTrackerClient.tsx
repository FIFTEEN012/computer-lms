"use client"

import { useState, useMemo, useCallback } from 'react'
import { Calendar, Check, X, Clock, FileText, Users, Save, Loader2, ChevronLeft, ChevronRight, BarChart2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { recordAttendanceAction } from '@/app/actions/attendance'
import { useToast } from '@/hooks/useToast'
import Link from 'next/link'
import ClassTabs from '@/components/teacher/ClassTabs'

type Status = 'present' | 'absent' | 'late' | 'excused'

const STATUS_CONFIG: Record<Status, { icon: any; label: string; color: string; bg: string }> = {
  present: { icon: Check, label: 'Present', color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/50' },
  absent: { icon: X, label: 'Absent', color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/50' },
  late: { icon: Clock, label: 'Late', color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/50' },
  excused: { icon: FileText, label: 'Excused', color: 'text-cyan-400', bg: 'bg-cyan-400/10 border-cyan-400/50' },
}

interface Student { id: string; full_name: string; student_id: string; avatar_url: string | null }
interface AttendanceRecord { student_id: string; date: string; status: string; note: string | null }

export default function AttendanceTrackerClient({
  classData, students, allAttendance
}: {
  classData: any; students: Student[]; allAttendance: AttendanceRecord[]
}) {
  const today = new Date().toISOString().split('T')[0]
  const [selectedDate, setSelectedDate] = useState(today)
  const [statuses, setStatuses] = useState<Record<string, Status>>({})
  const [notes, setNotes] = useState<Record<string, string>>({})
  const [saving, setSaving] = useState(false)
  const [view, setView] = useState<'list' | 'calendar'>('list')
  const { toast } = useToast()

  // Initialize statuses from existing data when date changes
  useMemo(() => {
    const dayRecords = allAttendance.filter(a => a.date === selectedDate)
    const statusMap: Record<string, Status> = {}
    const noteMap: Record<string, string> = {}
    dayRecords.forEach(r => {
      statusMap[r.student_id] = r.status as Status
      if (r.note) noteMap[r.student_id] = r.note
    })
    setStatuses(statusMap)
    setNotes(noteMap)
  }, [selectedDate, allAttendance])

  const setStatus = useCallback((studentId: string, status: Status) => {
    setStatuses(prev => ({ ...prev, [studentId]: status }))
  }, [])

  const markAll = useCallback((status: Status) => {
    const bulk: Record<string, Status> = {}
    students.forEach(s => { bulk[s.id] = status })
    setStatuses(bulk)
  }, [students])

  const handleSave = async () => {
    setSaving(true)
    const records = students
      .filter(s => statuses[s.id])
      .map(s => ({
        student_id: s.id,
        status: statuses[s.id],
        note: notes[s.id] || undefined,
      }))

    if (records.length === 0) {
      toast({ title: 'NO_DATA', description: 'Mark at least one student.', variant: 'destructive' })
      setSaving(false)
      return
    }

    const res = await recordAttendanceAction(classData.id, selectedDate, records)
    setSaving(false)
    if (res?.error) {
      toast({ title: 'SAVE_ERROR', description: res.error, variant: 'destructive' })
    } else {
      toast({ title: 'ATTENDANCE_SAVED', description: `${records.length} records committed for ${selectedDate}` })
    }
  }

  // Calendar view data
  const [calMonth, setCalMonth] = useState(() => {
    const d = new Date()
    return { year: d.getFullYear(), month: d.getMonth() }
  })

  const calendarDays = useMemo(() => {
    const { year, month } = calMonth
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const days: (number | null)[] = Array(firstDay).fill(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [calMonth])

  const getDateStats = useCallback((day: number) => {
    const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const records = allAttendance.filter(a => a.date === dateStr)
    if (records.length === 0) return null
    const present = records.filter(r => r.status === 'present').length
    return { total: records.length, present, pct: Math.round((present / records.length) * 100) }
  }, [allAttendance, calMonth])

  // Per-student attendance rate
  const studentRates = useMemo(() => {
    const rates: Record<string, { present: number; total: number; pct: number }> = {}
    students.forEach(s => {
      const records = allAttendance.filter(a => a.student_id === s.id)
      const present = records.filter(r => r.status === 'present' || r.status === 'late').length
      rates[s.id] = { present, total: records.length, pct: records.length > 0 ? Math.round((present / records.length) * 100) : 0 }
    })
    return rates
  }, [students, allAttendance])

  const markedCount = Object.keys(statuses).length
  const monthNames = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="font-mono text-[10px] text-emerald-500 uppercase tracking-widest bg-emerald-500/10 inline-block px-3 py-1 mb-3">
            ATTENDANCE_TRACKER
          </div>
          <h2 className="text-2xl font-black tracking-tighter text-white uppercase italic">
            Roll Call <span className="text-emerald-400">//</span> SESSION_LOG
          </h2>
        </div>
        <div className="flex items-center gap-3">
          <Link href={`/teacher/classes/${classData.id}/attendance/report`}>
            <Button variant="ghost" className="rounded-none font-mono text-[10px] uppercase tracking-widest border border-slate-800 text-slate-400 hover:text-white hover:border-emerald-400">
              <BarChart2 className="w-3 h-3 mr-2" /> ANALYTICS_REPORT
            </Button>
          </Link>
          <div className="flex border border-slate-800">
            <button onClick={() => setView('list')} className={`px-3 py-2 font-mono text-[9px] uppercase tracking-widest ${view === 'list' ? 'bg-emerald-400/10 text-emerald-400' : 'text-slate-500'}`}>List</button>
            <button onClick={() => setView('calendar')} className={`px-3 py-2 font-mono text-[9px] uppercase tracking-widest ${view === 'calendar' ? 'bg-emerald-400/10 text-emerald-400' : 'text-slate-500'}`}>Calendar</button>
          </div>
        </div>
      </div>

        {view === 'list' ? (
          <>
            {/* Date Picker & Bulk Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-[#131313] border border-slate-800 p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-4 h-4 text-emerald-400" />
                <input
                  type="date"
                  value={selectedDate}
                  onChange={e => setSelectedDate(e.target.value)}
                  className="bg-[#0a0a0a] border border-slate-800 px-4 py-2 font-mono text-sm text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>
              <div className="flex items-center gap-2 ml-auto">
                <span className="font-mono text-[9px] text-slate-600 uppercase tracking-widest mr-2">Bulk:</span>
                <Button onClick={() => markAll('present')} variant="ghost" className="rounded-none font-mono text-[9px] uppercase tracking-widest border border-emerald-400/30 text-emerald-400 hover:bg-emerald-400/10 h-8 px-3">
                  ✅ All Present
                </Button>
                <Button onClick={() => markAll('absent')} variant="ghost" className="rounded-none font-mono text-[9px] uppercase tracking-widest border border-red-400/30 text-red-400 hover:bg-red-400/10 h-8 px-3">
                  ❌ All Absent
                </Button>
              </div>
            </div>

            {/* Student List */}
            <div className="space-y-2">
              {students.length === 0 ? (
                <div className="py-16 flex flex-col items-center border-2 border-dashed border-slate-800 bg-[#131313] text-center">
                  <Users className="w-8 h-8 text-slate-700 mb-4" />
                  <p className="font-mono text-[10px] text-slate-600 uppercase tracking-widest">NO_STUDENTS_ENROLLED</p>
                </div>
              ) : (
                students.map(student => {
                  const currentStatus = statuses[student.id]
                  const rate = studentRates[student.id]

                  return (
                    <div key={student.id} className="bg-[#131313] border border-slate-800 p-4 hover:border-slate-700 transition-colors">
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        {/* Student Info */}
                        <div className="flex items-center gap-3 min-w-[200px]">
                          <div className="w-9 h-9 bg-slate-800 flex items-center justify-center font-mono text-xs text-white font-bold flex-shrink-0">
                            {student.full_name?.charAt(0) || '?'}
                          </div>
                          <div>
                            <p className="font-sans text-sm text-white font-medium">{student.full_name}</p>
                            <p className="font-mono text-[9px] text-slate-500">{student.student_id || '—'}</p>
                          </div>
                        </div>

                        {/* Status Buttons */}
                        <div className="flex items-center gap-2 flex-1">
                          {(Object.entries(STATUS_CONFIG) as [Status, typeof STATUS_CONFIG[Status]][]).map(([key, config]) => {
                            const Icon = config.icon
                            const isActive = currentStatus === key
                            return (
                              <button
                                key={key}
                                onClick={() => setStatus(student.id, key)}
                                className={`flex items-center gap-1.5 px-3 py-2 border font-mono text-[9px] uppercase tracking-widest transition-all ${isActive ? `${config.bg} ${config.color}` : 'border-slate-800 text-slate-600 hover:border-slate-600'}`}
                              >
                                <Icon className="w-3 h-3" /> {config.label}
                              </button>
                            )
                          })}
                        </div>

                        {/* Rate Badge */}
                        {rate.total > 0 && (
                          <span className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 border flex-shrink-0 ${rate.pct >= 90 ? 'border-emerald-500/50 text-emerald-400 bg-emerald-500/10' : rate.pct >= 75 ? 'border-amber-500/50 text-amber-400 bg-amber-500/10' : 'border-red-500/50 text-red-400 bg-red-500/10'}`}>
                            {rate.pct}%
                          </span>
                        )}

                        {/* Note */}
                        <input
                          value={notes[student.id] || ''}
                          onChange={e => setNotes(prev => ({ ...prev, [student.id]: e.target.value }))}
                          placeholder="Note..."
                          className="w-full md:w-32 bg-[#0a0a0a] border border-slate-800 px-2 py-1.5 font-mono text-[10px] text-slate-300 placeholder:text-slate-700 focus:outline-none focus:border-slate-600 flex-shrink-0"
                        />
                      </div>
                    </div>
                  )
                })
              )}
            </div>

            {/* Save (Sticky) */}
            {students.length > 0 && (
              <div className="sticky bottom-4 z-30 flex items-center justify-between bg-[#131313]/95 backdrop-blur-sm border border-slate-800 p-4">
                <span className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">
                  {markedCount}/{students.length} marked • {selectedDate}
                </span>
                <Button onClick={handleSave} disabled={saving}
                  className="rounded-none font-mono text-[10px] uppercase tracking-widest bg-emerald-500 hover:bg-emerald-400 text-black px-8 h-10 border-2 border-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-2" /> COMMIT_ATTENDANCE</>}
                </Button>
              </div>
            )}
          </>
        ) : (
          /* Calendar View */
          <div className="bg-[#131313] border border-slate-800 p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={() => setCalMonth(p => ({ year: p.month === 0 ? p.year - 1 : p.year, month: p.month === 0 ? 11 : p.month - 1 }))} className="text-slate-500 hover:text-white"><ChevronLeft className="w-5 h-5" /></button>
              <h3 className="font-mono text-sm text-white uppercase tracking-widest">{monthNames[calMonth.month]} {calMonth.year}</h3>
              <button onClick={() => setCalMonth(p => ({ year: p.month === 11 ? p.year + 1 : p.year, month: p.month === 11 ? 0 : p.month + 1 }))} className="text-slate-500 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
            </div>

            <div className="grid grid-cols-7 gap-1 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                <div key={d} className="text-center font-mono text-[9px] text-slate-600 uppercase tracking-widest py-2">{d}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                if (day === null) return <div key={`empty-${i}`} />
                const stats = getDateStats(day)
                const dateStr = `${calMonth.year}-${String(calMonth.month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                const isToday = dateStr === today
                const isSelected = dateStr === selectedDate

                return (
                  <button
                    key={day}
                    onClick={() => { setSelectedDate(dateStr); setView('list') }}
                    className={`relative p-2 h-16 border text-left transition-colors ${isSelected ? 'border-emerald-400 bg-emerald-400/10' : isToday ? 'border-emerald-400/30' : 'border-slate-800 hover:border-slate-700'}`}
                  >
                    <span className={`font-mono text-xs ${isToday ? 'text-emerald-400 font-bold' : 'text-slate-400'}`}>{day}</span>
                    {stats && (
                      <div className={`mt-1 font-mono text-[9px] font-bold ${stats.pct >= 90 ? 'text-emerald-400' : stats.pct >= 75 ? 'text-amber-400' : 'text-red-400'}`}>
                        {stats.pct}%
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>
  )
}
