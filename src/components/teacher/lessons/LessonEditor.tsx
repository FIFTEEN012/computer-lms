"use client"

import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import ImageExtension from '@tiptap/extension-image'
import { CodePlaygroundNode } from '@/lib/tiptap-code-playground'
import { useState, useEffect, useCallback, useRef } from 'react'
import { updateLessonContentAction } from '@/app/actions/lessons'
import { useToast } from '@/hooks/useToast'
import { Save, Loader2, Bold, Italic, Heading1, Heading2, Heading3, List, Code, Image as ImageIcon, Eye, EyeOff, Terminal, Play } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'
import { sanitizeHTML, validateFile, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from '@/lib/sanitize'
import { SUPPORTED_LANGUAGES, type SupportedLanguageId } from '@/lib/piston'

// Calculates reading time dynamically given standard WPM rates
function calcReadingTime(text: string) {
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / 200)
}

function CodePlaygroundDialog({ open, onClose, onInsert }: { open: boolean, onClose: () => void, onInsert: (lang: SupportedLanguageId, code: string, instructions: string) => void }) {
  const [lang, setLang] = useState<SupportedLanguageId>('python')
  const [code, setCode] = useState('print("Hello, World!")')
  const [instructions, setInstructions] = useState('')

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-surface-container-low border border-outline-variant/30 w-full max-w-lg p-6 space-y-5" onClick={e => e.stopPropagation()}>
        <h3 className="font-headline font-black text-sm uppercase tracking-widest text-on-surface">INSERT_CODE_PLAYGROUND</h3>

        <div>
          <label className="block font-headline text-[10px] uppercase tracking-widest text-outline mb-2">LANGUAGE</label>
          <select value={lang} onChange={e => setLang(e.target.value as SupportedLanguageId)} className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-mono text-sm px-3 py-2 focus:ring-1 focus:ring-primary-fixed">
            {SUPPORTED_LANGUAGES.map(l => <option key={l.id} value={l.id} className="bg-surface-container-low">{l.label}</option>)}
          </select>
        </div>

        <div>
          <label className="block font-headline text-[10px] uppercase tracking-widest text-outline mb-2">INSTRUCTIONS (optional)</label>
          <input type="text" value={instructions} onChange={e => setInstructions(e.target.value)} placeholder="เขียนคำสั่งให้นักเรียน..." className="w-full bg-surface-container-lowest border border-outline-variant/30 text-on-surface font-mono text-sm px-3 py-2 focus:ring-1 focus:ring-primary-fixed placeholder:text-outline/30" />
        </div>

        <div>
          <label className="block font-headline text-[10px] uppercase tracking-widest text-outline mb-2">STARTER_CODE</label>
          <textarea value={code} onChange={e => setCode(e.target.value)} rows={8} className="w-full bg-surface-container-lowest border border-outline-variant/30 text-primary-fixed font-mono text-sm px-3 py-2 focus:ring-1 focus:ring-primary-fixed resize-y" />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button onClick={onClose} className="px-5 py-2 border border-outline-variant/30 text-on-surface-variant font-headline text-[10px] font-bold uppercase tracking-widest hover:bg-surface-container-high transition-all">CANCEL</button>
          <button onClick={() => { onInsert(lang, code, instructions); onClose() }} className="px-5 py-2 bg-primary-fixed text-on-primary-fixed font-headline text-[10px] font-black uppercase tracking-widest hover:shadow-[0_0_15px_rgba(0,251,251,0.4)] transition-all">INSERT</button>
        </div>
      </div>
    </div>
  )
}

function MenuBar({ editor }: { editor: any }) {
  if (!editor) return null

  const supabase = createClient()
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)
  const [showCodeDialog, setShowCodeDialog] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const savedSelectionRef = useRef<any>(null)

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
     `h-10 w-10 p-2 rounded-none border transition-all duration-300 ${active ? 'bg-primary border-primary text-black shadow-glow-cyan rotate-3' : 'bg-black/40 border-white/5 text-slate-500 hover:text-primary hover:border-primary/50'}`

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 bg-black/60 border border-white/5 sticky top-32 z-20 shadow-2xl backdrop-blur-xl mb-1 italic">
      <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none z-0"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleBold().run()} className={toggleBtnClass(editor.isActive('bold'))}><Bold className="w-5 h-5 mx-auto" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleItalic().run()} className={toggleBtnClass(editor.isActive('italic'))}><Italic className="w-5 h-5 mx-auto" /></button>
      <div className="w-px h-8 bg-white/5 mx-3"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 1 }))}><Heading1 className="w-5 h-5 mx-auto" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 2 }))}><Heading2 className="w-5 h-5 mx-auto" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={toggleBtnClass(editor.isActive('heading', { level: 3 }))}><Heading3 className="w-5 h-5 mx-auto" /></button>
      <div className="w-px h-8 bg-white/5 mx-3"></div>
      <button type="button" onClick={() => editor.chain().focus().toggleBulletList().run()} className={toggleBtnClass(editor.isActive('bulletList'))}><List className="w-5 h-5 mx-auto" /></button>
      <button type="button" onClick={() => editor.chain().focus().toggleCodeBlock().run()} className={toggleBtnClass(editor.isActive('codeBlock'))}><Code className="w-5 h-5 mx-auto" /></button>
      <div className="w-px h-8 bg-white/5 mx-3"></div>
      
      <button type="button" onClick={() => fileInputRef.current?.click()} className={toggleBtnClass(false)}>
        {uploading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : <ImageIcon className="w-5 h-5 mx-auto" />}
      </button>
      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />

      <button type="button" onClick={() => { savedSelectionRef.current = editor.state.selection; setShowCodeDialog(true) }} className={toggleBtnClass(false)} title="Insert Code Playground">
        <Play className="w-5 h-5 mx-auto" />
      </button>

      <CodePlaygroundDialog
        open={showCodeDialog}
        onClose={() => setShowCodeDialog(false)}
        onInsert={(lang, code, instructions) => {
          const encodedCode = btoa(unescape(encodeURIComponent(code)))
          const encodedInstructions = instructions ? btoa(unescape(encodeURIComponent(instructions))) : ''
          // Restore cursor position before inserting
          if (savedSelectionRef.current) {
            editor.commands.setTextSelection(savedSelectionRef.current)
          }
          editor.chain().focus().insertContent([
            {
              type: 'codePlayground',
              attrs: {
                language: lang,
                starterCode: encodedCode,
                instructions: encodedInstructions,
              },
            },
            { type: 'paragraph' },
          ]).run()
        }}
      />
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
    extensions: [StarterKit, ImageExtension.configure({ inline: true }), CodePlaygroundNode],
    content: initialLesson.content || '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-invert prose-p:text-slate-300 prose-headings:font-heading prose-headings:text-white prose-a:text-primary hover:prose-a:text-white prose-strong:text-primary prose-code:text-fuchsia-400 prose-code:bg-white/[0.05] prose-code:px-2 prose-pre:bg-black/80 prose-pre:border prose-pre:border-white/10 prose-img:rounded-none focus:outline-none min-h-[600px] w-full max-w-none p-10 md:p-16 bg-black/40 border-x border-b border-white/5 backdrop-blur-3xl shadow-2xl',
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
    <div className="space-y-8 max-w-7xl mx-auto pb-64 font-body relative">
      <div className="absolute inset-0 scanlines opacity-[0.02] pointer-events-none z-0"></div>
      
      {/* HEADER HUD */}
      <div className="bg-black/60 p-8 border-b-2 border-primary flex flex-col md:flex-row justify-between items-start md:items-end gap-10 sticky top-0 z-30 shadow-2xl backdrop-blur-2xl italic font-heading">
         <div className="flex-1 w-full space-y-6">
             <div className="flex items-center gap-6">
                <Terminal className="w-5 h-5 text-primary shadow-glow-cyan animate-pulse" />
                <span className="text-[10px] text-slate-600 font-black uppercase tracking-[0.3em]">MOD_ID: {initialLesson.id.slice(0, 12)}</span>
                <span className="text-[10px] text-fuchsia-500 font-black uppercase tracking-[0.3em] px-4 border-l border-white/10">
                    SYNC_STATUS: {isSaving ? 'UPLOADING...' : `RESTING_@_${lastSaved.toLocaleTimeString()}`}
                </span>
                <span className="text-[10px] text-emerald-500 font-black uppercase tracking-[0.3em] px-4 border-l border-white/10">
                    DURATION: {readingTime}_CYCLES
                </span>
             </div>
             
             <input 
                type="text" 
                value={title} 
                onChange={e => setTitle(e.target.value)}
                className="w-full bg-transparent text-4xl md:text-5xl font-black text-white uppercase tracking-widest focus:outline-none placeholder:text-slate-800 text-shadow-neon-cyan glitch-text"
                placeholder="MODULE_TITLE"
             />
             <input 
                type="text" 
                value={description} 
                onChange={e => setDescription(e.target.value)}
                className="w-full bg-transparent text-[11px] font-black text-slate-500 tracking-[0.3em] uppercase focus:outline-none placeholder:text-slate-800 border-l-2 border-primary/20 pl-4 py-2 mt-2 not-italic"
                placeholder="SYSTEM_INTEL_DESCRIPTION..."
             />
         </div>

         <div className="flex items-center gap-4">
             <Button variant="ghost" onClick={() => setIsPreview(!isPreview)} className="rounded-none h-14 px-8 bg-white/[0.03] hover:bg-white/[0.1] text-slate-400 font-black text-[10px] tracking-[0.3em] uppercase border border-white/5 transition-all">
                {isPreview ? <><EyeOff className="w-4 h-4 mr-3" /> EDIT_FLOW</> : <><Eye className="w-4 h-4 mr-3" /> QA_PREVIEW</>}
             </Button>
             
             <Button onClick={() => { const next = !isPublished; setIsPublished(next); saveContent(true, next) }} className={`rounded-none h-14 px-8 font-black text-[10px] tracking-[0.4em] uppercase border transition-all italic ${isPublished ? 'bg-white/5 text-slate-500 border-white/10 hover:bg-white hover:text-black' : 'bg-fuchsia-600 text-white border-fuchsia-500 hover:bg-white hover:text-black shadow-glow-fuchsia'}`}>
                {isPublished ? "CEASE_BROADCAST" : "INITIATE_BROADCAST"}
             </Button>

             <Button onClick={() => saveContent(true)} disabled={isSaving} className="rounded-none h-14 px-10 bg-primary hover:bg-white text-black font-black uppercase tracking-[0.4em] text-[10px] shadow-glow-cyan min-w-[170px] border-none group transition-all">
                {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : <><Save className="w-5 h-5 mr-3 group-hover:rotate-12 transition-transform" /> FORCE_FLUSH</>}
             </Button>
         </div>
      </div>

      {isPreview ? (
         <div className="bg-black/40 border border-white/5 p-12 md:p-20 min-h-[600px] backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 scanlines opacity-[0.03] pointer-events-none z-0"></div>
            <div className="prose prose-invert prose-p:text-slate-300 prose-headings:font-heading prose-headings:italic prose-headings:font-black prose-headings:uppercase prose-headings:tracking-widest prose-headings:text-white prose-a:text-primary hover:prose-a:text-white prose-strong:text-primary prose-code:text-fuchsia-400 prose-code:bg-white/[0.05] prose-code:px-2 prose-pre:bg-black/80 prose-pre:border prose-pre:border-white/10 prose-img:rounded-none max-w-none relative z-10" dangerouslySetInnerHTML={{ __html: sanitizeHTML(editor?.getHTML() || '') }} />
         </div>
      ) : (
         <div className="relative group overflow-hidden">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
            <div className="absolute bottom-0 right-0 p-8 opacity-5 pointer-events-none text-white font-heading text-8xl font-black italic select-none">DATA_WRITE</div>
         </div>
      )}
    </div>
  )
}
