'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import Editor, { type OnMount } from '@monaco-editor/react'
import { runCode, SUPPORTED_LANGUAGES, type RunResult, type SupportedLanguageId } from '@/lib/piston'
import { Play, RotateCcw, Copy, Check, Loader2, Terminal, GripHorizontal, AlertTriangle, Save } from 'lucide-react'

export type CodeEditorProps = {
  language?: SupportedLanguageId
  starterCode?: string
  instructions?: string
  lessonId?: string
  onFirstRun?: () => void  // callback for XP reward
}

const DEFAULT_CODE: Record<string, string> = {
  python: '# เขียนโค้ด Python ที่นี่\nprint("Hello, World!")\n',
  javascript: '// เขียนโค้ด JavaScript ที่นี่\nconsole.log("Hello, World!");\n',
  java: '// เขียนโค้ด Java ที่นี่\npublic class Main {\n  public static void main(String[] args) {\n    System.out.println("Hello, World!");\n  }\n}\n',
  cpp: '// เขียนโค้ด C++ ที่นี่\n#include <iostream>\nusing namespace std;\n\nint main() {\n  cout << "Hello, World!" << endl;\n  return 0;\n}\n',
  html: '<!-- เขียน HTML/CSS ที่นี่ -->\n<!DOCTYPE html>\n<html>\n<head>\n  <style>\n    body { background: #131313; color: #00fbfb; font-family: monospace; padding: 2rem; }\n  </style>\n</head>\n<body>\n  <h1>Hello, World!</h1>\n</body>\n</html>\n',
}

export default function CodeEditor({
  language: initialLang = 'python',
  starterCode,
  instructions,
  lessonId,
  onFirstRun,
}: CodeEditorProps) {
  const [language, setLanguage] = useState<SupportedLanguageId>(initialLang)
  const [code, setCode] = useState(starterCode || DEFAULT_CODE[initialLang] || '')
  const [result, setResult] = useState<RunResult | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [copied, setCopied] = useState(false)
  const [editorHeight, setEditorHeight] = useState(400)
  const [hasRunOnce, setHasRunOnce] = useState(false)
  const [htmlPreview, setHtmlPreview] = useState<string | null>(null)

  const editorRef = useRef<Parameters<OnMount>[0] | null>(null)
  const dragRef = useRef<{ startY: number; startH: number } | null>(null)

  const currentStarterCode = starterCode || DEFAULT_CODE[language] || ''

  // ---------- Run Code ----------
  const handleRun = useCallback(async () => {
    if (isRunning) return
    setIsRunning(true)
    setResult(null)
    setHtmlPreview(null)

    if (language === 'html') {
      setHtmlPreview(code)
      setResult({ stdout: 'HTML preview rendered below.', stderr: '', exitCode: 0, timedOut: false })
      setIsRunning(false)
    } else {
      const res = await runCode(language, code)
      setResult(res)
      setIsRunning(false)
    }

    if (!hasRunOnce) {
      setHasRunOnce(true)
      onFirstRun?.()
    }
  }, [code, language, isRunning, hasRunOnce, onFirstRun])

  // ---------- Keyboard shortcut: Ctrl+Enter ----------
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleRun()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [handleRun])

  // ---------- Language change ----------
  const handleLanguageChange = (newLang: SupportedLanguageId) => {
    setLanguage(newLang)
    if (!starterCode) {
      setCode(DEFAULT_CODE[newLang] || '')
    }
    setResult(null)
    setHtmlPreview(null)
  }

  // ---------- Copy ----------
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // ---------- Reset ----------
  const handleReset = () => {
    setCode(currentStarterCode)
    setResult(null)
    setHtmlPreview(null)
  }

  // ---------- Resize drag ----------
  const onDragStart = (e: React.MouseEvent) => {
    e.preventDefault()
    dragRef.current = { startY: e.clientY, startH: editorHeight }
    const onMove = (ev: MouseEvent) => {
      if (!dragRef.current) return
      const newH = Math.max(200, Math.min(800, dragRef.current.startH + (ev.clientY - dragRef.current.startY)))
      setEditorHeight(newH)
    }
    const onUp = () => {
      dragRef.current = null
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  // ---------- Editor mount ----------
  const onEditorMount: OnMount = (editor) => {
    editorRef.current = editor
    editor.addAction({
      id: 'run-code',
      label: 'Run Code',
      keybindings: [2048 /* CtrlCmd */ | 3 /* Enter */],
      run: () => handleRun(),
    })
  }

  const langMeta = SUPPORTED_LANGUAGES.find(l => l.id === language)!

  return (
    <div className="bg-surface-container-lowest border border-white/5 shadow-2xl relative overflow-hidden my-4">
      {/* Instructions - Stitch style */}
      {instructions && (
        <div className="px-6 py-4 bg-surface-container-low border-b border-white/5 text-sm text-on-surface-variant font-body">
          {instructions}
        </div>
      )}

      {/* Language Tabs - Stitch style */}
      <div className="flex bg-surface-container-low border-b border-white/5">
        {SUPPORTED_LANGUAGES.map((l) => (
          <button
            key={l.id}
            onClick={() => handleLanguageChange(l.id)}
            className={`px-6 py-3 font-label text-xs tracking-widest uppercase transition-colors ${
              language === l.id
                ? 'bg-surface-container-lowest border-t-2 border-primary-fixed text-primary-fixed'
                : 'text-outline hover:text-on-surface-variant'
            }`}
          >
            {l.label}
          </button>
        ))}
        <div className="ml-auto flex items-center px-4 gap-2">
          <span className="w-2 h-2 rounded-full bg-tertiary-fixed animate-pulse shadow-[0_0_5px_#2ae500]" />
          <span className="text-[10px] font-label text-outline uppercase tracking-tighter">Compiler_Online</span>
        </div>
      </div>

      {/* Monaco Editor */}
      <div style={{ height: editorHeight }} className="relative">
        <div className="scanline-overlay absolute inset-0 opacity-[0.06] pointer-events-none z-10" />
        <Editor
          height="100%"
          language={langMeta.monacoId}
          value={code}
          onChange={(v) => setCode(v ?? '')}
          onMount={onEditorMount}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', monospace",
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            wordWrap: 'on',
            padding: { top: 12 },
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-surface-container-lowest text-primary-fixed font-mono text-sm">
              <Loader2 className="w-5 h-5 animate-spin mr-3" /> LOADING_EDITOR...
            </div>
          }
        />
      </div>

      {/* Resize Handle */}
      <div
        onMouseDown={onDragStart}
        className="h-2.5 bg-surface-container border-y border-white/5 cursor-row-resize flex items-center justify-center group hover:bg-surface-container-high transition-colors"
      >
        <GripHorizontal className="w-4 h-4 text-outline/20 group-hover:text-outline/50 transition-colors" />
      </div>

      {/* Editor Footer/Action Bar - Stitch style */}
      <div className="p-4 bg-surface-container-low flex justify-between items-center border-t border-white/5">
        <div className="flex gap-4">
          <button
            onClick={handleReset}
            className="text-outline hover:text-white flex items-center gap-2 text-xs font-label tracking-widest uppercase transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset
          </button>
          <button
            onClick={handleCopy}
            className="text-outline hover:text-white flex items-center gap-2 text-xs font-label tracking-widest uppercase transition-colors"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-tertiary-fixed" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
        <button
          onClick={handleRun}
          disabled={isRunning}
          className="bg-primary-fixed text-on-primary-fixed px-8 py-2 font-headline font-bold tracking-tighter hover:shadow-[0_0_20px_#00fbfb] transition-all active:scale-95 flex items-center gap-2 disabled:opacity-40"
        >
          {isRunning ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> EXECUTING...
            </>
          ) : (
            <>
              RUN_PROTOCOL
              <Play className="w-4 h-4" />
            </>
          )}
          {!isRunning && <span className="text-[8px] opacity-50 ml-1 hidden sm:inline">CTRL+ENTER</span>}
        </button>
      </div>

      {/* Terminal Output - Stitch style */}
      <div className="bg-black/80 backdrop-blur-md p-4 border-t border-white/5 font-mono text-xs leading-relaxed min-h-[100px] max-h-[220px] overflow-y-auto custom-scrollbar">
        <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/10">
          <Terminal className="w-3.5 h-3.5 text-outline" />
          <span className="text-outline uppercase tracking-widest font-label text-[10px]">Output_Terminal</span>
          {result && result.exitCode !== null && (
            <span className={`ml-auto font-mono text-[10px] uppercase tracking-widest ${result.exitCode === 0 ? 'text-tertiary-fixed' : 'text-error'}`}>
              EXIT_CODE: {result.exitCode}
            </span>
          )}
          {result?.timedOut && (
            <span className="ml-auto flex items-center gap-1 font-mono text-[10px] text-error uppercase">
              <AlertTriangle className="w-3 h-3" /> TIMEOUT
            </span>
          )}
        </div>

        {isRunning ? (
          <div className="space-y-1">
            <p className="text-primary-fixed/60">[SYNCING...] Connecting to remote execution kernel...</p>
            <div className="flex items-center gap-2 text-primary-fixed animate-pulse">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>EXECUTING_{language.toUpperCase()}_PROCESS...</span>
            </div>
          </div>
        ) : result ? (
          <div className="space-y-1">
            <p className="text-primary-fixed/40">[SYNCING...] Connecting to remote execution kernel...</p>
            {result.stdout && (
              <pre className="text-white whitespace-pre-wrap break-words">{result.stdout}</pre>
            )}
            {result.stderr && (
              <pre className="text-error whitespace-pre-wrap break-words">{result.stderr}</pre>
            )}
            {!result.stdout && !result.stderr && (
              <span className="text-outline text-[10px] uppercase tracking-widest">NO_OUTPUT</span>
            )}
            {result.exitCode === 0 && !result.timedOut && (
              <p className="text-tertiary-fixed">[PROCESS_COMPLETE] Execution successful. Returning status code 0.</p>
            )}
            <div className="flex gap-1 mt-1">
              <span className="text-primary-fixed">{'>'}</span>
              <span className="w-2 h-4 bg-primary-fixed/50 animate-pulse" />
            </div>
          </div>
        ) : (
          <div>
            <p className="text-outline/40 mb-1">{'>'} AWAITING_EXECUTION...</p>
            <p className="text-outline/30 text-[10px]">กด RUN_PROTOCOL หรือ Ctrl+Enter เพื่อรันโค้ด</p>
            <div className="flex gap-1 mt-2">
              <span className="text-primary-fixed">{'>'}</span>
              <span className="w-2 h-4 bg-primary-fixed/50 animate-pulse" />
            </div>
          </div>
        )}
      </div>

      {/* HTML Preview */}
      {htmlPreview && (
        <div className="border-t border-white/5">
          <div className="px-4 py-2 bg-surface-container-low border-b border-white/5 flex items-center gap-2">
            <span className="font-mono text-[10px] text-secondary uppercase tracking-widest">HTML_PREVIEW</span>
          </div>
          <iframe
            srcDoc={htmlPreview}
            sandbox="allow-scripts"
            className="w-full h-64 bg-white"
            title="HTML Preview"
          />
        </div>
      )}
    </div>
  )
}
