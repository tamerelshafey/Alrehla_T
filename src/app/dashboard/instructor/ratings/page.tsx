import React from 'react';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { getCurrentUser, getReviewsByInstructor } from '@/data/mock';
import { Star } from 'lucide-react';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function RatingsPage() {
  const user = await getCurrentUser();
  if (user.role !== 'instructor') {
    redirect('/dashboard');
  }

  const reviews = await getReviewsByInstructor(user.id);

  return (
    <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">
      <DashboardPageHeader 
        title="تقييمات الطلاب" 
        backHref="/dashboard/instructor"
      />

      {reviews.length === 0 ? (
        <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
          لا توجد تقييمات حتى الآن.
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {reviews.map(review => (
            <div key={review.id} className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-start mb-4">
                <div className="font-bold text-slate-800">{review.studentName}</div>
                <div className="text-xs font-bold text-slate-500">
                  {new Date(review.createdAt).toLocaleDateString('ar-EG')}
                </div>
              </div>
              <div className="flex gap-1 mb-4">
                {[1, 2, 3, 4, 5].map(star => (
                  <Star 
                    key={star} 
                    className={`h-5 w-5 ${star <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`} 
                  />
                ))}
              </div>
              <p className="text-slate-700 text-sm leading-relaxed flex-1">
                {review.comment}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
