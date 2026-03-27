"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import { useState, useEffect, useCallback, useRef } from 'react'
import { updateLessonContentAction } from '@/app/actions/lessons'
import { useToast } from '@/hooks/useToast'
import { Save, Loader2, Bold, Italic, Heading1, Heading2, Heading3, List, Code, Image as ImageIcon, Eye, EyeOff, Terminal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { sanitizeHTML, validateFile, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/sanitize'

// Calculates reading time dynamically given standard WPM rates
function calcReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}

function MenuBar({ editor }: { editor: any }) {
  if (!editor) return null

  const supabase = createClient()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const validationError = validateFile(file, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE)
    if (validationError) {
      toast({ title: 'VALIDATION_FAILURE', description: validationError, variant: 'destructive' })
      return
    }
    setUploading(true)
    try {
       const fileExt = file.name.split('.').pop()
       const fileName = `${Date.now()}-${Math.random()}.${fileExt}`
       const { error } = await supabase.storage.from('lesson-images').upload(fileName, file)
       if (error) throw error
       
       const { data: { publicUrl } } = supabase.storage.from('lesson-images').getPublicUrl(fileName)
       editor.chain().focus().setImage({ src: publicUrl }).run()
    } catch (err: any) {
       toast({ title: "UPLOAD_FAILURE", description: err.message, variant: "destructive" })
    } finally {
       setUploading(false)
       if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const toggleBtnClass = (active: boolean) => 
     `h-8 w-8 p-1 rounded-none border transition-colors ${active ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_10px_rgba(34,211,238,0.3)]' : 'bg-[#1c1b1b] border-slate-800 text-slate-400 hover:text-cyan-400 hover:border-cyan-400'}`

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 bg-[#0e0e0e] border border-slate-800 sticky top-16 z-20 shadow-md">
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={toggleBtnClass(editor.isActive('bold'))}><Bold className="w-5 h-5 mx-auto" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={toggleBtnClass(editor.isActive('italic'))}><Italic className="w-5 h-5 mx-auto" /></button>
      <div className="w-px h-6 bg-slate-800 mx-2"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 1 }))}><Heading1 className="w-5 h-5 mx-auto" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 2 }))}><Heading2 className="w-5 h-5 mx-auto" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 3 }))}><Heading3 className="w-5 h-5 mx-auto" /></button>
      <div className="w-px h-6 bg-slate-800 mx-2"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toggleBtnClass(editor.isActive('bulletList'))}><List className="w-5 h-5 mx-auto" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={toggleBtnClass(editor.isActive('codeBlock'))}><Code className="w-5 h-5 mx-auto" /></button>
      <div className="w-px h-6 bg-slate-800 mx-2"></div>
      
      <button type="button" onClick={() => fileInputRef.current?.click()} className={toggleBtnClass(false)}>
        {uploading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : <ImageIcon className="w-5 h-5 mx-auto" />}
      </button>
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
    </div>
  )
}

export default function LessonEditor({ initialLesson }: { initialLesson: any }) {
  const { toast } = useToast()
  const [title, setTitle] = useState(initialLesson.title || '')
  const [description, setDescription] = useState(initialLesson.description || '')
  const [isPublished, setIsPublished] = useState(initialLesson.is_published || false)
  const [isPreview, setIsPreview] = useState(false)
  
  const [isSaving, setIsSaving] = useState(false)
  const [lastSaved, setLastSaved] = useState<Date>(new Date())
  const [readingTime, setReadingTime] = useState(initialLesson.time_estimated_minutes || 0)

  const editor = useEditor({
    extensions: [StarterKit, ImageExtension.configure({ inline: true })],
    content: initialLesson.content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-p:text-slate-300 prose-headings:text-white prose-a:text-cyan-400 hover:prose-a:text-cyan-300 prose-strong:text-cyan-400 prose-code:text-fuchsia-400 prose-code:bg-[#1c1b1b] prose-code:px-1 prose-pre:bg-[#131313] prose-pre:border prose-pre:border-slate-800 prose-img:rounded-sm focus:outline-none min-h-[500px] w-full max-w-none p-6 bg-[#131313] border border-t-0 border-slate-800',
      },
    },
    onUpdate: ({ editor }) => {
       setReadingTime(calcReadingTime(editor.getText()))
    }
  })

  // Auto-Save Loop
  const saveContent = useCallback(async (isManual = false, publishOverride?: boolean) => {
    if (!editor) return
    setIsSaving(true)
    const contentHtml = editor.getHTML()
    const targetPublished = publishOverride !== undefined ? publishOverride : isPublished
    
    const res = await updateLessonContentAction(initialLesson.id, initialLesson.class_id, {
        title,
        description,
        content: contentHtml,
        is_published: targetPublished,
        time_estimated_minutes: calcReadingTime(editor.getText())
    })
    setIsSaving(false)

    if (res?.error) {
       toast({ title: "SYNC_FAILURE", description: res.error, variant: "destructive" })
    } else {
       setLastSaved(new Date())
       if (isManual) toast({ title: "DIRECTIVES_SAVED", description: "All parameter modifications successfully flushed to disk." })
    }
  }, [editor, title, description, isPublished, initialLesson.id, initialLesson.class_id, toast])

  useEffect(() => {
    const interval = setInterval(() => {
       saveContent(false)
    }, 30000) // 30 seconds
    return () => clearInterval(interval)
  }, [saveContent])

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-24 font-body">
      
      {/* HEADER HUD */}
      <div className="bg-[#1c1b1b] p-6 border-b-4 border-cyan-400 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sticky top-0 z-30 shadow-xl">
         <div className="flex-1 w-full space-y-4">
             <div className="flex items-center gap-3">
                <Terminal className="w-5 h-5 text-cyan-400" />
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">MODULE_ID: {initialLesson.id.slice(0, 8)}</span>
                <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest px-2 border-l border-slate-800">
                    LAST_SYNC: {isSaving ? 'SYNCING...' : lastSaved.toLocaleTimeString()}
                </span>
                <span className="font-mono text-[10px] text-lime-400 uppercase tracking-widest px-2 border-l border-slate-800">
                    EST_TIME: {readingTime} MIN
                </span>
             </div>
             
             <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-transparent text-3xl font-black text-white uppercase tracking-tight focus:outline-none placeholder:text-slate-700"
                placeholder="MODULE_TITLE"
             />
             <input 
                type="text" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-transparent text-sm font-mono text-slate-400 tracking-widest uppercase focus:outline-none placeholder:text-slate-700"
                placeholder="Short description defining module objectives..."
             />
         </div>

         <div className="flex items-center gap-3">
             <Button variant="ghost" onClick={() => setIsPreview(!isPreview)} className="rounded-none h-12 bg-[#2a2a2a] hover:bg-[#353534] text-slate-300 font-mono text-[10px] tracking-widest uppercase border border-slate-800">
                {isPreview ? <><EyeOff className="w-4 h-4 mr-2" /> EDIT_MODE</> : <><Eye className="w-4 h-4 mr-2" /> PREVIEW_MODE</>}
             </Button>
             
             <Button onClick={() => { const next = !isPublished; setIsPublished(next); saveContent(true, next) }} className={`rounded-none h-12 font-mono text-[10px] tracking-widest uppercase font-bold border transition-colors ${isPublished ? 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700' : 'bg-lime-500 text-black border-lime-400 hover:bg-lime-600 shadow-[0_0_15px_rgba(163,230,53,0.3)]'}`}>
                {isPublished ? "REVERT_TO_DRAFT" : "PUBLISH_MODULE"}
             </Button>

             <Button onClick={() => saveContent(true)} disabled={isSaving} className="rounded-none h-12 bg-cyan-500 hover:bg-cyan-600 text-black font-bold uppercase tracking-widest font-mono text-[10px] shadow-[0_0_15px_rgba(34,211,238,0.3)] min-w-[120px]">
                {isSaving ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : <><Save className="w-4 h-4 mr-2" /> FORCE_SYNC</>}
             </Button>
         </div>
      </div>

      {isPreview ? (
         <div className="bg-[#131313] border border-slate-800 p-8 min-h-[500px]">
            <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-white prose-a:text-cyan-400 prose-strong:text-cyan-400 prose-code:text-fuchsia-400 prose-code:bg-[#1c1b1b] prose-code:px-1 prose-pre:bg-[#1a1a1a] prose-pre:border prose-pre:border-slate-800 prose-img:rounded-sm max-w-none" dangerouslySetInnerHTML={{ __html: sanitizeHTML(editor?.getHTML() || '') }} />
         </div>
      ) : (
         <div className="relative">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
         </div>
      )}
    </div>
  )
}
