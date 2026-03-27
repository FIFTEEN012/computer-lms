"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClassSchema } from '@/lib/validations'
import { createClassAction } from '@/app/actions/teacher'
import * as z from 'zod'
import { Plus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'

export default function CreateClassModal() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<z.infer<typeof createClassSchema>>({
    resolver: zodResolver(createClassSchema),
    defaultValues: { name: "", description: "", class_code: "", academic_year: "2024-2025", semester: 1 },
  })

  async function onSubmit(data: z.infer<typeof createClassSchema>) {
    setLoading(true)
    const result = await createClassAction(data)
    setLoading(false)

    if (result.error) {
      toast({ title: "COMPILATION_ERROR", description: result.error, variant: "destructive" })
    } else {
      toast({ title: "DEPLOYMENT_SUCCESS", description: "Node Instantiated successfully." })
      setOpen(false)
      form.reset()
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-mono text-[10px] font-bold tracking-widest uppercase rounded-none h-10 shadow-[0_0_15px_rgba(var(--primary),0.3)] hover:shadow-[0_0_25px_rgba(var(--primary),0.5)] transition-all">
          <Plus className="w-4 h-4 mr-2" /> CREATE_NODE (CLASS)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#131313] border-primary dark:border-primary shadow-[0_0_40px_rgba(var(--primary),0.1)] rounded-none">
        <DialogHeader>
          <DialogTitle className="font-sans font-black tracking-widest uppercase text-slate-900 dark:text-white flex items-center">
            <span className="w-2 h-4 bg-primary mr-3"></span>
            INITIALIZE_CLASS_NODE
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 font-mono mt-4 relative z-10 w-full">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.03),rgba(0,0,0,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none -z-10"></div>
          
          <div className="relative z-10 group">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest group-focus-within:text-primary transition-colors">Course_Identity (Name)</label>
            <input {...form.register('name')} disabled={loading} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 p-2 text-primary focus:border-primary focus:outline-none transition-colors text-xs placeholder:text-slate-400" placeholder="e.g. Data Structures & Algorithms" />
            {form.formState.errors.name && <p className="text-[9px] text-red-500 mt-1">{form.formState.errors.name.message}</p>}
          </div>

          <div className="relative z-10 group">
            <label className="text-[10px] text-slate-500 uppercase tracking-widest group-focus-within:text-primary transition-colors">Description</label>
            <input {...form.register('description')} disabled={loading} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 p-2 text-primary focus:border-primary focus:outline-none transition-colors text-xs placeholder:text-slate-400" placeholder="Optional brief..." />
          </div>

          <div className="grid grid-cols-2 gap-4 relative z-10">
            <div className="group">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest group-focus-within:text-blue-500 transition-colors">Access_Code</label>
              <input {...form.register('class_code')} disabled={loading} className="w-full bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 p-2 text-blue-500 focus:border-blue-500 focus:outline-none transition-colors text-xs uppercase placeholder:text-slate-400" placeholder="CS204" />
              {form.formState.errors.class_code && <p className="text-[9px] text-red-500 mt-1">{form.formState.errors.class_code.message}</p>}
            </div>
            
            <div className="group">
              <label className="text-[10px] text-slate-500 uppercase tracking-widest group-focus-within:text-emerald-500 transition-colors">Term (Year/Sem)</label>
              <div className="flex gap-2">
                <input {...form.register('academic_year')} disabled={loading} className="w-2/3 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 p-2 text-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors text-xs placeholder:text-slate-400" placeholder="2026-2027" />
                <input type="number" {...form.register('semester')} disabled={loading} className="w-1/3 bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 p-2 text-emerald-500 focus:border-emerald-500 focus:outline-none transition-colors text-xs" />
              </div>
            </div>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full rounded-none font-bold tracking-widest uppercase mt-6 relative z-10 shadow-[0_0_15px_rgba(var(--primary),0.3)]">
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : "EXECUTE_DEPLOYMENT"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
