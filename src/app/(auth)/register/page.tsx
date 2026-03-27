"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { registerSchema } from '@/lib/validations'
import { signUpAction } from '@/app/actions/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle } from 'lucide-react'

export default function RegisterPage() {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const form = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { 
      fullName: "", email: "", password: "", confirmPassword: "", role: "student", studentId: "" 
    },
  })

  const watchRole = form.watch("role")

  async function onSubmit(values: z.infer<typeof registerSchema>) {
    setIsLoading(true)
    setError(null)
    const result = await signUpAction(values) // Call Next.js Server Action
    
    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  // Generate abstract password strength
  const pwd = form.watch('password') || ''
  const strength = pwd.length > 7 ? (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) ? 100 : 66) : (pwd.length > 0 ? 33 : 0)

  if (success) {
    return (
      <div className="relative z-20 w-full max-w-md mx-auto text-center mt-20 mb-20 animate-in fade-in duration-500">
        <div className="bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl border border-primary/50 p-12 shadow-[0_0_40px_rgba(var(--primary),0.1)]">
          <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-6" />
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-widest uppercase mb-4">NODE_REGISTERED</h2>
          <p className="font-mono text-xs text-slate-500 uppercase">Redirecting to Authentication Portal...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="relative z-20 w-full max-w-2xl mx-auto mt-20 mb-20">
      {/* Corner Brackets */}
      <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
      <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
      <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
      <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
      
      <div className="bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl border border-white/10 dark:border-slate-800 p-8 md:p-10 relative overflow-hidden">
        
        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.03),rgba(0,0,0,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none"></div>

        <div className="mb-8 relative z-10 flex flex-col items-start">
          <h2 className="text-2xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 uppercase">
            INITIALIZE_ACCOUNT // <span className="text-blue-500">NEW_NODE</span>
          </h2>
          <p className="font-mono text-[11px] text-slate-500 uppercase tracking-widest">
            Establish secure learning credentials
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10 w-full">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-primary transition-colors mb-2">
                Legal_Designation (Name)
              </label>
              <div className="relative">
                <input 
                  {...form.register("fullName")}
                  type="text"
                  disabled={isLoading}
                  placeholder="Jane Doe"
                  className="w-full bg-slate-100 dark:bg-slate-900 border-0 border-b-2 border-slate-300 dark:border-slate-800 focus:border-primary focus:ring-0 text-primary placeholder:text-slate-500 font-mono text-sm uppercase transition-all duration-300 py-3 px-3"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
              </div>
              {form.formState.errors.fullName && <p className="font-mono text-[9px] text-red-500 uppercase mt-2">{form.formState.errors.fullName.message}</p>}
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-primary transition-colors mb-2">
                Comms_Channel (Email)
              </label>
              <div className="relative">
                <input 
                  {...form.register("email")}
                  type="email"
                  disabled={isLoading}
                  placeholder="AGENT@KINETIC.NET"
                  className="w-full bg-slate-100 dark:bg-slate-900 border-0 border-b-2 border-slate-300 dark:border-slate-800 focus:border-primary focus:ring-0 text-primary placeholder:text-slate-500 font-mono text-sm uppercase transition-all duration-300 py-3 px-3"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
              </div>
              {form.formState.errors.email && <p className="font-mono text-[9px] text-red-500 uppercase mt-2">{form.formState.errors.email.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-blue-500 transition-colors mb-2">
                Security_Key (Password)
              </label>
              <div className="relative">
                <input 
                  {...form.register("password")}
                  type="password"
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full bg-slate-100 dark:bg-slate-900 border-0 border-b-2 border-slate-300 dark:border-slate-800 focus:border-blue-500 focus:ring-0 text-blue-500 placeholder:text-slate-500 font-mono text-sm transition-all duration-300 py-3 px-3"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              </div>
              <div className="flex gap-1 mt-3 h-[2px] w-full bg-slate-300 dark:bg-slate-800">
                <div className="h-full bg-red-500 transition-all duration-300" style={{ width: strength > 0 ? '33.33%' : '0%' }}></div>
                <div className="h-full bg-yellow-400 transition-all duration-300" style={{ width: strength > 33 ? '33.33%' : '0%' }}></div>
                <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: strength > 66 ? '33.34%' : '0%' }}></div>
              </div>
              {form.formState.errors.password && <p className="font-mono text-[9px] text-red-500 uppercase mt-2">{form.formState.errors.password.message}</p>}
            </div>

            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-blue-500 transition-colors mb-2">
                Verify_Key
              </label>
              <div className="relative">
                <input 
                  {...form.register("confirmPassword")}
                  type="password"
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full bg-slate-100 dark:bg-slate-900 border-0 border-b-2 border-slate-300 dark:border-slate-800 focus:border-blue-500 focus:ring-0 text-blue-500 placeholder:text-slate-500 font-mono text-sm transition-all duration-300 py-3 px-3"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
              </div>
              {form.formState.errors.confirmPassword && <p className="font-mono text-[9px] text-red-500 uppercase mt-2">{form.formState.errors.confirmPassword.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="group">
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-emerald-500 transition-colors mb-2">
                Permission_Level
              </label>
              <div className="relative">
                <select 
                  {...form.register("role")}
                  disabled={isLoading}
                  className="w-full bg-slate-100 dark:bg-slate-900 border-0 border-b-2 border-slate-300 dark:border-slate-800 focus:border-emerald-500 focus:ring-0 text-emerald-500 font-mono text-sm uppercase transition-all duration-300 py-3 px-3 appearance-none"
                >
                  <option value="student">STUDENT_NODE</option>
                  <option value="teacher">INSTRUCTOR_NODE</option>
                </select>
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-500 group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
              </div>
              {form.formState.errors.role && <p className="font-mono text-[9px] text-red-500 uppercase mt-2">{form.formState.errors.role.message}</p>}
            </div>

            {watchRole === 'student' && (
              <div className="group animate-in fade-in duration-300">
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-emerald-500 transition-colors mb-2">
                  Student_Index_ID
                </label>
                <div className="relative">
                  <input 
                    {...form.register("studentId")}
                    type="text"
                    disabled={isLoading}
                    placeholder="65-0219-XXXX"
                    className="w-full bg-slate-100 dark:bg-slate-900 border-0 border-b-2 border-slate-300 dark:border-slate-800 focus:border-emerald-500 focus:ring-0 text-emerald-500 placeholder:text-slate-500 font-mono text-sm uppercase transition-all duration-300 py-3 px-3"
                  />
                  <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-emerald-500 group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                </div>
                {form.formState.errors.studentId && <p className="font-mono text-[9px] text-red-500 uppercase mt-2">{form.formState.errors.studentId.message}</p>}
              </div>
            )}
          </div>

          {error && (
            <div className="font-mono text-[10px] flex items-center gap-3 text-red-500 bg-red-500/10 p-4 border-l-2 border-red-500 uppercase">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="group relative w-full h-14 bg-primary text-primary-foreground font-black text-sm tracking-[0.3em] uppercase transition-all duration-300 hover:shadow-[0_0_20px_rgba(var(--primary),0.4)] active:scale-95 overflow-hidden disabled:opacity-50 mt-4"
          >
            <span className="relative z-10 font-mono tracking-[0.3em]">
              {isLoading ? "COMPILING PROFILE..." : "EXECUTE_REGISTRATION"}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>
        
        <div className="mt-8 text-center relative z-10 border-t border-slate-200 dark:border-slate-800 pt-6">
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            Existing Entity? <Link href="/login" className="text-secondary hover:underline underline-offset-4">ACCESS_PORTAL_HERE</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
