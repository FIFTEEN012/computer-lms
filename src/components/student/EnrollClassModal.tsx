"use client"

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
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
        <Button className="font-mono text-[10px] font-bold tracking-widest uppercase rounded-none h-10 shadow-[0_0_15px_rgba(34,211,238,0.3)] bg-cyan-500 hover:bg-cyan-600 text-black hover:text-black transition-all">
          <Plus className="w-4 h-4 mr-2" /> REQUEST_ACCESS (JOIN)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px] bg-[#131313] border-cyan-400 shadow-[0_0_40px_rgba(34,211,238,0.1)] rounded-none">
        <DialogHeader>
          <DialogTitle className="font-sans font-black tracking-widest uppercase text-white flex items-center">
            <span className="w-2 h-4 bg-cyan-400 mr-3 animate-pulse"></span>
            MANUAL_NODE_INJECTION
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleEnrollment} className="space-y-6 mt-4 relative z-10 w-full">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.03),rgba(0,0,0,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none -z-10"></div>
          
          <div className="relative group">
            <label className="text-[10px] bg-[#131313] px-2 absolute -top-2 left-3 text-slate-500 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors z-10">ACCESS_CODE</label>
            <input 
               type="text"
               required
               value={code}
               onChange={(e) => setCode(e.target.value)}
               disabled={loading} 
               className="w-full bg-[#1c1b1b] border border-slate-800 p-4 h-14 text-cyan-400 focus:border-cyan-400 focus:outline-none transition-colors text-lg uppercase placeholder:text-slate-700 tracking-[0.2em] font-mono text-center relative z-0" 
               placeholder="ENTER 6-DIGIT CORE" 
            />
          </div>

          <Button type="submit" disabled={loading} className="w-full rounded-none font-bold tracking-widest uppercase mt-6 relative z-10 bg-cyan-500 hover:bg-cyan-600 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)] h-12">
            {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "TRANSMIT_REQUEST"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
