import Link from 'next/link';
import { PageContainer } from '@/components/PageContainer';
import { Mail, Lock, User, UserPlus, ArrowRight } from 'lucide-react';

export default function SignUpPage() {
  return (
    <PageContainer>
      <div className="mx-auto w-full max-w-md pt-12 pb-24">
        <div className="mb-10 text-center">
          <Link href="/" className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600 mb-6">
            <UserPlus className="h-6 w-6" />
          </Link>
          <h1 className="text-3xl font-black text-slate-800">حساب جديد</h1>
          <p className="mt-2 text-slate-500 font-medium">انضم إلى مجتمع الرحلة وابدأ القصة</p>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-8 shadow-xl shadow-slate-200/50">
          <form className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-700">الاسم الكامل</label>
              <div className="relative">
                <User className="absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
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
                  type="email"
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
                  type="password"
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-3 pr-12 pl-4 font-medium transition-all outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 py-4 font-bold text-white shadow-md transition-colors hover:bg-slate-800"
            >
              إنشاء الحساب
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
          </form>

          <div className="mt-8 text-center text-sm font-medium text-slate-600">
            لديك حساب بالفعل؟{' '}
            <Link href="/sign-in" className="font-bold text-amber-600 hover:text-amber-700">
              تسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
