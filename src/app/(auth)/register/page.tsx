"use client"

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { registerSchema } from '@/lib/validations'
import { signUpAction } from '@/app/actions/auth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CheckCircle2, AlertCircle, Terminal } from 'lucide-react'

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
    const result = await signUpAction(values)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      setSuccess(true)
      setTimeout(() => router.push('/login'), 2000)
    }
  }

  const pwd = form.watch('password') || ''
  const strength = pwd.length > 7 ? (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd) ? 100 : 66) : (pwd.length > 0 ? 33 : 0)

  if (success) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-surface-container-low border border-outline-variant/30 p-12 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
          <CheckCircle2 className="w-16 h-16 text-tertiary-fixed mx-auto mb-6" />
          <h2 className="text-2xl font-headline font-black text-white tracking-widest uppercase mb-4">ลงทะเบียนสำเร็จ</h2>
          <p className="font-mono text-xs text-outline uppercase tracking-widest">กำลังนำคุณไปยังหน้าเข้าสู่ระบบ...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl relative mt-4 mb-10">
      {/* Registration Terminal Box */}
      <div className="bg-surface-container-low border border-outline-variant/30 overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">

        {/* Terminal Header */}
        <div className="bg-surface-container-high px-6 py-3 border-b border-outline-variant/40 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary-fixed shadow-[0_0_8px_#00fbfb]"></div>
            <h1 className="font-headline text-xs font-bold uppercase tracking-[0.3em] text-on-surface">
              INITIALIZE_ACCOUNT_SEQUENCE
            </h1>
          </div>
          <div className="text-[10px] font-mono text-outline uppercase">
            NODE: 0x7F_AUTH
          </div>
        </div>

        {/* Terminal Content */}
        <div className="p-8 md:p-12 relative">
          {/* Corner Brackets */}
          <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary-fixed/30"></div>
          <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary-fixed/30"></div>
          <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary-fixed/30"></div>
          <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary-fixed/30"></div>

          {/* Status Header */}
          <div className="mb-10">
            <div className="flex items-center gap-4 mb-2">
              <span className="text-secondary-md font-mono text-xs uppercase tracking-tighter">SYSTEM_INITIALIZATION:</span>
              <span className="text-primary-fixed font-mono text-xs uppercase animate-pulse">PENDING...</span>
            </div>
            <p className="text-on-surface-variant text-sm font-light leading-relaxed max-w-md">
              กรอกข้อมูลเพื่อสร้างบัญชีผู้ใช้ใหม่ในระบบ KINETIC_TERMINAL
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Full Name */}
              <div className="relative group">
                <label className="block font-headline text-[10px] uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary-fixed transition-colors">
                  USER_IDENTIFIER // ชื่อ-นามสกุล
                </label>
                <input
                  {...form.register("fullName")}
                  type="text"
                  disabled={isLoading}
                  placeholder="สมชาย ใจดี"
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-2 px-0 text-primary-fixed placeholder:text-outline/30 focus:ring-0 focus:border-primary-fixed transition-all font-mono text-sm"
                />
                {form.formState.errors.fullName && (
                  <p className="text-error text-[10px] font-mono mt-1">{form.formState.errors.fullName.message}</p>
                )}
              </div>

              {/* Email */}
              <div className="relative group">
                <label className="block font-headline text-[10px] uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary-fixed transition-colors">
                  REPLY_NETWORK_ID // อีเมล
                </label>
                <input
                  {...form.register("email")}
                  type="email"
                  disabled={isLoading}
                  placeholder="USER@NODE.CORE"
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-2 px-0 text-primary-fixed placeholder:text-outline/30 focus:ring-0 focus:border-primary-fixed transition-all font-mono text-sm"
                />
                {form.formState.errors.email && (
                  <p className="text-error text-[10px] font-mono mt-1">{form.formState.errors.email.message}</p>
                )}
              </div>

              {/* Password */}
              <div className="relative group">
                <label className="block font-headline text-[10px] uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary-fixed transition-colors">
                  ENCRYPTION_KEY // รหัสผ่าน
                </label>
                <input
                  {...form.register("password")}
                  type="password"
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-2 px-0 text-primary-fixed placeholder:text-outline/30 focus:ring-0 focus:border-primary-fixed transition-all font-mono text-sm"
                />
                {/* Password strength bar */}
                <div className="flex gap-1 mt-2 h-[2px]">
                  <div className={`flex-1 transition-all duration-500 ${strength >= 33 ? 'bg-secondary-md shadow-glow-pink' : 'bg-outline-variant/20'}`}></div>
                  <div className={`flex-1 transition-all duration-500 ${strength >= 66 ? 'bg-yellow-500' : 'bg-outline-variant/20'}`}></div>
                  <div className={`flex-1 transition-all duration-500 ${strength >= 100 ? 'bg-tertiary-fixed shadow-glow-green' : 'bg-outline-variant/20'}`}></div>
                </div>
                {form.formState.errors.password && (
                  <p className="text-error text-[10px] font-mono mt-1">{form.formState.errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative group">
                <label className="block font-headline text-[10px] uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary-fixed transition-colors">
                  CONFIRM_ENCRYPTION // ยืนยันรหัสผ่าน
                </label>
                <input
                  {...form.register("confirmPassword")}
                  type="password"
                  disabled={isLoading}
                  placeholder="••••••••"
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-2 px-0 text-primary-fixed placeholder:text-outline/30 focus:ring-0 focus:border-primary-fixed transition-all font-mono text-sm"
                />
                {form.formState.errors.confirmPassword && (
                  <p className="text-error text-[10px] font-mono mt-1">{form.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Role */}
              <div className="relative group">
                <label className="block font-headline text-[10px] uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary-fixed transition-colors">
                  SECTOR_AUTHORITY // ระดับการเข้าถึง
                </label>
                <select
                  {...form.register("role")}
                  disabled={isLoading}
                  className="w-full bg-transparent border-0 border-b border-outline-variant py-2 px-0 text-primary-fixed focus:ring-0 focus:border-primary-fixed transition-all font-mono text-sm appearance-none"
                >
                  <option value="student" className="bg-surface-container-low">STUDENT_NODE // นักเรียน</option>
                  <option value="teacher" className="bg-surface-container-low">INSTRUCTOR_NODE // อาจารย์</option>
                </select>
                {form.formState.errors.role && (
                  <p className="text-error text-[10px] font-mono mt-1">{form.formState.errors.role.message}</p>
                )}
              </div>

              {/* Student ID */}
              {watchRole === 'student' && (
                <div className="relative group animate-in fade-in slide-in-from-right-4 duration-300">
                  <label className="block font-headline text-[10px] uppercase tracking-widest text-outline mb-2 group-focus-within:text-primary-fixed transition-colors">
                    IDENT_TAG // รหัสนักเรียน
                  </label>
                  <input
                    {...form.register("studentId")}
                    type="text"
                    disabled={isLoading}
                    placeholder="65-0219-XXXX"
                    className="w-full bg-transparent border-0 border-b border-outline-variant py-2 px-0 text-primary-fixed placeholder:text-outline/30 focus:ring-0 focus:border-primary-fixed transition-all font-mono text-sm"
                  />
                  {form.formState.errors.studentId && (
                    <p className="text-error text-[10px] font-mono mt-1">{form.formState.errors.studentId.message}</p>
                  )}
                </div>
              )}
            </div>

            {error && (
              <div className="flex items-center gap-3 text-error bg-error-container/20 border border-error/20 p-4 font-mono text-[11px]">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            {/* CTA Button */}
            <div className="pt-6">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary-fixed text-on-primary-fixed font-headline font-black py-4 uppercase tracking-[0.2em] text-sm hover:shadow-[0_0_20px_rgba(0,251,251,0.5)] transition-all flex items-center justify-center gap-3 active:translate-y-px disabled:opacity-40"
              >
                <Terminal className="w-4 h-4" />
                {isLoading ? "INITIALIZING..." : "INITIALIZE_ACCOUNT // สร้างบัญชี"}
              </button>
            </div>
          </form>

          {/* Secondary Link */}
          <div className="mt-10 text-center">
            <Link href="/login" className="text-[10px] font-mono uppercase tracking-widest text-outline hover:text-primary-fixed transition-colors">
              EXISTING_ENTITY? ACCESS_PORTAL_HERE // เข้าสู่ระบบ
            </Link>
          </div>
        </div>

        {/* Terminal Footer */}
        <div className="bg-surface-container-highest/50 px-6 py-2 border-t border-outline-variant/20 flex justify-between">
          <div className="text-[9px] font-mono text-primary-fixed/50">CRC_CHECK: OK</div>
          <div className="text-[9px] font-mono text-secondary-md/50">LATENCY: 14MS</div>
        </div>
      </div>
    </div>
  )
}
