"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createClassSchema } from '@/lib/validations'
import { createClassAction } from '@/app/actions/teacher'
import * as z from 'zod'
import { Plus, Loader2, ArrowRight } from 'lucide-react'
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
        <Button className="font-heading text-[10px] font-black tracking-[0.3em] uppercase rounded-none h-11 bg-primary text-black hover:bg-white transition-all shadow-glow-cyan italic border-none">
          <Plus className="w-4 h-4 mr-3" /> CREATE_NODE (CLASS)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] bg-black/90 border-primary shadow-2xl rounded-none backdrop-blur-2xl">
        <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>
        <DialogHeader className="relative z-10">
          <DialogTitle className="font-heading font-black tracking-[0.2em] uppercase text-white flex items-center italic text-shadow-neon-cyan">
            <span className="w-2.5 h-5 bg-primary mr-4 shadow-glow-cyan"></span>
            INITIALIZE_CLASS_NODE
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 font-heading mt-6 relative z-10 w-full italic">
          
          <div className="relative z-10 group">
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] group-focus-within:text-primary transition-colors font-black">COURSE_IDENTITY (NAME)</label>
            <input {...form.register('name')} disabled={loading} className="w-full bg-white/[0.03] border border-white/10 p-3 text-primary focus:border-primary focus:outline-none transition-all text-xs placeholder:text-slate-700 font-body not-italic mt-2" placeholder="e.g. Data Structures & Algorithms" />
            {form.formState.errors.name && <p className="text-[9px] text-red-500 mt-2 font-black tracking-widest uppercase">{form.formState.errors.name.message}</p>}
          </div>

          <div className="relative z-10 group">
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] group-focus-within:text-primary transition-colors font-black">BRIEF_DESCRIPTION</label>
            <input {...form.register('description')} disabled={loading} className="w-full bg-white/[0.03] border border-white/10 p-3 text-white focus:border-primary focus:outline-none transition-all text-xs placeholder:text-slate-700 font-body not-italic mt-2" placeholder="OPTIONAL_SYSTEM_INTEL..." />
          </div>

          <div className="grid grid-cols-2 gap-6 relative z-10">
            <div className="group">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] group-focus-within:text-fuchsia-500 transition-colors font-black">ACCESS_CODE</label>
              <input {...form.register('class_code')} disabled={loading} className="w-full bg-white/[0.03] border border-white/10 p-3 text-fuchsia-500 focus:border-fuchsia-500 focus:outline-none transition-all text-xs uppercase placeholder:text-slate-700 font-body not-italic mt-2" placeholder="CS204" />
              {form.formState.errors.class_code && <p className="text-[9px] text-red-500 mt-2 font-black tracking-widest uppercase">{form.formState.errors.class_code.message}</p>}
            </div>
            
            <div className="group">
              <label className="text-[10px] text-slate-500 uppercase tracking-[0.2em] group-focus-within:text-emerald-500 transition-colors font-black">TIMELINE_SYNC</label>
              <div className="flex gap-2 mt-2">
                <input {...form.register('academic_year')} disabled={loading} className="w-2/3 bg-white/[0.03] border border-white/10 p-3 text-emerald-500 focus:border-emerald-500 focus:outline-none transition-all text-xs placeholder:text-slate-700 font-body not-italic" placeholder="2026-2027" />
                <input type="number" {...form.register('semester')} disabled={loading} className="w-1/3 bg-white/[0.03] border border-white/10 p-3 text-emerald-500 focus:border-emerald-500 focus:outline-none transition-all text-xs font-body not-italic" />
              </div>
            </div>
          </div>
          
          <Button type="submit" disabled={loading} className="w-full rounded-none font-black tracking-[0.4em] uppercase h-12 mt-8 relative z-10 shadow-glow-cyan bg-primary text-black hover:bg-white transition-all border-none italic group">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : (
              <span className="flex items-center">
                 EXECUTE_DEPLOYMENT <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-2 transition-transform" />
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
