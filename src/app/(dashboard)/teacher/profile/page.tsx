import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Terminal, Shield, Clock, BookOpen } from 'lucide-react'
import ProfileUpdateForm from '@/components/student/ProfileUpdateForm'

export const dynamic = 'force-dynamic'

export default async function TeacherProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="p-8 md:p-12 min-h-screen relative font-body text-foreground selection:bg-accent-secondary/20 selection:text-accent-secondary overflow-x-hidden italic">
      <div className="absolute inset-0 scanlines opacity-[0.02] pointer-events-none z-0"></div>
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-8 opacity-5 pointer-events-none z-0">
        <div className="font-heading text-[200px] leading-none select-none font-black text-accent-secondary italic opacity-10 tracking-tighter uppercase">ADMIN_CFG</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-16 font-heading">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-[0.1em] text-foreground italic flex items-center mb-16 drop-shadow-glow-fuchsia leading-tight">
           <span className="w-1.5 h-12 md:h-16 bg-accent-secondary mr-8 shadow-glow-fuchsia animate-pulse" />
           SYSTEM_ADMIN_CONFIG
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
           
           {/* Profile Parameters Editor */}
           <div className="lg:col-span-2 space-y-10 group">
              <div className="bg-bg-secondary/60 p-10 md:p-16 border border-border shadow-2xl backdrop-blur-3xl relative overflow-hidden group-hover:border-accent-secondary transition-all duration-700">
                 <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all duration-700 transform group-hover:scale-110">
                    <Shield className="w-24 h-24 text-accent-secondary" />
                 </div>
                 <h2 className="font-black text-2xl tracking-[0.3em] uppercase flex items-center gap-6 text-foreground mb-10 border-b border-border pb-6 glitch-text leading-tight italic">
                    IDENTITY_OVERRIDE_INTERFACE
                 </h2>

                 <div className="text-[12px] text-text-muted font-black leading-relaxed mb-10 uppercase tracking-[0.3em] max-w-2xl border-l-2 border-accent-secondary/30 pl-6 not-italic">
                    WARNING: CHANGING ADMINISTRATIVE CREDENTIALS UPDATES ALL CENTRAL AUDIT LOGS AND SECURITY SIGNATURE RECORDS. ENCRYPTED OVERRIDES REQUIRE SECURE RE-AUTHENTICATION ON ALL AUTHORIZED SECTOR NODES.
                 </div>

                 <div className="font-body italic text-base">
                    <ProfileUpdateForm currentName={profile?.full_name || ''} />
                 </div>
                 
                 <div className="absolute bottom-0 left-0 w-0 h-1 bg-accent-secondary group-hover:w-full transition-all duration-1000 shadow-glow-fuchsia"></div>
              </div>
           </div>

           {/* Metrics & Identity Card */}
           <div className="space-y-10">
              <div className="bg-bg-secondary/60 border border-border p-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden hover:border-accent-secondary transition-all duration-700 group">
                  <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-accent-secondary shadow-glow-fuchsia" />
                  
                  <div className="relative z-10 flex flex-col items-center">
                     {profile?.avatar_url ? (
                       <div className="relative group/avatar mb-8">
                         <img src={profile.avatar_url} alt="Avatar" className="w-32 h-32 rounded-none border-4 border-accent-secondary/30 group-hover:border-accent-secondary transition-all duration-700 shadow-glow-fuchsia object-cover" />
                         <div className="absolute inset-0 border border-border group-hover:border-accent-secondary/30 transition-colors"></div>
                       </div>
                     ) : (
                       <div className="w-32 h-32 rounded-none border-4 border-border bg-white/[0.02] flex items-center justify-center shadow-inner mb-8 group-hover:border-accent-secondary transition-all duration-700">
                          <Terminal className="text-accent-secondary/30 w-12 h-12 animate-pulse group-hover:text-accent-secondary" />
                       </div>
                     )}
                     <div className="text-center w-full">
                        <div className="font-black text-3xl text-foreground uppercase tracking-widest leading-tight glitch-text mb-2 italic">{profile?.full_name}</div>
                        <div className="text-[10px] text-accent-secondary font-black uppercase tracking-[0.4em] bg-accent-secondary/10 inline-block px-5 py-2 mt-4 mb-8 border border-accent-secondary/20 shadow-glow-fuchsia italic">
                           AUTH_SIG_0{profile?.id.slice(0, 8)}_SECURE
                        </div>
                     </div>
                  </div>

                  <div className="space-y-5 relative z-10 w-full mt-4 font-heading">
                     <div className="flex justify-between items-center bg-bg-primary/40 p-5 border border-border shadow-inner hover:bg-bg-primary/60 transition-colors">
                        <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-3"><BookOpen className="w-4 h-4 text-accent-secondary shadow-glow-fuchsia" /> SYSTEM_ROLE</span>
                        <span className="text-[11px] text-foreground font-black tracking-widest uppercase italic bg-accent-secondary/20 px-4 py-1.5 border border-accent-secondary/10">ADMIN_FACULTY</span>
                     </div>
                     <div className="flex justify-between items-center bg-bg-primary/40 p-5 border border-border shadow-inner hover:bg-bg-primary/60 transition-colors">
                        <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-3"><Clock className="w-4 h-4 text-text-muted" /> PROVISIONED_DATE</span>
                        <span className="text-[11px] font-black flex items-center gap-2 text-foreground italic uppercase tracking-tighter">
                           [{profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : 'UNKNOWN'}]
                        </span>
                     </div>
                  </div>
                  
                  <div className="absolute bottom-0 right-0 p-6 opacity-5 pointer-events-none text-foreground font-heading text-6xl font-black italic select-none">SIG_AUTH</div>
              </div>
           </div>
           
        </div>
      </div>
    </div>
  )
}
