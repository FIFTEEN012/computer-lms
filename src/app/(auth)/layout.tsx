export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen relative flex items-center justify-center bg-bg-primary text-text-main selection:bg-accent-primary/30 selection:text-white overflow-hidden">
      
      {/* Global Overlays */}
      <div className="fixed inset-0 grid-overlay opacity-30 pointer-events-none z-0"></div>
      <div className="fixed inset-0 scanlines-tv opacity-[0.08] pointer-events-none z-[100]"></div>

      {/* Hero Branding Header */}
      <header className="fixed top-0 w-full z-[110] flex justify-between items-center px-12 h-16 bg-bg-secondary/80 backdrop-blur-3xl border-b border-accent-primary/10 shadow-[0_0_20px_rgba(0,251,251,0.05)]">
        <div className="flex items-center gap-6">
          <div className="w-10 h-10 bg-accent-primary flex items-center justify-center group-hover:rotate-90 transition-transform duration-500">
             <span className="text-bg-primary font-black font-heading text-xl italic translate-y-[1px]">K</span>
          </div>
          <h1 className="font-heading font-black text-2xl tracking-[0.2em] text-accent-primary uppercase italic neon-glaze glitch-text" data-text="KINETIC_TERMINAL">
             KINETIC_TERMINAL
          </h1>
        </div>
        <div className="hidden md:flex items-center gap-10 font-mono text-[9px] tracking-[0.4em] text-text-muted/40 uppercase font-black italic">
          <div className="flex items-center gap-3">
             <div className="w-2 h-2 bg-accent-tertiary rounded-full animate-ping opacity-60" />
             AUTH_SERVICE: <span className="text-accent-tertiary shadow-glow-emerald">READY</span>
          </div>
          <span>UPLINK_STABLE_4.9</span>
        </div>
      </header>
      
      <main className="relative z-10 w-full flex items-center justify-center p-6 mt-16 pb-24">
         {children}
      </main>
      
      {/* Industrial Footer */}
      <footer className="absolute bottom-0 w-full py-6 px-12 z-[110] flex flex-col md:flex-row justify-between items-center bg-bg-secondary/50 backdrop-blur-3xl border-t border-accent-primary/5">
        <div className="font-mono text-[10px] text-text-muted/30 uppercase tracking-[0.2em] mb-4 md:mb-0 italic font-black">
          © 2026 CS_LMS_PRO_V2.5 // <span className="text-accent-primary/40">ARCHITECT_BOONL</span>
        </div>
        <div className="flex gap-10 font-mono text-[9px] text-text-muted/30 uppercase tracking-[0.3em] font-black italic">
          <a href="#" className="hover:text-accent-primary transition-colors hover:shadow-glow-cyan">SYSTEM_PROTOCOL</a>
          <a href="#" className="hover:text-accent-secondary transition-colors hover:shadow-glow-pink">SECURITY_UPLINK</a>
        </div>
      </footer>
    </div>
  )
}
