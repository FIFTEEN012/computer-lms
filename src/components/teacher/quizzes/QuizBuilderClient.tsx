"use client"

import { useState, useCallback } from 'react'
import { Plus, GripVertical, Trash2, Copy, Save, Eye, EyeOff, ChevronDown, CheckCircle2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { updateQuizAction, updateQuizQuestionsAction } from '@/app/actions/quiz'
import { useToast } from '@/hooks/useToast'
import {
  DndContext, closestCenter, KeyboardSensor,
  PointerSensor, useSensor, useSensors, DragEndEvent
} from '@dnd-kit/core'
import {
  SortableContext, sortableKeyboardCoordinates,
  useSortable, verticalListSortingStrategy, arrayMove
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

type QuestionType = 'multiple_choice' | 'true_false' | 'short_answer'

interface Question {
  id: string
  quiz_id: string
  question: string
  question_type: QuestionType
  options: string[] | null
  correct_answer: string
  points: number
  order_num: number
}

// ── Sortable Question Card ────────────────────────────────────────
function SortableQuestion({
  q, idx, onChange, onDuplicate, onDelete
}: {
  q: Question, idx: number,
  onChange: (id: string, field: string, value: any) => void,
  onDuplicate: (id: string) => void,
  onDelete: (id: string) => void,
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: q.id })
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 }

  return (
    <div ref={setNodeRef} style={style} className={`bg-[#131313] border ${isDragging ? 'border-emerald-500' : 'border-slate-800'} group`}>
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border-b border-slate-800">
        <button {...attributes} {...listeners} className="cursor-grab text-slate-600 hover:text-slate-400 touch-none">
          <GripVertical className="w-4 h-4" />
        </button>
        <span className="font-mono text-[10px] uppercase tracking-widest text-slate-500">Q{idx + 1}</span>

        {/* Type selector */}
        <select
          value={q.question_type}
          onChange={e => onChange(q.id, 'question_type', e.target.value)}
          className="ml-auto bg-[#0a0a0a] border border-slate-800 text-slate-300 font-mono text-[10px] uppercase tracking-widest px-2 py-1 focus:outline-none focus:border-emerald-500"
        >
          <option value="multiple_choice">Multiple Choice</option>
          <option value="true_false">True / False</option>
          <option value="short_answer">Short Answer</option>
        </select>

        <input
          type="number" min={1}
          value={q.points}
          onChange={e => onChange(q.id, 'points', parseInt(e.target.value) || 1)}
          className="w-14 bg-[#0a0a0a] border border-slate-800 text-emerald-400 font-mono text-xs px-2 py-1 text-center focus:outline-none focus:border-emerald-500"
          title="Points"
        />
        <span className="font-mono text-[9px] text-slate-600 uppercase">pts</span>

        <div className="flex items-center gap-1 ml-2">
          <button onClick={() => onDuplicate(q.id)} className="p-1 text-slate-600 hover:text-cyan-400 transition-colors">
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button onClick={() => onDelete(q.id)} className="p-1 text-slate-600 hover:text-red-400 transition-colors">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        <textarea
          value={q.question}
          onChange={e => onChange(q.id, 'question', e.target.value)}
          className="w-full bg-[#0a0a0a] border border-slate-800 px-4 py-3 font-sans text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors resize-none"
          rows={2}
          placeholder="Enter question text..."
        />

        {q.question_type === 'multiple_choice' && (
          <div className="space-y-2">
            {(q.options || ['', '', '', '']).map((opt, oi) => (
              <div key={oi} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => onChange(q.id, 'correct_answer', String(oi))}
                  className={`flex-shrink-0 w-5 h-5 border-2 ${q.correct_answer === String(oi) ? 'border-emerald-400 bg-emerald-400' : 'border-slate-700'} transition-colors`}
                  title="Mark correct"
                >
                  {q.correct_answer === String(oi) && <CheckCircle2 className="w-3 h-3 mx-auto text-black mt-0.5" />}
                </button>
                <input
                  value={opt}
                  onChange={e => {
                    const newOpts = [...(q.options || ['', '', '', ''])]
                    newOpts[oi] = e.target.value
                    onChange(q.id, 'options', newOpts)
                  }}
                  className="flex-1 bg-[#0a0a0a] border border-slate-800 px-3 py-2 font-sans text-sm text-white placeholder:text-slate-700 focus:outline-none focus:border-slate-600 transition-colors"
                  placeholder={`Option ${oi + 1}`}
                />
              </div>
            ))}
            <p className="font-mono text-[9px] text-slate-600 uppercase tracking-widest">Click checkbox to mark correct answer</p>
          </div>
        )}

        {q.question_type === 'true_false' && (
          <div className="flex gap-4">
            {['true', 'false'].map(val => (
              <button
                key={val}
                type="button"
                onClick={() => onChange(q.id, 'correct_answer', val)}
                className={`flex-1 py-3 font-mono text-xs uppercase tracking-widest border-2 transition-colors ${q.correct_answer === val ? (val === 'true' ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' : 'border-red-400 bg-red-400/10 text-red-400') : 'border-slate-800 text-slate-500 hover:border-slate-600'}`}
              >
                {val === 'true' ? '✓ True' : '✗ False'}
              </button>
            ))}
          </div>
        )}

        {q.question_type === 'short_answer' && (
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Model Answer (case-insensitive match)</label>
            <input
              value={q.correct_answer}
              onChange={e => onChange(q.id, 'correct_answer', e.target.value)}
              className="w-full bg-[#0a0a0a] border border-slate-800 px-4 py-3 font-sans text-sm text-emerald-400 placeholder:text-slate-700 focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="Model answer..."
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ── Main Builder ─────────────────────────────────────────────────
export default function QuizBuilderClient({ quiz, initialQuestions, classId }: {
  quiz: any, initialQuestions: Question[], classId: string
}) {
  const [settings, setSettings] = useState({
    title: quiz.title || '',
    time_limit_minutes: quiz.time_limit_minutes || '',
    max_attempts: quiz.max_attempts || 1,
    passing_score: quiz.passing_score || 60,
    is_published: quiz.is_published || false,
  })
  const [questions, setQuestions] = useState<Question[]>(initialQuestions)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const { toast } = useToast()

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      setQuestions(items => {
        const oldIdx = items.findIndex(i => i.id === active.id)
        const newIdx = items.findIndex(i => i.id === over.id)
        return arrayMove(items, oldIdx, newIdx)
      })
    }
  }

  const addQuestion = (type: QuestionType) => {
    const newQ: Question = {
      id: `new_${Date.now()}`,
      quiz_id: quiz.id,
      question: '',
      question_type: type,
      options: type === 'multiple_choice' ? ['', '', '', ''] : null,
      correct_answer: type === 'true_false' ? 'true' : type === 'multiple_choice' ? '0' : '',
      points: 1,
      order_num: questions.length + 1,
    }
    setQuestions(prev => [...prev, newQ])
  }

  const handleChange = useCallback((id: string, field: string, value: any) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, [field]: value } : q))
  }, [])

  const handleDuplicate = useCallback((id: string) => {
    const orig = questions.find(q => q.id === id)
    if (!orig) return
    setQuestions(prev => [...prev, { ...orig, id: `new_${Date.now()}` }])
  }, [questions])

  const handleDelete = useCallback((id: string) => {
    setQuestions(prev => prev.filter(q => q.id !== id))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    const settingsRes = await updateQuizAction(quiz.id, classId, {
      title: settings.title,
      time_limit_minutes: settings.time_limit_minutes ? Number(settings.time_limit_minutes) : null,
      max_attempts: Number(settings.max_attempts),
      passing_score: Number(settings.passing_score),
      is_published: settings.is_published,
    })
    if (settingsRes?.error) {
      toast({ title: "SAVE_FAILURE", description: settingsRes.error, variant: "destructive" })
      setSaving(false)
      return
    }

    const questionsRes = await updateQuizQuestionsAction(quiz.id, questions)
    setSaving(false)
    if (questionsRes?.error) {
      toast({ title: "QUESTION_SAVE_FAILURE", description: questionsRes.error, variant: "destructive" })
    } else {
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
      toast({ title: "ASSESSMENT_SAVED", description: "All parameters committed to database." })
    }
  }

  const totalPoints = questions.reduce((s, q) => s + (q.points || 1), 0)

  return (
    <div className="space-y-8">
      {/* Settings Panel */}
      <div className="bg-[#131313] border border-slate-800">
        <div className="px-6 py-4 bg-[#1a1a1a] border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-emerald-400">ASSESSMENT_PARAMETERS</h2>
        </div>
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">Title *</label>
            <input
              value={settings.title}
              onChange={e => setSettings(s => ({ ...s, title: e.target.value }))}
              className="w-full bg-[#0a0a0a] border border-slate-800 px-4 py-3 text-white font-sans text-sm focus:outline-none focus:border-emerald-500 transition-colors uppercase"
            />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">Time Limit (minutes, 0=unlimited)</label>
            <input type="number" min={0} value={settings.time_limit_minutes}
              onChange={e => setSettings(s => ({ ...s, time_limit_minutes: e.target.value }))}
              className="w-full bg-[#0a0a0a] border border-slate-800 px-4 py-3 text-white font-sans text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              placeholder="30"
            />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">Max Attempts</label>
            <input type="number" min={1} value={settings.max_attempts}
              onChange={e => setSettings(s => ({ ...s, max_attempts: e.target.value }))}
              className="w-full bg-[#0a0a0a] border border-slate-800 px-4 py-3 text-white font-sans text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="space-y-2">
            <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest block">Passing Score %</label>
            <input type="number" min={0} max={100} value={settings.passing_score}
              onChange={e => setSettings(s => ({ ...s, passing_score: e.target.value }))}
              className="w-full bg-[#0a0a0a] border border-slate-800 px-4 py-3 text-white font-sans text-sm focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <div className="flex items-center gap-4">
            <label className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">Published</label>
            <button
              onClick={() => setSettings(s => ({ ...s, is_published: !s.is_published }))}
              className={`relative inline-flex h-6 w-11 items-center rounded-none border-2 transition-colors ${settings.is_published ? 'bg-emerald-500 border-emerald-400' : 'bg-slate-800 border-slate-700'}`}
            >
              <span className={`inline-block h-4 w-4 transform bg-white transition-transform ${settings.is_published ? 'translate-x-5' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="flex items-center gap-6 text-center border border-slate-800 bg-[#131313] p-4">
        <div><div className="text-white font-black text-2xl">{questions.length}</div><div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Questions</div></div>
        <div className="h-8 w-px bg-slate-800" />
        <div><div className="text-emerald-400 font-black text-2xl">{totalPoints}</div><div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Total Points</div></div>
        <div className="h-8 w-px bg-slate-800" />
        <div><div className="text-cyan-400 font-black text-2xl">{settings.passing_score}%</div><div className="font-mono text-[9px] text-slate-500 uppercase tracking-widest">Pass Threshold</div></div>
      </div>

      {/* Questions DnD Area */}
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <h2 className="font-mono text-[10px] uppercase tracking-widest text-slate-400 flex-1">QUESTION_MATRIX // {questions.length} nodes</h2>
        </div>

        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={questions.map(q => q.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-3">
              {questions.map((q, idx) => (
                <SortableQuestion
                  key={q.id} q={q} idx={idx}
                  onChange={handleChange}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {questions.length === 0 && (
          <div className="py-16 flex flex-col items-center border-2 border-dashed border-slate-800 bg-[#131313] text-center">
            <p className="font-mono text-[10px] uppercase tracking-widest text-slate-600">NO_QUESTIONS_INITIALIZED.<br/>SELECT A TYPE BELOW TO BEGIN.</p>
          </div>
        )}
      </div>

      {/* Add Question Buttons */}
      <div className="flex flex-wrap gap-3 border-t border-slate-800 pt-6">
        <span className="font-mono text-[10px] text-slate-600 uppercase tracking-widest self-center mr-2">Add↓</span>
        {([
          ['multiple_choice', 'Multiple Choice', 'text-cyan-400 border-cyan-400/30 hover:border-cyan-400 hover:bg-cyan-400/10'],
          ['true_false', 'True / False', 'text-fuchsia-400 border-fuchsia-400/30 hover:border-fuchsia-400 hover:bg-fuchsia-400/10'],
          ['short_answer', 'Short Answer', 'text-amber-400 border-amber-400/30 hover:border-amber-400 hover:bg-amber-400/10'],
        ] as const).map(([type, label, cls]) => (
          <Button key={type} onClick={() => addQuestion(type as QuestionType)}
            variant="ghost"
            className={`rounded-none font-mono text-[10px] uppercase tracking-widest border ${cls} transition-all`}
          >
            <Plus className="w-3 h-3 mr-2" />{label}
          </Button>
        ))}
      </div>

      {/* Save Button */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-slate-800 bg-[#0a0a0a]/95 backdrop-blur-sm px-4 py-4 flex items-center justify-end">
        <Button onClick={handleSave} disabled={saving}
          className={`h-12 px-10 rounded-none font-mono text-sm uppercase tracking-widest border-2 transition-all ${saved ? 'border-emerald-400 bg-emerald-400/10 text-emerald-400' : 'border-emerald-400 bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_20px_rgba(16,185,129,0.3)]'}`}
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : saved ? <><CheckCircle2 className="w-4 h-4 mr-2" /> SAVED</> : <><Save className="w-4 h-4 mr-2" /> COMMIT_CHANGES</>}
        </Button>
      </div>
    </div>
  )
}
