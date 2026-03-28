"use client"

import { useState } from 'react'
import { Plus, Loader2, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { joinClassAction } from '@/app/actions/student'
import { useToast } from '@/hooks/useToast'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

export default function EnrollClassModal() {
  const [open, setOpen] = useState(false)
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleEnrollment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!code) return
    setLoading(true)

    const result = await joinClassAction(code)
    setLoading(false)

    if (result.error) {
       toast({ title: "CONNECTION_REFUSED", description: result.error, variant: "destructive" })
    } else {
       toast({ title: "CONNECTION_ESTABLISHED", description: "Successfully linked to Master Node." })
       setOpen(false)
       setCode("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="font-heading text-[10px] font-black tracking-[0.3em] uppercase rounded-none h-11 bg-cyan-500 hover:bg-white text-black transition-all shadow-glow-cyan italic border-none">
          <Plus className="w-4 h-4 mr-3" /> REQUEST_ACCESS (JOIN)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-black/90 border-cyan-400 shadow-2xl rounded-none backdrop-blur-2xl">
        <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>
        <DialogHeader className="relative z-10">
          <DialogTitle className="font-heading font-black tracking-[0.2em] uppercase text-white flex items-center italic text-shadow-neon-cyan">
            <span className="w-2.5 h-5 bg-cyan-400 mr-4 shadow-glow-cyan"></span>
            MANUAL_NODE_INJECTION
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleEnrollment} className="space-y-8 mt-6 relative z-10 w-full italic font-heading">
          
          <div className="relative group">
            <label className="text-[10px] text-slate-500 uppercase tracking-[0.3em] group-focus-within:text-cyan-400 transition-colors font-black mb-3 block">ACCESS_CODE</label>
            <input 
               type="text"
               required
               value={code}
               onChange={(e) => setCode(e.target.value)}
               disabled={loading} 
               className="w-full bg-white/[0.03] border border-white/10 p-5 h-16 text-cyan-400 focus:border-cyan-400 focus:outline-none transition-all text-xl uppercase placeholder:text-slate-800 tracking-[0.4em] font-heading text-center font-black" 
               placeholder="CORE_IDENTIFIER" 
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-none font-black tracking-[0.4em] uppercase h-14 relative z-10 bg-cyan-500 hover:bg-white text-black shadow-glow-cyan border-none group">
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : (
              <span className="flex items-center">
                TRANSMIT_REQUEST <ArrowRight className="w-4 h-4 ml-4 group-hover:translate-x-2 transition-transform" />
              </span>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
