'use client'

import { Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react'
import { useState } from 'react'
import { signUp } from '@/actions/auth'

export function SignUpForm() {
  const [pending, setPending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setPending(true)
    setError(null)
    
    const formData = new FormData(e.currentTarget)
    try {
      const result = await signUp(formData)
      if (result?.error) {
        setError(result.error)
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى.')
    } finally {
      setPending(false)
    }
  }

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm font-medium text-red-600">
          {error}
        </div>
      )}
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
        <div className="relative">
          <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            name="fullName"
            type="text"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 font-medium transition-all outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            placeholder="الاسم"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">البريد الإلكتروني</label>
        <div className="relative">
          <Mail className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            name="email"
            type="email"
            required
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 font-medium transition-all outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            placeholder="example@email.com"
          />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-bold text-slate-700">كلمة المرور</label>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 font-medium transition-all outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
            placeholder="••••••••"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-md transition-colors hover:bg-slate-800 disabled:opacity-70"
      >
        {pending ? <Loader2 className="h-5 w-5 animate-spin" /> : 'إنشاء الحساب'}
        {!pending && <ArrowRight className="h-5 w-5 rotate-180" />}
      </button>
    </form>
  )
}
