import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Terminal, Shield, Award, Clock, TrendingUp } from 'lucide-react'
import ProfileUpdateForm from '@/components/student/ProfileUpdateForm'

export const dynamic = 'force-dynamic'

export default async function StudentProfilePage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase.from('profiles').select('*').eq('id', user.id).single()

  return (
    <div className="p-4 md:p-8 min-h-screen relative font-body text-slate-200 dark:bg-[#0e0e0e]/50 selection:bg-cyan-400/20 selection:text-cyan-400 overflow-x-hidden">
      
      {/* Background Decor */}
      <div className="fixed top-0 right-0 p-4 opacity-5 pointer-events-none z-0">
        <div className="font-mono text-[150px] leading-none select-none font-black text-slate-500">P/R</div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-12">
        <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter text-white italic flex items-center mb-10">
           <span className="w-4 h-10 bg-cyan-400 mr-5"></span> 
           SYSTEM_CONFIG
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           
           {/* Profile Parameters Editor */}
           <div className="lg:col-span-2 space-y-8">
              <div className="bg-[#1c1b1b] p-8 border border-slate-800 shadow-sm relative">
                 <div className="absolute top-0 right-0 p-4 opacity-10">
                    <Shield className="w-20 h-20" />
                 </div>
                 <h2 className="font-sans font-black text-xl tracking-widest uppercase flex items-center gap-3 text-white mb-8 border-b border-slate-800 pb-4">
                    IDENTITY_OVERRIDE
                 </h2>

                 <div className="font-mono text-xs text-slate-400 leading-relaxed mb-6 uppercase tracking-widest max-w-xl">
                    WARNING: Altering your underlying designation modifies all global leaderboards instantly. Passwords require immediate re-authentication across all mobile terminals.
                 </div>

                 <ProfileUpdateForm currentName={profile?.full_name || ''} />
              </div>
           </div>

           {/* Metrics & Identity Card */}
           <div className="space-y-8">
              <div className="bg-[#0e0e0e] border-t-4 border-t-cyan-400 p-6 border border-slate-800 relative shadow-xl overflow-hidden">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(45deg,rgba(0,0,0,0.05),rgba(0,0,0,0.05)_2px,transparent_2px,transparent_4px)] pointer-events-none z-0"></div>
                  
                  <div className="relative z-10 flex flex-col items-center">
                     {profile?.avatar_url ? (
                       <img src={profile.avatar_url} alt="Avatar" className="w-24 h-24 rounded-full border-4 border-[#1c1b1b] shadow-[0_0_20px_rgba(34,211,238,0.2)] object-cover mb-4" />
                     ) : (
                       <div className="w-24 h-24 rounded-full border-4 border-[#1c1b1b] bg-slate-900 flex items-center justify-center shadow-[0_0_20px_rgba(34,211,238,0.2)] mb-4">
                          <Terminal className="text-cyan-400/50 w-10 h-10" />
                       </div>
                     )}
                     <div className="text-center w-full">
                        <div className="font-sans font-black text-xl text-white uppercase tracking-widest">{profile?.full_name}</div>
                        <div className="font-mono text-[10px] text-cyan-400 uppercase tracking-widest bg-cyan-400/10 inline-block px-3 py-1 mt-2 mb-6">
                           HASH: {profile?.id.slice(0, 8)}
                        </div>
                     </div>
                  </div>

                  <div className="space-y-4 relative z-10 w-full mt-2">
                     <div className="flex justify-between items-center bg-[#1c1b1b] p-3 border border-slate-800">
                        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2"><Award className="w-3 h-3 text-fuchsia-400" /> TOTAL_XP</span>
                        <span className="font-sans font-bold text-white tracking-widest">{profile?.xp || 0}</span>
                     </div>
                     <div className="flex justify-between items-center bg-[#1c1b1b] p-3 border border-slate-800">
                        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2"><TrendingUp className="w-3 h-3 text-lime-400" /> SYS_LEVEL</span>
                        <span className="font-sans font-bold text-white tracking-widest">LVL {profile?.level || 1}</span>
                     </div>
                     <div className="flex justify-between items-center bg-[#1c1b1b] p-3 border border-slate-800">
                        <span className="font-mono text-[10px] text-slate-500 uppercase tracking-widest flex items-center gap-2"><Clock className="w-3 h-3 text-slate-300" /> INCEPTION</span>
                        <span className="font-mono text-[10px] flex items-center gap-2 text-white">
                           {profile?.created_at ? new Date(profile.created_at).toISOString().split('T')[0] : 'UNKNOWN'}
                        </span>
                     </div>
                  </div>
              </div>
           </div>
           
        </div>
      </div>
    </div>
  )
}
