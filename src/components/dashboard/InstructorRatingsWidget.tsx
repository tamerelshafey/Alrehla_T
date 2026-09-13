'use client';

import React from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';

export function InstructorRatingsWidget() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-800">أحدث التقييمات</h3>
        <div className="flex items-center gap-1 text-amber-500 font-bold">
          <Star className="h-5 w-5 fill-current" />
          <span>4.5 / 5.0</span>
        </div>
      </div>

      <div className="space-y-4 mb-6 flex-1">
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
          لا توجد تقييمات حتى الآن.
        </div>
      </div>

      <Link 
        href="/dashboard/instructor/ratings" 
        className="w-full text-center rounded-xl bg-slate-100 py-3 font-bold text-slate-700 hover:bg-slate-200 transition-colors block mt-auto"
      >
        عرض جميع التقييمات
      </Link>
    </div>
  );
}
