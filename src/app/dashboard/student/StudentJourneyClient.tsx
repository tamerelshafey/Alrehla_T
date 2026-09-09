'use client';
import React, { useState } from 'react';
import { WritingPackage } from '@/types';
import { Calendar, Eye, Star, CheckCircle2, MessageSquare } from 'lucide-react';
import Link from 'next/link';

interface Props {
  currentPackage: WritingPackage;
}

export function StudentJourneyClient({ currentPackage }: Props) {
  const [showRating, setShowRating] = useState(false);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [review, setReview] = useState('');
  const [isRated, setIsRated] = useState(false);

  const handleSubmitRating = (e: React.FormEvent) => {
    e.preventDefault();
    setIsRated(true);
    setShowRating(false);
  };

  return (
    <div className="mb-4 rounded-2xl border border-slate-100 bg-slate-50 p-4">
      <h3 className="text-lg font-bold text-slate-800">
        {currentPackage.name}
      </h3>
      <p className="mt-1 text-sm text-slate-500">
        {currentPackage.shortDescription}
      </p>

      <div className="mt-6 mb-2 flex justify-between text-sm font-bold text-slate-600">
        <span>الجلسة 5 من 12</span>
        <span>41%</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
        <div
          className="h-2.5 rounded-full bg-amber-500"
          style={{ width: '41%' }}
        ></div>
      </div>

      <div className="mt-6 flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex items-center gap-3 text-sm font-bold text-slate-800">
          <Calendar className="h-5 w-5 text-blue-500 shrink-0" />
          <span>الموعد الأسبوعي الثابت: السبت، 4:00 عصراً</span>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-2">
          <Link 
            href="/dashboard/student/sessions/s-123" 
            className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-blue-600 py-2.5 text-sm font-bold text-white hover:bg-blue-700 transition-colors"
          >
            دخول جلسة اليوم
          </Link>
          <button 
            onClick={() => setShowRating(!showRating)}
            className="flex items-center justify-center gap-2 rounded-xl border-2 border-amber-200 bg-amber-50 text-amber-700 py-2.5 px-4 text-sm font-bold hover:bg-amber-100 transition-colors"
          >
            <Star className="h-4 w-4" />
            تقييم المدرب
          </button>
        </div>
      </div>

      {/* Rating Module */}
      {showRating && !isRated && (
        <form onSubmit={handleSubmitRating} className="mt-4 rounded-xl bg-white border border-slate-200 p-4 shadow-sm animate-in fade-in slide-in-from-top-2">
          <h4 className="font-bold text-slate-800 mb-3">كيف كانت جلستك الأخيرة؟</h4>
          
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-1 focus:outline-none"
              >
                <Star className={`h-8 w-8 transition-colors ${
                  star <= (hoverRating || rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                }`} />
              </button>
            ))}
          </div>

          <textarea
            rows={3}
            placeholder="اكتب تعليقك للمدرب (اختياري)..."
            value={review}
            onChange={(e) => setReview(e.target.value)}
            className="w-full resize-none rounded-lg border border-slate-200 bg-slate-50 py-2 px-3 text-sm outline-none focus:border-amber-500 mb-3"
          ></textarea>

          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowRating(false)} className="px-4 py-2 text-sm font-bold text-slate-500">إلغاء</button>
            <button type="submit" disabled={rating === 0} className="rounded-lg bg-amber-500 px-6 py-2 text-sm font-bold text-white hover:bg-amber-600 disabled:opacity-50">إرسال التقييم</button>
          </div>
        </form>
      )}

      {isRated && (
        <div className="mt-4 rounded-xl bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 text-emerald-700 text-sm font-bold">
          <CheckCircle2 className="h-5 w-5" />
          شكراً لتقييمك! تم إرسال ملاحظاتك.
        </div>
      )}

      {/* Latest Report */}
      <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50/50 p-4">
        <h4 className="flex items-center gap-2 font-bold text-slate-800 mb-2">
          <MessageSquare className="h-4 w-4 text-blue-500" />
          رسالة المدرب من الجلسة السابقة
        </h4>
        <p className="text-sm text-slate-600 leading-relaxed">
          "أداء ممتاز اليوم! ناقشنا بناء الشخصيات، وأريد منك كتابة صفحة واحدة عن خلفية شخصيتك الرئيسية قبل جلستنا القادمة."
        </p>
      </div>

    </div>
  );
}
