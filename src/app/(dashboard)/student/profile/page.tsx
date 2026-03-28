import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Terminal, Shield, Award, Clock, TrendingUp, Flame } from 'lucide-react'
import ProfileUpdateForm from '@/components/student/ProfileUpdateForm'
import StreakCalendar from '@/components/gamification/StreakCalendar'
import { getStreakData, getActivityHeatmap } from '@/lib/streak'

export const dynamic = 'force-dynamic'

export default async function StudentProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [{ data: profile }, streakInfo, heatmapDays] = await Promise.all([
    supabase.from('profiles').select('*').eq('id', user.id).single(),
    getStreakData(user.id),
    getActivityHeatmap(user.id),
  ])

  return (
    <div className="p-8 md:p-12 min-h-screen relative font-body text-foreground selection:bg-primary/20 selection:text-primary overflow-x-hidden italic">
      <div className="absolute inset-0 scanlines opacity-[0.02] pointer-events-none z-0"></div>
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-8 opacity-5 pointer-events-none z-0">
        <div className="font-heading text-[200px] leading-none select-none font-black text-primary italic opacity-10 tracking-tighter uppercase">PROFILE_CFG</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-16 font-heading">
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-[0.1em] text-foreground italic flex items-center mb-16 drop-shadow-glow-cyan leading-tight">
           <span className="w-1.5 h-12 md:h-16 bg-primary mr-8 shadow-glow-cyan animate-pulse" />
           USER_SYSTEM_CONFIG
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 relative z-10">
           
           {/* Profile Parameters Editor */}
           <div className="lg:col-span-2 space-y-10 group">
              <div className="bg-bg-secondary/60 p-10 md:p-16 border border-border shadow-2xl backdrop-blur-3xl relative overflow-hidden group-hover:border-primary transition-all duration-700">
                 <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>
                 <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-20 transition-all duration-700 transform group-hover:scale-110">
                    <Shield className="w-24 h-24 text-primary" />
                 </div>
                 <h2 className="font-black text-2xl tracking-[0.3em] uppercase flex items-center gap-6 text-foreground mb-10 border-b border-border pb-6 glitch-text leading-tight italic">
                    IDENTITY_OVERRIDE_INTERFACE
                 </h2>

                 <div className="text-[12px] text-text-muted font-black leading-relaxed mb-10 uppercase tracking-[0.3em] max-w-2xl border-l-2 border-primary/30 pl-6 not-italic">
                    WARNING: ALTERING YOUR UNDERLYING DESIGNATION MODIFIES ALL GLOBAL LEADERBOARDS INSTANTLY. ENCRYPTED OVERRIDES REQUIRE SECURE RE-AUTHENTICATION ON ALL AUTHORIZED MOBILE TERMINALS.
                 </div>

                 <div className="font-body italic text-base">
                    <ProfileUpdateForm currentName={profile?.full_name || ''} />
                 </div>
                 
                 <div className="absolute bottom-0 left-0 w-0 h-1 bg-primary group-hover:w-full transition-all duration-1000 shadow-glow-cyan"></div>
              </div>
           </div>

           {/* Metrics & Identity Card */}
           <div className="space-y-10">
              <div className="bg-bg-secondary/60 border border-border p-10 shadow-2xl backdrop-blur-3xl relative overflow-hidden hover:border-primary transition-all duration-700 group">
                  <div className="absolute inset-0 scanlines opacity-[0.05] pointer-events-none z-0"></div>
                  <div className="absolute top-0 left-0 w-full h-1.5 bg-primary shadow-glow-cyan" />
                  
                  <div className="relative z-10 flex flex-col items-center font-heading">
                     {profile?.avatar_url ? (
                       <div className="relative group/avatar mb-8">
                         <img src={profile.avatar_url} alt="Avatar" className="w-32 h-32 rounded-none border-4 border-primary/30 group-hover:border-primary transition-all duration-700 shadow-glow-cyan object-cover" />
                         <div className="absolute inset-0 border border-primary/10 group-hover:border-primary/30 transition-colors"></div>
                       </div>
                     ) : (
                       <div className="w-32 h-32 rounded-none border-4 border-border bg-white/[0.02] flex items-center justify-center shadow-inner mb-8 group-hover:border-primary transition-all duration-700">
                          <Terminal className="text-primary/30 w-12 h-12 animate-pulse group-hover:text-primary" />
                       </div>
                     )}
                     <div className="text-center w-full">
                        <div className="font-black text-3xl text-foreground uppercase tracking-widest leading-tight glitch-text mb-2 italic">{profile?.full_name}</div>
                        <div className="text-[10px] text-primary font-black uppercase tracking-[0.4em] bg-primary/10 inline-block px-5 py-2 mt-4 mb-8 border border-primary/20 shadow-glow-cyan italic">
                           HASH_SIG_0{profile?.id.slice(0, 8)}_V3
                        </div>
                     </div>
                  </div>

                  <div className="space-y-5 relative z-10 w-full mt-4 font-heading">
                     <div className="flex justify-between items-center bg-white/[0.03] p-4 border border-border shadow-inner hover:bg-white/[0.05] transition-colors">
                        <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-3"><Award className="w-4 h-4 text-accent-secondary shadow-glow-pink" /> INTEGRATED_XP</span>
                        <span className="text-[11px] text-foreground font-black tracking-widest italic">{profile?.xp || 0}_DATA_POINTS</span>
                     </div>
                     <div className="flex justify-between items-center bg-white/[0.03] p-4 border border-border shadow-inner hover:bg-white/[0.05] transition-colors">
                        <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-3"><TrendingUp className="w-4 h-4 text-primary shadow-glow-cyan" /> SYS_SYNC_LVL</span>
                        <span className="text-[11px] text-foreground font-black tracking-widest italic uppercase">STAGE_0{profile?.level || 1}</span>
                     </div>
                     <div className="flex justify-between items-center bg-white/[0.03] p-4 border border-border shadow-inner hover:bg-white/[0.05] transition-colors">
                        <span className="text-[10px] text-text-muted font-black uppercase tracking-[0.2em] flex items-center gap-3"><Clock className="w-4 h-4 text-text-muted" /> INCEPTION_DATE</span>
                        <span className="text-[11px] font-black flex items-center gap-2 text-foreground italic uppercase tracking-tighter">
                           [{profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : 'UNKNOWN'}]
                        </span>
                     </div>
                  </div>
                  
                  <div className="absolute bottom-0 right-0 p-6 opacity-5 pointer-events-none text-foreground font-heading text-6xl font-black italic select-none">SIG_AUTH</div>
              </div>
           </div>

        </div>

        {/* Streak Heatmap - Full Width */}
        <StreakCalendar
          days={heatmapDays}
          currentStreak={streakInfo.currentStreak}
          longestStreak={streakInfo.longestStreak}
        />
      </div>
    </div>
  )
}
