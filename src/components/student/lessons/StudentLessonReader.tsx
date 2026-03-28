"use client"

import { useState, useMemo, useCallback } from 'react'
import { markLessonCompleteAction, awardCodePlaygroundXP } from '@/app/actions/lessons'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight, ArrowLeft, Loader2, Zap, Award, Info, ChevronLeft, ChevronRight } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useRouter } from 'next/navigation'
import { sanitizeHTML } from '@/lib/sanitize'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import type { SupportedLanguageId } from '@/lib/piston'

const CodeEditor = dynamic(() => import('@/components/lesson/CodeEditor'), {
  ssr: false,
  loading: () => (
    <div className="min-h-[400px] bg-surface-container-lowest border border-white/5 flex items-center justify-center text-primary-fixed font-mono text-sm animate-pulse">
      LOADING_CODE_EDITOR...
    </div>
  ),
})

type PlaygroundBlock = {
  language: SupportedLanguageId
  starterCode: string
  instructions: string
}

function parseContentWithPlaygrounds(html: string): (string | PlaygroundBlock)[] {
  const parts: (string | PlaygroundBlock)[] = []
  const regex = /<div[^>]*data-code-playground="true"[^>]*data-language="([^"]*)"[^>]*data-starter-code="([^"]*)"[^>]*data-instructions="([^"]*)"[^>]*>[\s\S]*?<\/div>/g
  let lastIndex = 0
  let match

  while ((match = regex.exec(html)) !== null) {
    if (match.index > lastIndex) {
      parts.push(html.slice(lastIndex, match.index))
    }
    try {
      const lang = match[1] as SupportedLanguageId
      const code = decodeURIComponent(escape(atob(match[2])))
      const instructions = match[3] ? decodeURIComponent(escape(atob(match[3]))) : ''
      parts.push({ language: lang, starterCode: code, instructions })
    } catch {
      parts.push(match[0])
    }
    lastIndex = match.index + match[0].length
  }

  if (lastIndex < html.length) {
    parts.push(html.slice(lastIndex))
  }

  return parts
}

type Props = {
  lesson: any
  classId: string
  isCompleted: boolean
  prevLesson?: { id: string; title: string } | null
  nextLesson?: { id: string; title: string } | null
  lessonNumber?: number
  totalLessons?: number
}

export default function StudentLessonReader({ lesson, classId, isCompleted, prevLesson, nextLesson, lessonNumber, totalLessons }: Props) {
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(isCompleted)
  const { toast } = useToast()
  const router = useRouter()

  const contentParts = useMemo(() => parseContentWithPlaygrounds(lesson.content || '<p>Awaiting text stream...</p>'), [lesson.content])

  // Separate text and playground parts
  const textParts = contentParts.filter((p): p is string => typeof p === 'string')
  const playgroundParts = contentParts.filter((p): p is PlaygroundBlock => typeof p !== 'string')
  const hasPlaygrounds = playgroundParts.length > 0

  const handleFirstRun = useCallback(async () => {
    const res = await awardCodePlaygroundXP(lesson.id)
    if (res && !res.error && res.xpGained && res.xpGained > 0) {
      toast({ title: "CODE_EXECUTED", description: `+${res.xpGained} XP สำหรับการรันโค้ดครั้งแรก!` })
    }
  }, [lesson.id, toast])

  const handleComplete = async () => {
    setLoading(true)
    const res = await markLessonCompleteAction(lesson.id, classId)
    setLoading(false)

    if (res?.error) {
      toast({ title: "VERIFICATION_FAILURE", description: res.error, variant: "destructive" })
    } else {
      setComplete(true)
      if (res.xpGained) {
        toast({ title: "MODULE_RESOLVED", description: `INTELLIGENCE UPGRADED: +${res.xpGained} XP.` })
      }
      router.refresh()
    }
  }

  const proseClasses = "prose prose-invert prose-sm max-w-none text-on-surface-variant font-body leading-relaxed prose-headings:font-headline prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-white prose-a:text-primary-fixed hover:prose-a:text-white prose-strong:text-primary-fixed prose-code:text-secondary prose-code:font-mono prose-code:bg-surface-container-high prose-code:px-1 prose-pre:bg-black/80 prose-pre:border prose-pre:border-white/10 prose-img:rounded-none prose-li:text-on-surface-variant"

  // ─── Two-Column Layout (when code playgrounds exist) ───
  if (hasPlaygrounds) {
    return (
      <div className="space-y-8 pb-16">
        <div className="grid grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Instructions Column */}
          <div className="col-span-12 lg:col-span-4 space-y-4 lg:sticky lg:top-24">
            {/* Instruction Panel */}
            <section className="bg-surface-container-low p-6 border-l border-primary-fixed/20 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 text-[10px] font-label text-primary-fixed/30 uppercase tracking-tighter">DATA_STREAM.LOG</div>
              <h2 className="font-headline text-lg text-primary-fixed mb-4 flex items-center gap-2">
                <Info className="w-4 h-4" />
                INSTRUCTION_SET
              </h2>
              <div className={proseClasses}>
                {textParts.map((part, i) => (
                  <div key={i} dangerouslySetInnerHTML={{ __html: sanitizeHTML(part) }} />
                ))}
                {textParts.length === 0 && (
                  <p className="text-outline">No instructions provided for this module.</p>
                )}
              </div>
            </section>

            {/* XP Reward Card */}
            <div className="p-4 bg-surface-container-high border-t border-b border-white/5 flex items-center justify-between group cursor-default">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-tertiary-container/10 flex items-center justify-center">
                  <Award className="w-5 h-5 text-tertiary-fixed" />
                </div>
                <div>
                  <div className="font-label text-xs text-tertiary-fixed tracking-widest uppercase">XP Reward Potential</div>
                  <div className="font-headline text-lg text-white">+5 XP for first execution</div>
                </div>
              </div>
              <Zap className="w-5 h-5 text-outline group-hover:text-tertiary-fixed transition-colors" />
            </div>

            {/* Complete Button (in sidebar) */}
            <div className="pt-2">
              {complete ? (
                <button disabled className="w-full py-4 border border-tertiary-fixed/30 bg-tertiary-fixed/5 text-tertiary-fixed font-headline font-bold text-xs tracking-[0.3em] uppercase flex items-center justify-center gap-3">
                  <Check className="w-4 h-4" /> VERIFIED_COMPLETE
                </button>
              ) : (
                <button onClick={handleComplete} disabled={loading} className="w-full py-4 bg-primary-fixed text-on-primary-fixed font-headline font-bold text-xs tracking-[0.3em] uppercase flex items-center justify-center gap-3 hover:shadow-[0_0_20px_#00fbfb] transition-all active:scale-[0.98]">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> SYNCHRONIZE_PROGRESS</>}
                </button>
              )}
            </div>
          </div>

          {/* Code Editor Column */}
          <div className="col-span-12 lg:col-span-8 flex flex-col gap-4">
            {playgroundParts.map((playground, i) => (
              <CodeEditor
                key={i}
                language={playground.language}
                starterCode={playground.starterCode}
                instructions={playground.instructions}
                lessonId={lesson.id}
                onFirstRun={handleFirstRun}
              />
            ))}
          </div>
        </div>

        {/* Navigation Footer - Stitch Style */}
        <NavigationFooter
          classId={classId}
          prevLesson={prevLesson}
          nextLesson={nextLesson}
          lessonNumber={lessonNumber}
          totalLessons={totalLessons}
        />
      </div>
    )
  }

  // ─── Single-Column Layout (no code playgrounds) ───
  return (
    <div className="space-y-8 pb-16">
      <div className="bg-surface-container-low border-l border-primary-fixed/20 p-8 md:p-12 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-3 text-[10px] font-label text-primary-fixed/30 uppercase tracking-tighter">DATA_STREAM.LOG</div>
        <div className="scanline-overlay absolute inset-0 opacity-[0.04] pointer-events-none z-0" />

        <div className="relative z-10 space-y-6">
          {contentParts.map((part, i) =>
            typeof part === 'string' ? (
              <div key={i} className={proseClasses} dangerouslySetInnerHTML={{ __html: sanitizeHTML(part) }} />
            ) : (
              <CodeEditor
                key={i}
                language={part.language}
                starterCode={part.starterCode}
                instructions={part.instructions}
                lessonId={lesson.id}
                onFirstRun={handleFirstRun}
              />
            )
          )}
        </div>
      </div>

      {/* Complete Button */}
      <div className="flex justify-end">
        {complete ? (
          <button disabled className="py-4 px-10 border border-tertiary-fixed/30 bg-tertiary-fixed/5 text-tertiary-fixed font-headline font-bold text-xs tracking-[0.3em] uppercase flex items-center gap-3">
            <Check className="w-4 h-4" /> VERIFIED_COMPLETE
          </button>
        ) : (
          <button onClick={handleComplete} disabled={loading} className="py-4 px-10 bg-primary-fixed text-on-primary-fixed font-headline font-bold text-xs tracking-[0.3em] uppercase flex items-center gap-3 hover:shadow-[0_0_20px_#00fbfb] transition-all active:scale-[0.98]">
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><ArrowRight className="w-4 h-4" /> SYNCHRONIZE_PROGRESS</>}
          </button>
        )}
      </div>

      {/* Navigation Footer */}
      <NavigationFooter
        classId={classId}
        prevLesson={prevLesson}
        nextLesson={nextLesson}
        lessonNumber={lessonNumber}
        totalLessons={totalLessons}
      />
    </div>
  )
}

function NavigationFooter({ classId, prevLesson, nextLesson, lessonNumber, totalLessons }: {
  classId: string
  prevLesson?: { id: string; title: string } | null
  nextLesson?: { id: string; title: string } | null
  lessonNumber?: number
  totalLessons?: number
}) {
  return (
    <footer className="pt-8 flex justify-between items-center border-t border-white/5">
      {prevLesson ? (
        <Link href={`/student/lessons/${prevLesson.id}`} className="flex items-center gap-3 group text-outline hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <div className="text-left">
            <div className="text-[10px] font-label uppercase tracking-widest opacity-50">Previous</div>
            <div className="font-headline font-bold uppercase tracking-tight text-sm">{prevLesson.title.length > 24 ? prevLesson.title.slice(0, 24) + '...' : prevLesson.title}</div>
          </div>
        </Link>
      ) : (
        <Link href={`/student/classes/${classId}`} className="flex items-center gap-3 group text-outline hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <div className="text-left">
            <div className="text-[10px] font-label uppercase tracking-widest opacity-50">Back</div>
            <div className="font-headline font-bold uppercase tracking-tight text-sm">CLASS_INDEX</div>
          </div>
        </Link>
      )}

      {lessonNumber && totalLessons && (
        <div className="hidden md:flex gap-1 text-[10px] font-label text-outline/40 tracking-widest uppercase">
          <span>Section_{String(lessonNumber).padStart(2, '0')}</span>
          <span className="text-primary-fixed/30">//</span>
          <span>Total_{String(totalLessons).padStart(2, '0')}</span>
        </div>
      )}

      {nextLesson ? (
        <Link href={`/student/lessons/${nextLesson.id}`} className="flex items-center gap-3 group text-primary-fixed hover:text-white transition-colors">
          <div className="text-right">
            <div className="text-[10px] font-label uppercase tracking-widest opacity-50">Continue</div>
            <div className="font-headline font-bold uppercase tracking-tight text-sm">{nextLesson.title.length > 24 ? nextLesson.title.slice(0, 24) + '...' : nextLesson.title}</div>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      ) : (
        <Link href={`/student/classes/${classId}`} className="flex items-center gap-3 group text-primary-fixed hover:text-white transition-colors">
          <div className="text-right">
            <div className="text-[10px] font-label uppercase tracking-widest opacity-50">Complete</div>
            <div className="font-headline font-bold uppercase tracking-tight text-sm">BACK_TO_CLASS</div>
          </div>
          <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </Link>
      )}
    </footer>
  )
}
