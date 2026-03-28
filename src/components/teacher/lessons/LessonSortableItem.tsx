"use client"

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Edit, Trash2, Globe, EyeOff, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useState } from 'react'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { deleteLessonAction } from '@/app/actions/lessons'
import { useToast } from '@/hooks/useToast'

export function LessonSortableItem({ lesson, classId }: { lesson: any, classId: string }) {
  const { toast } = useToast()
  const [isDeleting, setIsDeleting] = useState(false)
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: lesson.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    const result = await deleteLessonAction(lesson.id, classId)
    setIsDeleting(false)
    if (result.error) toast({ title: "SEVERANCE_FAILED", description: result.error, variant: "destructive" })
  }

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={`bg-black/60 border ${isDragging ? 'border-primary shadow-glow-cyan scale-[1.02] z-50' : 'border-white/5'} p-5 flex items-center justify-between group transition-all duration-300 backdrop-blur-xl relative overflow-hidden italic font-heading`}
    >
      <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none z-0"></div>
      
      <div className="flex items-center gap-6 flex-1 relative z-10">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab hover:bg-white/5 p-3 text-slate-700 hover:text-primary transition-all active:cursor-grabbing border border-transparent hover:border-white/10"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-4 mb-3">
            <span className="text-[9px] text-primary font-black uppercase tracking-[0.3em] bg-primary/10 px-3 py-1 border border-primary/20 shadow-[inset_0_0_10px_rgba(34,211,238,0.1)]">
              SEQ_0{lesson.lesson_order}
            </span>
            <span className={`text-[9px] font-black uppercase tracking-[0.3em] flex items-center gap-2 ${lesson.is_published ? 'text-emerald-400' : 'text-slate-600'}`}>
               {lesson.is_published ? <><Globe className="w-3.5 h-3.5 shadow-glow-emerald" /> LIVE_DIRECTIVE</> : <><EyeOff className="w-3.5 h-3.5" /> ENCRYPTED_DRAFT</>}
            </span>
          </div>
          <h3 className="text-lg font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors duration-500 font-heading italic">
            {lesson.title}
          </h3>
        </div>
      </div>

      <div className="flex items-center gap-4 relative z-10">
        <Link href={`/teacher/lessons/${lesson.id}/edit`}>
          <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-none text-slate-600 hover:text-primary hover:bg-white/[0.05] transition-all border border-transparent hover:border-white/10 group-hover:rotate-12">
            <Edit className="w-4 h-4" />
          </Button>
        </Link>
        <ConfirmDialog title="DELETE_NODE" description={`Permantely purge [${lesson.title}] from existence? This cannot be undone.`} onConfirm={handleDelete}>
          <Button disabled={isDeleting} variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-none text-slate-600 hover:text-fuchsia-400 hover:bg-white/[0.05] transition-all border border-transparent hover:border-white/10 group-hover:-rotate-12">
             {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </ConfirmDialog>
      </div>

      <div className="absolute top-0 left-0 w-[2px] h-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity"></div>
    </div>
  )
}
