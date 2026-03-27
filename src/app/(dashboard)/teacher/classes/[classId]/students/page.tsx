import { createClient } from '@/lib/supabase/server'
import { Trash2, ShieldAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import BulkImportModal from '@/components/teacher/BulkImportModal'
import AddStudentForm from '@/components/teacher/AddStudentForm'
import DeleteStudentButton from '@/components/teacher/DeleteStudentButton'

export const dynamic = 'force-dynamic'

export default async function ClassStudentsPage({ params }: { params: { classId: string } }) {
  const supabase = createClient()

  // Fetch joined class_enrollments table with profile inner references
  const { data: enrollments } = await supabase
    .from('class_enrollments')
    .select(`
      id,
      enrolled_at,
      student_id,
      profiles (
        full_name,
        email,
        student_id
      )
    `)
    .eq('class_id', params.classId)
    .order('enrolled_at', { ascending: false })

  return (
    <div className="space-y-8 animate-in fade-in duration-500 w-full max-w-7xl mx-auto">
      
      {/* Management Controllers */}
      <div className="bg-white dark:bg-[#1c1b1b] border border-slate-200 dark:border-slate-800 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 shadow-sm relative overflow-hidden">
         {/* Scanline overlay */}
         <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.02),rgba(0,0,0,0.02)_1px,transparent_1px,transparent_2px)] pointer-events-none z-0"></div>
        
         <div className="relative z-10 w-full md:w-auto flex-1">
           <AddStudentForm classId={params.classId} />
         </div>
         <div className="relative z-10 w-full md:w-auto flex justify-end">
           <BulkImportModal classId={params.classId} />
         </div>
      </div>

      {/* Cyberpunk Table Architecture */}
      <div className="bg-white dark:bg-[#1c1b1b] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden relative">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-black/20">
          <h2 className="font-sans font-black tracking-widest text-sm uppercase flex items-center text-slate-900 dark:text-white">
            <span className="w-2 h-4 bg-emerald-500 mr-3 animate-pulse"></span>
            Enrolled_Nodes <span className="ml-3 text-slate-500 font-normal text-[10px] font-mono tracking-widest hidden sm:inline">/ ROSTER MANIFEST</span>
          </h2>
          <div className="font-mono text-[10px] text-slate-500 dark:text-slate-400 font-bold bg-slate-200 dark:bg-[#2a2a2a] px-3 py-1 uppercase tracking-widest">
            {enrollments?.length || 0} TOTAL
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs">
            <thead>
              <tr className="text-slate-500 uppercase text-[10px] tracking-widest border-b border-slate-200 dark:border-slate-800">
                <th className="px-6 py-4 font-normal">Legal_Designation</th>
                <th className="px-6 py-4 font-normal">System_Identifier</th>
                <th className="px-6 py-4 font-normal">Comms_Channel</th>
                <th className="px-6 py-4 font-normal">Timestamp</th>
                <th className="px-6 py-4 font-normal text-right">Terminals</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {enrollments?.map((enrollment) => {
                // Assert typing since Supabase typings for joins can be complex
                const profile = enrollment.profiles as any
                return (
                  <tr key={enrollment.id} className="hover:bg-slate-50 dark:hover:bg-[#201f1f] transition-colors group">
                    <td className="px-6 py-4 text-slate-900 dark:text-white font-bold">{profile?.full_name || 'UNKNOWN_ENTITY'}</td>
                    <td className="px-6 py-4 text-emerald-600 dark:text-emerald-500 font-bold">{profile?.student_id || 'N/A'}</td>
                    <td className="px-6 py-4 text-slate-500 uppercase">{profile?.email}</td>
                    <td className="px-6 py-4 text-slate-400 dark:text-slate-600 text-[10px] tracking-widest">{new Date(enrollment.enrolled_at).toISOString().split('T')[0]}</td>
                    <td className="px-6 py-4 text-right">
                      <DeleteStudentButton classId={params.classId} studentId={enrollment.student_id} />
                    </td>

                  </tr>
                )
              })}
              
              {(!enrollments || enrollments.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-500 font-mono text-[10px] uppercase tracking-widest bg-slate-50/50 dark:bg-transparent">
                    <ShieldAlert className="w-8 h-8 mx-auto mb-4 opacity-50" />
                    EMPTY_NODE_POOL.<br/>AWAITING_INGESTION_COMMANDS.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    
    </div>
  )
}
