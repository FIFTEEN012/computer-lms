import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ConfirmDialogProps {
  title: string
  description: string
  onConfirm: () => void
  children: React.ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'default' | 'destructive'
}

export function ConfirmDialog({
  title,
  description,
  onConfirm,
  children,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = 'default'
}: ConfirmDialogProps) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent className="bg-[#0e0e0e] border-2 border-slate-800 rounded-none shadow-[0_0_30px_rgba(0,0,0,0.5)] max-w-md">
        <AlertDialogHeader className="space-y-4">
          <AlertDialogTitle className="text-xl font-black text-white uppercase tracking-tighter italic flex items-center gap-3">
             <span className="w-2 h-6 bg-cyan-400"></span>
             {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="font-mono text-xs text-slate-400 uppercase tracking-widest leading-relaxed">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="mt-8 gap-3 sm:gap-0">
          <AlertDialogCancel className="bg-[#1c1b1b] border border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-white rounded-none font-mono text-[10px] tracking-widest uppercase h-10 px-6">
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction 
            onClick={onConfirm}
            className={`rounded-none font-mono text-[10px] tracking-widest uppercase h-10 px-6 font-bold shadow-[0_0_15px_rgba(34,211,238,0.2)] transition-all ${
              variant === 'destructive' 
                ? 'bg-red-500 text-black hover:bg-red-600 border-red-400' 
                : 'bg-cyan-500 text-black hover:bg-cyan-600 border-cyan-400'
            }`}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
