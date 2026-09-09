'use client';

import React from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';

const mockReviews = [
  { id: '1', studentName: 'أحمد محمود', rating: 5, comment: 'مدرب ممتاز، ساعدني جداً في كتابة أول قصة قصيرة.', date: '2023-10-20' },
  { id: '2', studentName: 'سارة خالد', rating: 4, comment: 'شرح واضح ومفيد، لكن أحياناً يكون هناك تأخير بسيط.', date: '2023-10-18' },
];

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
        {mockReviews.map(review => (
          <div key={review.id} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
            <div className="flex justify-between items-start mb-2">
              <span className="font-bold text-slate-800">{review.studentName}</span>
              <div className="flex text-amber-500">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className={`h-4 w-4 ${i < review.rating ? 'fill-current' : 'text-slate-300'}`} />
                ))}
              </div>
            </div>
            <p className="text-sm text-slate-600 mb-2">{review.comment}</p>
            <span className="text-xs text-slate-400">{review.date}</span>
          </div>
        ))}
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
