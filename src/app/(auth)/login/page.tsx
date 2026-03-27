"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { loginSchema } from '@/lib/validations'
import { signInAction } from '@/app/actions/auth'
import Link from 'next/link'
import { LogIn } from 'lucide-react'

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  })

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    setIsLoading(true)
    setError(null)
    const result = await signInAction(values) // Server Action driven!
    
    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result.redirectUrl) {
      window.location.href = result.redirectUrl
    }
  }

  return (
    <div className="relative z-20 w-full max-w-md mx-auto">
      {/* Corner Brackets */}
      <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary"></div>
      <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary"></div>
      <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary"></div>
      <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary"></div>
      
      <div className="bg-slate-900/40 dark:bg-slate-950/80 backdrop-blur-xl shadow-[0_0_40px_rgba(var(--primary),0.05)] border border-white/10 dark:border-slate-800 p-8 md:p-12 relative overflow-hidden">
        
        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[repeating-linear-gradient(0deg,rgba(0,0,0,0.03),rgba(0,0,0,0.03)_1px,transparent_1px,transparent_2px)] pointer-events-none"></div>

        <div className="mb-10 relative z-10">
          <h2 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white mb-2 uppercase">
            ACCESS_GRANTED // <span className="text-primary">USER_AUTH</span>
          </h2>
          <p className="font-mono text-[11px] text-slate-500 uppercase tracking-widest">
            Identify yourself to the central node
          </p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 relative z-10">
          
          <div className="group">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-primary transition-colors mb-2">
              User_Identity
            </label>
            <div className="relative">
              <input 
                {...form.register("email")}
                placeholder="ROOT@KINETIC.NET" 
                type="text"
                disabled={isLoading}
                className="w-full bg-slate-100 dark:bg-slate-900 border-0 border-b-2 border-slate-300 dark:border-slate-800 focus:border-primary focus:ring-0 text-primary placeholder:text-slate-400 font-mono text-sm uppercase transition-all duration-300 py-3 px-4"
              />
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(var(--primary),0.5)]"></div>
            </div>
            {form.formState.errors.email && (
              <p className="font-mono text-[10px] text-red-500 uppercase mt-2">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="group">
            <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-500 group-focus-within:text-blue-500 transition-colors mb-2">
              Security_Key
            </label>
            <div className="relative">
              <input 
                {...form.register("password")}
                placeholder="••••••••••••" 
                type={showPassword ? "text" : "password"}
                disabled={isLoading}
                className="w-full bg-slate-100 dark:bg-slate-900 border-0 border-b-2 border-slate-300 dark:border-slate-800 focus:border-blue-500 focus:ring-0 text-blue-500 placeholder:text-slate-400 font-mono text-sm transition-all duration-300 py-3 px-4 pr-12"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-blue-500 transition-colors font-mono tracking-widest text-[10px]"
              >
                {showPassword ? "HIDE" : "SHOW"}
              </button>
              <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-blue-500 group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(59,130,246,0.5)]"></div>
            </div>
            {form.formState.errors.password && (
              <p className="font-mono text-[10px] text-red-500 uppercase mt-2">{form.formState.errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center justify-between font-mono text-[10px] tracking-widest uppercase">
            <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors">
              <input type="checkbox" className="w-4 h-4 rounded-none bg-slate-900 border-slate-700 text-primary focus:ring-primary focus:ring-offset-slate-900" />
              <span>Remember_Me</span>
            </label>
          </div>

          {error && <div className="font-mono text-[10px] text-red-500 bg-red-500/10 p-3 border-l-2 border-red-500 uppercase">{error}</div>}

          <button 
            type="submit" 
            disabled={isLoading}
            className="group relative w-full h-14 bg-primary text-primary-foreground font-black text-sm tracking-[0.3em] uppercase transition-all duration-300 hover:shadow-[0_0_25px_rgba(var(--primary),0.4)] active:scale-95 overflow-hidden disabled:opacity-50"
          >
            <span className="relative z-10 flex items-center justify-center gap-3">
              {isLoading ? "AUTHENTICATING..." : "Initiate_Login"}
              {!isLoading && <LogIn className="w-5 h-5" />}
            </span>
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
          </button>
        </form>

        <div className="mt-10 text-center relative z-10">
          <p className="font-mono text-[10px] text-slate-500 uppercase tracking-widest">
            New student? <Link href="/register" className="text-blue-500 hover:underline underline-offset-4">Register_New_Node</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
