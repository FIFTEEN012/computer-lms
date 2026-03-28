"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { loginSchema } from '@/lib/validations'
import { signInAction } from '@/app/actions/auth'
import Link from 'next/link'
import { LogIn, ShieldCheck, Activity } from 'lucide-react'

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
    const result = await signInAction(values)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else if (result.redirectUrl) {
      window.location.href = result.redirectUrl
    }
  }

  return (
    <>
      {/* Decoration Left */}
      <div className="hidden lg:block fixed left-12 top-1/2 -translate-y-1/2 font-mono text-[10px] text-outline/30 space-y-4 z-20">
        <p>0x00A1 // INIT_SEQUENCE</p>
        <p>0x00A2 // HANDSHAKE_START</p>
        <p>0x00A3 // RSA_KEY_EXCHANGE</p>
        <p>0x00A4 // ENCRYPTION_LAYER_ACTIVE</p>
        <p>0x00A5 // WAITING_FOR_INPUT</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-md relative">
        {/* Corner Brackets */}
        <div className="absolute -top-2 -left-2 w-6 h-6 border-t-2 border-l-2 border-primary-fixed"></div>
        <div className="absolute -top-2 -right-2 w-6 h-6 border-t-2 border-r-2 border-primary-fixed"></div>
        <div className="absolute -bottom-2 -left-2 w-6 h-6 border-b-2 border-l-2 border-primary-fixed"></div>
        <div className="absolute -bottom-2 -right-2 w-6 h-6 border-b-2 border-r-2 border-primary-fixed"></div>

        <div className="bg-surface-container-low shadow-[0_0_40px_rgba(0,251,251,0.05)] border border-outline-variant/20 p-8 md:p-12">
          <div className="mb-10">
            <h2 className="font-headline text-3xl font-bold tracking-tighter text-white mb-2 uppercase">
              ACCESS_GRANTED // <span className="text-primary-fixed">USER_AUTH</span>
            </h2>
            <p className="font-mono text-[11px] text-outline uppercase tracking-widest">
              ยืนยันตัวตนเพื่อเข้าสู่ระบบการเรียนรู้
            </p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {/* Email Field */}
            <div className="group">
              <label className="block font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-outline group-focus-within:text-primary-fixed transition-colors mb-2">
                User_Identity // อีเมล
              </label>
              <div className="relative">
                <input
                  {...form.register("email")}
                  placeholder="ROOT@KINETIC.NET"
                  type="text"
                  disabled={isLoading}
                  className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-primary-fixed focus:ring-0 text-primary-fixed placeholder:text-outline/30 font-mono text-sm uppercase transition-all duration-300 py-3 px-4"
                />
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-primary-fixed group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(0,251,251,0.5)]"></div>
              </div>
              {form.formState.errors.email && (
                <div className="flex items-center gap-2 text-error mt-2 font-mono text-[10px] tracking-widest">
                  <ShieldCheck className="w-3 h-3" /> {form.formState.errors.email.message}
                </div>
              )}
            </div>

            {/* Password Field */}
            <div className="group">
              <label className="block font-headline text-[10px] font-bold uppercase tracking-[0.2em] text-outline group-focus-within:text-secondary-md transition-colors mb-2">
                Security_Key // รหัสผ่าน
              </label>
              <div className="relative">
                <input
                  {...form.register("password")}
                  placeholder="••••••••••••"
                  type={showPassword ? "text" : "password"}
                  disabled={isLoading}
                  className="w-full bg-surface-container-lowest border-0 border-b-2 border-outline-variant focus:border-secondary-md focus:ring-0 text-secondary-md placeholder:text-outline/30 font-mono text-sm transition-all duration-300 py-3 px-4 pr-16"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 font-mono text-[9px] text-outline hover:text-secondary-md transition-colors uppercase tracking-widest"
                >
                  {showPassword ? "HIDE" : "SHOW"}
                </button>
                <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-secondary-md group-focus-within:w-full transition-all duration-500 shadow-[0_0_10px_rgba(255,171,243,0.5)]"></div>
              </div>
              {form.formState.errors.password && (
                <div className="flex items-center gap-2 text-error mt-2 font-mono text-[10px] tracking-widest">
                  <ShieldCheck className="w-3 h-3" /> {form.formState.errors.password.message}
                </div>
              )}
            </div>

            {error && (
              <div className="bg-error-container/50 border border-error/30 p-4 font-mono text-[11px] text-error flex items-center gap-3">
                <Activity className="w-4 h-4" /> {error}
              </div>
            )}

            {/* Login Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full h-14 bg-primary-fixed text-on-primary-fixed font-headline font-black text-sm tracking-[0.3em] uppercase transition-all duration-300 hover:shadow-[0_0_25px_rgba(0,251,251,0.4)] active:scale-95 overflow-hidden disabled:opacity-40"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isLoading ? "AUTHENTICATING..." : "INITIATE_LOGIN // เข้าสู่ระบบ"}
                {!isLoading && <LogIn className="w-4 h-4" />}
              </span>
              <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            </button>
          </form>

          {/* Register Link */}
          <div className="mt-10 text-center">
            <p className="font-mono text-[10px] text-outline/40 uppercase tracking-widest">
              นักเรียนใหม่? <Link href="/register" className="text-tertiary-fixed hover:underline underline-offset-4">Register_New_Node</Link>
            </p>
          </div>
        </div>
      </div>

      {/* Decoration Right */}
      <div className="hidden lg:flex fixed right-12 bottom-24 flex-col items-end font-mono text-[10px] text-outline/30 space-y-2 text-right z-20">
        <p>{'// NODE_LOCATION: LMS_SCHOOL_2570'}</p>
        <p>{'// LATENCY: 24MS'}</p>
        <p>{'// PACKET_LOSS: 0.00%'}</p>
        <div className="w-48 h-1 bg-outline-variant/20 mt-4 overflow-hidden">
          <div className="h-full bg-primary-fixed w-2/3 animate-pulse shadow-[0_0_5px_#00fbfb]"></div>
        </div>
      </div>

      {/* Ambient Elements */}
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary-fixed/5 rounded-full blur-[120px] pointer-events-none -z-10"></div>
      <div className="fixed top-0 right-0 w-[400px] h-[400px] bg-secondary-md/5 rounded-full blur-[100px] pointer-events-none -z-10"></div>
    </>
  )
}
