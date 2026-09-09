import React from 'react';
import { SessionRequestForm } from './SessionRequestForm';

export const dynamic = 'force-dynamic';

export default function SessionRequestPage() {
  return (
    <div className="mx-auto w-full max-w-2xl px-6 py-12">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-black text-slate-900 mb-2">طلب مساعدة في الحجز</h1>
        <p className="text-slate-600">إذا كنت تواجه صعوبة في حجز جلسة أو اختيار الباقة المناسبة، اترك بياناتك وسنقوم بالتواصل معك لتسهيل العملية.</p>
      </div>
      <SessionRequestForm />
    </div>
  );
}
