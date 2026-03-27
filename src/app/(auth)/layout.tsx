export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-slate-50 dark:bg-[#0a0a0a] text-slate-900 dark:text-slate-100 selection:bg-primary/30 selection:text-primary overflow-hidden">
      
      {/* Ambient Grid overlay */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-20 dark:opacity-40" 
           style={{
             backgroundSize: '24px 24px',
             backgroundImage: 'linear-gradient(to right, rgba(128, 128, 128, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(128, 128, 128, 0.2) 1px, transparent 1px)'
           }}>
      </div>

      {/* Cyberpunk ambient blooms */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/10 rounded-full blur-[120px] pointer-events-none z-0"></div>
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none z-0"></div>

      {/* Hero Branding Header */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-slate-50/80 dark:bg-[#0a0a0a]/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold font-mono text-xl">{'>_'}</span>
          </div>
          <h1 className="font-black text-xl tracking-widest text-primary uppercase hidden sm:block">KINETIC_LMS</h1>
        </div>
        <div className="hidden md:flex items-center gap-6 font-mono text-[10px] tracking-widest text-slate-400 dark:text-slate-500 uppercase">
          <span>System_Status: <span className="text-emerald-500">Online</span></span>
          <span>Latency: 14MS</span>
        </div>
      </header>
      
      {children}
      
      {/* Footer */}
      <footer className="absolute bottom-0 w-full py-6 px-12 z-50 flex flex-col md:flex-row justify-between items-center bg-slate-50/50 dark:bg-[#0a0a0a]/50 backdrop-blur-sm border-t border-slate-200 dark:border-slate-800">
        <div className="font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter mb-4 md:mb-0">
          © 2026 KINETIC_LMS // ALL_RIGHTS_RESERVED
        </div>
        <div className="flex gap-8 font-mono text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-tighter">
          <a href="#" className="hover:text-primary transition-colors">System Status</a>
          <a href="#" className="hover:text-primary transition-colors">API</a>
        </div>
      </footer>
    </div>
  )
}
