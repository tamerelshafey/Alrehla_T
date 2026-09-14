import React from 'react';
import { Star } from 'lucide-react';
import Link from 'next/link';
import { getMyInstructorId } from '@/data/domains/services';
import { getInstructorRatingSummary, getReviewsForInstructor } from '@/data/domains/reviews';
import { formatDate } from '@/lib/utils';

/**
 * The instructor's rating on their dashboard.
 *
 * This used to print "4.5 / 5.0" directly above the words "لا توجد تقييمات
 * حتى الآن" — an invented score sitting on top of an empty list.
 */
export async function InstructorRatingsWidget() {
  const instructorId = await getMyInstructorId();
  const [summary, reviews] = instructorId
    ? await Promise.all([
        getInstructorRatingSummary(instructorId),
        getReviewsForInstructor(instructorId),
      ])
    : [{ average: null, count: 0 }, []];

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col h-full">
      <div className="mb-6 flex items-center justify-between">
        <h3 className="text-xl font-black text-slate-800">أحدث التقييمات</h3>
        {summary.average != null && (
          <div className="flex items-center gap-1 font-bold text-amber-500">
            <Star className="h-5 w-5 fill-current" />
            <span>
              {summary.average.toFixed(1)} / 5.0
              <span className="mr-1 text-xs font-medium text-slate-400">
                ({summary.count})
              </span>
            </span>
          </div>
        )}
      </div>

      <div className="mb-6 flex-1 space-y-4">
        {reviews.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center text-slate-500 shadow-sm">
            لا توجد تقييمات حتى الآن.
          </div>
        ) : (
          reviews.slice(0, 3).map((review) => (
            <div key={review.id} className="rounded-2xl border border-slate-200 p-4">
              <div className="mb-2 flex items-center justify-between">
                <span className="font-bold text-slate-800">{review.reviewerName}</span>
                <span className="text-xs font-bold text-slate-400">
                  {formatDate(review.createdAt)}
                </span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((n) => (
                  <Star
                    key={n}
                    className={`h-3.5 w-3.5 ${
                      n <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
                    }`}
                  />
                ))}
              </div>
              {review.comment && (
                <p className="mt-2 line-clamp-2 text-sm font-medium text-slate-600">
                  {review.comment}
                </p>
              )}
            </div>
          ))
        )}
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
