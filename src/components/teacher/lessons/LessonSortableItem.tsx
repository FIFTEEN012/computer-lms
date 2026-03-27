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
      className={`bg-[#1c1b1b] border ${isDragging ? 'border-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.2)]' : 'border-slate-800'} p-4 flex items-center justify-between group transition-colors`}
    >
      <div className="flex items-center gap-4 flex-1">
        <div 
          {...attributes} 
          {...listeners} 
          className="cursor-grab hover:bg-slate-800 p-2 text-slate-500 hover:text-cyan-400 transition-colors active:cursor-grabbing"
        >
          <GripVertical className="w-5 h-5" />
        </div>
        
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest bg-cyan-400/10 px-2 py-0.5">SEQ_{lesson.lesson_order}</span>
            <span className={`font-mono text-[10px] uppercase tracking-widest flex items-center gap-1 ${lesson.is_published ? 'text-lime-400' : 'text-slate-500'}`}>
               {lesson.is_published ? <><Globe className="w-3 h-3" /> PUBLISHED</> : <><EyeOff className="w-3 h-3" /> DRAFT</>}
            </span>
          </div>
          <h3 className="font-sans font-bold text-white uppercase tracking-wider">{lesson.title}</h3>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Link href={`/teacher/lessons/${lesson.id}/edit`}>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors">
            <Edit className="w-4 h-4" />
          </Button>
        </Link>
        <ConfirmDialog title="DELETE_NODE" description={`Permantely purge [${lesson.title}] from existence? This cannot be undone.`} onConfirm={handleDelete}>
          <Button disabled={isDeleting} variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-none text-slate-400 hover:text-fuchsia-400 hover:bg-slate-800 transition-colors">
             {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </Button>
        </ConfirmDialog>
      </div>
    </div>
  )
}
