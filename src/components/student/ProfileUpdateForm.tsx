"use client"

import { useState } from 'react'
import { updateProfileAction } from '@/app/actions/student'
import { Loader2, Save, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/useToast'
import { createClient } from '@/lib/supabase/client'
import { validateFile, ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE } from '@/lib/sanitize'

export default function ProfileUpdateForm({ currentName }: { currentName: string }) {
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()
  const supabase = createClient()

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validationError = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_AVATAR_SIZE)
    if (validationError) {
      toast({ title: 'VALIDATION_FAILURE', description: validationError, variant: 'destructive' })
      return
    }

    setUploading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("Auth timeout")

      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}-${Math.random()}.${fileExt}`
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, file)
      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName)
      
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
      
      toast({ title: "VISUAL_IDENTIFIER_UPDATED", description: "Node visuals synchronized. Rebuilding framework..." })
      setTimeout(() => window.location.reload(), 800)
    } catch (error: any) {
      toast({ title: "UPLOAD_FAILURE", description: error.message, variant: "destructive" })
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    
    const formData = new FormData(e.currentTarget)
    const result = await updateProfileAction(formData)
    
    setLoading(false)

    if (result.error) {
       toast({ title: "UPDATE_FAILED", description: result.error, variant: "destructive" })
    } else {
       toast({ title: "CONFIGURATION_SAVED", description: "Profile parameters securely committed." })
       // Reset password field specifically
       const form = e.target as HTMLFormElement
       const passwordInput = form.elements.namedItem('password') as HTMLInputElement
       if (passwordInput) passwordInput.value = ''
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
       
       <div className="relative group">
          <label className="text-[10px] bg-[#1c1b1b] px-2 absolute -top-2 left-3 text-slate-500 uppercase tracking-widest group-focus-within:text-lime-400 transition-colors z-10">VISUAL_IDENTIFIER (AVATAR JPG/PNG)</label>
          <div className="flex w-full bg-[#131313] border border-slate-800 h-12 relative z-0 items-center pl-4 cursor-pointer overflow-hidden group-hover:border-lime-400/50 transition-colors">
             <Upload className="w-4 h-4 text-slate-500 mr-4 group-hover:text-lime-400 transition-colors" />
             <input 
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={loading || uploading}
                className="w-full text-slate-400 file:hidden cursor-pointer bg-transparent uppercase font-mono text-[10px] tracking-widest focus:outline-none" 
             />
             {uploading && <Loader2 className="w-4 h-4 text-cyan-400 animate-spin absolute right-4" />}
          </div>
       </div>

       <div className="relative group">
          <label className="text-[10px] bg-[#1c1b1b] px-2 absolute -top-2 left-3 text-slate-500 uppercase tracking-widest group-focus-within:text-cyan-400 transition-colors z-10">DESIGNATION (FULL NAME)</label>
          <input 
             type="text" 
             name="fullName"
             defaultValue={currentName}
             disabled={loading}
             className="w-full bg-[#131313] border border-slate-800 p-4 h-12 text-white focus:border-cyan-400 focus:outline-none transition-colors text-sm font-sans relative z-0" 
          />
       </div>

       <div className="relative group">
          <label className="text-[10px] bg-[#1c1b1b] px-2 absolute -top-2 left-3 text-slate-500 uppercase tracking-widest group-focus-within:text-fuchsia-400 transition-colors z-10">SECURITY_KEY (NEW PASSWORD)</label>
          <input 
             type="password" 
             name="password"
             disabled={loading}
             placeholder="Leave blank to keep current..."
             className="w-full bg-[#131313] border border-slate-800 p-4 h-12 text-fuchsia-400 focus:border-fuchsia-400 focus:outline-none transition-colors text-sm font-sans placeholder:text-slate-700 relative z-0" 
          />
       </div>

       <Button type="submit" disabled={loading} className="w-full rounded-none font-bold tracking-widest uppercase mt-6 bg-cyan-500 hover:bg-cyan-600 text-black shadow-[0_0_15px_rgba(34,211,238,0.3)] h-12">
          {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : <><Save className="w-4 h-4 mr-2" /> OVERWRITE_PARAMETERS</>}
       </Button>
    </form>
  )
}
