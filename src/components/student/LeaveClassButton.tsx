"use client"
import { ConfirmDialog } from '@/components/ui/confirm-dialog'
import { Button } from '@/components/ui/button'
import { leaveClassAction } from '@/app/actions/student'
import { useToast } from '@/hooks/useToast'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

export default function LeaveClassButton({ classId }: { classId: string }) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const handleLeave = async () => {
    setLoading(true)
    const res = await leaveClassAction(classId)
    setLoading(false)
    if (res?.error) toast({ title: "SEVERANCE_FAILED", description: res.error, variant: "destructive" })
    else toast({ title: "SEVERANCE_COMPLETE", description: "Node detached successfully." })
  }

  return (
    <ConfirmDialog 
      title="SEVER_CONNECTION" 
      description="Are you sure you want to completely disconnect from this Master Node? Your progress and attendance records will be irrevocably detached from your active profile."
      onConfirm={handleLeave}
    >
      <Button disabled={loading} variant="ghost" className="rounded-none h-10 border border-slate-800 hover:bg-red-500/10 hover:text-red-500 font-mono text-[10px] uppercase tracking-widest transition-colors cursor-pointer text-slate-500">
        {loading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "SEVER"}
      </Button>
    </ConfirmDialog>
  )
}
