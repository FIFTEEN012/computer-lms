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
    <form onSubmit={handleSubmit} className="space-y-8 font-body">
       
       <div className="relative group">
          <label className="text-[10px] bg-bg-secondary px-3 absolute -top-2.5 left-4 text-text-muted uppercase tracking-[0.2em] font-black group-focus-within:text-accent-primary transition-colors z-10 italic">VISUAL_IDENTIFIER (AVATAR JPG/PNG)</label>
          <div className="flex w-full bg-bg-primary/50 border border-border h-14 relative z-0 items-center pl-5 cursor-pointer overflow-hidden group-hover:border-accent-primary transition-all duration-500 shadow-inner">
             <Upload className="w-4 h-4 text-text-muted mr-4 group-hover:text-accent-primary transition-colors" />
             <input 
                type="file" 
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={loading || uploading}
                className="w-[100%] text-text-muted file:hidden cursor-pointer bg-transparent uppercase font-heading text-[10px] tracking-widest focus:outline-none italic" 
             />
             {uploading && <Loader2 className="w-4 h-4 text-accent-primary animate-spin absolute right-5" />}
          </div>
       </div>

       <div className="relative group">
          <label className="text-[10px] bg-bg-secondary px-3 absolute -top-2.5 left-4 text-text-muted uppercase tracking-[0.2em] font-black group-focus-within:text-accent-primary transition-colors z-10 italic">DESIGNATION (FULL NAME)</label>
          <input 
             type="text" 
             name="fullName"
             defaultValue={currentName}
             disabled={loading}
             className="w-full bg-bg-primary/50 border border-border p-5 h-14 text-foreground focus:border-accent-primary focus:outline-none transition-all duration-500 text-sm font-heading tracking-widest uppercase relative z-0 italic shadow-inner" 
          />
       </div>

       <div className="relative group">
          <label className="text-[10px] bg-bg-secondary px-3 absolute -top-2.5 left-4 text-text-muted uppercase tracking-[0.2em] font-black group-focus-within:text-accent-secondary transition-colors z-10 italic">SECURITY_KEY (NEW PASSWORD)</label>
          <input 
             type="password" 
             name="password"
             disabled={loading}
             placeholder="Leave blank to keep current..."
             className="w-full bg-bg-primary/50 border border-border p-5 h-14 text-accent-secondary focus:border-accent-secondary focus:outline-none transition-all duration-500 text-sm font-heading tracking-widest uppercase placeholder:text-text-muted/30 relative z-0 italic shadow-inner" 
          />
       </div>

       <Button type="submit" disabled={loading} className="w-full rounded-none font-black tracking-[0.4em] uppercase mt-8 bg-accent-primary hover:bg-accent-primary/80 text-bg-primary shadow-glow-cyan h-14 transition-all duration-500 hover:scale-[1.01] active:scale-[0.98] italic font-heading text-[11px]">
          {loading ? <Loader2 className="animate-spin w-5 h-5 mx-auto" /> : <><Save className="w-4 h-4 mr-3" /> OVERWRITE_PARAMETERS</>}
       </Button>
    </form>
  )
}
