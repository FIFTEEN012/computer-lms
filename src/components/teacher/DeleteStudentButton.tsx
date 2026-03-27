"use client"

import { useState } from 'react'
import { Trash2, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { removeStudentAction } from '@/app/actions/teacher'
import { useToast } from '@/hooks/useToast'

interface DeleteStudentButtonProps {
  classId: string
  studentId: string
}

import { ConfirmDialog } from '@/components/ui/confirm-dialog'

export default function DeleteStudentButton({ classId, studentId }: DeleteStudentButtonProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await removeStudentAction(classId, studentId)
      if (res.error) {
        toast({ title: 'ERROR', description: res.error, variant: 'destructive' })
      } else {
        toast({ title: 'DISCONNECTED', description: 'Student removed from class.' })
      }
    } catch (err) {
      toast({ title: 'SYSTEM_FAILURE', description: 'An unexpected error occurred.', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <ConfirmDialog
      title="DISCONNECT_ENTITY"
      description="Proceeding will terminate this student's access to the current class sequence. All progress within this cluster will be archived but inaccessible."
      onConfirm={handleDelete}
      confirmText="TERMINATE_ACCESS"
      variant="destructive"
    >
      <Button 
        disabled={loading}
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin text-red-500" /> : <Trash2 className="w-4 h-4" />}
      </Button>
    </ConfirmDialog>
  )
}
