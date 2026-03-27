"use client"

import { useState } from 'react'
import Papa from 'papaparse'
import { Upload, Loader2, AlertCircle, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { bulkImportStudentsAction } from '@/app/actions/teacher'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/useToast'

export default function BulkImportModal({ classId }: { classId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [preview, setPreview] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        if (results.errors.length > 0) {
          setError("Malformed CSV file detected. Please ensure headers are intact.")
          return
        }
        setError(null)
        setPreview(results.data)
      }
    })
  }

  const executeBulkImport = async () => {
    if (preview.length === 0) return
    setLoading(true)
    setError(null)

    // Find the email column no matter what variation of spelling the teacher used.
    const emails = preview.map((row) => {
      const emailKey = Object.keys(row).find(k => k.toLowerCase().includes('email'))
      return emailKey ? row[emailKey] : null
    }).filter(Boolean) as string[]

    if (emails.length === 0) {
      setError("CRITICAL_ERR: No 'email' column detected in the uploaded payload.")
      setLoading(false)
      return
    }

    const { added, failed } = await bulkImportStudentsAction(classId, emails)
    setLoading(false)

    toast({
      title: "BATCH_OPERATIONS_COMPLETE",
      description: `Successfully attached ${added} nodes. ${failed} entries rejected or skipped.`
    })
    
    setOpen(false)
    setPreview([])
  }

  return (
    <Dialog open={open} onOpenChange={(val) => { setOpen(val); if (!val) { setPreview([]); setError(null); } }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="font-mono text-[10px] font-bold tracking-widest uppercase rounded-none h-10 border-emerald-500 text-emerald-600 dark:text-emerald-500 hover:bg-emerald-500/10 transition-colors">
          <FileSpreadsheet className="w-4 h-4 mr-2" /> MULTI_NODE_INJECT (CSV)
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] bg-white dark:bg-[#131313] border-emerald-500 dark:border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.15)] rounded-none">
        <DialogHeader>
          <DialogTitle className="font-sans font-black tracking-widest text-sm uppercase text-slate-900 dark:text-white flex items-center">
            <span className="w-2 h-4 bg-emerald-500 mr-3 animate-pulse"></span>
            BATCH_DEPLOY_PROFILES
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4 relative z-10 w-full">
          <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.03),rgba(0,0,0,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none -z-10"></div>
          
          <div className="border-2 border-dashed border-slate-300 dark:border-slate-800 p-8 text-center relative hover:border-emerald-500 dark:hover:border-emerald-500 transition-colors group cursor-pointer">
            <input 
              type="file" 
              accept=".csv" 
              onChange={handleFileUpload} 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            />
            <Upload className="w-8 h-8 text-slate-300 dark:text-slate-700 group-hover:text-emerald-500 transition-colors mx-auto mb-4" />
            <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
              DROP_CSV_HERE OR CLICK_TO_BROWSE
            </p>
            <p className="font-mono text-[9px] text-slate-400 mt-2 uppercase">
              Required Header: `email`
            </p>
          </div>

          {error && (
            <div className="font-mono text-[10px] flex items-center gap-3 text-red-500 bg-red-500/10 p-4 border-l-2 border-red-500 uppercase">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          {preview.length > 0 && !error && (
            <div className="bg-slate-50 dark:bg-black/50 border border-slate-200 dark:border-slate-800 p-4">
              <h4 className="font-mono text-[10px] text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-3 flex items-center">
                <span className="w-1.5 h-1.5 bg-emerald-500 mr-2"></span> PREVIEWING {preview.length} ENTRIES
              </h4>
              <div className="max-h-40 overflow-y-auto font-mono text-[10px] text-slate-500 dark:text-slate-400 uppercase">
                {preview.slice(0, 5).map((row, i) => (
                  <div key={i} className="py-2 border-b border-slate-200 dark:border-slate-800/50 flex justify-between">
                    <span>{Object.values(row)[0] as string}</span>
                    <span>{Object.values(row)[1] as string}</span>
                  </div>
                ))}
                {preview.length > 5 && <div className="py-2 text-center">...AND {preview.length - 5} MORE</div>}
              </div>
            </div>
          )}

          <Button 
            onClick={executeBulkImport}
            disabled={loading || preview.length === 0} 
            className="w-full rounded-none font-bold tracking-widest uppercase mt-6 relative z-10 bg-emerald-600 hover:bg-emerald-700 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin w-4 h-4" /> : `DEPLOY ${preview.length} NODES`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
