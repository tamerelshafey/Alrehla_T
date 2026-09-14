'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Star, CheckCircle2 } from 'lucide-react';
import { submitServiceReview } from '@/actions/reviews';

interface Props {
  orderId: string;
  serviceName: string;
  instructorName: string | null;
}

function StarPicker({
  value,
  onChange,
  label,
  hint,
}: {
  value: number;
  onChange: (v: number) => void;
  label: string;
  hint: string;
}) {
  return (
    <div className="space-y-2">
      <div>
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-xs font-medium text-slate-500">{hint}</p>
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => onChange(n)}
            aria-label={`${n} من 5`}
            className="rounded-lg p-1 transition-transform hover:scale-110"
          >
            <Star
              className={`h-8 w-8 ${
                n <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Rating a completed order.
 *
 * Two scores on purpose: a weak service delivered well should not drag down
 * the instructor, and a strong service delivered badly should not flatter them.
 */
export function ReviewForm({ orderId, serviceName, instructorName }: Props) {
  const router = useRouter();
  const [serviceRating, setServiceRating] = useState(0);
  const [instructorRating, setInstructorRating] = useState(0);
  const [comment, setComment] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);
  const [skipped, setSkipped] = useState(false);

  if (done) {
    return (
      <div className="flex items-center gap-3 rounded-3xl border border-emerald-200 bg-emerald-50 p-6">
        <CheckCircle2 className="h-6 w-6 shrink-0 text-emerald-600" />
        <p className="font-bold text-emerald-900">
          شكرًا — تقييمك ظاهر الآن في صفحة المدرب.
        </p>
      </div>
    );
  }

  if (skipped) return null;

  const submit = async () => {
    if (serviceRating === 0 || instructorRating === 0) {
      setError('اختر عدد النجوم للاثنين');
      return;
    }
    setBusy(true);
    setError('');
    try {
      await submitServiceReview({ orderId, instructorRating, serviceRating, comment });
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'تعذّر حفظ التقييم');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6">
      <h3 className="mb-1 text-lg font-black text-amber-900">كيف كانت التجربة؟</h3>
      <p className="mb-6 text-sm font-medium text-amber-800">
        تقييمك يظهر في صفحة المدرب ويساعد غيرك على الاختيار.
      </p>

      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-6 rounded-2xl bg-white p-5 sm:grid-cols-2">
        <StarPicker
          label="جودة الخدمة"
          hint={serviceName}
          value={serviceRating}
          onChange={setServiceRating}
        />
        <StarPicker
          label="التعامل مع المدرب"
          hint={instructorName ?? 'المدرب'}
          value={instructorRating}
          onChange={setInstructorRating}
        />

        <div className="space-y-2 sm:col-span-2">
          <label className="text-sm font-bold text-slate-800">تعليق (اختياري)</label>
          <textarea
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="ما الذي أعجبك؟ وما الذي كان يمكن أن يكون أفضل؟"
            className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm font-medium outline-none transition-colors focus:border-amber-500 focus:bg-white"
          />
        </div>
      </div>

      <div className="mt-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setSkipped(true)}
          className="rounded-xl px-4 py-2.5 text-sm font-bold text-amber-800 transition-colors hover:bg-amber-100"
        >
          ليس الآن
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={submit}
          className="rounded-xl bg-slate-900 px-6 py-2.5 text-sm font-bold text-white transition-colors hover:bg-slate-800 disabled:opacity-50"
        >
          {busy ? 'جارٍ الإرسال…' : 'إرسال التقييم'}
        </button>
      </div>
    </div>
  );
}
