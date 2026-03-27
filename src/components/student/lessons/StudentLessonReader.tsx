"use client"

import { useState } from 'react'
import { markLessonCompleteAction } from '@/app/actions/lessons'
import { Button } from '@/components/ui/button'
import { Check, ArrowRight, Loader2 } from 'lucide-react'
import { useToast } from '@/hooks/useToast'
import { useRouter } from 'next/navigation'
import { sanitizeHTML } from '@/lib/sanitize'
import Link from 'next/link'

export default function StudentLessonReader({ lesson, classId, isCompleted }: { lesson: any, classId: string, isCompleted: boolean }) {
  const [loading, setLoading] = useState(false)
  const [complete, setComplete] = useState(isCompleted)
  const { toast } = useToast()
  const router = useRouter()

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

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-32">
       
       <div className="bg-[#131313] border border-slate-800 p-8 shadow-xl relative overflow-hidden font-body text-slate-300">
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-cyan-500 to-fuchsia-500"></div>
          
          <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-strong:text-cyan-400 prose-code:text-fuchsia-400 prose-code:bg-[#1c1b1b] prose-code:px-1 prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-slate-800 prose-img:rounded-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHTML(lesson.content || '<p>Awaiting text stream...</p>') }} />
       </div>

       <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800 pt-8">
          <Link href={`/student/classes/${classId}`}>
             <Button variant="ghost" className="rounded-none font-mono text-[10px] tracking-widest uppercase text-slate-500 hover:text-cyan-400">
                RETURN_TO_SEQUENCE
             </Button>
          </Link>

          {complete ? (
             <Button disabled className="h-14 px-8 rounded-none font-mono text-sm tracking-widest uppercase font-bold border-2 border-lime-500/50 bg-lime-500/10 text-lime-400">
               <Check className="w-5 h-5 mr-3" /> VERIFIED_COMPLETE
             </Button>
          ) : (
             <Button onClick={handleComplete} disabled={loading} className="h-14 px-8 rounded-none font-mono text-sm tracking-widest uppercase font-bold border-2 border-cyan-400 bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(34,211,238,0.2)] hover:shadow-[0_0_30px_rgba(34,211,238,0.4)] transition-all">
                {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><ArrowRight className="w-5 h-5 mr-3" /> MARK_COMPLETE_AGREEMENT</>}
             </Button>
          )}
       </div>
    </div>
  )
}
