"use client"

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { LessonSortableItem } from './LessonSortableItem'
import { updateLessonOrderAction } from '@/app/actions/lessons'
import { useToast } from '@/hooks/useToast'
import { Terminal } from 'lucide-react'

export default function LessonsListManager({ initialLessons, classId }: { initialLessons: any[], classId: string }) {
  const [items, setItems] = useState(initialLessons)
  const { toast } = useToast()

  useEffect(() => {
    setItems(initialLessons)
  }, [initialLessons])

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: any) => {
    const { active, over } = event
    
    if (active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex(item => item.id === active.id)
        const newIndex = items.findIndex(item => item.id === over.id)
        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Ensure UI updates optimistically, fire background hook mapping persistence
        updateLessonOrderAction(classId, newItems.map(i => i.id)).then(res => {
          if (res?.error) toast({ title: "SYNC_FAILURE", description: res.error, variant: "destructive" })
        })
        
        return newItems
      })
    }
  }

  if (items.length === 0) {
    return (
      <div className="py-24 border border-white/5 bg-black/40 flex flex-col items-center justify-center relative overflow-hidden text-slate-500 group">
         <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>
         <Terminal className="w-16 h-16 mb-8 text-primary opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700 relative z-10 shadow-glow-cyan" />
         <p className="font-heading text-[11px] tracking-[0.4em] uppercase text-center max-w-sm relative z-10 font-black italic leading-relaxed text-slate-600 group-hover:text-slate-400 transition-colors">
            // AWAITING_CONTENT_MANIFEST<br/>
            INITIALIZE NEW MODULE TO POPULATE SEQUENCE.
         </p>
      </div>
    )
  }

  return (
    <DndContext 
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <SortableContext 
        items={items.map(i => i.id)}
        strategy={verticalListSortingStrategy}
      >
        <div className="space-y-3">
          {items.map((lesson) => (
            <LessonSortableItem key={lesson.id} lesson={lesson} classId={classId} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
