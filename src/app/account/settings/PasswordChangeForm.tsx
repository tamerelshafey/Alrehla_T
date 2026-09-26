'use client';

import React, { useState } from 'react';
import { KeyRound, Lock, CheckCircle2 } from 'lucide-react';
import { setMyPassword } from '@/actions/set-password';

export function PasswordChangeForm() {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (newPassword.length < 8) {
      setMessage({ ok: false, text: 'كلمة المرور يجب أن تكون 8 أحرف أو أرقام على الأقل.' });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ ok: false, text: 'كلمتا المرور غير متطابقتين.' });
      return;
    }

    setSaving(true);
    try {
      const res = await setMyPassword(newPassword);
      if (res.ok) {
        setMessage({ ok: true, text: 'تم تحديث كلمة المرور بنجاح!' });
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setMessage({ ok: false, text: res.error });
      }
    } catch {
      setMessage({ ok: false, text: 'تعذّر تحديث كلمة المرور. يرجى المحاولة لاحقاً.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-6">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800">
          <KeyRound className="h-5 w-5" />
        </div>
        <div>
          <h2 className="font-black text-slate-800 text-lg">أمان الحساب وكلمة المرور</h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            يمكنك تعيين كلمة مرور جديدة لحسابك في أي وقت لحماية أمان بياناتك وطلباتك.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">كلمة المرور الجديدة</label>
            <input
              type="password"
              dir="ltr"
              required
              minLength={8}
              placeholder="8 أحرف أو أرقام على الأقل"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden transition-colors"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-bold text-slate-700">تأكيد كلمة المرور الجديدة</label>
            <input
              type="password"
              dir="ltr"
              required
              minLength={8}
              placeholder="أعد كتابة كلمة المرور"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full rounded-xl border border-slate-200 px-4 py-3 font-mono text-sm text-slate-800 focus:border-slate-800 focus:ring-1 focus:ring-slate-800 focus:outline-hidden transition-colors"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
          <div className="flex-1">
            {message && (
              <div
                className={`flex items-center gap-2 text-sm font-bold ${
                  message.ok ? 'text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-2 rounded-xl' : 'text-rose-700 bg-rose-50 border border-rose-200 px-3.5 py-2 rounded-xl'
                }`}
              >
                {message.ok && <CheckCircle2 className="h-4 w-4 shrink-0" />}
                <span>{message.text}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={saving || !newPassword}
            className="flex items-center gap-2 rounded-xl bg-slate-900 px-6 py-3 font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-40 text-sm shadow-xs"
          >
            <Lock className="h-4 w-4" />
            <span>{saving ? 'جارٍ الحفظ…' : 'تحديث كلمة المرور'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
