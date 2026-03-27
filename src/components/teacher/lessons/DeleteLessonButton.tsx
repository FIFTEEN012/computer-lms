"use client"

import { useState } from 'react'
import { Trash, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import { deleteLessonAction } from '@/app/actions/lessons'
import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export function DeleteLessonButton({ lessonId, classId, lessonTitle }: { lessonId: string, classId: string, lessonTitle: string }) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)
    const res = await deleteLessonAction(lessonId, classId)
    setLoading(false)

    if (res?.error) {
       toast({ title: "DELETE_FAILURE", description: res.error, variant: "destructive" })
    } else {
       toast({ title: "MODULE_SEVERED", description: "Node eliminated from global databanks successfully." })
    }
  }

  return (
    <ConfirmDialog
      title="ELIMINATE_MODULE"
      description={`Proceeding will permanently purge "${lessonTitle}" from the local sequence. This directive is irreversible. Are you sure?`}
      onConfirm={handleDelete}
      confirmText="PURGE_SYSTEM"
      variant="destructive"
    >
      <Button 
        variant="ghost" 
        size="icon" 
        disabled={loading}
        className="text-slate-600 hover:text-red-500 hover:bg-red-500/10 transition-colors h-10 w-10 p-0"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash className="w-4 h-4" />}
      </Button>
    </ConfirmDialog>
  )
}
