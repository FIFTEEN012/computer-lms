"use client"

import { useState } from 'react'
import { UserPlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { addStudentByEmailAction } from '@/app/actions/teacher'
import { useToast } from '@/hooks/useToast'

export default function AddStudentForm({ classId }: { classId: string }) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleManualAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    
    const result = await addStudentByEmailAction(classId, email)
    setLoading(false)

    if (result.error) {
       toast({ title: "ATTACHMENT_FAILED", description: result.error, variant: "destructive" })
    } else {
       toast({ title: "ATTACHMENT_SUCCESS", description: `Node bound to classroom successfully.` })
       setEmail('')
    }
  }

  return (
    <form onSubmit={handleManualAdd} className="flex flex-col sm:flex-row gap-3">
      <div className="relative group flex-1">
        <label className="absolute -top-2 left-2 bg-white dark:bg-[#1c1b1b] px-1 text-[8px] font-mono text-slate-500 uppercase tracking-widest group-focus-within:text-primary transition-colors">STUDENT_IDENTIFIER (EMAIL)</label>
        <input 
          type="email" 
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="AGENT@KINETIC.NET" 
          disabled={loading}
          className="w-full bg-transparent border border-slate-200 dark:border-slate-800 p-3 h-10 text-slate-900 dark:text-primary focus:border-primary focus:outline-none transition-colors text-xs font-mono uppercase placeholder:text-slate-400" 
        />
        <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-primary group-focus-within:w-full transition-all duration-500"></div>
      </div>
      <Button disabled={loading} type="submit" className="font-mono text-[10px] font-bold tracking-widest uppercase rounded-none h-10 shadow-[0_0_10px_rgba(var(--primary),0.2)]">
        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <UserPlus className="w-4 h-4 mr-2" />} APPEND_NODE
      </Button>
    </form>
  )
}
