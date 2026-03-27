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
      <div className="py-12 border border-slate-800 bg-[#1c1b1b] flex flex-col items-center justify-center relative overflow-hidden text-slate-500">
         <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02)_1px,transparent_1px,transparent_4px)] z-0"></div>
         <Terminal className="w-12 h-12 mb-4 opacity-50 relative z-10" />
         <p className="font-mono text-[10px] tracking-widest uppercase text-center max-w-sm relative z-10">AWAITING_CONTENT.<br/>INITIALIZE NEW MODULE TO POPULATE SEQUENCE.</p>
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
